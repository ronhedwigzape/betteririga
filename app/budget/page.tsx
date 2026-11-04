import { CivicPageContainer } from "@/components/civic/civic-page-container"
import type { Metadata } from "next"
import Link from "next/link"
import {
  FileSpreadsheet,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Scale,
  ArrowUpRight,
  Globe,
  Building2,
  Layers,
  Terminal,
  Database,
  Banknote,
  Code2,
  BarChart3,
} from "lucide-react"
import {
  formatPeso,
  formatPesoCompact,
  getCivicSnapshot,
  getPageMetadata,
  getNationalBudget,
  getBetterGovDatasets,
} from "@/lib/data/iriga-data"
import { CitationBadge } from "@/components/civic/citation-badge"
import { Reveal } from "@/components/civic/reveal"
import { BudgetCharts } from "@/components/civic/budget-charts"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = getPageMetadata("budget")

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) {
    return `${(bytes / 1_000_000_000).toFixed(2)} GB`
  }
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(2)} MB`
  }
  return `${(bytes / 1_000).toFixed(1)} KB`
}

export default function BudgetPage() {
  const snapshot = getCivicSnapshot()
  const pageCopy = snapshot.siteContent.pages.budget
  const ntaSeries = snapshot.nationalTaxAllotments
  const statutoryRules = snapshot.statutoryAllocationRules
  const disclosures = snapshot.budgetDisclosures
  const profile = snapshot.cityProfile
  const nationalBudget = getNationalBudget()
  const allBetterGovDatasets = getBetterGovDatasets()

  // Filter BetterGov datasets specifically related to budget, tax, debt, and public procurement
  const fiscalDatasets = allBetterGovDatasets.filter(
    (d) =>
      d.id === 19 || // DPWH Infrastructure
      d.id === 5 ||  // PhilGEPS
      d.id === 20 || // BIR Tax
      d.id === 13 || // National Debt
      d.id === 12    // Government Securities
  )

  const maxNta = Math.max(...ntaSeries.map((n) => n.amountPhp))
  const fy2025 = ntaSeries[0]
  const perCapita2025 = Math.round(fy2025.amountPhp / profile.population2024)

  const maxDistrictPhp = Math.max(
    ...nationalBudget.camSur5thDistrictLedger.years.map((y) => y.amountPhp)
  )

  return (
    <CivicPageContainer className="space-y-12 py-4">
      {/* Page Hero Header & Key Stats (No outer card container) */}
      <Reveal>
        <section className="space-y-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1.5 bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-bold">
                <FileSpreadsheet className="size-3.5" />
                <span>{pageCopy.eyebrow}</span>
              </Badge>
              <Badge variant="outline" className="gap-1 text-blue-700 dark:text-blue-400">
                <Globe className="size-3" />
                <span>Powered by BetterGov.ph Budget Data API</span>
              </Badge>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {pageCopy.title}
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {pageCopy.subtitle}
            </p>
          </div>

          {/* Top Fiscal Highlights - Direct shadcn Cards sitting naturally */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="civic-card-hover border-border bg-card shadow-2xs">
              <CardContent className="p-4 sm:p-5">
                <span className="text-xs font-medium text-muted-foreground">
                  2025 Iriga National Tax Allotment
                </span>
                <div className="mt-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                  {formatPesoCompact(fy2025.amountPhp)}
                </div>
                <p className="mt-0.5 break-words font-mono text-xs text-muted-foreground">
                  {formatPeso(fy2025.amountPhp)} (+18.33% vs 2024)
                </p>
              </CardContent>
            </Card>

            <Card className="civic-card-hover border-border bg-card shadow-2xs">
              <CardContent className="p-4 sm:p-5">
                <span className="text-xs font-medium text-muted-foreground">
                  2025 Share Per Iriga Resident
                </span>
                <div className="mt-1 text-2xl font-extrabold text-blue-700 dark:text-blue-400 font-mono">
                  {formatPeso(perCapita2025)}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Divided across {profile.population2024.toLocaleString()} citizens
                </p>
              </CardContent>
            </Card>

            <Card className="civic-card-hover border-border bg-card shadow-2xs">
              <CardContent className="p-4 sm:p-5">
                <span className="text-xs font-medium text-muted-foreground">
                  CamSur 5th DEO Enacted (2026 GAA)
                </span>
                <div className="mt-1 text-2xl font-extrabold text-foreground font-mono">
                  ₱1.01B
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                  ₱1,012,023,000 for District 5
                </p>
              </CardContent>
            </Card>

            <Card className="civic-card-hover border-border bg-card shadow-2xs">
              <CardContent className="p-4 sm:p-5">
                <span className="text-xs font-medium text-muted-foreground">
                  National Proposed Budget (NEP 2027)
                </span>
                <div className="mt-1 text-2xl font-extrabold text-purple-700 dark:text-purple-400 font-mono">
                  ₱7.20 Trillion
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  +5.99% (+₱407.02B) vs 2026 baseline
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </Reveal>

      {/* Section 1: The 3-Phase National Budget Cycle */}
      <Reveal delayMs={40}>
        <section className="space-y-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-blue-700 uppercase dark:text-blue-400">
              <Layers className="size-4" />
              National Budget Architecture (budget.bettergov.ph/docs)
            </span>
            <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
              How Public Money Moves: The 3-Phase Budget Cycle
            </h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Public funds travel through three distinct constitutional stages before reaching Iriga City.
              Every stage has different legal weight and document types.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {nationalBudget.budgetCycleStages.map((st) => (
              <Card
                key={st.stage}
                className="civic-card-hover flex flex-col justify-between rounded-2xl border-border bg-card p-5 shadow-2xs space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {st.badge}
                    </Badge>
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      0{st.order}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {st.title}
                  </h3>
                  <p className="text-xs font-medium text-foreground/90">
                    {st.summary}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {st.details}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Section 2: Camarines Sur 5th Legislative District & DEO Multi-Year Ledger (No outer card container) */}
      <Reveal delayMs={60}>
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                <Globe className="size-4" />
                Official DPWH 5th District Multi-Year Ledger (2020–2027)
              </span>
              <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
                Camarines Sur 5th District Engineering Office Public Works
              </h2>
              <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
                Official appropriations history from the BetterGov.ph Budget Data API (<code>/api/v1/hgab/2027/districts/leg:camarines-sur:5th</code>).
                Representative: {nationalBudget.camSur5thDistrictLedger.representativeName} (Member Code: {nationalBudget.camSur5thDistrictLedger.representativeCode}).
              </p>
            </div>

            <Badge
              variant="outline"
              className="self-start sm:self-auto bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-bold"
            >
              {nationalBudget.camSur5thDistrictLedger.attributionTier}
            </Badge>
          </div>

          <div className="space-y-3">
            {nationalBudget.camSur5thDistrictLedger.years.map((y) => {
              const widthPct = Math.round((y.amountPhp / maxDistrictPhp) * 100)
              const isProposed = y.stage === "nep" || y.stage === "hgab3"

              return (
                <Card
                  key={`${y.fy}-${y.stage}`}
                  className="civic-card-hover border border-border bg-card p-4 shadow-2xs"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-blue-700 dark:text-blue-400">
                        FY {y.fy}
                      </span>
                      <Badge
                        variant={isProposed ? "outline" : "secondary"}
                        className={
                          isProposed
                            ? "border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                            : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                        }
                      >
                        {y.stageLabel}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ({y.scope})
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-base font-extrabold text-foreground sm:text-lg">
                        {y.displayAmount}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
                        ({formatPeso(y.amountPhp)})
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={
                        isProposed
                          ? "h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                          : "h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 transition-all duration-700"
                      }
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </Card>
              )
            })}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">
              {nationalBudget.camSur5thDistrictLedger.attributionMeaning}
            </span>
            <a
              href="https://budget.bettergov.ph/hgab/2027/districts/leg%3Acamarines-sur%3A5th"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Open Full Camarines Sur 5th District Ledger on BetterGov.ph
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </section>
      </Reveal>

      {/* Section 3: National GAA FY2020–2026 Series & Proposed NEP 2027 */}
      <Reveal delayMs={80}>
        <div className="grid gap-6 lg:grid-cols-12">
          {/* GAA National Growth */}
          <Card className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-2xs lg:col-span-7 space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-purple-700 uppercase dark:text-purple-400">
                <TrendingUp className="size-4" />
                National GAA Growth (FY 2020–2026)
              </span>
              <h3 className="mt-1 text-lg font-bold text-foreground sm:text-xl">
                Philippine General Appropriations Act Totals
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Summed across all 38 departments down to UACS object-level line items (~2M rows).
              </p>
            </div>

            <div className="space-y-2">
              {nationalBudget.gaaNationalTotals.map((item) => (
                <div
                  key={item.year}
                  className="flex flex-wrap items-center justify-between rounded-xl bg-muted/40 hover:bg-muted/70 p-3 text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-foreground">
                      {item.year}
                    </span>
                    <span className="text-muted-foreground hidden sm:inline">
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-mono">
                      {item.lineItems.toLocaleString()} items
                    </span>
                    <span className="font-mono text-sm font-black text-purple-700 dark:text-purple-400">
                      {item.displayTotal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* NEP 2027 Proposed Department Allocations */}
          <Card className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-2xs lg:col-span-5 space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-blue-700 uppercase dark:text-blue-400">
                <Building2 className="size-4" />
                NEP 2027 Executive Proposal
              </span>
              <h3 className="mt-1 text-lg font-bold text-foreground sm:text-xl">
                Top Department Allocations (₱7.20T)
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Proposed by the Executive vs FY 2026 GAA baseline (+5.99% overall).
              </p>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {nationalBudget.nep2027National.topDepartments.map((dept) => (
                <div
                  key={dept.id}
                  className="rounded-xl bg-muted/40 hover:bg-muted/70 p-2.5 text-xs space-y-1 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-foreground truncate">
                      {dept.name}
                    </span>
                    <span
                      className={
                        dept.pctChange >= 0
                          ? "font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0"
                          : "font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0"
                      }
                    >
                      {dept.pctChange >= 0 ? "+" : ""}
                      {dept.pctChange.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px]">
                    <span>{formatPesoCompact(dept.amountPhp)}</span>
                    <span>Base: {formatPesoCompact(dept.baseAmountPhp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Reveal>

      {/* Section 4: The 4 Statutory Expense Classes */}
      <Reveal delayMs={100}>
        <section className="space-y-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-blue-700 uppercase dark:text-blue-400">
              <Scale className="size-4" />
              Statutory Accounting Dimensions
            </span>
            <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
              The 4 Statutory Expense Classes
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Every peso in the Philippine national budget is classified into one of four standard expense classes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nationalBudget.expenseClasses.map((exp) => (
              <Card
                key={exp.code}
                className="civic-card-hover flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-3"
              >
                <div className="space-y-2">
                  <Badge variant="outline" className="font-mono text-xs font-bold">
                    {exp.code}
                  </Badge>
                  <h3 className="text-base font-bold text-foreground">
                    {exp.name}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {exp.summary}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/60 p-2 text-[11px] text-muted-foreground">
                  <strong>Local Impact:</strong> {exp.localImpact}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Interactive Public Funds Visualizations (Chart.js) */}
      <Reveal delayMs={100}>
        <section className="space-y-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
              <BarChart3 className="size-4" />
              Interactive Public Funds Visualizations (Chart.js)
            </span>
            <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
              NTA Growth Trends & Statutory Allocations
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Dynamic visual charts mapping annual National Tax Allotment growth, statutory community set-asides, and CamSur 5th District public works.
            </p>
          </div>
          <BudgetCharts ntaSeries={ntaSeries} nationalBudget={nationalBudget} />
        </section>
      </Reveal>

      {/* Section 5: Iriga City's Local National Tax Allotments & Statutory Set-asides */}
      <Reveal delayMs={120}>
        <section className="space-y-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
              <Banknote className="size-4" />
              Verified DBM Records (2022–2025)
            </span>
            <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
              Iriga City&apos;s National Tax Allotment (NTA) & Community Set-Asides
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              National revenues automatically transferred by DBM to the Iriga City Treasury, plus mandatory legal set-asides.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* NTA Growth Bars (Direct standalone cards) */}
            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-base font-bold text-foreground">
                Iriga City NTA Allocation History
              </h3>

              <div className="space-y-3">
                {ntaSeries
                  .slice()
                  .sort((a, b) => a.fiscalYear - b.fiscalYear)
                  .map((item) => {
                    const widthPct = Math.round((item.amountPhp / maxNta) * 100)
                    return (
                      <Card
                        key={item.id}
                        className="civic-card-hover border border-border bg-card p-4 shadow-2xs"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div>
                            <span className="font-mono text-sm font-bold text-blue-700 dark:text-blue-400">
                              Year {item.fiscalYear}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {item.legalBasis}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-base font-extrabold text-foreground sm:text-lg">
                              {formatPeso(item.amountPhp)}
                            </span>
                            {typeof item.yoyChangePct === "number" ? (
                              <span
                                className={
                                  item.yoyChangePct >= 0
                                    ? "rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : "rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                }
                              >
                                {item.yoyChangePct >= 0 ? "+" : ""}
                                {item.yoyChangePct}%
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 transition-all duration-700"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </Card>
                    )
                  })}
              </div>
            </div>

            {/* Mandatory Set-Asides Grid */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-base font-bold text-foreground">
                Mandatory Legal Set-Asides
              </h3>
              {statutoryRules.map((rule) => (
                <Card
                  key={rule.id}
                  className="civic-card-hover flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="font-semibold text-xs">
                        {rule.statutoryShare}
                      </Badge>
                      <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        ~{formatPesoCompact(rule.estimatedFy2025Php)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground">
                      {rule.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {rule.purpose} ({rule.legalBasis})
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Section 6: National Fiscal & Procurement Datasets from BetterGov.ph (No outer card container) */}
      <Reveal delayMs={140}>
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-blue-700 uppercase dark:text-blue-400">
                <Database className="size-4" />
                Open Data Extract (data.bettergov.ph)
              </span>
              <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
                National Fiscal, Tax & Public Procurement Datasets
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Curated open datasets from BetterGov.ph powering government spending transparency.
              </p>
            </div>

            <Button asChild variant="outline" className="self-start sm:self-auto rounded-xl text-xs font-bold">
              <Link href="/open-data">
                View All 10 Datasets & APIs →
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fiscalDatasets.map((d) => (
              <Card
                key={d.id}
                className="civic-card-hover flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <Badge variant="secondary" className="text-[10px]">
                      {d.license}
                    </Badge>
                    <span className="font-mono font-semibold text-muted-foreground">
                      {formatBytes(d.sizeBytes)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground leading-snug">
                    {d.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {d.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/70 text-xs">
                  <span className="text-[11px] text-muted-foreground truncate">
                    {d.publisher?.name ?? "BetterGov.ph"}
                  </span>
                  <a
                    href={d.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline dark:text-blue-400 shrink-0"
                  >
                    Open
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Section 7: BetterGov.ph Budget Data API & AI Agent MCP Server */}
      <Reveal delayMs={160}>
        <Card className="rounded-3xl border border-border bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-5 sm:p-8 text-white shadow-md space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <Terminal className="size-4" />
                <span>Developer REST API & AI MCP Server</span>
              </div>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Philippine Budget Data API Integration
              </h2>
              <p className="mt-1 text-xs text-slate-300">
                Read-only public REST API and Model Context Protocol (MCP) server for AI assistants and developers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="secondary" className="rounded-xl text-xs font-bold">
                <a href={nationalBudget.meta.docsUrl} target="_blank" rel="noopener noreferrer">
                  <span>API Documentation</span>
                  <ExternalLink className="size-3.5 ml-1.5" />
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-xl text-xs font-bold border-white/20 text-white hover:bg-white/10">
                <a href={nationalBudget.meta.openapiUrl} target="_blank" rel="noopener noreferrer">
                  <Code2 className="size-3.5 mr-1.5" />
                  <span>OpenAPI Spec</span>
                </a>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* cURL commands */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {"// Test REST Endpoints via cURL"}
              </span>
              <pre className="overflow-x-auto font-mono text-xs text-slate-200 p-2 rounded-lg bg-black/50 leading-relaxed">
{`# National GAA totals (2020–2026)
curl https://budget.bettergov.ph/api/v1/gaa

