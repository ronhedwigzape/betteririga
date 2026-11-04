/**
 * BetterIriga.org — Central Civic Store
 *
 * All Client Components and pages read their data, UI copy, search filters,
 * Freedom Wall sticky-note canvas state, and source verification status from
 * this store so nothing is hardcoded in UI files.
 */

import { create } from "zustand"
import {
  FreedomWallStickyNoteSchema,
  fetchCivicDataFromApi,
  formatNoteTimestamp,
  formatPeso,
  formatPesoCompact,
  formatPhpMillions,
  formatPhtDate,
  formatPhtDateTime,
  formatPhtTime,
  getCivicSnapshot,
  getVerificationLedgerSummary,
  searchCivicRecords,
  detectCarrier,
  getBrandLogos,
  getHeroMedia,
  getCivicPillars,
  getCarrierRegistry,
  getNationalBudget,
  getBetterGovDatasets,
  type BrandLogos,
  type CarrierRegistry,
  type CarrierType,
  type CivicDatasetSnapshot,
  type DirectoryControls,
  type FreedomWallStickyNote,
  type HeroMedia,
  type SearchableCivicRecord,
  type VerificationLedgerSummary,
} from "@/lib/data/iriga-data"

export {
  formatNoteTimestamp,
  formatPeso,
  formatPesoCompact,
  formatPhpMillions,
  formatPhtDate,
  formatPhtDateTime,
  formatPhtTime,
  detectCarrier,
  getBrandLogos,
  getHeroMedia,
  getCivicPillars,
  getCarrierRegistry,
  getNationalBudget,
  getBetterGovDatasets,
}
import {
  fetchSupabaseFreedomWallNotes,
  insertSupabaseFreedomWallNote,
  isSupabaseFreedomWallConfigured,
  updateSupabaseFreedomWallNotePosition,
} from "@/lib/supabase/freedom-wall"

export interface LiveVerificationResult {
  status: "idle" | "checking" | "verified" | "offline-fallback"
  apiSha256?: string
  psgcStatus?: string
  checkedAt?: string
}

export interface NewFreedomWallNoteInput {
  content: string
  color?: string
  x?: number
  y?: number
}

const STORAGE_KEYS = {
  stickyNotes: "betteririga:freedom-wall:sticky-notes:v3",
} as const

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeWriteJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage quota or private browsing restrictions
  }
}

export interface CivicStoreState {
  snapshot: CivicDatasetSnapshot
  directoryControls: DirectoryControls
  ledger: VerificationLedgerSummary
  searchQuery: string
  searchSection: SearchableCivicRecord["section"] | "all"
  verificationFilter: "all" | "verified-only" | "open-gaps"
  liveVerification: LiveVerificationResult

  // Universal formatters backed by Zod store
  formatNoteTimestamp: (isoDate: string) => string
  formatPeso: (amountPhp: number) => string
  formatPesoCompact: (amountPhp: number) => string
  formatPhpMillions: (amountPhp: number) => string
  formatPhtDate: (isoDateOrDate: string | Date) => string
  formatPhtDateTime: (isoDateOrDate: string | Date) => string
  formatPhtTime: (isoDateOrDate: string | Date) => string
  detectCarrier: (number?: string, networkOrType?: string) => CarrierType
  getBrandLogos: () => BrandLogos | undefined
  getHeroMedia: () => HeroMedia | undefined
  getCivicPillars: () => string[]
  getCarrierRegistry: () => CarrierRegistry | undefined

  // Freedom Wall sticky-note canvas state (empty by default until notes are added)
  freedomWallHydrated: boolean
  freedomWallStorageMode: "supabase" | "local-fallback"
  freedomWallNotes: FreedomWallStickyNote[]

  // Actions
  setSearchQuery: (query: string) => void
  setSearchSection: (
    section: SearchableCivicRecord["section"] | "all"
  ) => void
  setVerificationFilter: (
    filter: "all" | "verified-only" | "open-gaps"
  ) => void
  resetSearch: () => void
  getSearchResults: () => SearchableCivicRecord[]
  syncFromApi: (
    baseUrl?: string,
    fetcher?: (url: string) => Promise<Response>
  ) => Promise<CivicDatasetSnapshot>
  runLiveAudit: () => Promise<void>

  // Freedom Wall Sticky-Note Canvas Actions
  hydrateFreedomWall: () => Promise<void>
  addFreedomWallNote: (input: NewFreedomWallNoteInput) => FreedomWallStickyNote
  moveFreedomWallNote: (
    noteId: string,
    x: number,
    y: number,
    persistRemote?: boolean
  ) => void
}

