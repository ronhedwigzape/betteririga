-- =============================================================================
-- BetterIriga.org — Irigueño Freedom Wall Sticky-Note Canvas Schema
-- Run this entire script in your Supabase Project -> SQL Editor -> Click "Run"
-- =============================================================================

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

-- Index on created_at for fast descending feed retrieval
create index if not exists idx_freedom_wall_posts_created_at
  on public.freedom_wall_posts (created_at desc);

-- Grant schema and table access to public (anon) and authenticated roles
grant usage on schema public to anon, authenticated;
grant all on table public.freedom_wall_posts to anon, authenticated;

-- Enable Row Level Security (RLS)
alter table public.freedom_wall_posts enable row level security;

-- 1. Public read access for everyone visiting BetterIriga.org
drop policy if exists "Allow public read access on freedom_wall_posts" on public.freedom_wall_posts;
create policy "Allow public read access on freedom_wall_posts"
  on public.freedom_wall_posts
  for select
  to anon, authenticated
  using (true);

-- 2. Public insert access with length & coordinate constraints
drop policy if exists "Allow public insert on freedom_wall_posts" on public.freedom_wall_posts;
create policy "Allow public insert on freedom_wall_posts"
  on public.freedom_wall_posts
  for insert
  to anon, authenticated
  with check (
    char_length(content) between 1 and 500
    and x >= 0 and x <= 6000
    and y >= 0 and y <= 6000
  );

-- 3. Allow repositioning sticky notes on the canvas
drop policy if exists "Allow public position update on freedom_wall_posts" on public.freedom_wall_posts;
create policy "Allow public position update on freedom_wall_posts"
  on public.freedom_wall_posts
  for update
  to anon, authenticated
  using (true)
  with check (
    x >= 0 and x <= 6000
    and y >= 0 and y <= 6000
  );

-- Self-test query to verify the table is ready (should return 0 or existing count)
select count(*) as freedom_wall_posts_ready from public.freedom_wall_posts;