# Proposed NEP 2027 by department
curl https://budget.bettergov.ph/api/v1/nep/2027

# CamSur 5th District & DEO multi-year ledger
curl https://budget.bettergov.ph/api/v1/hgab/2027/districts/leg:camarines-sur:5th`}
              </pre>
            </div>

            {/* MCP AI Agent install */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-blue-400">
                {"// Install MCP in Claude Code CLI & Cursor"}
              </span>
              <pre className="overflow-x-auto font-mono text-xs text-slate-200 p-2 rounded-lg bg-black/50 leading-relaxed">
{`# Claude Code CLI:
claude mcp add --transport http ph-budget https://budget.bettergov.ph/mcp

# Cursor / Windsurf mcp.json:
{
  "mcpServers": {
    "ph-budget": { "url": "https://budget.bettergov.ph/mcp" }
  }
}`}
              </pre>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Free for public and civic use under fair-use conditions. Edge-cached globally.</span>
            <span className="font-mono text-emerald-400">Transport: Streamable HTTP (JSON-RPC)</span>
          </div>
        </Card>
      </Reveal>

      {/* Section 8: Full Disclosure & Honest Gap Ledger (No outer card container) */}
      <Reveal delayMs={180}>
        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-800 uppercase dark:text-amber-300">
                <AlertTriangle className="size-4" />
                Honest Document Tracker
              </span>
              <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
                Which Financial Reports Are Available Online?
              </h2>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
                We never invent spending numbers. Below is the exact status of each financial report from City Hall, DILG, BLGF, and the Commission on Audit (COA).
              </p>
            </div>
            <Button asChild variant="default" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold">
              <Link href="/about#contribute">
                Submit an Official Financial PDF
                <ArrowUpRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {disclosures.map((item) => (
              <Card
                key={item.id}
                className="civic-card-hover rounded-xl border border-border bg-card p-5 shadow-2xs space-y-2"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {item.responsibleAgency} • {item.period}
                    </span>
                    <h3 className="mt-0.5 text-base font-bold text-foreground">
                      {item.documentTitle}
                    </h3>
                  </div>
                  {item.status === "verified" ? (
                    <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-bold">
                      <CheckCircle2 className="size-3.5" />
                      Verified & Published
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold">
                      <AlertTriangle className="size-3.5" />
                      Data not yet available online
                    </Badge>
                  )}
                </div>

                <p className="text-xs leading-relaxed text-foreground/90">
                  {item.summary}
                </p>

                <p className="rounded-lg bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
                  <strong>Why:</strong> {item.gapReason}
                </p>

                <div className="pt-1">
                  <CitationBadge citation={item.citation} compact />
                </div>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-xs">
            <span>
              Need to request financial documents directly from City Hall? Call
              the <strong>City Budget Office</strong> (<code>(054) 299 9925</code>) or{" "}
              <strong>City Accountant&apos;s Office</strong> (<code>(054) 299 9919</code>).
            </span>
            <a
              href="https://fdpp.dilg.gov.ph/fdpp/report"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 underline dark:text-blue-400"
            >
              Open DILG Full Disclosure Portal
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </section>
      </Reveal>
    </CivicPageContainer>
  )
}
