"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search,
  MapPin,
  Building2,
  Calendar,
  Banknote,
  Globe,
  HardHat,
  ArrowUpDown,
  ExternalLink,
  RotateCcw,
  Layers,
  ShieldCheck,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { formatPeso, type ProjectRecord, type BetterGovRecord } from "@/lib/data/iriga-data"
import { useCivicStore } from "@/lib/store/civic-store"
import { CitationBadge } from "@/components/civic/citation-badge"
import { GapNotice } from "@/components/civic/gap-notice"
import { Reveal } from "@/components/civic/reveal"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectsExplorerProps {
  projects?: ProjectRecord[]
  betterGovRecords?: BetterGovRecord[]
}

function getProjectMaxYear(p: {
  period?: string
  duration?: string
  contractOrReferenceId?: string
  status?: string
}): number {
  const text = `${p.period ?? ""} ${p.duration ?? ""} ${p.contractOrReferenceId ?? ""} ${p.status ?? ""}`
  const matches = text.match(/\b(19\d\d|20\d\d)\b/g)
  if (!matches || matches.length === 0) {
    if (text.includes("19FG")) return 2019
    return 0
  }
  return Math.max(...matches.map(Number))
}

function getProjectMinYear(p: {
  period?: string
  duration?: string
  contractOrReferenceId?: string
  status?: string
}): number {
  const text = `${p.period ?? ""} ${p.duration ?? ""} ${p.contractOrReferenceId ?? ""} ${p.status ?? ""}`
  const matches = text.match(/\b(19\d\d|20\d\d)\b/g)
  if (!matches || matches.length === 0) {
    if (text.includes("19FG")) return 2019
    return 9999
  }
  return Math.min(...matches.map(Number))
}

