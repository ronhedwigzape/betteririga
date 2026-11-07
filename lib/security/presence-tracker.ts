/**
 * BetterIriga.org — Freedom Wall Live Presence & Real-Time Typing Tracker
 *
 * Tracks live visitors and active typers on the Community Freedom Wall.
 * Works seamlessly in memory for local/fallback and complements Supabase Realtime Presence.
 */

interface PresenceRecord {
  sessionId: string
  lastSeen: number
  isTyping: boolean
  typingLastSeen: number
}

const HEARTBEAT_TIMEOUT_MS = 15_000 // 15 seconds to consider active
const TYPING_TIMEOUT_MS = 6_000 // 6 seconds to consider actively typing
const MAX_STORE_SIZE = 5_000

// Use globalThis so presence persists across HMR and route re-evaluations in Node/Bun runtime
const globalPresenceStore = ((globalThis as unknown as { __betteririga_presence?: Map<string, PresenceRecord> })
  .__betteririga_presence ??= new Map<string, PresenceRecord>())

function pruneStale(now = Date.now()) {
  if (globalPresenceStore.size === 0) return
  for (const [sessionId, rec] of globalPresenceStore.entries()) {
    if (now - rec.lastSeen > HEARTBEAT_TIMEOUT_MS * 2) {
      globalPresenceStore.delete(sessionId)
    }
  }
}

export function recordPresence(
  sessionId: string,
  isTyping = false
): { liveCount: number; typingCount: number } {
  const now = Date.now()
  if (!sessionId || typeof sessionId !== "string") {
    return getPresenceStats()
  }

  // Prevent memory bloat
  if (globalPresenceStore.size > MAX_STORE_SIZE) {
    pruneStale(now)
  }

  const existing = globalPresenceStore.get(sessionId)
  globalPresenceStore.set(sessionId, {
    sessionId,
    lastSeen: now,
    isTyping: Boolean(isTyping),
    typingLastSeen: isTyping ? now : existing?.typingLastSeen ?? 0,
  })

  return getPresenceStats(now)
}

export function removePresence(
  sessionId: string
): { liveCount: number; typingCount: number } {
  if (sessionId && typeof sessionId === "string") {
    globalPresenceStore.delete(sessionId)
  }
  return getPresenceStats()
}

export function getPresenceStats(now = Date.now()): {
  liveCount: number
  typingCount: number
} {
  pruneStale(now)

  let live = 0
  let typing = 0

  for (const rec of globalPresenceStore.values()) {
    const isLive = now - rec.lastSeen <= HEARTBEAT_TIMEOUT_MS
    if (isLive) {
      live += 1
      const isCurrentlyTyping =
        rec.isTyping && now - rec.typingLastSeen <= TYPING_TIMEOUT_MS
      if (isCurrentlyTyping) {
        typing += 1
      }
    }
  }

  return {
    liveCount: Math.max(1, live), // At least 1 (the requesting user)
    typingCount: typing,
  }
}
