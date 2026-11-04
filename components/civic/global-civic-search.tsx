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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

  const resultsRef = React.useRef<HTMLDivElement | null>(null)
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

  const displayedResults = hasActiveSearch ? results.slice(0, 12) : []

  // Smoothly scrolls enough to show the contents of the suggestion/search at any breakpoint
  const scrollToResults = React.useCallback(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!resultsRef.current) return
        const rect = resultsRef.current.getBoundingClientRect()
        // Account for persistent 3-tier sticky header (approx 84px) with breathing room
        const stickyHeaderOffset = 88
        const currentY =
          window.pageYOffset || document.documentElement.scrollTop
        const targetY = currentY + rect.top - stickyHeaderOffset - 16

        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: "smooth",
        })
      }, 70)
    })
  }, [])

  const handleSuggestionClick = (sample: string) => {
    setQuery(sample)
    scrollToResults()
  }

  const handleSectionClick = (
    sect: (typeof quickFilters)[number]["section"]
  ) => {
    setSection(sect)
    if (sect !== "all" || query.trim().length > 0) {
      scrollToResults()
    }
  }

  const handleVerificationClick = (
    filter: "all" | "verified-only" | "open-gaps"
  ) => {
    setVerificationFilter(filter)
    scrollToResults()
  }

  const handleReset = () => {
    setQuery("")
    setSection("all")
    setVerificationFilter("all")
    inputRef.current?.focus()
  }

  return (
    <div className="w-full max-w-full space-y-4 text-left">
      {/* Main Search Controls Card (100% shadcn UI) */}
      <Card className="w-full max-w-full border-border/80 bg-card/95 shadow-md backdrop-blur-md transition-all duration-300 hover:shadow-lg">
        <CardContent className="space-y-4 p-4 sm:p-6">
          {/* Search Input Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Search className="size-4 text-muted-foreground transition-colors duration-200" />
              </div>
              <Input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={homeCopy.searchPlaceholder}
                aria-label="Search all verified Iriga civic records"
                className="h-12 w-full rounded-xl bg-background/90 pr-10 pl-10 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus-visible:border-blue-600 focus-visible:ring-blue-500/20"
              />
              {query ? (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setQuery("")}
                    aria-label="Clear search query"
                    className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:scale-90"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Category & Verification Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {quickFilters.map((item) => {
                const active = section === item.section
                return (
                  <Button
                    key={item.section}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => handleSectionClick(item.section)}
                    className={cn(
                      "h-7 rounded-full px-3 text-xs font-semibold transition-all duration-200 active:scale-95",
                      active
                        ? "bg-blue-600 text-white shadow-xs hover:bg-blue-500 scale-[1.02]"
                        : "border-border/70 bg-muted/70 text-foreground/80 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Button>
                )
              })}
            </div>

            {/* Verification Status Toggle using shadcn Button */}
            <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-border bg-muted/50 p-0.5 sm:rounded-full">
              <Button
                type="button"
                size="xs"
                variant={verificationFilter === "all" ? "secondary" : "ghost"}
                onClick={() => handleVerificationClick("all")}
                className={cn(
                  "rounded-full px-2.5 text-[11px] font-semibold transition-all duration-200 active:scale-95",
                  verificationFilter === "all"
                    ? "bg-background text-foreground shadow-2xs font-bold"
                    : "text-foreground/75 hover:text-foreground"
                )}
              >
                All Verified
              </Button>
              <Button
                type="button"
                size="xs"
                variant={
                  verificationFilter === "verified-only" ? "default" : "ghost"
                }
                onClick={() => handleVerificationClick("verified-only")}
                className={cn(
                  "gap-1 rounded-full px-2.5 text-[11px] font-semibold transition-all duration-200 active:scale-95",
                  verificationFilter === "verified-only"
                    ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-2xs font-bold"
                    : "text-foreground/75 hover:text-foreground"
                )}
              >
                <ShieldCheck className="size-3" />
                Complete Info
              </Button>
              <Button
                type="button"
                size="xs"
                variant={
                  verificationFilter === "open-gaps" ? "default" : "ghost"
                }
                onClick={() => handleVerificationClick("open-gaps")}
                className={cn(
                  "gap-1 rounded-full px-2.5 text-[11px] font-semibold transition-all duration-200 active:scale-95",
                  verificationFilter === "open-gaps"
                    ? "bg-amber-600 text-white hover:bg-amber-500 shadow-2xs font-bold"
                    : "text-foreground/75 hover:text-foreground"
                )}
              >
                <AlertTriangle className="size-3" />
                Pending LGU Info
              </Button>
            </div>
          </div>

          {/* Popular Search Suggestions using interactive shadcn Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <Sparkles className="size-3.5 text-blue-600 dark:text-blue-400" />
              Try searching:
            </span>
            {homeCopy.popularSearches.map((sample) => {
              const isSelected =
                query.trim().toLowerCase() === sample.toLowerCase()
              return (
                <Badge
                  key={sample}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleSuggestionClick(sample)}
                  className={cn(
                    "h-6 px-2.5 text-xs cursor-pointer select-none transition-all duration-200 active:scale-95",
                    isSelected
                      ? "bg-blue-600 text-white hover:bg-blue-500 shadow-xs scale-[1.02]"
                      : "bg-background/80 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/40"
                  )}
                >
                  {sample}
                </Badge>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Suggestion Contents Results Card (100% shadcn UI & Smooth Entrance Animation) */}
      {displayedResults.length > 0 ? (
        <Card
          ref={resultsRef}
          className="w-full border-border/80 bg-card/95 shadow-lg backdrop-blur-md animate-in fade-in-50 slide-in-from-top-2 duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between border-b pb-3.5">
            <div className="space-y-0.5">
              <CardTitle className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                <span>Verified Civic Records</span>
                {query ? (
                  <Badge variant="secondary" className="font-normal text-xs">
                    &ldquo;{query}&rdquo;
                  </Badge>
                ) : null}
              </CardTitle>
              <CardDescription className="text-xs">
                Showing <strong>{displayedResults.length}</strong> of{" "}
                <strong>{results.length}</strong> matching public records
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 active:scale-95"
            >
              Reset search
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {displayedResults.map((item) => (
                <Card
                  key={item.id}
                  size="sm"
                  className="group relative cursor-pointer border-border bg-background/80 transition-all duration-200 hover:border-blue-500/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <Link href={item.href} className="absolute inset-0 z-10">
                    <span className="sr-only">View {item.title}</span>
                  </Link>
                  <CardHeader className="pb-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {item.title}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px] font-semibold"
                      >
                        {item.badge}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs font-medium">
                      {item.subtitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                  <CardFooter className="justify-between border-t pt-2 text-[11px] text-emerald-700 dark:text-emerald-400">
                    <span className="truncate">
                      Source: {item.citation.sourceName}
                    </span>
                    <ArrowRight className="size-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : query.trim().length > 0 ? (
        <Card
          ref={resultsRef}
          className="border-dashed border-border bg-card/60 p-6 text-center animate-in fade-in-50 duration-200"
        >
          <CardContent className="space-y-1.5 p-0 text-xs text-muted-foreground">
            <p>
              No verified records matched <strong>&ldquo;{query}&rdquo;</strong>
              .
            </p>
            <p>
              Try another keyword, pick a suggestion above, or{" "}
              <Link
                href="/about#contribute"
                className="font-semibold text-blue-600 underline hover:text-blue-700"
              >
                submit an official source
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
