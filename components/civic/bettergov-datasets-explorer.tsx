"use client"

import * as React from "react"
import {
  Database,
  ExternalLink,
  Search,
  Copy,
  Check,
  FileCode2,
  HardDrive,
  Calendar,
  Tag,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BetterGovDataset } from "@/lib/data/schemas"
import { CitationBadge } from "@/components/civic/citation-badge"

interface BetterGovDatasetsExplorerProps {
  datasets: BetterGovDataset[]
  defaultCategory?: string
  title?: string
  subtitle?: string
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) {
    return `${(bytes / 1_000_000_000).toFixed(2)} GB`
  }
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(2)} MB`
  }
  if (bytes >= 1_000) {
    return `${(bytes / 1_000).toFixed(1)} KB`
  }
  return `${bytes} B`
}

export function BetterGovDatasetsExplorer({
  datasets,
  defaultCategory = "all",
  title = "BetterGov.ph Open Datasets Catalog",
  subtitle = "Directly extracted from https://data.bettergov.ph/ — 100% verified public datasets covering elections, geodata, hazard maps, public works, taxes, and legal archives.",
}: BetterGovDatasetsExplorerProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>(defaultCategory)
  const [copiedId, setCopiedId] = React.useState<number | null>(null)

  const categories = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const d of datasets) {
      const cat = d.category?.name ?? "Other"
      map.set(cat, (map.get(cat) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
  }, [datasets])

  const filteredDatasets = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return datasets.filter((d) => {
      const matchesCategory =
        selectedCategory === "all" ||
        d.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
      if (!matchesCategory) return false

      if (!q) return true
      const haystack = `${d.name} ${d.description} ${d.tags.join(" ")} ${d.license} ${d.publisher?.name ?? ""}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [datasets, searchQuery, selectedCategory])

  const handleCopyApi = (dataset: BetterGovDataset) => {
    navigator.clipboard.writeText(dataset.apiUrl)
    setCopiedId(dataset.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Toolbar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Database className="size-4" />
              <span>{title}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          </div>

          <div className="relative w-full sm:w-72">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="size-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search datasets, tags, license..."
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:border-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-bold transition",
              selectedCategory === "all"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            All Datasets ({datasets.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-bold transition",
                selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredDatasets.map((d) => (
          <div
            key={d.id}
            className="civic-card-hover flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    {d.category.name}
                  </span>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-200">
                    {d.license}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-mono text-xs font-semibold text-muted-foreground">
                  <HardDrive className="size-3.5" />
                  <span>{formatBytes(d.sizeBytes)}</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground leading-snug">
                  {d.name}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {d.description}
                </p>
              </div>

              {/* Publisher & Metadata */}
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-2.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 truncate">
                  <Building2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate">{d.publisher?.name ?? "BetterGov.ph"}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                  <span>Updated {d.latestVersionDate}</span>
                </div>
              </div>

              {/* Tags */}
              {d.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {d.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      <Tag className="size-2.5" />
                      {tag}
                    </span>
                  ))}
                  {d.tags.length > 4 && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">
                      +{d.tags.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions & Citation */}
            <div className="space-y-3 pt-3 border-t border-border/70">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <a
                  href={d.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 shadow-2xs"
                >
                  <span>Open on Data.BetterGov.ph</span>
                  <ExternalLink className="size-3.5" />
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyApi(d)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-foreground/80 hover:bg-muted hover:text-foreground transition"
                    title="Copy REST API Endpoint"
                  >
                    {copiedId === d.id ? (
                      <>
                        <Check className="size-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copy API</span>
                      </>
                    )}
                  </button>

                  <a
                    href={d.apiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-foreground/80 hover:bg-muted hover:text-foreground transition"
                    title="View Raw JSON API Response"
                  >
                    <FileCode2 className="size-3" />
                    <span>JSON</span>
                  </a>
                </div>
              </div>

              <div className="pt-1">
                <CitationBadge citation={d.citation} compact />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDatasets.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground">
          No datasets match your search query &quot;{searchQuery}&quot;. Try clearing filters.
        </div>
      )}
    </div>
  )
}
