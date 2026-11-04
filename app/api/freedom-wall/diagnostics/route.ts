import { NextResponse } from "next/server"
import {
  getSupabaseClient,
  getSupabaseConfig,
} from "@/lib/supabase/freedom-wall"

export const dynamic = "force-dynamic"

const SETUP_SQL = `-- BetterIriga.org — Run this in Supabase Project -> SQL Editor -> Click "Run"
create table if not exists public.freedom_wall_posts (
  id text primary key,
  content text not null check (char_length(content) between 1 and 500),
  x double precision not null default 2500 check (x >= 0 and x <= 6000),
  y double precision not null default 2500 check (y >= 0 and y <= 6000),
  color text not null default 'bg-yellow-100 border-yellow-300 text-yellow-950',
  rotation double precision not null default 0 check (rotation >= -15 and rotation <= 15),
  author_label text not null default 'Anonymous' check (char_length(author_label) between 1 and 60),
  created_at timestamptz not null default now()
);

create index if not exists idx_freedom_wall_posts_created_at
  on public.freedom_wall_posts (created_at desc);

grant usage on schema public to anon, authenticated;
grant all on table public.freedom_wall_posts to anon, authenticated;

alter table public.freedom_wall_posts enable row level security;

drop policy if exists "Allow public read access on freedom_wall_posts" on public.freedom_wall_posts;
create policy "Allow public read access on freedom_wall_posts"
  on public.freedom_wall_posts for select to anon, authenticated using (true);

drop policy if exists "Allow public insert on freedom_wall_posts" on public.freedom_wall_posts;
create policy "Allow public insert on freedom_wall_posts"
  on public.freedom_wall_posts for insert to anon, authenticated
  with check (
    char_length(content) between 1 and 500
    and x >= 0 and x <= 6000
    and y >= 0 and y <= 6000
  );

drop policy if exists "Allow public position update on freedom_wall_posts" on public.freedom_wall_posts;
create policy "Allow public position update on freedom_wall_posts"
  on public.freedom_wall_posts for update to anon, authenticated using (true)
  with check (x >= 0 and x <= 6000 and y >= 0 and y <= 6000);
`

export async function GET() {
  const config = getSupabaseConfig()

  const detectedEnv = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  }

  let maskedHost: string | null = null
  if (config.url) {
    try {
      const u = new URL(config.url)
      maskedHost = u.host
    } catch {
      maskedHost = "invalid-url"
    }
  }

  if (!config.isConfigured) {
    return NextResponse.json({
      ok: false,
      status: "unconfigured",
      summary: "Supabase environment variables are missing in Vercel.",
      detectedEnv,
      maskedHost,
      keyType: config.keyType,
      tableExists: false,
      notesCount: 0,
      instructions: [
        "1. In Vercel Project Settings -> Environment Variables, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY).",
        "2. If variables were just added, trigger a Redeploy in Vercel.",
        "3. In Supabase -> SQL Editor, run the setup SQL below to create the table freedom_wall_posts.",
      ],
      setupSql: SETUP_SQL,
    })
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return NextResponse.json({
      ok: false,
      status: "init_failed",
      summary: "Could not initialize Supabase client.",
      detectedEnv,
      maskedHost,
      keyType: config.keyType,
      tableExists: false,
      notesCount: 0,
      setupSql: SETUP_SQL,
    })
  }

  const { count, error } = await supabase
    .from("freedom_wall_posts")
    .select("*", { count: "exact", head: true })

  if (error) {
    const isTableMissing = error.code === "42P01"
    const isPermissionError = error.code === "42501"

    let summary = `Supabase responded with error code ${error.code}: ${error.message}`
    if (isTableMissing) {
      summary =
        "The table 'freedom_wall_posts' does not exist in your Supabase project. You must run the SQL schema in your Supabase SQL Editor."
    } else if (isPermissionError) {
      summary =
        "Permission denied on table 'freedom_wall_posts'. Make sure to grant table access to anon and check RLS policies."
    }

    return NextResponse.json({
      ok: false,
      status: isTableMissing ? "table_missing" : "database_error",
      summary,
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      detectedEnv,
      maskedHost,
      keyType: config.keyType,
      tableExists: !isTableMissing,
      notesCount: 0,
      instructions: [
        "1. Open your Supabase Dashboard: https://supabase.com/dashboard",
        "2. Select your project and navigate to 'SQL Editor' in the left sidebar.",
        "3. Click 'New query', paste the SQL schema below, and click 'Run'.",
        "4. Refresh this diagnostics page or reload the Freedom Wall canvas.",
      ],
      setupSql: SETUP_SQL,
    })
  }

  return NextResponse.json({
    ok: true,
    status: "ready",
    summary: "Supabase connection is healthy and table freedom_wall_posts is ready.",
    detectedEnv,
    maskedHost,
    keyType: config.keyType,
    tableExists: true,
    notesCount: typeof count === "number" ? count : 0,
    setupSql: SETUP_SQL,
  })
}

