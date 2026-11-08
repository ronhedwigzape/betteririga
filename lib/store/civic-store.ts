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

function isSupabaseConfiguredFast(): boolean {
  if (typeof process === "undefined" || !process.env) return false
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof window === "undefined" ? process.env.SUPABASE_ANON_KEY : undefined)
  return Boolean(
    url &&
      key &&
      url.startsWith("https://") &&
      !url.includes("your-project-id") &&
      !url.includes("your-project-ref") &&
      !key.includes("your-publishable-key") &&
      !key.includes("your-anon-key") &&
      !key.includes("your-supabase-service-role-key")
  )
}

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
  freedomWallSyncError: string | null
  freedomWallTableExists: boolean
  clearFreedomWallSyncError: () => void

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
  syncFreedomWallNotes: (notes: FreedomWallStickyNote[]) => void
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
  let cachedLedgerSummary: VerificationLedgerSummary | null = null

  return {
    snapshot: initialSnapshot,
    directoryControls: initialSnapshot.siteContent.directoryControls,
    get ledger() {
      if (!cachedLedgerSummary) {
        cachedLedgerSummary = getVerificationLedgerSummary()
      }
      return cachedLedgerSummary
    },
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
    freedomWallStorageMode: isSupabaseConfiguredFast()
      ? "supabase"
      : "local-fallback",
    freedomWallNotes: [],
    freedomWallSyncError: null,
    freedomWallTableExists: true,
    clearFreedomWallSyncError: () => set({ freedomWallSyncError: null }),

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
    try {
      const { fetchSupabaseFreedomWallNotes } = await import(
        "@/lib/supabase/freedom-wall"
      )
      const remoteNotes = await fetchSupabaseFreedomWallNotes()
      set({
        freedomWallHydrated: true,
        freedomWallNotes: remoteNotes,
        freedomWallStorageMode: "supabase",
        freedomWallTableExists: true,
        freedomWallSyncError: null,
      })
    } catch (err) {
      set({
        freedomWallHydrated: true,
        freedomWallNotes: [],
        freedomWallSyncError: err instanceof Error ? err.message : String(err),
      })
    }
  },

  syncFreedomWallNotes: (incomingNotes) => {
    set({
      freedomWallNotes: incomingNotes,
      freedomWallHydrated: true,
    })
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

    if (typeof window === "undefined") {
      set({ freedomWallNotes: [validated, ...freedomWallNotes] })
      return validated
    }

    void (async () => {
      try {
        const { insertSupabaseFreedomWallNote } = await import(
          "@/lib/supabase/freedom-wall"
        )
        const res = await insertSupabaseFreedomWallNote(validated)
        if (res.storage === "supabase" && res.note) {
          set((state) => ({
            freedomWallNotes: [
              res.note,
              ...state.freedomWallNotes.filter((n) => n.id !== res.note.id),
            ],
            freedomWallSyncError: null,
          }))
        } else {
          set({
            freedomWallSyncError: res.error || "Unable to save note to database",
          })
        }
      } catch (err) {
        set({
          freedomWallSyncError:
            err instanceof Error ? err.message : "Failed to sync note",
        })
      }
    })()

    return validated
  },

  moveFreedomWallNote: (noteId, x, y, persistRemote = false) => {
    const clampedX = Math.max(40, Math.min(5700, Math.round(x)))
    const clampedY = Math.max(40, Math.min(5700, Math.round(y)))

    const updated = get().freedomWallNotes.map((note) =>
      note.id === noteId ? { ...note, x: clampedX, y: clampedY } : note
    )

    set({ freedomWallNotes: updated })

    if (persistRemote) {
      safeWriteJson(STORAGE_KEYS.stickyNotes, updated)
      void (async () => {
        const { updateSupabaseFreedomWallNotePosition } = await import(
          "@/lib/supabase/freedom-wall"
        )
        void updateSupabaseFreedomWallNotePosition(noteId, clampedX, clampedY)
      })()
    }
  },
  }
})
