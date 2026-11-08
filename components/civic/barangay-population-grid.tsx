"use client"

import * as React from "react"
import { Search, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface BarangayPopulationItem {
  name: string
  population: number
  classification: string
  pctOfCity: number
}

interface BarangayPopulationGridProps {
  barangays: BarangayPopulationItem[]
}

export function BarangayPopulationGrid({
  barangays,
}: BarangayPopulationGridProps) {
  const [query, setQuery] = React.useState("")
  const [showAllMobile, setShowAllMobile] = React.useState(false)

  const q = query.trim().toLowerCase()
  const filtered = barangays.filter((b) =>
    `${b.name} ${b.classification}`.toLowerCase().includes(q)
  )

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs sm:p-6 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="size-4 text-muted-foreground" />
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter 36 barangays by name or urban/rural..."
            aria-label="Filter barangay population rankings"
            className="h-9 w-full rounded-xl border border-input bg-background pr-3 pl-9 text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          Showing <strong className="text-foreground">{filtered.length}</strong>{" "}
          of <strong className="text-foreground">{barangays.length}</strong>{" "}
          barangays
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b, idx) => {
          const originalRank =
            barangays.findIndex((item) => item.name === b.name) + 1
          return (
            <div
              key={b.name}
              className={cn(
                !showAllMobile && !q && idx >= 12 && "hidden sm:block",
                "rounded-xl border border-border/70 bg-background p-3 text-xs transition-colors hover:border-blue-300 dark:hover:border-blue-800"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-foreground truncate">
                  #{originalRank || idx + 1}. Barangay {b.name}
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0">
                  {b.population.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="truncate">{b.classification.split("/")[0]}</span>
                <span className="shrink-0">{b.pctOfCity}% of city</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-blue-500"
                  style={{
                    width: `${((b.population / 10792) * 100).toFixed(1)}%`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length > 12 && !q ? (
        <button
          type="button"
          data-mobile-expand-barangays="statistics"
          onClick={() => setShowAllMobile((prev) => !prev)}
          className="flex sm:hidden w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-xs font-bold text-blue-900 shadow-2xs transition hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200"
        >
          <span>
            {showAllMobile
              ? "Show Top 12 Populous Barangays"
              : `Show All ${filtered.length} Barangays (Toggle Full Ranking)`}
          </span>
          {showAllMobile ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
      ) : null}
    </div>
  )
}

