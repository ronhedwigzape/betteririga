"use client"

import * as React from "react"
import {
  Search,
  Mail,
  MapPin,
  User,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { CarrierIconOnly } from "@/components/civic/telecom-and-channel-icons"
import type { OfficeContact } from "@/lib/data/iriga-data"
import { useCivicStore } from "@/lib/store/civic-store"
import { CitationBadge } from "@/components/civic/citation-badge"
import { GapNotice } from "@/components/civic/gap-notice"
import { Reveal } from "@/components/civic/reveal"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ContactsDirectoryProps {
  offices?: OfficeContact[]
}

export function ContactsDirectory({ offices }: ContactsDirectoryProps) {
  const storeOffices = useCivicStore((state) => state.snapshot.offices)
  const contactCategories = useCivicStore(
    (state) => state.directoryControls.contactCategories
  ) as Array<"all" | OfficeContact["category"]>
  const activeOffices = offices ?? storeOffices

  const [category, setCategory] = React.useState<
    "all" | OfficeContact["category"]
  >("all")
  const [query, setQuery] = React.useState("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false)

  const filtered = activeOffices.filter((o) => {
    const matchesCat = category === "all" || o.category === category
    const q = query.trim().toLowerCase()
    const matchesQuery =
      !q ||
      `${o.name} ${o.category} ${o.departmentHead ?? ""} ${o.landline ?? ""} ${o.email ?? ""} ${o.location}`
        .toLowerCase()
        .includes(q)
    return matchesCat && matchesQuery
  })

  return (
    <div className="space-y-6">
      {/* Sticky Search & Category Filter */}
      <div className="sticky top-[4.75rem] sm:top-[5rem] lg:top-[5.25rem] z-30 space-y-2.5 sm:space-y-3 rounded-2xl border border-border/90 bg-card/95 p-3 shadow-md backdrop-blur-md supports-[backdrop-filter]:bg-card/85 sm:p-5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 z-10">
              <Search className="size-4 text-muted-foreground" />
            </div>
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 29 City Hall offices by name, phone number, email, or head..."
              aria-label="Search Iriga City Hall offices"
              className="h-10 w-full rounded-xl pr-3 pl-10 text-sm bg-background"
            />
          </div>

          <button
            type="button"
            data-mobile-filter-toggle="contacts"
            aria-expanded={mobileFiltersOpen}
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className={cn(
              "inline-flex sm:hidden h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition",
              category !== "all" || mobileFiltersOpen
                ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                : "border-border bg-muted/80 text-foreground hover:bg-muted"
            )}
          >
            <SlidersHorizontal className="size-3.5" />
            <span>Filter</span>
            {category !== "all" ? (
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                1
              </span>
            ) : null}
            {mobileFiltersOpen ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </button>
        </div>

        <div className="flex sm:hidden items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="truncate">
            Showing <strong className="text-foreground">{filtered.length}</strong>{" "}
            of <strong className="text-foreground">{activeOffices.length}</strong>{" "}
            offices
          </span>
          {category !== "all" ? (
            <button
              type="button"
              onClick={() => setCategory("all")}
              className="shrink-0 font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Show All
            </button>
          ) : null}
        </div>

        <div
          className={cn(
            !mobileFiltersOpen && "hidden sm:flex",
            "flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3"
          )}
        >
          <div className="flex flex-wrap gap-1.5">
            {contactCategories.map((cat) => (
              <Badge
                key={cat}
                variant={category === cat ? "default" : "secondary"}
                onClick={() => {
                  setCategory(cat)
                  setMobileFiltersOpen(false)
                }}
                className="cursor-pointer font-semibold"
              >
                {cat === "all" ? `All Offices (${activeOffices.length})` : cat}
              </Badge>
            ))}
          </div>
          <span className="hidden sm:inline text-xs text-muted-foreground">
            Showing <strong>{filtered.length}</strong> of{" "}
            <strong>{activeOffices.length}</strong> offices
          </span>
        </div>
      </div>

      {/* Office Cards */}
      <Reveal delayMs={60}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((office) => (
            <Card
              key={office.id}
              className="civic-card-hover flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs"
            >
              <div className="space-y-2.5">
                <Badge variant="outline" className="text-[11px] font-semibold text-blue-800 bg-blue-50 dark:bg-blue-950 dark:text-blue-200">
                  {office.category}
                </Badge>

                <h3 className="text-base font-bold text-foreground">
                  {office.name}
                </h3>

                {office.departmentHead ? (
                  <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <User className="mt-0.5 size-3.5 shrink-0 text-blue-600" />
                    <span>
                      <strong>Head:</strong> {office.departmentHead}
                    </span>
                  </p>
                ) : null}

                <div className="space-y-1.5 rounded-xl border border-border/80 bg-muted/30 p-3 text-xs">
                  <p className="flex items-center gap-2">
                    <CarrierIconOnly number={office.landline ?? ""} className="size-3.5" />
                    {office.landline ? (
                      <a
                        href={`tel:${office.landline.split("|")[0].replace(/[^0-9+]/g, "")}`}
                        className="font-mono font-semibold text-foreground hover:text-blue-600 hover:underline"
                      >
                        {office.landline}
                      </a>
                    ) : (
                      <span className="italic text-amber-700 dark:text-amber-400">
                        Data not yet available
                      </span>
                    )}
                  </p>

                  <p className="flex items-center gap-2">
                    <Mail className="size-3.5 shrink-0 text-blue-600" />
                    {office.email ? (
                      <a
                        href={`mailto:${office.email.split("/")[0].trim()}`}
                        className="truncate font-mono text-foreground hover:text-blue-600 hover:underline"
                      >
                        {office.email}
                      </a>
                    ) : (
                      <span className="italic text-amber-700 dark:text-amber-400">
                        Data not yet available
                      </span>
                    )}
                  </p>

                  <p className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-500" />
                    <span>{office.location}</span>
                  </p>
                </div>

                {office.gaps ? (
                  <GapNotice gaps={office.gaps} title="Pending LGU Info" />
                ) : null}
              </div>

              <div className="mt-4 pt-3">
                <CitationBadge citation={office.citation} compact />
              </div>
            </Card>
          ))}
        </div>
      </Reveal>
    </div>
  )
}
