/**
 * BetterIriga.org — Security, Sanitization & Rate-Limiting Module
 *
 * Implements strict controls per OWASP guidelines and the security-and-hardening skill:
 * - Anti-flood burst protection (minimum 10s between note submissions)
 * - Daily quota per browser session & IP (maximum 5 notes per calendar day)
 * - Input sanitization (strips script tags, HTML tags, control chars)
 * - Drag/update rate limit (maximum 60 position updates per minute)
 */

interface ClientQuotaRecord {
  dailyCount: number
  lastPostTimestamp: number
  datePht: string // YYYY-MM-DD in PHT
}

interface PatchRateRecord {
  count: number
  windowStart: number
}

// In-memory rate and quota stores
const quotaStore = new Map<string, ClientQuotaRecord>()
const patchRateStore = new Map<string, PatchRateRecord>()

const DAILY_LIMIT = 5
const BURST_MIN_INTERVAL_MS = 10_000 // 10 seconds between posts
const PATCH_WINDOW_MS = 60_000 // 1 minute
const PATCH_MAX_PER_MINUTE = 60

/**
 * Returns current Philippine Standard Time date string (YYYY-MM-DD, UTC+8)
 */
export function getPhtDateString(date = new Date()): string {
  const pht = new Date(date.getTime() + 8 * 60 * 60 * 1000)
  return pht.toISOString().slice(0, 10)
}

/**
 * Strips HTML tags, script blocks (including contents), javascript: protocols, and control characters.
 */
export function sanitizeText(input: string, maxLength = 280): string {
  if (typeof input !== "string") return ""
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // strip script tags + contents
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // strip style tags + contents
    .replace(/<[^>]*>/g, "") // strip all remaining HTML tags
    .replace(/javascript:/gi, "") // strip javascript: pseudo-protocols
    .replace(/data:/gi, "") // strip data: URIs
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // strip control characters
    .trim()
    .slice(0, maxLength)
}

/**
 * Validates whether a client (IP + browser session) is allowed to post a note.
 */
export function checkFreedomWallQuota(
  ip: string,
  sessionId = "anon"
): {
  allowed: boolean
  remaining: number
  reason?: "burst" | "daily_limit"
  message?: string
  retryAfterSeconds?: number
} {
  const today = getPhtDateString()
  const key = `${ip || "unknown"}:${sessionId || "anon"}`
  const now = Date.now()

  // Clean up any stale records from previous days if map gets large
  if (quotaStore.size > 2000) {
    for (const [k, v] of quotaStore.entries()) {
      if (v.datePht !== today) {
        quotaStore.delete(k)
      }
    }
  }

  const existing = quotaStore.get(key)

  if (!existing || existing.datePht !== today) {
    return {
      allowed: true,
      remaining: DAILY_LIMIT,
    }
  }

  // 1. Daily session/IP quota check (evaluated first so exhausted quota reports daily_limit)
  if (existing.dailyCount >= DAILY_LIMIT) {
    return {
      allowed: false,
      reason: "daily_limit",
      remaining: 0,
      message: `Daily limit reached (${DAILY_LIMIT} notes per day). To keep our community board healthy and prevent database overload, each browser session can post up to ${DAILY_LIMIT} notes per day. Please return tomorrow to post again.`,
    }
  }

  // 2. Anti-flood burst check (minimum interval between consecutive submissions)
  const timeSinceLast = now - existing.lastPostTimestamp
  if (timeSinceLast < BURST_MIN_INTERVAL_MS) {
    const retryAfter = Math.ceil((BURST_MIN_INTERVAL_MS - timeSinceLast) / 1000)
    return {
      allowed: false,
      reason: "burst",
      remaining: Math.max(0, DAILY_LIMIT - existing.dailyCount),
      retryAfterSeconds: retryAfter,
      message: `Please wait ${retryAfter} second${retryAfter > 1 ? "s" : ""} before posting another note.`,
    }
  }

  return {
    allowed: true,
    remaining: DAILY_LIMIT - existing.dailyCount,
  }
}

/**
 * Records a successful post submission for the client quota.
 */
export function recordFreedomWallPost(ip: string, sessionId = "anon"): number {
  const today = getPhtDateString()
  const key = `${ip || "unknown"}:${sessionId || "anon"}`
  const now = Date.now()

  const existing = quotaStore.get(key)
  if (!existing || existing.datePht !== today) {
    quotaStore.set(key, {
      dailyCount: 1,
      lastPostTimestamp: now,
      datePht: today,
    })
    return DAILY_LIMIT - 1
  }

  existing.dailyCount += 1
  existing.lastPostTimestamp = now
  quotaStore.set(key, existing)
  return Math.max(0, DAILY_LIMIT - existing.dailyCount)
}

/**
 * Checks PATCH position drag rate limit (max 60 updates per minute per IP).
 */
export function checkDragRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = patchRateStore.get(ip)

  if (!record || now - record.windowStart > PATCH_WINDOW_MS) {
    patchRateStore.set(ip, { count: 1, windowStart: now })
    return true
  }

  if (record.count >= PATCH_MAX_PER_MINUTE) {
    return false
  }

  record.count += 1
  patchRateStore.set(ip, record)
  return true
}

/**
 * Test helper to reset rate limit stores.
 */
export function resetRateLimitsForTesting(): void {
  quotaStore.clear()
  patchRateStore.clear()
}