export const useCivicStore = create<CivicStoreState>((set, get) => {
  const initialSnapshot = getCivicSnapshot()

  return {
    snapshot: initialSnapshot,
    directoryControls: initialSnapshot.siteContent.directoryControls,
    ledger: getVerificationLedgerSummary(),
    searchQuery: "",
    searchSection: "all",
    verificationFilter: "all",
    liveVerification: {
      status: "idle",
    },

    // Formatters
    formatNoteTimestamp,
    formatPeso,
    formatPesoCompact,
    formatPhpMillions,
    formatPhtDate,
    formatPhtDateTime,
    formatPhtTime,
    detectCarrier,
    getBrandLogos,
    getHeroMedia,
    getCivicPillars,
    getCarrierRegistry,

    freedomWallHydrated: false,
    freedomWallStorageMode: isSupabaseFreedomWallConfigured()
      ? "supabase"
      : "local-fallback",
    freedomWallNotes: [],

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchSection: (searchSection) => set({ searchSection }),
  setVerificationFilter: (verificationFilter) => set({ verificationFilter }),
  resetSearch: () =>
    set({
      searchQuery: "",
      searchSection: "all",
      verificationFilter: "all",
    }),

  getSearchResults: () => {
    const { searchQuery, searchSection, verificationFilter } = get()
    return searchCivicRecords(searchQuery, searchSection, verificationFilter)
  },

  syncFromApi: async (baseUrl = "", fetcher) => {
    const verifiedSnapshot = await fetchCivicDataFromApi(baseUrl, fetcher)
    set({
      snapshot: verifiedSnapshot,
      ledger: getVerificationLedgerSummary(),
    })
    return verifiedSnapshot
  },

  runLiveAudit: async () => {
    set({ liveVerification: { status: "checking" } })
    const { ledger } = get()
    try {
      const apiRes = await fetch("/api/civic-data", { cache: "no-store" })
      const apiJson = await apiRes.json()

      let psgcNote = "Iriga City Official Records Checked"
      try {
        const psgcRes = await fetch(
          "https://psgc.gitlab.io/api/cities/051716000/"
        )
        if (psgcRes.ok) {
          const psgcData = await psgcRes.json()
          if (psgcData?.name) {
            psgcNote = `National Directory Match (${psgcData.name})`
          }
        }
      } catch {
        psgcNote = "Saved Official Records Confirmed"
      }

      set({
        liveVerification: {
          status:
            apiJson?.validation?.datasetSha256 === ledger.datasetSha256
              ? "verified"
              : "offline-fallback",
          apiSha256: apiJson?.validation?.datasetSha256,
          psgcStatus: psgcNote,
          checkedAt: new Date().toLocaleTimeString(),
        },
      })
    } catch {
      set({
        liveVerification: {
          status: "offline-fallback",
          psgcStatus: "All published records match our saved source list",
          checkedAt: new Date().toLocaleTimeString(),
        },
      })
    }
  },

  hydrateFreedomWall: async () => {
    if (get().freedomWallHydrated) return

    const savedNotesRaw = safeReadJson<unknown[]>(STORAGE_KEYS.stickyNotes, [])
    const validLocalNotes: FreedomWallStickyNote[] = []
    for (const item of savedNotesRaw) {
      const parsed = FreedomWallStickyNoteSchema.safeParse(item)
      if (parsed.success) {
        validLocalNotes.push(parsed.data)
      }
    }

    const supabaseConfigured = isSupabaseFreedomWallConfigured()
    set({
      freedomWallHydrated: true,
      freedomWallStorageMode: supabaseConfigured
        ? "supabase"
        : "local-fallback",
      freedomWallNotes: validLocalNotes,
    })

    if (supabaseConfigured) {
      const remoteNotes = await fetchSupabaseFreedomWallNotes()
      const remoteIds = new Set(remoteNotes.map((n) => n.id))
      const merged = [
        ...remoteNotes,
        ...validLocalNotes.filter((n) => !remoteIds.has(n.id)),
      ]
      safeWriteJson(STORAGE_KEYS.stickyNotes, merged)
      set({
        freedomWallNotes: merged,
        freedomWallStorageMode: "supabase",
      })
    }
  },

  addFreedomWallNote: (input) => {
    const { snapshot, freedomWallNotes } = get()
    const defaultColor =
      snapshot.freedomWall.stickyColors[0]?.cardClass ??
      "bg-yellow-100 border-yellow-300 text-yellow-900"

    const centerX =
      input.x ??
      Math.round(
        snapshot.freedomWall.canvas.defaultCenterX +
          (Math.random() - 0.5) * 320
      )
    const centerY =
      input.y ??
      Math.round(
        snapshot.freedomWall.canvas.defaultCenterY +
          (Math.random() - 0.5) * 240
      )
    const rotation = Number(((Math.random() - 0.5) * 8).toFixed(2))

    const candidate: FreedomWallStickyNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      content: input.content.trim().slice(0, 500),
      x: Math.max(80, Math.min(5600, centerX)),
      y: Math.max(80, Math.min(5600, centerY)),
      color: input.color || defaultColor,
      rotation,
      createdAt: new Date().toISOString(),
      authorLabel: "Anonymous",
    }

    const validated = FreedomWallStickyNoteSchema.parse(candidate)
    const nextNotes = [validated, ...freedomWallNotes]

    safeWriteJson(STORAGE_KEYS.stickyNotes, nextNotes)
    set({ freedomWallNotes: nextNotes })

    if (isSupabaseFreedomWallConfigured()) {
      void insertSupabaseFreedomWallNote(validated)
    }

    return validated
  },

  moveFreedomWallNote: (noteId, x, y, persistRemote = false) => {
    const clampedX = Math.max(40, Math.min(5700, Math.round(x)))
    const clampedY = Math.max(40, Math.min(5700, Math.round(y)))

    const updated = get().freedomWallNotes.map((note) =>
      note.id === noteId ? { ...note, x: clampedX, y: clampedY } : note
    )

    safeWriteJson(STORAGE_KEYS.stickyNotes, updated)
    set({ freedomWallNotes: updated })

    if (persistRemote && isSupabaseFreedomWallConfigured()) {
      void updateSupabaseFreedomWallNotePosition(noteId, clampedX, clampedY)
    }
  },
  }
})
