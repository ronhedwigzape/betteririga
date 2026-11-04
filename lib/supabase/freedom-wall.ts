/**
 * BetterIriga.org — Freedom Wall Sticky-Note Database Client
 *
 * All Freedom Wall sticky notes live strictly on BetterIriga.org (never forwarded
 * to City Hall). When Supabase credentials are configured in Vercel or `.env.local`,
 * sticky notes and their canvas coordinates are synchronized with the `freedom_wall_posts`
 * table via the dedicated first-party `/api/freedom-wall` endpoint or direct Supabase client.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import {
  FreedomWallStickyNoteSchema,
  type FreedomWallStickyNote,
} from "@/lib/data/schemas"

export interface SupabaseFreedomWallNoteRow {
  id: string
  content: string
  x: number
  y: number
  color: string
  rotation: number
  author_label?: string
  created_at: string
}

export interface SupabaseConfigInfo {
  url?: string
  key?: string
  keyType: "service_role" | "publishable" | "anon" | "none"
  isConfigured: boolean
}

let cachedClient: SupabaseClient | null = null

export function getSupabaseConfig(): SupabaseConfigInfo {
  // Support both NEXT_PUBLIC_ (client/server) and standard (server-side) Vercel env vars
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof window === "undefined" ? process.env.SUPABASE_URL : undefined)

  let key: string | undefined = undefined
  let keyType: SupabaseConfigInfo["keyType"] = "none"

  // Check service role key first (server-side only)
  if (typeof window === "undefined" && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    key = process.env.SUPABASE_SERVICE_ROLE_KEY
    keyType = "service_role"
  } else if (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    keyType = "publishable"
  } else if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    keyType = "anon"
  } else if (typeof window === "undefined" && process.env.SUPABASE_ANON_KEY) {
    key = process.env.SUPABASE_ANON_KEY
    keyType = "anon"
  }

  const isConfigured = Boolean(
    url &&
      key &&
      url.startsWith("https://") &&
      !url.includes("your-project-id") &&
      !url.includes("your-project-ref") &&
      !key.includes("your-publishable-key") &&
      !key.includes("your-anon-key") &&
      !key.includes("your-supabase-service-role-key")
  )

  return { url, key, keyType, isConfigured }
}

export function isSupabaseFreedomWallConfigured(): boolean {
  return getSupabaseConfig().isConfigured
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseConfig()
  if (!isConfigured || !url || !key) return null
  if (cachedClient) return cachedClient

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
    },
  })
  return cachedClient
}

export function mapRowToFreedomWallNote(
  row: SupabaseFreedomWallNoteRow
): FreedomWallStickyNote | null {
  const candidate = {
    id: String(row.id),
    content: String(row.content ?? "").trim(),
    x: Number(row.x ?? 2500),
    y: Number(row.y ?? 2500),
    color:
      row.color ||
      "bg-yellow-100 border-yellow-300 text-yellow-950",
    rotation: Number(row.rotation ?? 0),
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
    authorLabel: row.author_label || "Anonymous",
  }
  const parsed = FreedomWallStickyNoteSchema.safeParse(candidate)
  return parsed.success ? parsed.data : null
}

export interface FreedomWallSyncStatus {
  lastSyncError?: string
  storageMode: "supabase" | "local-fallback"
}

export async function fetchSupabaseFreedomWallNotes(): Promise<
  FreedomWallStickyNote[]
> {
  // If running in browser, prioritize first-party API route
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/freedom-wall", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.notes)) {
          return json.notes
        }
        if (json.error) {
          console.warn("[Freedom Wall] API reported database status:", json.error)
        }
      }
    } catch (err) {
      console.warn("[Freedom Wall] /api/freedom-wall network fetch failed, trying direct client:", err)
    }
  }

  // Server or fallback direct Supabase client
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("freedom_wall_posts")
    .select("id, content, x, y, color, rotation, author_label, created_at")
    .order("created_at", { ascending: false })
    .limit(200)

  if (error || !Array.isArray(data)) {
    if (error) {
      console.warn("[Freedom Wall] Direct query error:", error.message)
    }
    return []
  }

  const notes: FreedomWallStickyNote[] = []
  for (const row of data as SupabaseFreedomWallNoteRow[]) {
    const mapped = mapRowToFreedomWallNote(row)
    if (mapped) notes.push(mapped)
  }
  return notes
}

export interface InsertNoteResult {
  note: FreedomWallStickyNote
  storage: "supabase" | "local-fallback"
  error?: string
  code?: string
  tableExists?: boolean
}

export async function insertSupabaseFreedomWallNote(
  note: FreedomWallStickyNote
): Promise<InsertNoteResult> {
  // 1. In browser: use first-party API route (handles server env vars, bypasses adblockers & RLS grants)
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/freedom-wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      })
      const json = await res.json()
      if (json.success && json.note) {
        return {
          note: json.note,
          storage: "supabase",
        }
      }
      if (json.error) {
        console.warn("[Freedom Wall] Sync note notice:", json.error)
        return {
          note,
          storage: "local-fallback",
          error: json.error,
          code: json.code,
          tableExists: json.tableExists,
        }
      }
    } catch (err) {
      console.warn("[Freedom Wall] API post failed, attempting direct insert:", err)
    }
  }

  // 2. Direct client or server insert
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      note,
      storage: "local-fallback",
      error: "Supabase credentials are not configured in Vercel environment variables.",
    }
  }

  const { data, error } = await supabase
    .from("freedom_wall_posts")
    .insert({
      id: note.id,
      content: note.content,
      x: note.x,
      y: note.y,
      color: note.color,
      rotation: note.rotation,
      author_label: note.authorLabel,
    })
    .select("id, content, x, y, color, rotation, author_label, created_at")
    .single()

  if (error || !data) {
    console.error("[Freedom Wall] Supabase insert error:", error)
    return {
      note,
      storage: "local-fallback",
      error: error?.message ?? "Failed to save note to Supabase",
      code: error?.code,
    }
  }

  const mapped = mapRowToFreedomWallNote(data as SupabaseFreedomWallNoteRow)
  return {
    note: mapped ?? note,
    storage: "supabase",
  }
}

export async function updateSupabaseFreedomWallNotePosition(
  noteId: string,
  x: number,
  y: number
): Promise<void> {
  const clampedX = Math.max(40, Math.min(5700, Math.round(x)))
  const clampedY = Math.max(40, Math.min(5700, Math.round(y)))

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/freedom-wall", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: noteId, x: clampedX, y: clampedY }),
      })
      return
    } catch {
      // Fallback to direct client
    }
  }

  const supabase = getSupabaseClient()
  if (!supabase) return

  await supabase
    .from("freedom_wall_posts")
    .update({
      x: clampedX,
      y: clampedY,
    })
    .eq("id", noteId)
}
