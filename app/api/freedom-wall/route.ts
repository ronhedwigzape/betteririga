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
import {
  checkFreedomWallQuota,
  recordFreedomWallPost,
  checkDragRateLimit,
  sanitizeText,
} from "@/lib/security/rate-limiter"

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

  // 1. Enforce payload size limit (max 10KB)
  const contentLength = Number(req.headers.get("content-length") || 0)
  if (contentLength > 10_240) {
    return NextResponse.json(
      { success: false, error: "Payload too large (max 10KB)" },
      { status: 413 }
    )
  }

  // 2. Client identification & rate limit / daily quota check (5 notes/day, 10s burst)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown-ip"
  const sessionId =
    req.headers.get("x-session-id") ||
    req.cookies?.get?.("betteririga_fw_session")?.value ||
    "anon"

  const quota = checkFreedomWallQuota(ip, sessionId)
  if (!quota.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: quota.message,
        reason: quota.reason,
        remaining: quota.remaining,
        retryAfterSeconds: quota.retryAfterSeconds,
      },
      {
        status: 429,
        headers: quota.retryAfterSeconds
          ? { "Retry-After": String(quota.retryAfterSeconds) }
          : undefined,
      }
    )
  }

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

  // 3. Strict Input Sanitization (strip HTML/scripts/control characters)
  const rawContent = typeof body.content === "string" ? body.content : ""
  const sanitizedContent = sanitizeText(rawContent, 280)
  const rawAuthor = typeof body.authorLabel === "string" ? body.authorLabel : "Anonymous"
  const sanitizedAuthor = sanitizeText(rawAuthor, 40) || "Anonymous"

  const candidate = {
    id:
      typeof body.id === "string" && body.id.trim() && /^[a-zA-Z0-9_-]{1,64}$/.test(body.id.trim())
        ? body.id.trim()
        : `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    content: sanitizedContent,
    x: typeof body.x === "number" ? Math.max(80, Math.min(5600, body.x)) : 2500,
    y: typeof body.y === "number" ? Math.max(80, Math.min(5600, body.y)) : 2500,
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
    authorLabel: sanitizedAuthor,
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
    const remaining = recordFreedomWallPost(ip, sessionId)
    return NextResponse.json(
      {
        success: false,
        storage: "local-fallback",
        reason: "not_configured",
        error:
          "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY) are not set in Vercel.",
        note: validNote,
        remaining,
      },
      { status: 200 }
    )
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    const remaining = recordFreedomWallPost(ip, sessionId)
    return NextResponse.json(
      {
        success: false,
        storage: "local-fallback",
        reason: "client_init_failed",
        error: "Failed to initialize Supabase client.",
        note: validNote,
        remaining,
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

  const remaining = recordFreedomWallPost(ip, sessionId)
  const savedNote = mapRowToFreedomWallNote(data as SupabaseFreedomWallNoteRow)

  return NextResponse.json(
    {
      success: true,
      storage: "supabase",
      note: savedNote ?? validNote,
      remaining,
    },
    { status: 201 }
  )
}

export async function PATCH(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown-ip"

  // Rate limit note drag/position updates (max 60/min)
  if (!checkDragRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many position updates. Please slow down." },
      { status: 429 }
    )
  }

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

  if (
    !body.id ||
    typeof body.id !== "string" ||
    !/^[a-zA-Z0-9_-]{1,64}$/.test(body.id.trim()) ||
    typeof body.x !== "number" ||
    typeof body.y !== "number"
  ) {
    return NextResponse.json(
      { error: "Invalid id, x, or y in body" },
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

