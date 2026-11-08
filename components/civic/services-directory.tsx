"use client"

import * as React from "react"
import {
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  Clock,
  Banknote,
  Users,
  ExternalLink,
  Briefcase,
  Building2,
} from "lucide-react"
import type { CivicService, CivicServiceCategory } from "@/lib/data/iriga-data"
import { useCivicStore } from "@/lib/store/civic-store"
import { CitationBadge } from "@/components/civic/citation-badge"
import { GapNotice } from "@/components/civic/gap-notice"
import { Reveal } from "@/components/civic/reveal"
import { cn } from "@/lib/utils"

interface ServicesDirectoryProps {
  services?: CivicService[]
}

export function ServicesDirectory({ services }: ServicesDirectoryProps) {
  const storeServices = useCivicStore((state) => state.snapshot.services)
  const serviceCategories = useCivicStore(
    (state) => state.directoryControls.serviceCategories
  ) as Array<"all" | CivicServiceCategory>
  const activeServices = services ?? storeServices

  const [category, setCategory] = React.useState<"all" | CivicServiceCategory>(
    "all"
  )
  const [query, setQuery] = React.useState("")

  const filtered = activeServices.filter((srv) => {
    const matchesCategory = category === "all" || srv.category === category
    const q = query.trim().toLowerCase()
    const matchesQuery =
      !q ||
      `${srv.title} ${srv.category} ${srv.officeName} ${srv.summary} ${srv.whoCanApply} ${srv.requirements.join(" ")} ${srv.steps.join(" ")}`
        .toLowerCase()
        .includes(q)
    return matchesCategory && matchesQuery
  })

  return (
    <div className="space-y-8">
      {/* Citizen's Charter Official Banner */}
      <Reveal>
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-2xs sm:p-6 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-200">
              <Briefcase className="size-3.5" />
              Republic Act No. 11032 Ease of Doing Business • Iriga City Citizen&apos;s Charter
            </span>
            <h2 className="text-lg font-extrabold text-foreground sm:text-xl">
              Find Step-by-Step Requirements for Any City Hall Transaction
            </h2>
            <p className="text-xs text-muted-foreground">
              Every service below is mapped to the responsible Iriga City Hall
              office, landline, email, and the official Citizen&apos;s Charter.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://iriga.gov.ph/wp-content/uploads/2022/08/CGO-IRIGA-CITIZENS-CHARTER-2022.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-500"
            >
              <FileText className="size-3.5" />
              Official Citizen&apos;s Charter PDF
              <ExternalLink className="size-3" />
            </a>
            <a
              href="https://web.archive.org/web/20221205215726/https://iriga.gov.ph/iriga-city-citizens-charter/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              Wayback Charter Snapshot
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </Reveal>

      {/* Sticky Search & Category Filter Bar */}
      <div className="sticky top-[4.75rem] sm:top-[5rem] lg:top-[5.25rem] z-30 space-y-3 rounded-2xl border border-border/90 bg-card/95 p-3.5 sm:p-4 shadow-md backdrop-blur-md supports-[backdrop-filter]:bg-card/85">
        {/* Search Input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="size-4 text-muted-foreground" />
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services (e.g., birth certificate, marriage license, business permit, amilyar, cedula, building permit, senior ID, PWD, medical, jobs)..."
            aria-label="Search Iriga City services"
            className="h-11 w-full rounded-xl border border-input bg-background pr-4 pl-10 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {serviceCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  category === cat
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "border border-border/70 bg-muted/80 text-foreground/80 hover:bg-muted hover:text-foreground"
                )}
              >
                {cat === "all"
                  ? `All Services (${activeServices.length})`
                  : cat}
              </button>
            ))}
          </div>

          <span className="text-xs text-muted-foreground">
            Showing <strong>{filtered.length}</strong> of{" "}
            <strong>{activeServices.length}</strong> services
          </span>
        </div>
      </div>

      {/* Services Cards */}
      <Reveal delayMs={40}>
        <div className="grid gap-6 lg:grid-cols-2">
        {filtered.map((service) => (
          <article
            key={service.id}
            id={service.id}
            className="civic-card-hover flex scroll-mt-28 flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-2xs"
          >
            <div className="space-y-4">
              {/* Top Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                  {service.category}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                  <Building2 className="size-3" />
                  {service.officeName}
                </span>
              </div>

              {/* Service Title & Summary */}
              <div>
                <h3 className="text-lg font-extrabold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {service.summary}
                </p>
              </div>

              {/* Who Can Apply */}
              <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-xs">
                <p className="flex items-center gap-1.5 font-bold text-foreground">
                  <Users className="size-3.5 text-blue-600 dark:text-blue-400" />
                  Who Can Apply:
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  {service.whoCanApply}
                </p>
              </div>

              {/* Step-by-Step Guide */}
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-wide text-foreground uppercase">
                  Step-by-Step Process:
                </p>
                <ol className="space-y-1.5 text-xs text-muted-foreground">
                  {service.steps.map((step, idx) => (
                    <li key={step} className="flex items-start gap-2">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Checklist of Requirements */}
              <div className="space-y-1.5 rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  What to Bring (Requirements Checklist):
                </p>
                <ul className="space-y-1 text-xs text-emerald-900/90 dark:text-emerald-200/90">
                  {service.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-1.5">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fee & Processing Time */}
              <div className="grid gap-2 rounded-xl border border-border/80 bg-muted/20 p-3 text-xs sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <Banknote className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-bold text-foreground">Fees:</p>
                    <p className="text-muted-foreground">{service.feeNote}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-bold text-foreground">
                      Typical Processing Time:
                    </p>
                    <p className="text-muted-foreground">
                      {service.processingTimeNote}
                    </p>
                  </div>
                </div>
              </div>

              {/* Office Contact Box */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200/70 bg-blue-50/50 p-3 text-xs dark:border-blue-900/50 dark:bg-blue-950/25">
                <div className="space-y-0.5">
                  <p className="font-bold text-foreground">
                    {service.officeName}
                  </p>
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    {service.officeLocation}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {service.officePhone ? (
                    <a
                      href={`tel:${service.officePhone.split("|")[0].replace(/[^0-9+]/g, "")}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 font-mono text-xs font-bold text-white transition hover:bg-blue-500"
                    >
                      <Phone className="size-3" />
                      {service.officePhone}
                    </a>
                  ) : null}
                  {service.officeEmail ? (
                    <a
                      href={`mailto:${service.officeEmail.split("/")[0].trim()}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-xs font-medium text-foreground transition hover:bg-muted"
                    >
                      <Mail className="size-3 text-blue-600" />
                      Email Office
                    </a>
                  ) : null}
                </div>
              </div>

              {service.gaps && service.gaps.length > 0 ? (
                <GapNotice gaps={service.gaps} />
              ) : null}
            </div>

            <div className="mt-4 pt-3">
              <CitationBadge citation={service.citation} compact />
            </div>
          </article>
        ))}
        </div>
      </Reveal>
    </div>
  )
}
