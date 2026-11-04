"use client"

import * as React from "react"
import {
  Plus,
  RotateCcw,
  X,
  Move,
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
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
  const storageMode = useCivicStore((state) => state.freedomWallStorageMode)
  const syncError = useCivicStore((state) => state.freedomWallSyncError)
  const clearSyncError = useCivicStore(
    (state) => state.clearFreedomWallSyncError
  )
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

  // Diagnostics modal state
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = React.useState(false)
  const [diagnostics, setDiagnostics] = React.useState<{
    ok?: boolean
    status?: string
    summary?: string
    error?: string
    detectedEnv?: Record<string, boolean>
    maskedHost?: string | null
    keyType?: string
    tableExists?: boolean
    notesCount?: number
    setupSql?: string
    instructions?: string[]
  } | null>(null)
  const [loadingDiagnostics, setLoadingDiagnostics] = React.useState(false)
  const [copiedSql, setCopiedSql] = React.useState(false)

  const fetchDiagnostics = React.useCallback(async () => {
    setLoadingDiagnostics(true)
    try {
      const res = await fetch("/api/freedom-wall/diagnostics", {
        cache: "no-store",
      })
      if (res.ok) {
        const data = await res.json()
        setDiagnostics(data)
      }
    } catch {
      setDiagnostics({
        ok: false,
        status: "fetch_failed",
        summary: "Could not reach /api/freedom-wall/diagnostics",
      })
    } finally {
      setLoadingDiagnostics(false)
    }
  }, [])

  const handleOpenDiagnostics = () => {
    setIsDiagnosticsOpen(true)
    void fetchDiagnostics()
  }

  const handleCopySql = () => {
    if (!diagnostics?.setupSql) return
    navigator.clipboard.writeText(diagnostics.setupSql)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2000)
  }

  const handleRetrySync = async () => {
    await fetchDiagnostics()
    await hydrateFreedomWall()
  }

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
          {/* Database Connection Indicator Button */}
          <button
            type="button"
            onClick={handleOpenDiagnostics}
            title="Click to view database connection status and diagnostics"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold transition-colors hover:bg-gray-800"
          >
            {storageMode === "supabase" ? (
              <>
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden text-emerald-300 font-medium sm:inline">
                  Supabase
                </span>
                <span className="text-xs font-bold text-white">
                  {uiCopy.toolbarBadge}
                </span>
              </>
            ) : (
              <>
                <span className="size-2 rounded-full bg-amber-400" />
                <span className="text-xs font-medium text-amber-300">
                  Local Mode
                </span>
                <span className="hidden text-[11px] text-gray-400 underline sm:inline">
                  (Setup DB)
                </span>
              </>
            )}
            {notes.length > 0 ? (
              <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[11px] font-semibold text-gray-300">
                {notes.length}
              </span>
            ) : null}
          </button>

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

        {/* Floating Database Sync Notice (If note was saved to local storage but failed cloud sync) */}
        {syncError ? (
          <div className="pointer-events-auto absolute bottom-4 left-4 right-4 z-40 mx-auto max-w-lg rounded-xl border border-amber-600/70 bg-amber-950/95 p-3 shadow-2xl backdrop-blur-md text-xs text-amber-100 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start gap-2 min-w-0">
              <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-amber-200">
                  Note Saved to Device (Cloud Sync Pending)
                </p>
                <p className="mt-0.5 text-amber-300/80 truncate text-[11px]">
                  {syncError}
                </p>
                <button
                  type="button"
                  onClick={handleOpenDiagnostics}
                  className="mt-1 font-bold text-amber-300 underline hover:text-white"
                >
                  View Supabase Setup & Diagnostics &rarr;
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={clearSyncError}
              className="text-amber-400 hover:text-white shrink-0 p-1 rounded-md"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : null}

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

      {/* Post a Note Modal */}
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

      {/* Database Connection & Diagnostics Modal */}
      {isDiagnosticsOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          onClick={() => setIsDiagnosticsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-gray-700 bg-gray-900 p-6 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400">
                  <Database className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Freedom Wall Database Status
                  </h3>
                  <p className="text-xs text-gray-400">
                    Vercel & Supabase Cloud Connection Diagnostics
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDiagnosticsOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Overall Status Banner */}
              {loadingDiagnostics ? (
                <div className="flex items-center justify-center gap-2 p-6 text-sm text-gray-400">
                  <RefreshCw className="size-4 animate-spin text-blue-400" />
                  Testing live database connection...
                </div>
              ) : diagnostics?.ok ? (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-800/80 bg-emerald-950/40 p-3.5 text-xs text-emerald-200">
                  <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-100">
                      Supabase Cloud Connected & Ready
                    </p>
                    <p className="mt-0.5 text-emerald-300/90 leading-relaxed">
                      All new sticky notes are successfully saved to Supabase (table{" "}
                      <code className="rounded bg-emerald-900/60 px-1 py-0.5 text-[11px]">
                        freedom_wall_posts
                      </code>
                      ). Current cloud note count:{" "}
                      <strong>{diagnostics.notesCount ?? 0}</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-800/80 bg-amber-950/40 p-3.5 text-xs text-amber-200">
                  <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-100">
                      {diagnostics?.status === "table_missing"
                        ? "Action Needed: Create Database Table in Supabase"
                        : "Action Needed: Configure Supabase Credentials"}
                    </p>
                    <p className="mt-0.5 text-amber-300/90 leading-relaxed">
                      {diagnostics?.summary ||
                        "Sticky notes are currently stored locally in your browser because cloud sync could not reach Supabase."}
                    </p>
                  </div>
                </div>
              )}

              {/* Vercel Environment Variables Status */}
              <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                  1. Vercel Environment Variables
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-lg bg-gray-900 px-3 py-2">
                    <span className="font-mono text-gray-300">
                      NEXT_PUBLIC_SUPABASE_URL
                    </span>
                    <span
                      className={cn(
                        "font-semibold flex items-center gap-1",
                        diagnostics?.detectedEnv?.NEXT_PUBLIC_SUPABASE_URL ||
                          diagnostics?.detectedEnv?.SUPABASE_URL
                          ? "text-emerald-400"
                          : "text-rose-400"
                      )}
                    >
                      {diagnostics?.detectedEnv?.NEXT_PUBLIC_SUPABASE_URL ||
                      diagnostics?.detectedEnv?.SUPABASE_URL ? (
                        <>
                          <Check className="size-3.5" /> Detected (
                          {diagnostics.maskedHost ?? "connected"})
                        </>
                      ) : (
                        <>
                          <X className="size-3.5" /> Missing
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-900 px-3 py-2">
                    <span className="font-mono text-gray-300">
                      SUPABASE_ANON_KEY / SERVICE_ROLE
                    </span>
                    <span
                      className={cn(
                        "font-semibold flex items-center gap-1",
                        diagnostics?.keyType && diagnostics.keyType !== "none"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      )}
                    >
                      {diagnostics?.keyType && diagnostics.keyType !== "none" ? (
                        <>
                          <Check className="size-3.5" /> Active (
                          {diagnostics.keyType})
                        </>
                      ) : (
                        <>
                          <X className="size-3.5" /> Missing
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-gray-500">
                  Tip: In Vercel Project Settings &rarr; Environment Variables, add
                  these variables and trigger a <strong>Redeploy</strong>.
                </p>
              </div>

              {/* Supabase SQL Table Setup */}
              <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    2. Supabase SQL Schema
                  </h4>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/90 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-blue-500"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="size-3" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" /> Copy SQL
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Open your{" "}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 underline inline-flex items-center gap-0.5"
                  >
                    Supabase Dashboard <ExternalLink className="size-2.5" />
                  </a>{" "}
                  &rarr; <strong>SQL Editor</strong> &rarr; click{" "}
                  <strong>New query</strong> &rarr; paste this SQL &rarr; click{" "}
                  <strong>Run</strong>.
                </p>

                {diagnostics?.setupSql ? (
                  <pre className="mt-3 max-h-36 overflow-y-auto rounded-xl border border-gray-800 bg-gray-900 p-3 font-mono text-[11px] text-gray-300">
                    {diagnostics.setupSql}
                  </pre>
                ) : null}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRetrySync}
                  disabled={loadingDiagnostics}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-700 bg-gray-800 px-3.5 py-2 text-xs font-semibold text-gray-200 transition-colors hover:bg-gray-700 disabled:opacity-50"
                >
                  <RefreshCw
                    className={cn(
                      "size-3.5",
                      loadingDiagnostics && "animate-spin"
                    )}
                  />
                  Test Connection Now
                </button>
                <button
                  type="button"
                  onClick={() => setIsDiagnosticsOpen(false)}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-500"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export { FreedomWallCtaSection } from "./freedom-wall-cta"
