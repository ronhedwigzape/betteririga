"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search,
  ArrowRight,
  X,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react"
import { searchCivicRecords } from "@/lib/data/iriga-data"
import { useCivicStore } from "@/lib/store/civic-store"
import { cn } from "@/lib/utils"

export function GlobalCivicSearch() {
  const snapshot = useCivicStore((state) => state.snapshot)
  const quickFilters = snapshot.siteContent.searchFilters
  const query = useCivicStore((state) => state.searchQuery)
  const section = useCivicStore((state) => state.searchSection)
  const verificationFilter = useCivicStore((state) => state.verificationFilter)
  const setQuery = useCivicStore((state) => state.setSearchQuery)
  const setSection = useCivicStore((state) => state.setSearchSection)
  const setVerificationFilter = useCivicStore(
    (state) => state.setVerificationFilter
  )

  const homeCopy = snapshot.siteContent.home

  const results = React.useMemo(
    () => searchCivicRecords(query, section, verificationFilter),
    [query, section, verificationFilter]
  )

  const displayedResults =
    query.trim().length > 0 ||
    section !== "all" ||
    verificationFilter !== "all"
      ? results.slice(0, 12)
      : []

  return (
    <div className="w-full max-w-full rounded-2xl border border-border bg-card p-3.5 shadow-md transition-shadow hover:shadow-lg sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={homeCopy.searchPlaceholder}
            aria-label="Search all verified Iriga civic records"
            className="h-12 w-full rounded-xl border border-input bg-background pr-10 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search query"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Category & Verification Pills */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {quickFilters.map((item) => {
            const active = section === item.section
            return (
              <button
                key={item.section}
                type="button"
                onClick={() => setSection(item.section)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-all",
                  active
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Verification Status Toggle */}
        <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-border bg-muted/50 p-0.5 text-[11px] sm:rounded-full">
          <button
            type="button"
            onClick={() => setVerificationFilter("all")}
            className={cn(
              "rounded-full px-2.5 py-0.5 font-semibold transition",
              verificationFilter === "all"
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground"
            )}
          >
            All Verified
          </button>
          <button
            type="button"
            onClick={() => setVerificationFilter("verified-only")}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold transition",
              verificationFilter === "verified-only"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-muted-foreground"
            )}
          >
            <ShieldCheck className="size-3" />
            Complete Info
          </button>
          <button
            type="button"
            onClick={() => setVerificationFilter("open-gaps")}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold transition",
              verificationFilter === "open-gaps"
                ? "bg-amber-600 text-white shadow-2xs"
                : "text-muted-foreground"
            )}
          >
            <AlertTriangle className="size-3" />
            Pending LGU Info
          </button>
        </div>
      </div>

      {/* Popular Searches from Store */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
          <Sparkles className="size-3.5 text-blue-600 dark:text-blue-400" />
          Try searching:
        </span>
        {homeCopy.popularSearches.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => setQuery(sample)}
            className="rounded-md border border-border/80 bg-background px-2.5 py-1 text-xs text-foreground/80 transition hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* Instant Results */}
      {displayedResults.length > 0 ? (
        <div className="animate-civic-fade-up mt-4 border-t border-border pt-4">
          <div className="mb-2.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing <strong>{displayedResults.length}</strong> of{" "}
              <strong>{results.length}</strong> matching public records
            </span>
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setSection("all")
                setVerificationFilter("all")
              }}
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Reset search
            </button>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {displayedResults.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="civic-card-hover group flex flex-col justify-between rounded-xl border border-border bg-background p-3.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {item.title}
                    </p>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                      {item.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                    {item.subtitle}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/90">
                    {item.description}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                  <span className="truncate">
                    Source: {item.citation.sourceName}
                  </span>
                  <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : query.trim().length > 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          No verified records matched <strong>&ldquo;{query}&rdquo;</strong>. Try
          another word or{" "}
          <Link href="/about#contribute" className="text-blue-600 underline">
            submit an official source
          </Link>
          .
        </div>
      ) : null}
    </div>
  )
}
