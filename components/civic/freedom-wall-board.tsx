"use client"

import * as React from "react"
import {
  Plus,
  RotateCcw,
  X,
  Move,
  AlertCircle,
  LayoutGrid,
  Compass,
} from "lucide-react"
import { createClient, type RealtimeChannel } from "@supabase/supabase-js"
import { formatNoteTimestamp } from "@/lib/data/iriga-data"
import { useCivicStore } from "@/lib/store/civic-store"
import {
  mapRowToFreedomWallNote,
  type SupabaseFreedomWallNoteRow,
} from "@/lib/supabase/freedom-wall"
import type { FreedomWallStickyNote } from "@/lib/data/schemas"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const NOTE_CARD_WIDTH = 240
const NOTE_CARD_HEIGHT = 176
const NOTE_COLLISION_X = 216
const NOTE_COLLISION_Y = 156

/**
 * Deterministic visual de-stacking for Freedom Wall sticky notes so notes
 * with identical or overlapping coordinates never completely cover each other
 * across mobile, tablet, or desktop breakpoints.
 */
export function resolveVisibleNotePositions(
  notes: FreedomWallStickyNote[],
  draggingNoteId: string | null = null
): Array<FreedomWallStickyNote & { displayX: number; displayY: number }> {
  const placed: Array<
    FreedomWallStickyNote & { displayX: number; displayY: number }
  > = []

  // Sort oldest-first when assigning slots so existing notes stay stable
  const ordered = [...notes].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)
  )

  const resolvedMap = new Map<string, { displayX: number; displayY: number }>()

  for (const note of ordered) {
    let candidateX = note.x
    let candidateY = note.y

    if (note.id !== draggingNoteId) {
      let step = 0
      const maxSteps = 36
      while (
        step < maxSteps &&
        placed.some(
          (other) =>
            Math.abs(other.displayX - candidateX) < NOTE_COLLISION_X &&
            Math.abs(other.displayY - candidateY) < NOTE_COLLISION_Y
        )
      ) {
        step += 1
        // Golden-angle / hex-grid spiral around the original (x, y)
        const ring = Math.floor((step - 1) / 6) + 1
        const slotInRing = (step - 1) % 6
        const angle = (slotInRing * Math.PI) / 3 + (ring % 2) * (Math.PI / 6)
        const offsetX = Math.round(
          Math.cos(angle) * (NOTE_CARD_WIDTH + 20) * ring
        )
        const offsetY = Math.round(
          Math.sin(angle) * (NOTE_CARD_HEIGHT + 20) * ring
        )
        candidateX = Math.max(80, Math.min(5600, note.x + offsetX))
        candidateY = Math.max(80, Math.min(5600, note.y + offsetY))
      }
    }

    const resolved = { ...note, displayX: candidateX, displayY: candidateY }
    placed.push(resolved)
    resolvedMap.set(note.id, { displayX: candidateX, displayY: candidateY })
  }

  return notes.map((n) => {
    const pos = resolvedMap.get(n.id) ?? { displayX: n.x, displayY: n.y }
    return { ...n, displayX: pos.displayX, displayY: pos.displayY }
  })
}

