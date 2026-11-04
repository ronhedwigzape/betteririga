"use client"

import * as React from "react"
import { Search, Users, Building2, MapPin, Phone, Mail } from "lucide-react"
import { useCivicStore } from "@/lib/store/civic-store"
import { CitationBadge } from "@/components/civic/citation-badge"
import { GapNotice } from "@/components/civic/gap-notice"
import { Reveal } from "@/components/civic/reveal"
import { cn } from "@/lib/utils"

function getOfficialTabIcon(id: string) {
  if (id === "elected-2025") return Users
  if (id === "appointed") return Building2
  if (id === "barangays") return MapPin
  return Users
}

export function OfficialsDirectory() {
  const snapshot = useCivicStore((state) => state.snapshot)
  const officialTabs = snapshot.siteContent.directoryControls.officialTabs
  const brgyClassifications =
    snapshot.siteContent.directoryControls.barangayClassifications
  const elected2025 = snapshot.electedOfficials.filter(
    (o) => o.term === "2025-2028"
  )
  const elected2022 = snapshot.electedOfficials.filter(
    (o) => o.term === "2022-2025"
  )
  const appointed = snapshot.appointedOfficials
  const barangays = snapshot.barangays

  function getTabCount(id: string) {
    if (id === "elected-2025") return elected2025.length
    if (id === "appointed") return appointed.length
    if (id === "barangays") return barangays.length
    if (id === "elected-2022") return elected2022.length
    return 0
  }

  const [activeTab, setActiveTab] = React.useState<
    "elected-2025" | "appointed" | "barangays" | "elected-2022"
  >("elected-2025")
  const [query, setQuery] = React.useState("")
  const [brgyFilter, setBrgyFilter] = React.useState<string>("all")

  const q = query.trim().toLowerCase()

  const filteredElected2025 = elected2025.filter((o) =>
    `${o.name} ${o.position} ${o.party ?? ""}`.toLowerCase().includes(q)
  )

  const filteredElected2022 = elected2022.filter((o) =>
    `${o.name} ${o.position}`.toLowerCase().includes(q)
  )

  const filteredAppointed = appointed.filter((a) =>
    `${a.name} ${a.title} ${a.office}`.toLowerCase().includes(q)
  )

  const filteredBarangays = barangays.filter((b) => {
    const matchesClass =
      brgyFilter === "all" || b.classification === brgyFilter
    const matchesQuery = `${b.name} ${b.punongBarangay} ${b.classification}`
      .toLowerCase()
      .includes(q)
    return matchesClass && matchesQuery
  })

  return (
    <div className="space-y-6">
      {/* Sticky Controls & Search */}
      <div className="sticky top-[4.75rem] sm:top-[5rem] lg:top-[5.25rem] z-30 flex flex-col gap-3 rounded-2xl border border-border/90 bg-card/95 p-3.5 shadow-md backdrop-blur-md supports-[backdrop-filter]:bg-card/85 sm:gap-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {officialTabs.map((tab) => {
            const Icon = getOfficialTabIcon(tab.id)
            const count = getTabCount(tab.id)
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition sm:gap-2 sm:px-3.5 sm:py-2",
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-muted text-foreground/80 hover:bg-muted/80"
                )}
              >
                <Icon className="size-3.5" />
                {tab.label} ({count})
              </button>
            )
          })}
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="size-4 text-muted-foreground" />
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by official's name, department, barangay, or position..."
            aria-label="Filter officials and barangays"
            className="h-10 w-full rounded-xl border border-input bg-background pr-4 pl-10 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
          />
        </div>
      </div>

      {/* Tab 1: 2025-2028 Elected Officials */}
      {activeTab === "elected-2025" ? (
        <Reveal delayMs={60}>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredElected2025.map((official) => (
              <article
                key={official.id}
                className="civic-card-hover flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase",
                        official.roleCategory === "Executive"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      )}
                    >
                      {official.roleCategory} • {official.term}
                    </span>
                    {official.party ? (
                      <span className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs font-semibold">
                        Party: {official.party}
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {official.name}
                    </h3>
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                      {official.position}
                    </p>
                  </div>

                  {official.notes ? (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {official.notes}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
                    {official.officePhone ? (
                      <a
                        href={`tel:${official.officePhone.replace(/[^0-9+]/g, "")}`}
                        className="inline-flex items-center gap-1 font-medium text-foreground hover:text-blue-600"
                      >
                        <Phone className="size-3.5 text-blue-600" />
                        {official.officePhone}
                      </a>
                    ) : null}
                    {official.officeEmail ? (
                      <a
                        href={`mailto:${official.officeEmail}`}
                        className="inline-flex items-center gap-1 font-medium text-foreground hover:text-blue-600"
                      >
                        <Mail className="size-3.5 text-blue-600" />
                        {official.officeEmail}
                      </a>
                    ) : null}
                  </div>

                  {official.gaps ? (
                    <GapNotice
                      gaps={official.gaps}
                      title="Committee Assignment Note"
                    />
                  ) : null}
                </div>

                <div className="mt-4 pt-3">
                  <CitationBadge citation={official.citation} compact />
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      ) : null}

      {/* Tab 2: Appointed Department Heads */}
      {activeTab === "appointed" ? (
        <Reveal delayMs={60}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAppointed.map((head) => (
              <article
                key={head.id}
                className="civic-card-hover flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs"
              >
                <div className="space-y-2">
                  <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                    Department Head
                  </span>
                  <h3 className="text-base font-bold text-foreground">
                    {head.name}
                  </h3>
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                    {head.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{head.office}</p>

                  <div className="space-y-1 pt-2 text-xs">
                    {head.officePhone ? (
                      <p className="flex items-center gap-1.5">
                        <Phone className="size-3.5 text-muted-foreground" />
                        <a
                          href={`tel:${head.officePhone.replace(/[^0-9+]/g, "")}`}
                          className="font-mono font-medium hover:underline"
                        >
                          {head.officePhone}
                        </a>
                      </p>
                    ) : null}
                    {head.officeEmail ? (
                      <p className="flex items-center gap-1.5">
                        <Mail className="size-3.5 text-muted-foreground" />
                        <a
                          href={`mailto:${head.officeEmail}`}
                          className="truncate font-mono hover:underline"
                        >
                          {head.officeEmail}
                        </a>
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 pt-3">
                  <CitationBadge citation={head.citation} compact />
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      ) : null}

      {/* Tab 3: 36 Barangays */}
      {activeTab === "barangays" ? (
        <Reveal delayMs={60}>
          <div id="barangays" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {brgyClassifications.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setBrgyFilter(cat)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      brgyFilter === cat
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat === "all" ? "All 36 Barangays" : cat}
                  </button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                Showing {filteredBarangays.length} of {barangays.length}{" "}
                barangays
              </span>
            </div>

            {barangays[0]?.gaps ? (
              <GapNotice
                gaps={barangays[0].gaps}
                title="Barangay Phone & Email Note"
              />
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredBarangays.map((brgy, index) => (
                <div
                  key={brgy.id}
                  className="civic-card-hover flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-mono">Brgy. #{index + 1}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                        {brgy.classification.startsWith("Urban")
                          ? "Urban"
                          : "Rural"}
                      </span>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-foreground">
                      Brgy. {brgy.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Barangay Captain:{" "}
                      <strong className="text-foreground">
                        Hon. {brgy.punongBarangay}
                      </strong>
                    </p>
                  </div>
                  <div className="mt-3 border-t border-border/60 pt-2 text-[11px] text-emerald-700 dark:text-emerald-400">
                    <a
                      href={brgy.citation.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Source: iriga.gov.ph/barangay/ (
                      {brgy.citation.retrievedAt})
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      ) : null}

      {/* Tab 4: 2022-2025 Historical Comparison */}
      {activeTab === "elected-2022" ? (
        <Reveal delayMs={60}>
          <div className="space-y-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-950 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
              <strong>Why we keep this note:</strong> LGU Iriga&apos;s{" "}
              <code>organization-and-management</code> page still shows two
              2022–2025 councilors, whereas the June 13, 2025 oath-taking ceremony
              confirmed the new 2025–2028 City Council. We show both records so
              residents have the full picture.
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredElected2022.map((official) => (
                <article
                  key={official.id}
                  className="civic-card-hover flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs"
                >
                  <div className="space-y-2">
                    <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold">
                      {official.roleCategory} • {official.term} Term
                    </span>
                    <h3 className="text-lg font-bold text-foreground">
                      {official.name}
                    </h3>
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                      {official.position}
                    </p>
                    {official.notes ? (
                      <p className="text-xs text-muted-foreground">
                        {official.notes}
                      </p>
                    ) : null}
                    {official.gaps ? <GapNotice gaps={official.gaps} /> : null}
                  </div>
                  <div className="mt-4 pt-3">
                    <CitationBadge citation={official.citation} compact />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      ) : null}
    </div>
  )
}
