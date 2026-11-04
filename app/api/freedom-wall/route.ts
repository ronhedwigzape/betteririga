import { NextRequest, NextResponse } from "next/server"
import {
  FreedomWallStickyNoteSchema,
  type FreedomWallStickyNote,
} from "@/lib/data/schemas"
import {
  getSupabaseClient,
  getSupabaseConfig,
  mapRowToFreedomWallNote,
  type SupabaseFreedomWallNoteRow,
} from "@/lib/supabase/freedom-wall"

export const dynamic = "force-dynamic"

export async function GET() {
  const config = getSupabaseConfig()

  if (!config.isConfigured) {
    return NextResponse.json(
      {
        success: false,
        storage: "local-fallback",
        reason: "not_configured",
        message:
          "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY) are not configured in Vercel.",
        notes: [],
      },
      { status: 200 }
    )
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return NextResponse.json(
      {
        success: false,
        storage: "local-fallback",
        reason: "client_init_failed",
        message: "Failed to initialize Supabase client.",
        notes: [],
      },
      { status: 200 }
    )
  }

  const { data, error } = await supabase
    .from("freedom_wall_posts")
    .select("id, content, x, y, color, rotation, author_label, created_at")
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json(
      {
        success: false,
        storage: "local-fallback",
        reason: "supabase_query_error",
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        tableExists: error.code !== "42P01",
        notes: [],
      },
      { status: 200 }
    )
  }

  const notes: FreedomWallStickyNote[] = []
  for (const row of (data ?? []) as SupabaseFreedomWallNoteRow[]) {
    const mapped = mapRowToFreedomWallNote(row)
    if (mapped) notes.push(mapped)
  }

  return NextResponse.json({
    success: true,
    storage: "supabase",
    keyType: config.keyType,
    count: notes.length,
    notes,
  })
}

export async function POST(req: NextRequest) {
  const config = getSupabaseConfig()

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  const body = (rawBody && typeof rawBody === "object" ? rawBody : {}) as Record<
    string,
    unknown
  >

  const candidate = {
    id:
      typeof body.id === "string" && body.id.trim()
        ? body.id.trim()
        : `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    content: typeof body.content === "string" ? body.content.trim() : "",
    x: typeof body.x === "number" ? body.x : 2500,
    y: typeof body.y === "number" ? body.y : 2500,
    color:
      typeof body.color === "string"
        ? body.color
        : "bg-yellow-100 border-yellow-300 text-yellow-950",
    rotation:
      typeof body.rotation === "number"
        ? Number(body.rotation.toFixed(2))
        : Number(((Math.random() - 0.5) * 8).toFixed(2)),
    createdAt:
      typeof body.createdAt === "string"
        ? body.createdAt
        : new Date().toISOString(),
    authorLabel:
      typeof body.authorLabel === "string" && body.authorLabel.trim()
        ? body.authorLabel.trim()
        : "Anonymous",
  }

  const parsed = FreedomWallStickyNoteSchema.safeParse(candidate)
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        issues: parsed.error.issues,
      },
      { status: 422 }
    )
  }

  const validNote = parsed.data

  if (!config.isConfigured) {
    return NextResponse.json(
      {
        success: false,
        storage: "local-fallback",
        reason: "not_configured",
        error:
          "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY) are not set in Vercel.",
        note: validNote,
      },
      { status: 200 }
    )
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return NextResponse.json(
      {
        success: false,
        storage: "local-fallback",
        reason: "client_init_failed",
        error: "Failed to initialize Supabase client.",
        note: validNote,
      },
      { status: 200 }
    )
  }

  const { data, error } = await supabase
    .from("freedom_wall_posts")
    .insert({
      id: validNote.id,
      content: validNote.content,
      x: validNote.x,
      y: validNote.y,
      color: validNote.color,
      rotation: validNote.rotation,
      author_label: validNote.authorLabel,
    })
    .select("id, content, x, y, color, rotation, author_label, created_at")
    .single()

  if (error || !data) {
    return NextResponse.json(
      {
        success: false,
        storage: "local-fallback",
        reason: "supabase_error",
        error: error?.message ?? "Failed to save note to Supabase",
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        tableExists: error?.code !== "42P01",
        note: validNote,
      },
      { status: 200 }
    )
  }

  const savedNote = mapRowToFreedomWallNote(data as SupabaseFreedomWallNoteRow)

  return NextResponse.json(
    {
      success: true,
      storage: "supabase",
      note: savedNote ?? validNote,
    },
    { status: 201 }
  )
}

export async function PATCH(req: NextRequest) {
  const config = getSupabaseConfig()
  if (!config.isConfigured) {
    return NextResponse.json(
      { success: false, error: "Supabase not configured" },
      { status: 200 }
    )
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: "No client" },
      { status: 200 }
    )
  }

  let body: { id?: string; x?: number; y?: number } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.id || typeof body.x !== "number" || typeof body.y !== "number") {
    return NextResponse.json(
      { error: "Missing id, x, or y in body" },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from("freedom_wall_posts")
    .update({
      x: Math.max(40, Math.min(5700, Math.round(body.x))),
      y: Math.max(40, Math.min(5700, Math.round(body.y))),
    })
    .eq("id", body.id)

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 200 }
    )
  }

  return NextResponse.json({ success: true })
}