export function FreedomWallBoard() {
  const snapshot = useCivicStore((state) => state.snapshot)
  const freedomWall = snapshot.freedomWall
  const canvasConfig = freedomWall.canvas
  const stickyColors = freedomWall.stickyColors
  const uiCopy = freedomWall.uiCopy

  const notes = useCivicStore((state) => state.freedomWallNotes)
  const hydrateFreedomWall = useCivicStore((state) => state.hydrateFreedomWall)
  const syncFreedomWallNotes = useCivicStore(
    (state) => state.syncFreedomWallNotes
  )
  const moveFreedomWallNote = useCivicStore(
    (state) => state.moveFreedomWallNote
  )

  const viewportRef = React.useRef<HTMLDivElement>(null)
  const canvasSurfaceRef = React.useRef<HTMLDivElement>(null)
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  const noteElementsRef = React.useRef<Map<string, HTMLDivElement>>(new Map())

  const [pan, setPan] = React.useState({ x: 0, y: 0 })
  const [scale, setScale] = React.useState(1)
  const [isPanning, setIsPanning] = React.useState(false)
  const panRef = React.useRef({ x: 0, y: 0 })
  const scaleRef = React.useRef(1)
  const isPanningRef = React.useRef(false)
  const panStartRef = React.useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  const [draggingNoteId, setDraggingNoteId] = React.useState<string | null>(
    null
  )
  const draggingNoteIdRef = React.useRef<string | null>(null)
  const [activeNoteId, setActiveNoteId] = React.useState<string | null>(null)
  const hasAutoCenteredNotesRef = React.useRef(false)
  const lastViewportWidthRef = React.useRef(0)

  const dragNoteStartRef = React.useRef({
    noteId: "",
    clientX: 0,
    clientY: 0,
    noteX: 0,
    noteY: 0,
    currentX: 0,
    currentY: 0,
    rotation: 0,
  })
  const lastBroadcastAtRef = React.useRef(0)
  const notesRef = React.useRef(notes)
  React.useEffect(() => {
    notesRef.current = notes
  }, [notes])
  React.useEffect(() => {
    panRef.current = pan
  }, [pan])
  React.useEffect(() => {
    scaleRef.current = scale
  }, [scale])

  const [isComposeOpen, setIsComposeOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<"canvas" | "list">("canvas")
  const [noteContent, setNoteContent] = React.useState("")
  const [selectedColor, setSelectedColor] = React.useState(
    stickyColors[0]?.cardClass ??
      "bg-yellow-100 border-yellow-300 text-yellow-900"
  )
  const [submitting, setSubmitting] = React.useState(false)
  const [postError, setPostError] = React.useState<string | null>(null)

  // Live presence and real-time typing indicators
  const [liveCount, setLiveCount] = React.useState<number>(1)
  const [typingCount, setTypingCount] = React.useState<number>(0)
  const presenceChannelRef = React.useRef<RealtimeChannel | null>(null)
  const isComposeOpenRef = React.useRef(isComposeOpen)

  // De-stacked visible note coordinates so notes never cover each other
  const visibleNotes = React.useMemo(
    () => resolveVisibleNotePositions(notes, draggingNoteId),
    [notes, draggingNoteId]
  )
  const visibleNotesRef = React.useRef(visibleNotes)
  React.useEffect(() => {
    visibleNotesRef.current = visibleNotes
  }, [visibleNotes])

  // Daily quota limitation per browser session (max 5 notes per day)
  const DAILY_LIMIT = 5
  const [dailyPostsCount, setDailyPostsCount] = React.useState<number>(() => {
    if (typeof window === "undefined") return 0
    try {
      const todayDate = new Date().toISOString().slice(0, 10)
      return Number(
        localStorage.getItem(`betteririga_fw_quota_${todayDate}`) || 0
      )
    } catch {
      return 0
    }
  })

  const [sessionToken] = React.useState<string>(() => {
    if (typeof window === "undefined") return ""
    try {
      let sess = sessionStorage.getItem("betteririga_fw_session")
      if (!sess) {
        sess = `fw_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
        sessionStorage.setItem("betteririga_fw_session", sess)
      }
      return sess
    } catch {
      return ""
    }
  })

  // Real-time presence heartbeat function
  const sendHeartbeat = React.useCallback(
    async (typing: boolean) => {
      if (!sessionToken) return
      try {
        const res = await fetch("/api/freedom-wall/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionToken,
            isTyping: typing,
          }),
          cache: "no-store",
        })
        if (res.ok) {
          const data = await res.json()
          if (data.success && typeof data.liveCount === "number") {
            setLiveCount(Math.max(1, data.liveCount))
            setTypingCount(data.typingCount || 0)
          }
        }
      } catch {
        // Heartbeat silently retries next interval
      }
    },
    [sessionToken]
  )

  const openComposeModal = React.useCallback(() => {
    setPostError(null)
    setIsComposeOpen(true)
    void sendHeartbeat(true)
  }, [sendHeartbeat])

  const closeComposeModal = React.useCallback(() => {
    setIsComposeOpen(false)
    void sendHeartbeat(false)
  }, [sendHeartbeat])

  // Sync compose open ref and broadcast typing changes to Supabase Presence
  React.useEffect(() => {
    isComposeOpenRef.current = isComposeOpen
    if (presenceChannelRef.current) {
      void presenceChannelRef.current.track({
        online_at: new Date().toISOString(),
        isTyping: isComposeOpen,
      })
    }
  }, [isComposeOpen])

  // Periodic heartbeat & unmount/beforeunload cleanup
  React.useEffect(() => {
    void sendHeartbeat(isComposeOpenRef.current)

    const presenceInterval = window.setInterval(() => {
      void sendHeartbeat(isComposeOpenRef.current)
    }, 4500)

    const handleBeforeUnload = () => {
      if (
        sessionToken &&
        typeof navigator !== "undefined" &&
        navigator.sendBeacon
      ) {
        const payload = JSON.stringify({ sessionId: sessionToken, leave: true })
        const blob = new Blob([payload], { type: "application/json" })
        navigator.sendBeacon("/api/freedom-wall/presence", blob)
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.clearInterval(presenceInterval)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [sendHeartbeat, sessionToken])

  // Real-time remote poll: fetches exclusively from database API
  const refreshRemoteNotes = React.useCallback(async () => {
    // Never overwrite local note coordinates while the user is actively dragging a note
    if (draggingNoteIdRef.current) return
    try {
      const res = await fetch("/api/freedom-wall", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      })
      if (res.ok) {
        const json = await res.json()
        if (
          json.success &&
          Array.isArray(json.notes) &&
          !draggingNoteIdRef.current
        ) {
          syncFreedomWallNotes(json.notes)
        }
      }
    } catch {
      // Background poll silently retries next interval
    }
  }, [syncFreedomWallNotes])

  /**
   * Toolbar-safe, breakpoint-adaptive board centering.
   * Ensures all sticky notes are framed below `[data-wall-toolbar]` and inside
   * the visible viewport across mobile (320px–640px), tablet (768px), and desktop (1024px+).
   */
  const centerBoard = React.useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    const toolbarEl =
      toolbarRef.current ??
      (el.querySelector("[data-wall-toolbar]") as HTMLElement | null)
    const toolbarHeight = toolbarEl
      ? toolbarEl.getBoundingClientRect().height
      : 48
    const safeTop = Math.max(84, Math.ceil(toolbarHeight + 32))
    const safeBottom = 24
    const safeSide = rect.width < 640 ? 16 : 32

    const availW = Math.max(200, rect.width - safeSide * 2)
    const availH = Math.max(200, rect.height - safeTop - safeBottom)
    const safeCenterScreenX = rect.width / 2
    const safeCenterScreenY = safeTop + availH / 2

    const currentNotes = visibleNotesRef.current
    if (currentNotes.length === 0) {
      const baseScale = rect.width < 640 ? 0.9 : 1
      const nextPan = {
        x: Math.round(
          safeCenterScreenX - canvasConfig.defaultCenterX * baseScale
        ),
        y: Math.round(
          safeCenterScreenY - canvasConfig.defaultCenterY * baseScale
        ),
      }
      scaleRef.current = baseScale
      panRef.current = nextPan
      if (canvasSurfaceRef.current) {
        canvasSurfaceRef.current.style.transform = `translate3d(${nextPan.x}px, ${nextPan.y}px, 0) scale(${baseScale})`
      }
      setScale(baseScale)
      setPan(nextPan)
      return
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const n of currentNotes) {
      minX = Math.min(minX, n.displayX)
      minY = Math.min(minY, n.displayY)
      maxX = Math.max(maxX, n.displayX + NOTE_CARD_WIDTH)
      maxY = Math.max(maxY, n.displayY + NOTE_CARD_HEIGHT)
    }

    const bboxW = Math.max(NOTE_CARD_WIDTH, maxX - minX)
    const bboxH = Math.max(NOTE_CARD_HEIGHT, maxY - minY)
    const bboxCenterX = minX + bboxW / 2
    const bboxCenterY = minY + bboxH / 2

    const fitScaleX = availW / (bboxW + 24)
    const fitScaleY = availH / (bboxH + 24)
    const rawFitScale = Math.min(1, fitScaleX, fitScaleY)
    const minReadableScale = rect.width < 640 ? 0.65 : 0.72
    const nextScale = Number(
      Math.max(
        Math.max(canvasConfig.minScale, minReadableScale),
        Math.min(1, rawFitScale)
      ).toFixed(2)
    )
    const nextPan = {
      x: Math.round(safeCenterScreenX - bboxCenterX * nextScale),
      y: Math.round(safeCenterScreenY - bboxCenterY * nextScale),
    }

    scaleRef.current = nextScale
    panRef.current = nextPan
    if (canvasSurfaceRef.current) {
      canvasSurfaceRef.current.style.transform = `translate3d(${nextPan.x}px, ${nextPan.y}px, 0) scale(${nextScale})`
    }
    setScale(nextScale)
    setPan(nextPan)
  }, [
    canvasConfig.defaultCenterX,
    canvasConfig.defaultCenterY,
    canvasConfig.minScale,
  ])

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

  // Auto-center once when initial remote notes finish hydrating so notes are immediately visible
  React.useEffect(() => {
    if (notes.length > 0 && !hasAutoCenteredNotesRef.current) {
      hasAutoCenteredNotesRef.current = true
      const timer = window.setTimeout(() => {
        centerBoard()
      }, 20)
      return () => window.clearTimeout(timer)
    }
  }, [notes.length, centerBoard])

  // Keep notes centered and uncovered across mobile/tablet/desktop viewport breakpoint changes
  React.useEffect(() => {
    const el = viewportRef.current
    if (!el || typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const width = Math.round(entry.contentRect.width)
      if (
        width > 0 &&
        Math.abs(width - lastViewportWidthRef.current) > 24
      ) {
        lastViewportWidthRef.current = width
        centerBoard()
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [centerBoard])

  // Realtime websocket listener (when client env vars are available)
  React.useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!url || !key) return

    try {
      const client = createClient(url, key, { auth: { persistSession: false } })

      // Postgres changes channel for notes
      const notesChannel = client
        .channel("freedom-wall-realtime-feed")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "freedom_wall_posts" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const note = mapRowToFreedomWallNote(
                payload.new as SupabaseFreedomWallNoteRow
              )
              if (note) {
                syncFreedomWallNotes([
                  note,
                  ...notesRef.current.filter((n) => n.id !== note.id),
                ])
              }
            } else if (payload.eventType === "UPDATE") {
              const updated = mapRowToFreedomWallNote(
                payload.new as SupabaseFreedomWallNoteRow
              )
              if (updated && updated.id !== draggingNoteIdRef.current) {
                syncFreedomWallNotes(
                  notesRef.current.map((n) =>
                    n.id === updated.id ? updated : n
                  )
                )
              }
            } else if (!draggingNoteIdRef.current) {
              void refreshRemoteNotes()
            }
          }
        )
        .subscribe()

      // Realtime presence & live drag broadcast channel
      const presenceChannel = client.channel("freedom-wall-presence", {
        config: {
          presence: { key: sessionToken || "anon_user" },
          broadcast: { self: false },
        },
      })

      presenceChannel
        .on("presence", { event: "sync" }, () => {
          const state = presenceChannel.presenceState()
          const presences = Object.values(state).flat() as Array<{
            isTyping?: boolean
          }>
          if (presences.length > 0) {
            setLiveCount(Math.max(1, presences.length))
            const typing = presences.filter((p) => Boolean(p.isTyping)).length
            setTypingCount(typing)
          }
        })
        .on("broadcast", { event: "note-move" }, ({ payload }) => {
          const data = payload as {
            id?: string
            x?: number
            y?: number
          } | null
          if (
            !data ||
            typeof data.id !== "string" ||
            typeof data.x !== "number" ||
            typeof data.y !== "number"
          ) {
            return
          }
          if (data.id === draggingNoteIdRef.current) return

          // Zero-latency direct DOM update for remote viewers + store update
          const el = noteElementsRef.current.get(data.id)
          const matched = notesRef.current.find((n) => n.id === data.id)
          if (el && matched) {
            el.style.transform = `translate3d(${data.x}px, ${data.y}px, 0) rotate(${matched.rotation}deg) scale(1)`
          }
          moveFreedomWallNote(data.id, data.x, data.y, false)
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await presenceChannel.track({
              online_at: new Date().toISOString(),
              isTyping: isComposeOpenRef.current,
            })
          }
        })

      presenceChannelRef.current = presenceChannel

      return () => {
        void client.removeChannel(notesChannel)
        void client.removeChannel(presenceChannel)
        presenceChannelRef.current = null
      }
    } catch {
      // Fallback polling guarantees sync
    }
  }, [refreshRemoteNotes, syncFreedomWallNotes, moveFreedomWallNote, sessionToken])

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = -e.deltaY * 0.0012
    const nextScale = Math.min(
      canvasConfig.maxScale,
      Math.max(canvasConfig.minScale, Number((scaleRef.current + delta).toFixed(2)))
    )
    scaleRef.current = nextScale
    if (canvasSurfaceRef.current) {
      canvasSurfaceRef.current.style.transform = `translate3d(${panRef.current.x}px, ${panRef.current.y}px, 0) scale(${nextScale})`
    }
    setScale(nextScale)
  }

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-sticky-note]")) return
    if ((e.target as HTMLElement).closest("[data-wall-toolbar]")) return
    isPanningRef.current = true
    setIsPanning(true)
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // Ignore synthetic events in tests without pointer capture support
    }
  }

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const activeDragId = draggingNoteIdRef.current
    if (activeDragId) {
      const currentScale = scaleRef.current || 1
      const dx = (e.clientX - dragNoteStartRef.current.clientX) / currentScale
      const dy = (e.clientY - dragNoteStartRef.current.clientY) / currentScale
      const nextX = Math.max(
        40,
        Math.min(5700, Math.round(dragNoteStartRef.current.noteX + dx))
      )
      const nextY = Math.max(
        40,
        Math.min(5700, Math.round(dragNoteStartRef.current.noteY + dy))
      )
      dragNoteStartRef.current.currentX = nextX
      dragNoteStartRef.current.currentY = nextY

      // <1ms Direct GPU-Composited DOM Transform (zero React re-render on pointermove)
      const noteEl = noteElementsRef.current.get(activeDragId)
      if (noteEl) {
        noteEl.style.transform = `translate3d(${nextX}px, ${nextY}px, 0) rotate(${dragNoteStartRef.current.rotation}deg) scale(1.05)`
      }

      // Throttled realtime broadcast (every ~45ms) so other live viewers see smooth movement
      const now = performance.now()
      if (
        presenceChannelRef.current &&
        now - lastBroadcastAtRef.current >= 45
      ) {
        lastBroadcastAtRef.current = now
        void presenceChannelRef.current.send({
          type: "broadcast",
          event: "note-move",
          payload: { id: activeDragId, x: nextX, y: nextY },
        })
      }
      return
    }

    if (!isPanningRef.current) return
    const dx = e.clientX - panStartRef.current.x
    const dy = e.clientY - panStartRef.current.y
    const nextPanX = Math.round(panStartRef.current.panX + dx)
    const nextPanY = Math.round(panStartRef.current.panY + dy)
    panRef.current = { x: nextPanX, y: nextPanY }

    // <1ms Direct GPU-Composited Canvas Pan (zero React re-render on pointermove)
    if (canvasSurfaceRef.current) {
      canvasSurfaceRef.current.style.transform = `translate3d(${nextPanX}px, ${nextPanY}px, 0) scale(${scaleRef.current})`
    }
  }

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const activeDragId = draggingNoteIdRef.current
    if (activeDragId) {
      const finalX = dragNoteStartRef.current.currentX
      const finalY = dragNoteStartRef.current.currentY
      draggingNoteIdRef.current = null
      setDraggingNoteId(null)

      // Commit final position once to store + Supabase + broadcast
      moveFreedomWallNote(activeDragId, finalX, finalY, true)
      if (presenceChannelRef.current) {
        void presenceChannelRef.current.send({
          type: "broadcast",
          event: "note-move",
          payload: { id: activeDragId, x: finalX, y: finalY },
        })
      }
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // Ignore release errors
      }
    }
    if (isPanningRef.current) {
      isPanningRef.current = false
      setIsPanning(false)
      setPan(panRef.current)
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
    noteY: number,
    rotation: number
  ) => {
    e.stopPropagation()
    draggingNoteIdRef.current = noteId
    dragNoteStartRef.current = {
      noteId,
      clientX: e.clientX,
      clientY: e.clientY,
      noteX,
      noteY,
      currentX: noteX,
      currentY: noteY,
      rotation,
    }
    setActiveNoteId(noteId)
    setDraggingNoteId(noteId)

    // Capture pointer on viewport container so fast drags outside note bounds never drop frames
    if (viewportRef.current) {
      try {
        viewportRef.current.setPointerCapture(e.pointerId)
      } catch {
        // Ignore synthetic events in tests without pointer capture support
      }
    }
  }

  const handlePostNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim() || submitting) return

    // Enforce daily quota limitation (max 5 notes/day per browser session)
    if (dailyPostsCount >= DAILY_LIMIT) {
      setPostError(
        `Daily limit reached (${DAILY_LIMIT} of ${DAILY_LIMIT} notes posted today). To keep the community wall protected and prevent database overload, each browser can post up to ${DAILY_LIMIT} notes per day. Please return tomorrow to share more thoughts.`
      )
      return
    }

    setSubmitting(true)
    setPostError(null)

    const el = viewportRef.current
    let targetX = canvasConfig.defaultCenterX - NOTE_CARD_WIDTH / 2
    let targetY = canvasConfig.defaultCenterY - NOTE_CARD_HEIGHT / 2

    if (el) {
      const rect = el.getBoundingClientRect()
      const toolbarEl =
        toolbarRef.current ??
        (el.querySelector("[data-wall-toolbar]") as HTMLElement | null)
      const toolbarHeight = toolbarEl
        ? toolbarEl.getBoundingClientRect().height
        : 48
      const safeTop = Math.max(84, Math.ceil(toolbarHeight + 32))
      const safeBottom = 24
      const safeCenterScreenX = rect.width / 2
      const safeCenterScreenY =
        safeTop + Math.max(180, rect.height - safeTop - safeBottom) / 2

      const baseCanvasX = Math.round(
        (safeCenterScreenX - pan.x) / scale - NOTE_CARD_WIDTH / 2
      )
      const baseCanvasY = Math.round(
        (safeCenterScreenY - pan.y) / scale - NOTE_CARD_HEIGHT / 2
      )

      // Find an uncovered position near the center of the toolbar-safe viewport
      const existingVisible = visibleNotesRef.current
      targetX = baseCanvasX
      targetY = baseCanvasY

      let step = 0
      while (
        step < 24 &&
        existingVisible.some(
          (other) =>
            Math.abs(other.displayX - targetX) < NOTE_COLLISION_X &&
            Math.abs(other.displayY - targetY) < NOTE_COLLISION_Y
        )
      ) {
        step += 1
        const ring = Math.floor((step - 1) / 6) + 1
        const slot = (step - 1) % 6
        const angle = (slot * Math.PI) / 3 + (ring % 2) * (Math.PI / 6)
        targetX = Math.round(
          baseCanvasX + Math.cos(angle) * (NOTE_CARD_WIDTH + 20) * ring
        )
        targetY = Math.round(
          baseCanvasY + Math.sin(angle) * (NOTE_CARD_HEIGHT + 20) * ring
        )
      }
    }

    const newCandidate = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      content: noteContent.trim().slice(0, canvasConfig.maxMessageLength),
      x: Math.max(80, Math.min(5600, targetX)),
      y: Math.max(80, Math.min(5600, targetY)),
      color: selectedColor,
      rotation: Number(((Math.random() - 0.5) * 6).toFixed(2)),
      createdAt: new Date().toISOString(),
      authorLabel: "Anonymous",
    }

    try {
      const res = await fetch("/api/freedom-wall", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionToken || "anon",
        },
        body: JSON.stringify(newCandidate),
      })
      const json = await res.json()

      if (json.success && json.note) {
        // Confirmed saved in database! Update local daily quota count
        const newCount = dailyPostsCount + 1
        setDailyPostsCount(newCount)
        try {
          const todayDate = new Date().toISOString().slice(0, 10)
          localStorage.setItem(
            `betteririga_fw_quota_${todayDate}`,
            String(newCount)
          )
        } catch {
          // Ignore storage write error
        }

        const postedNote = json.note as FreedomWallStickyNote
        setActiveNoteId(postedNote.id)
        syncFreedomWallNotes([
          postedNote,
          ...notes.filter((n) => n.id !== postedNote.id),
        ])
        setNoteContent("")
        closeComposeModal()

        // Ensure newly posted note is framed below the toolbar across all breakpoints
        window.setTimeout(() => {
          centerBoard()
        }, 30)
      } else {
        // Database insert failed or limit reached!
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
          ref={toolbarRef}
          data-wall-toolbar
          className="pointer-events-auto absolute top-3 sm:top-4 left-1/2 z-30 flex flex-wrap sm:flex-nowrap justify-center max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-1 sm:gap-2.5 rounded-2xl border border-slate-700/60 bg-slate-900/95 px-2.5 py-1.5 shadow-xl backdrop-blur-md sm:px-4 sm:py-2"
        >
          {/* Live Indicator Pill with Visitor & Typing Counts */}
          <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg px-1 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold">
            <span
              className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0"
              aria-hidden="true"
            />
            <span className="text-xs font-bold uppercase tracking-wide text-white">
              {uiCopy.toolbarBadge || "Live"}
            </span>
            <Badge
              variant="secondary"
              className="px-1.5 py-0 font-mono text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shadow-2xs"
            >
              {liveCount} live
            </Badge>
            {typingCount > 0 ? (
              <span
                role="status"
                aria-live="polite"
                className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-1.5 sm:px-2 py-0.5 text-[11px] font-semibold text-amber-300 animate-pulse"
              >
                <span className="size-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                <span className="truncate max-w-[65px] sm:max-w-none">
                  {typingCount === 1
                    ? "1 typing…"
                    : `${typingCount} typing…`}
                </span>
              </span>
            ) : null}
            {notes.length > 0 ? (
              <Badge
                variant="secondary"
                className="hidden sm:inline-flex px-1.5 py-0 font-mono text-[11px] bg-slate-800 text-slate-300 border border-slate-700/60"
              >
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </Badge>
            ) : null}
          </div>

          <div className="hidden h-4 w-px bg-slate-700 sm:block" />

          <span className="hidden items-center gap-1.5 text-xs text-slate-400 lg:inline-flex">
            <Move className="size-3.5 text-slate-500" />
            {uiCopy.toolbarHint}
          </span>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-1">
            {viewMode === "canvas" ? (
              <>
                <span className="hidden xs:inline min-w-[2.5rem] sm:min-w-[3rem] text-center font-mono text-[11px] sm:text-xs text-slate-300">
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
              </>
            ) : null}

            <button
              type="button"
              data-wall-view-toggle
              onClick={() =>
                setViewMode((prev) => (prev === "canvas" ? "list" : "canvas"))
              }
              title={
                viewMode === "canvas"
                  ? "Switch to Readable Card List View"
                  : "Switch to Interactive 2D Sticky-Note Canvas"
              }
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/90 px-2 py-1 text-[11px] font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
            >
              {viewMode === "canvas" ? (
                <>
                  <LayoutGrid className="size-3 text-blue-400" />
                  <span>List ({notes.length})</span>
                </>
              ) : (
                <>
                  <Compass className="size-3 text-emerald-400" />
                  <span>Canvas</span>
                </>
              )}
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <Button
            type="button"
            size="sm"
            onClick={openComposeModal}
            className="h-7 sm:h-8 rounded-xl bg-blue-600 px-2.5 sm:px-3 font-bold text-xs text-white shadow-md hover:bg-blue-500 active:bg-blue-700"
          >
            <Plus className="size-3.5 stroke-[2.5] mr-1" />
            {uiCopy.addNoteButtonLabel}
          </Button>
        </div>

        {/* Readable Mobile & Desktop Card Feed Overlay (When viewMode === "list") */}
        {viewMode === "list" ? (
          <div
            data-wall-list-view
            onPointerDown={(e) => e.stopPropagation()}
            className="pointer-events-auto absolute inset-0 z-20 overflow-y-auto bg-slate-950/95 px-4 pt-20 pb-8 sm:px-6 sm:pt-20"
          >
            <div className="mx-auto max-w-4xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Community Sticky Notes ({notes.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Easy-to-read scrollable card view for mobile & desktop. Switch back to Canvas anytime to drag notes!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("canvas")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700"
                >
                  <Compass className="size-3.5 text-emerald-400" />
                  Back to 2D Canvas
                </button>
              </div>

              {notes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center">
                  <p className="text-sm font-bold text-slate-300">
                    {uiCopy.emptyStateTitle}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {uiCopy.emptyStateSubtitle}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className={cn(
                        "flex flex-col justify-between rounded-2xl border-2 p-4 text-xs shadow-md",
                        note.color
                      )}
                    >
                      <div>
                        <div className="mb-2 flex items-center justify-between opacity-70">
                          <span className="size-2 rounded-full bg-black/25" />
                          <span className="font-mono text-[10px] font-medium">
                            {formatNoteTimestamp(note.createdAt)}
                          </span>
                        </div>
                        <p className="font-medium leading-relaxed break-words whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] opacity-65 font-mono">
                        <span>{note.authorLabel || "Anonymous"}</span>
                        <span>Iriga City</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Empty State Overlay (When database has 0 notes) */}
        {notes.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 pt-16 text-center">
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
          ref={canvasSurfaceRef}
          style={{
            width: canvasConfig.width,
            height: canvasConfig.height,
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
            transformOrigin: "0 0",
            willChange: "transform",
            backgroundImage:
              "radial-gradient(circle, rgba(148, 163, 184, 0.18) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
          className={cn(
            "relative",
            !isPanning && "transition-transform duration-75 ease-out"
          )}
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
          {visibleNotes.map((note, idx) => {
            const isDragging = draggingNoteId === note.id
            const isActive = activeNoteId === note.id
            return (
              <div
                key={note.id}
                ref={(el) => {
                  if (el) {
                    noteElementsRef.current.set(note.id, el)
                  } else {
                    noteElementsRef.current.delete(note.id)
                  }
                }}
                data-sticky-note
                onPointerDown={(e) =>
                  handleNotePointerDown(
                    e,
                    note.id,
                    note.displayX,
                    note.displayY,
                    note.rotation
                  )
                }
                style={{
                  left: 0,
                  top: 0,
                  transform: `translate3d(${note.displayX}px, ${note.displayY}px, 0) rotate(${note.rotation}deg) scale(${isDragging ? 1.05 : 1})`,
                  willChange: isDragging ? "transform" : undefined,
                  zIndex: isDragging ? 50 : isActive ? 25 : 10 + (idx % 10),
                }}
                className={cn(
                  "absolute w-56 sm:w-60 cursor-grab rounded-2xl border-2 p-4 text-xs shadow-md transition-shadow active:cursor-grabbing",
                  note.color,
                  isDragging
                    ? "shadow-2xl ring-2 ring-blue-500/80"
                    : isActive
                      ? "shadow-xl ring-1 ring-blue-400/50"
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
          onClick={closeComposeModal}
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
                onClick={closeComposeModal}
                aria-label="Close modal"
                className="text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="size-5" />
              </Button>
            </div>

            <form onSubmit={handlePostNote} className="mt-4">
              {/* Daily Quota Indicator */}
              <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs">
                <span className="text-slate-400 font-medium">
                  Daily Browser Quota
                </span>
                <Badge
                  variant={
                    dailyPostsCount < DAILY_LIMIT ? "secondary" : "destructive"
                  }
                  className={cn(
                    "text-[11px] font-semibold",
                    dailyPostsCount < DAILY_LIMIT
                      ? "bg-blue-900/60 text-blue-200 border-blue-700/50"
                      : "bg-amber-900/60 text-amber-200 border-amber-700/50"
                  )}
                >
                  {Math.max(0, DAILY_LIMIT - dailyPostsCount)} of {DAILY_LIMIT}{" "}
                  notes remaining today
                </Badge>
              </div>

              {/* Warning if Quota Exhausted */}
              {dailyPostsCount >= DAILY_LIMIT ? (
                <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-amber-500/50 bg-amber-950/40 p-3 text-xs text-amber-200">
                  <AlertCircle className="size-4 shrink-0 text-amber-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-300">
                      Daily Posting Limit Reached
                    </p>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      To keep the community freedom wall open and prevent
                      database overload, each browser can post up to{" "}
                      {DAILY_LIMIT} notes per day. Thank you for sharing your
                      voice — please come back tomorrow to post again!
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Error Notice if Database Insert Failed */}
              {postError ? (
                <div className="mb-3 rounded-xl border border-rose-500/50 bg-rose-950/60 p-3 text-xs text-rose-200">
                  <p className="font-semibold text-rose-300">
                    Could not place note
                  </p>
                  <p className="mt-0.5 text-rose-200/90 text-[11px] leading-relaxed">
                    {postError}
                  </p>
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
                disabled={dailyPostsCount >= DAILY_LIMIT}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
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
                  onClick={closeComposeModal}
                  className="flex-1 rounded-xl border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {uiCopy.cancelButtonLabel}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !noteContent.trim() ||
                    submitting ||
                    dailyPostsCount >= DAILY_LIMIT
                  }
                  className="flex-1 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {dailyPostsCount >= DAILY_LIMIT
                    ? "Daily Limit Reached"
                    : submitting
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
