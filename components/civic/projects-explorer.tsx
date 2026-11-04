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
} from "lucide-react"
import { formatPeso, type ProjectRecord, type BetterGovRecord } from "@/lib/data/iriga-data"
import { useCivicStore } from "@/lib/store/civic-store"
import { CitationBadge } from "@/components/civic/citation-badge"
import { GapNotice } from "@/components/civic/gap-notice"
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
      <section
        aria-label="Overview statistics of tracked works"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        <Card className="civic-card-hover border-amber-200/80 bg-gradient-to-br from-amber-500/10 via-card to-card shadow-2xs dark:border-amber-900/60 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-5 sm:pb-2 space-y-0">
            <CardDescription className="text-[11px] font-bold text-amber-900 uppercase tracking-wider dark:text-amber-300">
              Tracked Works
            </CardDescription>
            <HardHat className="size-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
            <CardTitle className="text-2xl font-black font-mono tracking-tight text-foreground sm:text-3xl">
              {totalAllTracked}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              10 City Hall + 36 DPWH 5th DEO
            </p>
          </CardContent>
        </Card>

        <Card className="civic-card-hover border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-card to-card shadow-2xs dark:border-emerald-900/60 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-5 sm:pb-2 space-y-0">
            <CardDescription className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider dark:text-emerald-300">
              Monitored Funds
            </CardDescription>
            <Banknote className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
            <CardTitle className="text-2xl font-black font-mono tracking-tight text-emerald-700 dark:text-emerald-400 sm:text-3xl">
              ₱397.92M+
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Verified appropriations & awards
            </p>
          </CardContent>
        </Card>

        <Card className="civic-card-hover border-blue-200/80 bg-gradient-to-br from-blue-500/10 via-card to-card shadow-2xs dark:border-blue-900/60 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-5 sm:pb-2 space-y-0">
            <CardDescription className="text-[11px] font-bold text-blue-900 uppercase tracking-wider dark:text-blue-300">
              DPWH CamSur 5th
            </CardDescription>
            <Globe className="size-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
            <CardTitle className="text-2xl font-black font-mono tracking-tight text-foreground sm:text-3xl">
              {totalBetterGovTracked}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              National works via BetterGov.ph
            </p>
          </CardContent>
        </Card>

        <Card className="civic-card-hover border-purple-200/80 bg-gradient-to-br from-purple-500/10 via-card to-card shadow-2xs dark:border-purple-900/60 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-5 sm:pb-2 space-y-0">
            <CardDescription className="text-[11px] font-bold text-purple-900 uppercase tracking-wider dark:text-purple-300">
              LGU Iriga City
            </CardDescription>
            <Building2 className="size-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
            <CardTitle className="text-2xl font-black font-mono tracking-tight text-foreground sm:text-3xl">
              {totalLguTracked}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Local roads, health & welfare
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Sticky Source Switcher & Filter Bar with shadcn UI */}
      <Card className="sticky top-[4.75rem] sm:top-[5rem] lg:top-[5.25rem] z-30 rounded-2xl border border-border/90 bg-card/95 shadow-md backdrop-blur-md supports-[backdrop-filter]:bg-card/85">
        <CardContent className="p-3.5 sm:p-5 space-y-4">
        {/* Source Switcher Tabs using shadcn Tabs */}
        <div className="border-b border-border/80 pb-3">
          <Tabs
            value={sourceTab}
            onValueChange={(val) => setSourceTab(val as typeof sourceTab)}
            className="w-full"
          >
            <TabsList className="h-auto w-full flex-wrap justify-start gap-1.5 rounded-xl bg-muted/70 p-1 sm:h-11 sm:items-center">
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
          {/* Search Input */}
          <div className="relative h-10 md:col-span-8 lg:col-span-9">
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

          {/* Sort Dropdown Selector using shadcn Select */}
          <div className="md:col-span-4 lg:col-span-3">
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
            {filteredBetterGov.map((rec) => (
              <Card
                key={rec.id}
                className="civic-card-hover flex flex-col justify-between rounded-2xl border-emerald-200/90 bg-card p-6 shadow-2xs dark:border-emerald-900/60"
              >
                <CardHeader className="p-0 gap-3">
                  {/* Badges & Timeline Duration Pill */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-bold"
                    >
                      BetterGov.ph • {rec.category}
                    </Badge>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {rec.duration ? (
                        <Badge
                          variant="outline"
                          className="gap-1 bg-blue-50/60 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
                        >
                          <Calendar className="size-3 text-blue-600 dark:text-blue-400" />
                          <span>{rec.duration}</span>
                        </Badge>
                      ) : null}
                      <Badge variant="outline" className="bg-muted text-foreground">
                        {rec.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Plain Language Title & Summary */}
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      <Link
                        href={`/projects/${rec.id}`}
                        className="transition hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {rec.title}
                      </Link>
                    </CardTitle>

                    {rec.engineeringMarker ? (
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px] bg-muted/60">
                          DPWH Station:
                        </Badge>
                        <span>{rec.engineeringMarker}</span>
                      </div>
                    ) : null}
                  </div>

                  <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                    {rec.plainSummary}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 mt-4 space-y-3">
                  {/* Emphasized High-Visibility Funding Spotlight Container */}
                  <Card className="rounded-xl border border-emerald-200/90 bg-emerald-50/80 shadow-none dark:border-emerald-800/70 dark:bg-emerald-950/30">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                        <span className="font-bold text-emerald-900 uppercase tracking-wider dark:text-emerald-300">
                          Monitored Public Allocation
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900/70 dark:text-emerald-200 text-[11px]"
                        >
                          {rec.fundingSource}
                        </Badge>
                      </div>
                      <div className="text-xl font-black font-mono tracking-tight text-emerald-700 dark:text-emerald-300 sm:text-2xl">
                        {rec.amountDisplay}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <strong>Office / Proponent:</strong> {rec.contractorOrProponent}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Location & District Details */}
                  <Card className="rounded-xl border border-border/80 bg-muted/30 shadow-none">
                    <CardContent className="grid gap-1.5 p-3 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                        <span>
                          <strong>Location:</strong> {rec.location}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Building2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                        <span>
                          <strong>District / Office:</strong> {rec.district}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>

                {/* Card Actions & Citation */}
                <CardFooter className="p-0 mt-5 flex-col gap-2.5 border-t border-border pt-4">
                  <Button
                    asChild
                    variant="default"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 rounded-xl shadow-xs"
                  >
                    <Link href={`/projects/${rec.id}`}>
                      <Layers className="size-3.5 mr-1.5" />
                      <span>View Dedicated Project Page & API Data →</span>
                    </Link>
                  </Button>

                  {rec.citation.archiveUrl ? (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full text-xs font-semibold h-9 rounded-xl"
                    >
                      <a
                        href={rec.citation.archiveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ShieldCheck className="size-3.5 text-emerald-600 mr-1.5" />
                        <span>Open Official Legislative PDF / Award Archive ↗</span>
                      </a>
                    </Button>
                  ) : null}

                  <div className="w-full">
                    <CitationBadge citation={rec.citation} compact />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* City Hall & Local Projects Grid with shadcn Card */}
      {(sourceTab === "all" || sourceTab === "lgu-iriga") && filteredLguProjects.length > 0 ? (
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
            {filteredLguProjects.map((project) => (
              <Card
                key={project.id}
                className="civic-card-hover flex flex-col justify-between rounded-2xl border-border bg-card p-6 shadow-2xs"
              >
                <CardHeader className="p-0 gap-3">
                  {/* Category, Status & Timeline Duration Pill */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200 font-semibold">
                      {project.category}
                    </Badge>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="gap-1 bg-blue-50/60 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
                        <Calendar className="size-3 text-blue-600 dark:text-blue-400" />
                        <span>{project.period}</span>
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-bold",
                          project.status === "Completed"
                            ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                            : project.status === "Ongoing"
                              ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                              : "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200"
                        )}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <CardTitle className="text-lg font-bold text-foreground">
                      <Link
                        href={`/projects/${project.id}`}
                        className="transition hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {project.title}
                      </Link>
                    </CardTitle>
                  </div>

                  <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                    {project.summary}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 mt-4 space-y-3">
                  {/* Emphasized High-Visibility Funding Spotlight Container */}
                  <Card className="rounded-xl border border-emerald-200/90 bg-emerald-50/80 shadow-none dark:border-emerald-800/70 dark:bg-emerald-950/30">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                        <span className="font-bold text-emerald-900 uppercase tracking-wider dark:text-emerald-300">
                          Disclosed Project Budget
                        </span>
                        <Badge variant="secondary" className="bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900/70 dark:text-emerald-200 text-[11px]">
                          {project.implementingAgency}
                        </Badge>
                      </div>
                      <div className="text-xl font-black font-mono tracking-tight text-emerald-700 dark:text-emerald-300 sm:text-2xl">
                        {typeof project.amountPhp === "number"
                          ? formatPeso(project.amountPhp)
                          : "₱0 Disclosed"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {project.amountNote}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Location, Agency, and Reference Details */}
                  <Card className="rounded-xl border border-border/80 bg-muted/30 shadow-none">
                    <CardContent className="grid gap-2 p-3 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 size-3.5 shrink-0 text-blue-600" />
                        <span>
                          <strong>Location:</strong> {project.location}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Building2 className="mt-0.5 size-3.5 shrink-0 text-blue-600" />
                        <span>
                          <strong>Office in Charge:</strong>{" "}
                          {project.implementingAgency}
                        </span>
                      </div>
                      {project.contractOrReferenceId ? (
                        <p className="font-mono text-[11px] text-muted-foreground">
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
                </CardContent>

                {/* Primary Dedicated Action & Direct Verified Links */}
                <CardFooter className="p-0 mt-5 flex-col gap-2.5 border-t border-border pt-4">
                  <Button
                    asChild
                    variant="default"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 rounded-xl shadow-xs"
                  >
                    <Link href={`/projects/${project.id}`}>
                      <Layers className="size-3.5 mr-1.5" />
                      <span>View Dedicated Project Page & Details →</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full text-xs font-semibold h-9 rounded-xl"
                  >
                    <a
                      href={project.citation.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-3.5 text-blue-600 mr-1.5" />
                      <span>Open Official Department Page ↗</span>
                    </a>
                  </Button>

                  <div className="w-full">
                    <CitationBadge citation={project.citation} compact />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
