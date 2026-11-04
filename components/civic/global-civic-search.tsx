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

  const [isDismissed, setIsDismissed] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const homeCopy = snapshot.siteContent.home

  const results = React.useMemo(
    () => searchCivicRecords(query, section, verificationFilter),
    [query, section, verificationFilter]
  )

  const hasActiveSearch =
    query.trim().length > 0 ||
    section !== "all" ||
    verificationFilter !== "all"

  const isOpen = hasActiveSearch && !isDismissed
  const displayedResults = hasActiveSearch ? results.slice(0, 12) : []

  // Dismiss dropdown on outside click or Escape key without shifting page scroll
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsDismissed(true)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDismissed(true)
        inputRef.current?.blur()
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full max-w-full text-left">
      <div className="w-full max-w-full rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md p-3.5 shadow-md transition-all duration-200 hover:shadow-lg hover:border-border sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="size-4 text-muted-foreground transition-colors duration-200" />
            </div>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onFocus={() => {
                if (hasActiveSearch) setIsDismissed(false)
              }}
              onChange={(e) => {
                setQuery(e.target.value)
                setIsDismissed(false)
              }}
              placeholder={homeCopy.searchPlaceholder}
              aria-label="Search all verified Iriga civic records"
              className="h-12 w-full rounded-xl border border-input bg-background/90 pr-10 pl-10 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 ease-out focus:border-blue-600 focus:bg-background focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
            {query ? (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    if (section === "all" && verificationFilter === "all") {
                      setIsDismissed(true)
                    }
                  }}
                  aria-label="Clear search query"
                  className="rounded-full p-1 text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground active:scale-90"
                >
                  <X className="size-4" />
                </button>
              </div>
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
                  onClick={() => {
                    setSection(item.section)
                    setIsDismissed(false)
                  }}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ease-out select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
                    active
                      ? "bg-blue-600 text-white shadow-xs scale-[1.02]"
                      : "border border-border/70 bg-muted/80 text-foreground/80 hover:bg-muted hover:text-foreground hover:border-border"
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
              onClick={() => {
                setVerificationFilter("all")
                setIsDismissed(false)
              }}
              className={cn(
                "rounded-full px-2.5 py-0.5 font-semibold transition-all duration-200 ease-out select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
                verificationFilter === "all"
                  ? "bg-background text-foreground shadow-2xs font-bold"
                  : "text-foreground/75 hover:text-foreground"
              )}
            >
              All Verified
            </button>
            <button
              type="button"
              onClick={() => {
                setVerificationFilter("verified-only")
                setIsDismissed(false)
              }}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold transition-all duration-200 ease-out select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                verificationFilter === "verified-only"
                  ? "bg-emerald-600 text-white shadow-2xs font-bold"
                  : "text-foreground/75 hover:text-foreground"
              )}
            >
              <ShieldCheck className="size-3" />
              Complete Info
            </button>
            <button
              type="button"
              onClick={() => {
                setVerificationFilter("open-gaps")
                setIsDismissed(false)
              }}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold transition-all duration-200 ease-out select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40",
                verificationFilter === "open-gaps"
                  ? "bg-amber-600 text-white shadow-2xs font-bold"
                  : "text-foreground/75 hover:text-foreground"
              )}
            >
              <AlertTriangle className="size-3" />
              Pending LGU Info
            </button>
          </div>
        </div>

        {/* Popular Searches from Store */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
            <Sparkles className="size-3.5 text-blue-600 dark:text-blue-400" />
            Try searching:
          </span>
          {homeCopy.popularSearches.map((sample) => {
            const isSelected =
              query.trim().toLowerCase() === sample.toLowerCase()
            return (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setQuery(sample)
                  setIsDismissed(false)
                }}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-medium transition-all duration-200 ease-out select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/60 dark:text-blue-300 shadow-2xs"
                    : "border-border/80 bg-background text-foreground hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                {sample}
              </button>
            )
          })}
        </div>
      </div>

      {/* Floating Instant Results Panel (Zero page scrolling, zero layout displacement) */}
      {isOpen ? (
        <div
          role="region"
          aria-label="Search results"
          className="animate-civic-dropdown absolute top-full left-0 right-0 z-40 mt-2 max-h-[30rem] overflow-y-auto rounded-2xl border border-border bg-card/98 p-4 shadow-2xl backdrop-blur-md sm:p-5"
        >
          {displayedResults.length > 0 ? (
            <div>
              <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground border-b border-border/70 pb-2.5">
                <span className="font-medium text-foreground">
                  Showing <strong>{displayedResults.length}</strong> of{" "}
                  <strong>{results.length}</strong> matching public records
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("")
                      setSection("all")
                      setVerificationFilter("all")
                      setIsDismissed(true)
                    }}
                    className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 active:scale-95"
                  >
                    Reset search
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDismissed(true)}
                    aria-label="Close search results dropdown"
                    className="rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-90"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {displayedResults.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="civic-card-hover group flex flex-col justify-between rounded-xl border border-border bg-background/90 p-3.5 transition-all duration-200 hover:border-blue-500/50 hover:shadow-xs active:scale-[0.99]"
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
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/90 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2 text-[11px] text-emerald-700 dark:text-emerald-400">
                      <span className="truncate">
                        Source: {item.citation.sourceName}
                      </span>
                      <ArrowRight className="size-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              <p>
                No verified records matched{" "}
                <strong>&ldquo;{query}&rdquo;</strong>.
              </p>
              <p className="mt-1.5">
                Try another word, select a category pill above, or{" "}
                <Link
                  href="/about#contribute"
                  className="text-blue-600 font-semibold underline"
                >
                  submit an official source
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
