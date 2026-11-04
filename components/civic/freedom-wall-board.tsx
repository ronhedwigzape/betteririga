"use client"

import * as React from "react"
import {
  Plus,
  RotateCcw,
  X,
  Move,
} from "lucide-react"
import { formatNoteTimestamp } from "@/lib/data/iriga-data"
import { useCivicStore } from "@/lib/store/civic-store"
import { cn } from "@/lib/utils"

export function FreedomWallBoard() {
  const snapshot = useCivicStore((state) => state.snapshot)
  const freedomWall = snapshot.freedomWall
  const canvasConfig = freedomWall.canvas
  const stickyColors = freedomWall.stickyColors
  const uiCopy = freedomWall.uiCopy

  const notes = useCivicStore((state) => state.freedomWallNotes)
  const hydrateFreedomWall = useCivicStore((state) => state.hydrateFreedomWall)
  const addFreedomWallNote = useCivicStore((state) => state.addFreedomWallNote)
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
    return () => window.clearTimeout(timer)
  }, [hydrateFreedomWall, centerBoard])

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

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim() || submitting) return
    setSubmitting(true)

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

    addFreedomWallNote({
      content: noteContent.trim(),
      color: selectedColor,
      x: targetX,
      y: targetY,
    })

    setNoteContent("")
    setSubmitting(false)
    setIsComposeOpen(false)
  }

  return (
    <div className="relative">
      {/* Interactive Full-Canvas Sticky-Note Board (BetterLibmanan Style) */}
      <div
        ref={viewportRef}
        onWheel={handleWheel}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        className={cn(
          "relative h-[74dvh] min-h-[540px] w-full overflow-hidden rounded-3xl border border-gray-800 bg-gray-950 select-none shadow-2xl",
          isPanning ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ touchAction: "none" }}
      >
        {/* Top Floating Pill Toolbar */}
        <div
          data-wall-toolbar
          className="pointer-events-auto absolute top-4 left-1/2 z-30 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-gray-700/60 bg-gray-900/90 px-2.5 py-1.5 shadow-xl backdrop-blur-md sm:gap-3 sm:px-4 sm:py-2"
        >
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wide text-white">
              {uiCopy.toolbarBadge}
            </span>
            {notes.length > 0 ? (
              <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[11px] font-semibold text-gray-300">
                {notes.length}
              </span>
            ) : null}
          </div>

          <div className="hidden h-4 w-px bg-gray-700 sm:block" />

          <span className="hidden items-center gap-1.5 text-xs text-gray-400 md:inline-flex">
            <Move className="size-3.5 text-gray-500" />
            {uiCopy.toolbarHint}
          </span>

          <div className="h-4 w-px bg-gray-700" />

          <div className="flex items-center gap-1">
            <span className="min-w-[3rem] text-center font-mono text-xs text-gray-300">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={centerBoard}
              title={uiCopy.resetViewLabel}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-gray-700" />

          <button
            type="button"
            onClick={() => setIsComposeOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-blue-500 active:bg-blue-700"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            {uiCopy.addNoteButtonLabel}
          </button>
        </div>

        {/* Empty State Overlay (When database has 0 notes) */}
        {notes.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-gray-700 bg-gray-900/60">
              <Plus className="size-6 text-gray-500" />
            </div>
            <p className="text-base font-bold text-gray-300">
              {uiCopy.emptyStateTitle}
            </p>
            <p className="max-w-sm text-xs leading-relaxed text-gray-500">
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
              "radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          className="relative"
        >
          {notes.map((note) => (
            <div
              key={note.id}
              data-sticky-note
              onPointerDown={(e) =>
                handleNotePointerDown(e, note.id, note.x, note.y)
              }
              style={{
                left: note.x,
                top: note.y,
                transform: `rotate(${note.rotation}deg)`,
              }}
              className={cn(
                "absolute w-56 cursor-grab rounded-2xl border-2 p-4 shadow-lg transition-shadow select-none hover:shadow-2xl active:cursor-grabbing",
                note.color,
                draggingNoteId === note.id && "z-30 ring-2 ring-white/60"
              )}
            >
              <div className="mb-2 text-[10px] font-medium opacity-55">
                {formatNoteTimestamp(note.createdAt)}
              </div>
              <p className="text-sm leading-relaxed font-medium break-words whitespace-pre-wrap">
                {note.content}
              </p>
              <div className="mt-3 text-[10px] font-semibold opacity-45">
                {note.authorLabel || uiCopy.anonymousFooterLabel}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Floating + Button */}
        <button
          type="button"
          onClick={() => setIsComposeOpen(true)}
          aria-label={uiCopy.addNoteButtonLabel}
          className="pointer-events-auto absolute right-5 bottom-5 z-30 flex size-13 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-transform hover:bg-blue-500 active:scale-95 sm:hidden"
        >
          <Plus className="size-6" />
        </button>
      </div>

      {/* Post a Note Modal (Matches BetterLibmanan.org) */}
      {isComposeOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs"
          onClick={() => setIsComposeOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6 text-white shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {uiCopy.modalTitle}
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  {uiCopy.modalSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                aria-label="Close modal"
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handlePostNote}>
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
                className="w-full resize-none rounded-xl border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <div className="mt-1 text-right text-xs text-gray-500">
                {noteContent.length}/{canvasConfig.maxMessageLength}
              </div>

              {/* Sticky-Note Color Picker */}
              <div className="mt-3 mb-5 flex items-center gap-2.5">
                <span className="text-xs text-gray-400">
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
                          ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                          : "opacity-75 hover:opacity-100"
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="flex-1 rounded-xl bg-gray-800 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
                >
                  {uiCopy.cancelButtonLabel}
                </button>
                <button
                  type="submit"
                  disabled={!noteContent.trim() || submitting}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {submitting
                    ? uiCopy.submittingButtonLabel
                    : uiCopy.submitButtonLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export { FreedomWallCtaSection } from "./freedom-wall-cta"
