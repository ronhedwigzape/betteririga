/**
 * BetterIriga.org — Freedom Wall Sticky-Note Database Client
 *
 * All Freedom Wall sticky notes live strictly on BetterIriga.org (never forwarded
 * to City Hall). When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 * are configured in `.env.local`, sticky notes and their canvas coordinates are
 * read/written directly to the `freedom_wall_posts` table.
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

let cachedClient: SupabaseClient | null = null

export function isSupabaseFreedomWallConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof window === "undefined"
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : undefined)
  return Boolean(
    url &&
      key &&
      url.startsWith("https://") &&
      !url.includes("your-project-id") &&
      !url.includes("your-project-ref") &&
      !key.includes("your-publishable-key") &&
      !key.includes("your-anon-key")
  )
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseFreedomWallConfigured()) return null
  if (cachedClient) return cachedClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof window === "undefined"
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : "")!

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

export async function fetchSupabaseFreedomWallNotes(): Promise<
  FreedomWallStickyNote[]
> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("freedom_wall_posts")
    .select("id, content, x, y, color, rotation, author_label, created_at")
    .order("created_at", { ascending: false })
    .limit(200)

  if (error || !Array.isArray(data)) {
    return []
  }

  const notes: FreedomWallStickyNote[] = []
  for (const row of data as SupabaseFreedomWallNoteRow[]) {
    const mapped = mapRowToFreedomWallNote(row)
    if (mapped) notes.push(mapped)
  }
  return notes
}

export async function insertSupabaseFreedomWallNote(
  note: FreedomWallStickyNote
): Promise<FreedomWallStickyNote> {
  const supabase = getSupabaseClient()
  if (!supabase) return note

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
    return note
  }

  return mapRowToFreedomWallNote(data as SupabaseFreedomWallNoteRow) ?? note
}

export async function updateSupabaseFreedomWallNotePosition(
  noteId: string,
  x: number,
  y: number
): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase) return

  await supabase
    .from("freedom_wall_posts")
    .update({
      x: Math.max(40, Math.min(5700, Math.round(x))),
      y: Math.max(40, Math.min(5700, Math.round(y))),
    })
    .eq("id", noteId)
}