export function ProjectsExplorer({
  projects,
  betterGovRecords: propBetterGov,
}: ProjectsExplorerProps) {
  const storeProjects = useCivicStore(
    (state) => state.snapshot.projectsAndPrograms
  )
  const storeBetterGov = useCivicStore(
    (state) => state.snapshot.betterGovRecords
  )
  const directoryControls = useCivicStore((state) => state.directoryControls)
  const sourceTabs = directoryControls.projectSourceTabs
  const projectStatuses = directoryControls.projectStatuses as Array<
    "all" | ProjectRecord["status"]
  >
  const projectCategories = directoryControls.projectCategories as Array<
    "all" | ProjectRecord["category"]
  >
  const sortOptions = directoryControls.sortOptions.projects

  const activeProjects = projects ?? storeProjects
  const activeBetterGov = propBetterGov ?? storeBetterGov

  const [sourceTab, setSourceTab] = React.useState<
    "all" | "lgu-iriga" | "bettergov"
  >("all")
  const [category, setCategory] = React.useState<
    "all" | ProjectRecord["category"]
  >("all")
  const [status, setStatus] = React.useState<"all" | ProjectRecord["status"]>(
    "all"
  )
  const [sortBy, setSortBy] = React.useState<
    "default" | "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "title-asc"
  >("default")
  const [query, setQuery] = React.useState("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false)
  const [expandedProjectIds, setExpandedProjectIds] = React.useState<string[]>([])

  const toggleProjectExpanded = (id: string) => {
    setExpandedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const activeFilterCount =
    (sourceTab !== "all" ? 1 : 0) +
    (category !== "all" ? 1 : 0) +
    (status !== "all" ? 1 : 0) +
    (sortBy !== "default" ? 1 : 0)

  const filteredLguProjects = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = activeProjects.filter((proj) => {
      const matchesCat = category === "all" || proj.category === category
      const matchesStatus = status === "all" || proj.status === status
      const matchesQuery =
        !q ||
        `${proj.title} ${proj.location} ${proj.implementingAgency} ${proj.summary} ${proj.contractOrReferenceId ?? ""} ${proj.contractor ?? ""} ${proj.period}`
          .toLowerCase()
          .includes(q)
      return matchesCat && matchesStatus && matchesQuery
    })

    const list = [...matches]
    if (sortBy === "date-desc") {
      list.sort(
        (a, b) =>
          getProjectMaxYear(b) - getProjectMaxYear(a) ||
          (b.amountPhp ?? 0) - (a.amountPhp ?? 0) ||
          a.title.localeCompare(b.title)
      )
    } else if (sortBy === "date-asc") {
      list.sort(
        (a, b) =>
          getProjectMinYear(a) - getProjectMinYear(b) ||
          (a.amountPhp ?? 0) - (b.amountPhp ?? 0) ||
          a.title.localeCompare(b.title)
      )
    } else if (sortBy === "amount-desc") {
      list.sort(
        (a, b) =>
          (b.amountPhp ?? 0) - (a.amountPhp ?? 0) ||
          a.title.localeCompare(b.title)
      )
    } else if (sortBy === "amount-asc") {
      list.sort(
        (a, b) =>
          (a.amountPhp ?? 0) - (b.amountPhp ?? 0) ||
          a.title.localeCompare(b.title)
      )
    } else if (sortBy === "title-asc") {
      list.sort((a, b) => a.title.localeCompare(b.title))
    }
    return list
  }, [activeProjects, category, status, query, sortBy])

  const filteredBetterGov = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = activeBetterGov.filter((rec) => {
      const matchesCat =
        category === "all" ||
        (category === "Infrastructure" &&
          (rec.category === "DPWH 5th DEO Contract" ||
            rec.category === "GAA / House Bill Public Works"))
      const matchesStatus =
        status === "all" ||
        (status === "Ongoing" &&
          (rec.status.includes("Awarded") ||
            rec.status.includes("Sync") ||
            rec.status.includes("Ongoing"))) ||
        (status === "Completed" && rec.status.includes("Completed")) ||
        (status === "Planning" &&
          (rec.status.includes("NEP") || rec.status.includes("House Bill")))
      const matchesQuery =
        !q ||
        `${rec.title} ${rec.category} ${rec.district} ${rec.location} ${rec.contractorOrProponent} ${rec.plainSummary} ${rec.amountDisplay} ${rec.duration ?? ""} ${rec.engineeringMarker ?? ""}`
          .toLowerCase()
          .includes(q)
      return matchesCat && matchesStatus && matchesQuery
    })

    const list = [...matches]
    if (sortBy === "date-desc") {
      list.sort(
        (a, b) =>
          getProjectMaxYear(b) - getProjectMaxYear(a) ||
          (b.amountPhp ?? 0) - (a.amountPhp ?? 0) ||
          a.title.localeCompare(b.title)
      )
    } else if (sortBy === "date-asc") {
      list.sort(
        (a, b) =>
          getProjectMinYear(a) - getProjectMinYear(b) ||
          (a.amountPhp ?? 0) - (b.amountPhp ?? 0) ||
          a.title.localeCompare(b.title)
      )
    } else if (sortBy === "amount-desc") {
      list.sort(
        (a, b) =>
          (b.amountPhp ?? 0) - (a.amountPhp ?? 0) ||
          a.title.localeCompare(b.title)
      )
    } else if (sortBy === "amount-asc") {
      list.sort(
        (a, b) =>
          (a.amountPhp ?? 0) - (b.amountPhp ?? 0) ||
          a.title.localeCompare(b.title)
      )
    } else if (sortBy === "title-asc") {
      list.sort((a, b) => a.title.localeCompare(b.title))
    }
    return list
  }, [activeBetterGov, category, status, query, sortBy])

  const totalAllTracked = activeProjects.length + activeBetterGov.length
  const totalLguTracked = activeProjects.length
  const totalBetterGovTracked = activeBetterGov.length

  const matchingLguCount = filteredLguProjects.length
  const matchingBetterGovCount = filteredBetterGov.length
  const matchingAllCount = matchingLguCount + matchingBetterGovCount

  const totalDisplayed =
    sourceTab === "all"
      ? matchingAllCount
      : sourceTab === "lgu-iriga"
        ? matchingLguCount
        : matchingBetterGovCount

  const isFiltered =
    query.trim().length > 0 ||
    category !== "all" ||
    status !== "all" ||
    sortBy !== "default"

  const handleResetFilters = () => {
    setSourceTab("all")
    setCategory("all")
    setStatus("all")
    setSortBy("default")
    setQuery("")
  }

  return (
    <div className="space-y-8">
      {/* City-Wide Public Works & Funding Spotlight Summary */}
      <Reveal delayMs={40}>
      <section
        aria-label="Overview statistics of tracked works"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        <Card className="civic-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Tracked Works
            </CardDescription>
            <HardHat className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold font-mono tracking-tight">
              {totalAllTracked}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              10 City Hall + 36 DPWH 5th DEO
            </p>
          </CardContent>
        </Card>

        <Card className="civic-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Monitored Funds
            </CardDescription>
            <Banknote className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              ₱397.92M+
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Verified appropriations & awards
            </p>
          </CardContent>
        </Card>

        <Card className="civic-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              DPWH CamSur 5th
            </CardDescription>
            <Globe className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold font-mono tracking-tight">
              {totalBetterGovTracked}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              National works via BetterGov.ph
            </p>
          </CardContent>
        </Card>

        <Card className="civic-card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              LGU Iriga City
            </CardDescription>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold font-mono tracking-tight">
              {totalLguTracked}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Local roads, health & welfare
            </p>
          </CardContent>
        </Card>
      </section>
      </Reveal>

      {/* Sticky Source Switcher & Filter Bar with shadcn UI */}
      <Card className="sticky top-[4.75rem] sm:top-[5rem] lg:top-[5.25rem] z-30 rounded-2xl border border-border/90 bg-card/95 shadow-md backdrop-blur-md supports-[backdrop-filter]:bg-card/85">
        <CardContent className="p-3 sm:p-5 space-y-2.5 sm:space-y-4">
        {/* Source Switcher Tabs using shadcn Tabs */}
        <div className="border-b border-border/80 pb-2.5 sm:pb-3">
          <Tabs
            value={sourceTab}
            onValueChange={(val) => setSourceTab(val as typeof sourceTab)}
            className="w-full"
          >
            <TabsList className="h-auto w-full flex-nowrap sm:flex-wrap justify-start gap-1.5 overflow-x-auto no-scrollbar rounded-xl bg-muted/70 p-1 sm:h-11 sm:items-center">
              {sourceTabs.map((tab) => {
                const currentCount =
                  tab.id === "all"
                    ? matchingAllCount
                    : tab.id === "lgu-iriga"
                      ? matchingLguCount
                      : matchingBetterGovCount

                const baseCount =
                  tab.id === "all"
                    ? totalAllTracked
                    : tab.id === "lgu-iriga"
                      ? totalLguTracked
                      : totalBetterGovTracked

                const isActive = sourceTab === tab.id

                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "h-9 flex-none inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all select-none",
                      isActive
                        ? "bg-background text-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                  >
                    {tab.id === "lgu-iriga" ? (
                      <HardHat className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    ) : tab.id === "bettergov" ? (
                      <Globe className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Layers className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                    <span className="leading-none">{tab.label}</span>
                    <Badge
                      variant={isActive ? "default" : "outline"}
                      className={cn(
                        "h-5 px-1.5 font-mono text-[10px] font-semibold leading-none shrink-0 inline-flex items-center justify-center",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "border-border/80 bg-background/80 text-foreground/80"
                      )}
                    >
                      {currentCount}
                      {isFiltered && currentCount !== baseCount ? ` of ${baseCount}` : ""}
                    </Badge>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Search and Sort Row */}
        <div className="grid gap-3 md:grid-cols-12 items-center">
          <div className="flex items-center gap-2 md:col-span-8 lg:col-span-9">
            {/* Search Input */}
            <div className="relative h-10 md:col-span-8 lg:col-span-9 flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 z-10">
                <Search className="size-4 text-muted-foreground" />
              </div>
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by barangay (e.g. San Roque, Sagrada), road, contractor, or GAA..."
                aria-label="Search infrastructure projects and social programs"
                className="h-10 w-full rounded-xl pl-10 pr-10 text-sm border-input bg-background focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
              />
              {query ? (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search query"
                    className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : null}
            </div>

            {/* Mobile Filter Drawer Toggle Button */}
            <button
              type="button"
              data-mobile-filter-toggle="projects"
              aria-expanded={mobileFiltersOpen}
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
              className={cn(
                "inline-flex md:hidden h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition",
                activeFilterCount > 0 || mobileFiltersOpen
                  ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                  : "border-border bg-muted/80 text-foreground hover:bg-muted"
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 ? (
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                  {activeFilterCount}
                </span>
              ) : null}
              {mobileFiltersOpen ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
          </div>

          {/* Sort Dropdown Selector using shadcn Select */}
          <div
            className={cn(
              !mobileFiltersOpen && "hidden md:block",
              "md:col-span-4 lg:col-span-3"
            )}
          >
            <Select
              value={sortBy}
              onValueChange={(val) =>
                setSortBy(
                  val as
                    | "default"
                    | "date-desc"
                    | "date-asc"
                    | "amount-desc"
                    | "amount-asc"
                    | "title-asc"
                )
              }
            >
              <SelectTrigger className="h-10 w-full rounded-xl text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="size-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Sort projects..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Compact Result Summary */}
        <div className="flex md:hidden items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="truncate">
            Showing <strong className="text-foreground">{totalDisplayed}</strong>{" "}
            of <strong className="text-foreground">{totalAllTracked}</strong>{" "}
            verified works
          </span>
          {isFiltered ? (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex shrink-0 items-center gap-1 font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              <RotateCcw className="size-3" />
              Reset Filters
            </button>
          ) : null}
        </div>

        {/* Collapsible Status & Category Filter Rows on Mobile (Always visible on md+) */}
        <div
          className={cn(
            !mobileFiltersOpen && "hidden md:block",
            "space-y-3"
          )}
        >
        {/* Status Filter Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
              Status:
            </span>
            {projectStatuses.map((st) => (
              <Button
                key={st}
                type="button"
                variant={status === st ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus(st)}
                className={cn(
                  "h-8 rounded-lg px-3 text-xs font-semibold transition-all inline-flex items-center gap-1.5",
                  status === st
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "border-border/80 bg-background text-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {st === "Ongoing" ? (
                  <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                ) : st === "Completed" ? (
                  <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                ) : st === "Planning" ? (
                  <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                ) : null}
                <span>{st === "all" ? "All Statuses" : st}</span>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Showing <strong>{totalDisplayed}</strong> matching {totalDisplayed === 1 ? "work" : "works"}{" "}
              {isFiltered ? (
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  (filtered from {totalAllTracked} total tracked)
                </span>
              ) : (
                <span>(all {totalAllTracked} verified)</span>
              )}
            </span>

            {isFiltered ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-7 gap-1 rounded-lg px-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50"
              >
                <RotateCcw className="size-3" />
                Reset
              </Button>
            ) : null}
          </div>
        </div>

        {/* Category Pills */}
        <div className="border-t border-border/70 pt-2.5">
          {sourceTab !== "bettergov" ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Category:
              </span>
              {projectCategories.map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  variant={category === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "h-7 rounded-lg px-2.5 text-xs font-semibold transition-all",
                    category === cat
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "border-border/80 bg-background text-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {cat === "all" ? "All Categories" : cat}
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Globe className="size-3.5 text-emerald-600" />
              <span>DPWH Camarines Sur 5th District Engineering Office & GAA Portals</span>
            </div>
          )}
        </div>
        </div>
        </CardContent>
      </Card>

      {/* Empty State with shadcn Card */}
      {totalDisplayed === 0 ? (
        <Card className="rounded-2xl border-dashed p-8 text-center sm:p-12">
          <CardContent className="flex flex-col items-center justify-center p-0">
            <HardHat className="size-10 text-muted-foreground/60" />
            <h3 className="mt-3 text-base font-bold text-foreground">
              No Tracked Works Found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              No public works or social programs match your current search and filters.
            </p>
            <Button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 gap-1.5 rounded-xl font-bold text-xs"
            >
              <RotateCcw className="size-3.5" />
              Reset All Filters
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* BetterGov.ph DPWH & 5th District Section with shadcn Card */}
      {(sourceTab === "all" || sourceTab === "bettergov") && filteredBetterGov.length > 0 ? (
        <Reveal delayMs={60}>
        <section id="bettergov" className="scroll-mt-24 space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
                <Globe className="size-5 text-emerald-600" />
                BetterGov.ph Public Works & Camarines Sur 5th District Records
              </h2>
              <p className="text-xs text-muted-foreground">
                Verified DPWH Camarines Sur 5th District Engineering Office
                (DEO) contracts and National Expenditure Program (NEP/GAA)
                allocations in Iriga City indexed by{" "}
                <code className="font-mono text-emerald-700 dark:text-emerald-400">
                  transparency.bettergov.ph
                </code>{" "}
                and{" "}
                <code className="font-mono text-emerald-700 dark:text-emerald-400">
                  budget.bettergov.ph
                </code>
                .
              </p>
            </div>
            <Badge
              variant="secondary"
              className="self-start sm:self-auto bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-bold px-3 py-1"
            >
              {filteredBetterGov.length} {filteredBetterGov.length === 1 ? "Record" : "Records"}
            </Badge>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {filteredBetterGov.map((rec) => {
              const isCardExpanded = expandedProjectIds.includes(rec.id)

              return (
              <Card
                key={rec.id}
                className="civic-card-hover flex flex-col justify-between"
              >
                <CardHeader>
                  {/* Badges & Timeline Duration Pill */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="secondary">
                      BetterGov.ph • {rec.category}
                    </Badge>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {rec.duration ? (
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="size-3" />
                          <span>{rec.duration}</span>
                        </Badge>
                      ) : null}
                      <Badge variant="outline">{rec.status}</Badge>
                    </div>
                  </div>

                  {/* Plain Language Title & Summary */}
                  <div>
                    <CardTitle className="text-base font-bold">
                      <Link
                        href={`/projects/${rec.id}`}
                        className="hover:underline transition-colors"
                      >
                        {rec.title}
                      </Link>
                    </CardTitle>

                    {rec.engineeringMarker ? (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground font-mono">
                        <Badge variant="outline">DPWH Station:</Badge>
                        <span className="break-all">{rec.engineeringMarker}</span>
                      </div>
                    ) : null}
                  </div>

                  <CardDescription className="text-xs leading-relaxed">
                    {rec.plainSummary}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                  {/* Emphasized High-Visibility Funding Spotlight Container */}
                  <Card size="sm" className="bg-muted/40">
                    <CardHeader className="pb-1">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                          Monitored Public Allocation
                        </CardDescription>
                        <Badge variant="secondary">{rec.fundingSource}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        {rec.amountDisplay}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <strong>Office / Proponent:</strong> {rec.contractorOrProponent}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Mobile Toggle for Location & District Details */}
                  <button
                    type="button"
                    data-mobile-card-toggle={rec.id}
                    aria-expanded={isCardExpanded}
                    onClick={() => toggleProjectExpanded(rec.id)}
                    className="flex sm:hidden w-full items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-left text-xs font-semibold text-foreground transition hover:bg-muted"
                  >
                    <span>
                      {isCardExpanded
                        ? "Hide Location & District Info"
                        : "Show Location & District Info"}
                    </span>
                    {isCardExpanded ? (
                      <ChevronUp className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </button>

                  {/* Location & District Details (Collapsible on mobile, always visible on sm+) */}
                  <Card
                    size="sm"
                    className={cn(
                      !isCardExpanded && "hidden sm:block",
                      "bg-muted/20"
                    )}
                  >
                    <CardContent className="grid gap-1.5 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        <span>
                          <strong>Location:</strong> {rec.location}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Building2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        <span>
                          <strong>District / Office:</strong> {rec.district}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>

                {/* Card Actions & Citation */}
                <CardFooter className="flex flex-col gap-2.5">
                  <Button asChild className="h-auto min-h-9 w-full py-2 whitespace-normal text-center">
                    <Link href={`/projects/${rec.id}`}>
                      <Layers className="size-3.5 mr-1.5 shrink-0" />
                      <span>View Dedicated Project Page & API Data →</span>
                    </Link>
                  </Button>

                  {rec.citation.archiveUrl ? (
                    <Button asChild variant="outline" className="h-auto min-h-9 w-full py-2 whitespace-normal text-center">
                      <a
                        href={rec.citation.archiveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ShieldCheck className="size-3.5 mr-1.5 shrink-0" />
                        <span>Open Official Legislative PDF / Award Archive ↗</span>
                      </a>
                    </Button>
                  ) : null}

                  <div className="w-full">
                    <CitationBadge citation={rec.citation} compact />
                  </div>
                </CardFooter>
              </Card>
              )
            })}
          </div>
        </section>
        </Reveal>
      ) : null}

      {/* City Hall & Local Projects Grid with shadcn Card */}
      {(sourceTab === "all" || sourceTab === "lgu-iriga") && filteredLguProjects.length > 0 ? (
        <Reveal delayMs={80}>
        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
                <HardHat className="size-5 text-amber-600" />
                Iriga City Hall Infrastructure, Health & Social Welfare Programs
              </h2>
              <p className="text-xs text-muted-foreground">
                Verified projects and community programs from LGU Iriga&apos;s
                official portal, national agencies, and DPWH 5th DEO awards.
              </p>
            </div>
            <Badge
              variant="secondary"
              className="self-start sm:self-auto bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold px-3 py-1"
            >
              {filteredLguProjects.length} {filteredLguProjects.length === 1 ? "Program" : "Programs"}
            </Badge>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {filteredLguProjects.map((project) => {
              const isCardExpanded = expandedProjectIds.includes(project.id)

              return (
              <Card
                key={project.id}
                className="civic-card-hover flex flex-col justify-between"
              >
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="secondary">
                      LGU Iriga • {project.category}
                    </Badge>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="gap-1">
                        <Calendar className="size-3" />
                        <span>{project.period}</span>
                      </Badge>
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <CardTitle className="text-base font-bold">
                      <Link
                        href={`/projects/${project.id}`}
                        className="hover:underline transition-colors"
                      >
                        {project.title}
                      </Link>
                    </CardTitle>
                  </div>

                  <CardDescription className="text-xs leading-relaxed">
                    {project.summary}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                  {/* Disclosed Project Budget Container */}
                  <Card size="sm" className="bg-muted/40">
                    <CardHeader className="pb-1">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                          Disclosed Project Budget
                        </CardDescription>
                        <Badge variant="secondary">{project.implementingAgency}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        {typeof project.amountPhp === "number"
                          ? formatPeso(project.amountPhp)
                          : "₱0 Disclosed"}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {project.amountNote}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Mobile Toggle for Location & Contract Details */}
                  <button
                    type="button"
                    data-mobile-card-toggle={project.id}
                    aria-expanded={isCardExpanded}
                    onClick={() => toggleProjectExpanded(project.id)}
                    className="flex sm:hidden w-full items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-left text-xs font-semibold text-foreground transition hover:bg-muted"
                  >
                    <span>
                      {isCardExpanded
                        ? "Hide Location & Office Details"
                        : "Show Location & Office Details"}
                    </span>
                    {isCardExpanded ? (
                      <ChevronUp className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </button>

                  {/* Location, Agency, and Reference Details */}
                  <div
                    className={cn(
                      !isCardExpanded && "hidden sm:block",
                      "space-y-3"
                    )}
                  >
                    <Card size="sm" className="bg-muted/20">
                      <CardContent className="grid gap-2 text-xs">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                          <span>
                            <strong>Location:</strong> {project.location}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Building2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                          <span>
                            <strong>Office in Charge:</strong>{" "}
                            {project.implementingAgency}
                          </span>
                        </div>
                        {project.contractOrReferenceId ? (
                          <p className="font-mono text-[11px] text-muted-foreground break-words">
                            Reference: {project.contractOrReferenceId}
                            {project.contractor
                              ? ` • Contractor: ${project.contractor}`
                              : ""}
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>

                    {/* Honest Gap Disclosure Notice */}
                    {project.gaps ? (
                      <GapNotice
                        gaps={project.gaps}
                        title="Contract Disclosed Amount Note"
                      />
                    ) : null}
                  </div>
                </CardContent>

                {/* Primary Dedicated Action & Direct Verified Links */}
                <CardFooter className="flex flex-col gap-2.5">
                  <Button asChild className="h-auto min-h-9 w-full py-2 whitespace-normal text-center">
                    <Link href={`/projects/${project.id}`}>
                      <Layers className="size-3.5 mr-1.5 shrink-0" />
                      <span>View Dedicated Project Page & Details →</span>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto min-h-9 w-full py-2 whitespace-normal text-center">
                    <a
                      href={project.citation.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-3.5 mr-1.5 shrink-0" />
                      <span>Open Official Department Page ↗</span>
                    </a>
                  </Button>

                  <div className="w-full">
                    <CitationBadge citation={project.citation} compact />
                  </div>
                </CardFooter>
              </Card>
              )
            })}
          </div>
        </section>
        </Reveal>
      ) : null}
    </div>
  )
}
