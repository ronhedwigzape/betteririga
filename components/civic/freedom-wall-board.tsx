"use client"

import * as React from "react"
import { Plus, RotateCcw, X, Move } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { formatNoteTimestamp } from "@/lib/data/iriga-data"
import { useCivicStore } from "@/lib/store/civic-store"
import { mapRowToFreedomWallNote, type SupabaseFreedomWallNoteRow } from "@/lib/supabase/freedom-wall"
import type { FreedomWallStickyNote } from "@/lib/data/schemas"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function FreedomWallBoard() {
  const snapshot = useCivicStore((state) => state.snapshot)
  const freedomWall = snapshot.freedomWall
  const canvasConfig = freedomWall.canvas
  const stickyColors = freedomWall.stickyColors
  const uiCopy = freedomWall.uiCopy

  const notes = useCivicStore((state) => state.freedomWallNotes)
  const hydrateFreedomWall = useCivicStore((state) => state.hydrateFreedomWall)
  const syncFreedomWallNotes = useCivicStore((state) => state.syncFreedomWallNotes)
  const moveFreedomWallNote = useCivicStore(
    (state) => state.moveFreedomWallNote
  )

  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [pan, setPan] = React.useState({ x: 0, y: 0 })
  const [scale, setScale] = React.useState(1)
  const [isPanning, setIsPanning] = React.useState(false)
  const panStartRef = React.useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  const [draggingNoteId, setDraggingNoteId] = React.useState<string | null>(
    null
  )
  const dragNoteStartRef = React.useRef({
    clientX: 0,
    clientY: 0,
    noteX: 0,
    noteY: 0,
  })

  const [isComposeOpen, setIsComposeOpen] = React.useState(false)
  const [noteContent, setNoteContent] = React.useState("")
  const [selectedColor, setSelectedColor] = React.useState(
    stickyColors[0]?.cardClass ??
      "bg-yellow-100 border-yellow-300 text-yellow-900"
  )
  const [submitting, setSubmitting] = React.useState(false)
  const [postError, setPostError] = React.useState<string | null>(null)

  // Real-time remote poll: fetches exclusively from database API
  const refreshRemoteNotes = React.useCallback(async () => {
    try {
      const res = await fetch("/api/freedom-wall", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.notes)) {
          syncFreedomWallNotes(json.notes)
        }
      }
    } catch {
      // Background poll silently retries next interval
    }
  }, [syncFreedomWallNotes])

  const centerBoard = React.useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setScale(1)
    setPan({
      x: Math.round(rect.width / 2 - canvasConfig.defaultCenterX),
      y: Math.round(rect.height / 2 - canvasConfig.defaultCenterY),
    })
  }, [canvasConfig.defaultCenterX, canvasConfig.defaultCenterY])

  React.useEffect(() => {
    void hydrateFreedomWall()
    const timer = window.setTimeout(() => {
      centerBoard()
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search)
        if (params.get("compose") === "true") {
          setIsComposeOpen(true)
        }
      }
    }, 0)

    // Periodic 3.5s real-time poll ensuring all browsers synchronize
    const pollInterval = window.setInterval(refreshRemoteNotes, 3500)

    return () => {
      window.clearTimeout(timer)
      window.clearInterval(pollInterval)
    }
  }, [hydrateFreedomWall, refreshRemoteNotes, centerBoard])

  // Realtime websocket listener (when client env vars are available)
  React.useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!url || !key) return

    try {
      const client = createClient(url, key, { auth: { persistSession: false } })
      const channel = client
        .channel("freedom-wall-realtime-feed")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "freedom_wall_posts" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const note = mapRowToFreedomWallNote(payload.new as SupabaseFreedomWallNoteRow)
              if (note) {
                syncFreedomWallNotes([note, ...notes.filter((n) => n.id !== note.id)])
              }
            } else {
              void refreshRemoteNotes()
            }
          }
        )
        .subscribe()

      return () => {
        void client.removeChannel(channel)
      }
    } catch {
      // Fallback polling guarantees sync
    }
  }, [notes, refreshRemoteNotes, syncFreedomWallNotes])

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = -e.deltaY * 0.0012
    setScale((prev) =>
      Math.min(
        canvasConfig.maxScale,
        Math.max(canvasConfig.minScale, Number((prev + delta).toFixed(2)))
      )
    )
  }

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-sticky-note]")) return
    if ((e.target as HTMLElement).closest("[data-wall-toolbar]")) return
    setIsPanning(true)
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingNoteId) {
      const dx = (e.clientX - dragNoteStartRef.current.clientX) / scale
      const dy = (e.clientY - dragNoteStartRef.current.clientY) / scale
      moveFreedomWallNote(
        draggingNoteId,
        dragNoteStartRef.current.noteX + dx,
        dragNoteStartRef.current.noteY + dy,
        false
      )
      return
    }

    if (!isPanning) return
    const dx = e.clientX - panStartRef.current.x
    const dy = e.clientY - panStartRef.current.y
    setPan({
      x: panStartRef.current.panX + dx,
      y: panStartRef.current.panY + dy,
    })
  }

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingNoteId) {
      const note = notes.find((n) => n.id === draggingNoteId)
      if (note) {
        moveFreedomWallNote(note.id, note.x, note.y, true)
      }
      setDraggingNoteId(null)
    }
    if (isPanning) {
      setIsPanning(false)
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // Ignore release errors
      }
    }
  }

  const handleNotePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    noteId: string,
    noteX: number,
    noteY: number
  ) => {
    e.stopPropagation()
    setDraggingNoteId(noteId)
    dragNoteStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      noteX,
      noteY,
    }
  }

  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim() || submitting) return
    setSubmitting(true)
    setPostError(null)

    const el = viewportRef.current
    let targetX = canvasConfig.defaultCenterX
    let targetY = canvasConfig.defaultCenterY
    if (el) {
      const rect = el.getBoundingClientRect()
      targetX = Math.round(
        (rect.width / 2 - pan.x) / scale -
          112 +
          (Math.random() - 0.5) * 180
      )
      targetY = Math.round(
        (rect.height / 2 - pan.y) / scale -
          90 +
          (Math.random() - 0.5) * 140
      )
    }

    const newCandidate = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      content: noteContent.trim().slice(0, canvasConfig.maxMessageLength),
      x: Math.max(80, Math.min(5600, targetX)),
      y: Math.max(80, Math.min(5600, targetY)),
      color: selectedColor,
      rotation: Number(((Math.random() - 0.5) * 8).toFixed(2)),
      createdAt: new Date().toISOString(),
      authorLabel: "Anonymous",
    }

    try {
      const res = await fetch("/api/freedom-wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCandidate),
      })
      const json = await res.json()

      if (json.success && json.note) {
        // Confirmed saved in database! Now and only now show on the board
        syncFreedomWallNotes([json.note as FreedomWallStickyNote, ...notes.filter((n) => n.id !== (json.note as FreedomWallStickyNote).id)])
        setNoteContent("")
        setIsComposeOpen(false)
      } else {
        // Database insert failed! Do NOT show on board
        setPostError(
          json.error ||
          "Unable to post note to the board right now. Please ensure your database table is ready, then try again."
        )
      }
    } catch (err) {
      setPostError(
        err instanceof Error
          ? err.message
          : "Network connection error. Please try again in a moment."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative h-[80vh] min-h-[580px] w-full max-w-full overflow-hidden rounded-3xl border border-border bg-slate-950 select-none">
      {/* Viewport & Dragging Container */}
      <div
        ref={viewportRef}
        onWheel={handleWheel}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
        className={cn(
          "absolute inset-0 touch-none overflow-hidden",
          isPanning ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ touchAction: "none" }}
      >
        {/* Top Floating Pill Toolbar */}
        <div
          data-wall-toolbar
          className="pointer-events-auto absolute top-4 left-1/2 z-30 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-slate-700/60 bg-slate-900/90 px-3 py-1.5 shadow-xl backdrop-blur-md sm:gap-3 sm:px-4 sm:py-2"
        >
          {/* Live Indicator Pill */}
          <div className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white">
              {uiCopy.toolbarBadge}
            </span>
            {notes.length > 0 ? (
              <Badge variant="secondary" className="px-1.5 py-0 font-mono text-[11px] bg-slate-800 text-slate-200">
                {notes.length}
              </Badge>
            ) : null}
          </div>

          <div className="hidden h-4 w-px bg-slate-700 sm:block" />

          <span className="hidden items-center gap-1.5 text-xs text-slate-400 md:inline-flex">
            <Move className="size-3.5 text-slate-500" />
            {uiCopy.toolbarHint}
          </span>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-1">
            <span className="min-w-[3rem] text-center font-mono text-xs text-slate-300">
              {Math.round(scale * 100)}%
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={centerBoard}
              title={uiCopy.resetViewLabel}
              className="text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <Button
            type="button"
            size="sm"
            onClick={() => {
              setPostError(null)
              setIsComposeOpen(true)
            }}
            className="rounded-xl bg-blue-600 font-bold text-xs text-white shadow-md hover:bg-blue-500 active:bg-blue-700"
          >
            <Plus className="size-3.5 stroke-[2.5] mr-1" />
            {uiCopy.addNoteButtonLabel}
          </Button>
        </div>

        {/* Empty State Overlay (When database has 0 notes) */}
        {notes.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-slate-700 bg-slate-900/60">
              <Plus className="size-6 text-slate-500" />
            </div>
            <p className="text-base font-bold text-slate-300">
              {uiCopy.emptyStateTitle}
            </p>
            <p className="max-w-sm text-xs leading-relaxed text-slate-500">
              {uiCopy.emptyStateSubtitle}
            </p>
          </div>
        ) : null}

        {/* Virtual 6000x6000 Dotted Sticky-Note Canvas */}
        <div
          style={{
            width: canvasConfig.width,
            height: canvasConfig.height,
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
            transformOrigin: "0 0",
            backgroundImage:
              "radial-gradient(circle, rgba(148, 163, 184, 0.18) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
          className="relative transition-transform duration-75 ease-out"
        >
          {/* Subtle Canvas Center Marker */}
          <div
            style={{
              left: canvasConfig.defaultCenterX - 100,
              top: canvasConfig.defaultCenterY - 100,
              width: 200,
              height: 200,
            }}
            className="pointer-events-none absolute flex items-center justify-center rounded-full border border-dashed border-slate-800/80"
          >
            <span className="font-mono text-[10px] tracking-widest text-slate-700 uppercase">
              Center
            </span>
          </div>

          {/* Sticky Notes */}
          {notes.map((note) => {
            const isDragging = draggingNoteId === note.id
            return (
              <div
                key={note.id}
                data-sticky-note
                onPointerDown={(e) =>
                  handleNotePointerDown(e, note.id, note.x, note.y)
                }
                style={{
                  left: note.x,
                  top: note.y,
                  transform: `rotate(${note.rotation}deg) scale(${isDragging ? 1.05 : 1})`,
                  zIndex: isDragging ? 50 : 10,
                }}
                className={cn(
                  "absolute w-56 sm:w-60 cursor-grab rounded-2xl border-2 p-4 text-xs shadow-md transition-shadow active:cursor-grabbing",
                  note.color,
                  isDragging
                    ? "shadow-2xl ring-2 ring-blue-500/80"
                    : "hover:shadow-xl"
                )}
              >
                {/* Note Pin / Tape Header */}
                <div className="mb-2 flex items-center justify-between opacity-70">
                  <span className="size-2 rounded-full bg-black/25" />
                  <span className="font-mono text-[10px] font-medium">
                    {formatNoteTimestamp(note.createdAt)}
                  </span>
                </div>

                {/* Note Message */}
                <p className="font-medium leading-relaxed break-words whitespace-pre-wrap">
                  {note.content}
                </p>

                {/* Footer Attribution */}
                <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] opacity-65 font-mono">
                  <span>{note.authorLabel || "Anonymous"}</span>
                  <span>Iriga City</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Compose Sticky Note Modal */}
      {isComposeOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          onClick={() => setIsComposeOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {uiCopy.modalTitle}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsComposeOpen(false)}
                aria-label="Close modal"
                className="text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="size-5" />
              </Button>
            </div>

            <form onSubmit={handlePostNote} className="mt-4">
              {/* Error Notice if Database Insert Failed */}
              {postError ? (
                <div className="mb-3 rounded-xl border border-rose-500/50 bg-rose-950/60 p-3 text-xs text-rose-200">
                  <p className="font-semibold text-rose-300">Could not place note</p>
                  <p className="mt-0.5 text-rose-200/90 text-[11px] leading-relaxed">{postError}</p>
                </div>
              ) : null}

              {/* Live Sticky Note Preview */}
              <div
                className={cn(
                  "mb-4 min-h-[76px] rounded-xl border-2 p-3.5 text-sm leading-relaxed transition-colors",
                  selectedColor
                )}
              >
                {noteContent.trim() ? (
                  <p className="font-medium break-words whitespace-pre-wrap">
                    {noteContent}
                  </p>
                ) : (
                  <span className="italic opacity-45">
                    {uiCopy.previewLabel}
                  </span>
                )}
              </div>

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={uiCopy.messagePlaceholder}
                maxLength={canvasConfig.maxMessageLength}
                rows={4}
                autoFocus
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <div className="mt-1 text-right text-xs text-slate-500">
                {noteContent.length}/{canvasConfig.maxMessageLength}
              </div>

              {/* Sticky-Note Color Picker */}
              <div className="mt-3 mb-5 flex items-center gap-2.5">
                <span className="text-xs text-slate-400">
                  {uiCopy.colorPickerLabel}
                </span>
                <div className="flex items-center gap-2">
                  {stickyColors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      title={c.label}
                      onClick={() => setSelectedColor(c.cardClass)}
                      className={cn(
                        "size-6 rounded-full transition-transform",
                        c.dotClass,
                        selectedColor === c.cardClass
                          ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                          : "opacity-75 hover:opacity-100"
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsComposeOpen(false)}
                  className="flex-1 rounded-xl border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {uiCopy.cancelButtonLabel}
                </Button>
                <Button
                  type="submit"
                  disabled={!noteContent.trim() || submitting}
                  className="flex-1 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {submitting
                    ? uiCopy.submittingButtonLabel
                    : uiCopy.submitButtonLabel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
