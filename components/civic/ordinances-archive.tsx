"use client"

import * as React from "react"
import { Search, FileDown, Archive, Scale } from "lucide-react"
import type { LegislativeMeasure } from "@/lib/data/iriga-data"
import { useCivicStore } from "@/lib/store/civic-store"
import { CitationBadge } from "@/components/civic/citation-badge"
import { GapNotice } from "@/components/civic/gap-notice"
import { Reveal } from "@/components/civic/reveal"
import { cn } from "@/lib/utils"

interface OrdinancesArchiveProps {
  measures?: LegislativeMeasure[]
}

export function OrdinancesArchive({ measures }: OrdinancesArchiveProps) {
  const storeMeasures = useCivicStore(
    (state) => state.snapshot.ordinancesAndResolutions
  )
  const directoryControls = useCivicStore((state) => state.directoryControls)
  const ordinanceTopics = directoryControls.ordinanceTopics as Array<
    "all" | LegislativeMeasure["topic"]
  >
  const ordinanceKinds = directoryControls.ordinanceKinds as Array<
    "all" | "Ordinance" | "Resolution"
  >
  const activeMeasures = measures ?? storeMeasures

  const [kind, setKind] = React.useState<"all" | "Ordinance" | "Resolution">(
    "all"
  )
  const [topic, setTopic] = React.useState<"all" | LegislativeMeasure["topic"]>(
    "all"
  )
  const [query, setQuery] = React.useState("")

  const filtered = activeMeasures.filter((m) => {
    const matchesKind = kind === "all" || m.kind === kind
    const matchesTopic = topic === "all" || m.topic === topic
    const q = query.trim().toLowerCase()
    const matchesQuery =
      !q ||
      `${m.number} ${m.title} ${m.summary} ${m.topic} ${m.year}`
        .toLowerCase()
        .includes(q)
    return matchesKind && matchesTopic && matchesQuery
  })

  return (
    <div className="space-y-6">
      {/* Sticky Filter Controls */}
      <div className="sticky top-[4.75rem] sm:top-[5rem] lg:top-[5.25rem] z-30 space-y-3 rounded-2xl border border-border/90 bg-card/95 p-3.5 shadow-md backdrop-blur-md supports-[backdrop-filter]:bg-card/85 sm:p-5">
        <div className="grid gap-3 md:grid-cols-3 items-center">
          <div className="relative h-10 md:col-span-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="size-4 text-muted-foreground" />
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ordinance number or topic (e.g., Tourism, Plastic Ban, CCTV, Taxes, Land Use)..."
              aria-label="Search ordinances and resolutions"
              className="h-10 w-full rounded-xl border border-input bg-background pr-4 pl-10 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {ordinanceKinds.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  kind === k
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {k === "all" ? "All Laws & Resolutions" : `${k}s`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex flex-wrap gap-1.5">
            {ordinanceTopics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  topic === t
                    ? "bg-blue-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "all" ? "All Topics" : t}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            Showing <strong>{filtered.length}</strong> of{" "}
            <strong>{activeMeasures.length}</strong> verified measures
          </span>
        </div>
      </div>

      {/* Measures List */}
      <Reveal delayMs={60}>
        <div className="space-y-4">
          {filtered.map((measure) => (
            <article
              key={measure.id}
              className="civic-card-hover rounded-2xl border border-border bg-card p-6 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
                      measure.kind === "Ordinance"
                        ? "bg-blue-600 text-white"
                        : "bg-purple-600 text-white"
                    )}
                  >
                    <Scale className="size-3" />
                    {measure.kind}
                  </span>
                  <span className="font-mono text-sm font-bold text-foreground">
                    {measure.number}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {measure.topic}
                  </span>
                </div>

                <span className="font-mono text-xs font-semibold text-muted-foreground">
                  Year: {measure.year}
                </span>
              </div>

              <h3 className="mt-3 text-base font-bold leading-snug text-foreground sm:text-lg">
                {measure.title}
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {measure.summary}
              </p>

              {/* PDF Download Links */}
              {measure.pdfUrl || measure.archivePdfUrl ? (
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {measure.pdfUrl ? (
                    <a
                      href={measure.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      <FileDown className="size-3.5" />
                      Download Official PDF (iriga.gov.ph)
                    </a>
                  ) : null}
                  {measure.archivePdfUrl ? (
                    <a
                      href={measure.archivePdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted"
                    >
                      <Archive className="size-3.5" />
                      Backup PDF Mirror (Internet Archive)
                    </a>
                  ) : null}
                </div>
              ) : null}

              {measure.gaps ? (
                <div className="mt-3">
                  <GapNotice
                    gaps={measure.gaps}
                    title="Full-Text PDF Availability Note"
                  />
                </div>
              ) : null}

              <div className="mt-4">
                <CitationBadge citation={measure.citation} compact />
              </div>
            </article>
          ))}
        </div>
      </Reveal>
    </div>
  )
}
