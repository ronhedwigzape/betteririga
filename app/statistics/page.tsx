import { CivicPageContainer } from "@/components/civic/civic-page-container"
import type { Metadata } from "next"
import { BarChart3, CheckCircle2 } from "lucide-react"
import {
  getCivicSnapshot,
  getPageMetadata,
  getCityStatistics,
  formatPesoCompact,
} from "@/lib/data/iriga-data"
import { CitationBadge } from "@/components/civic/citation-badge"
import { Reveal } from "@/components/civic/reveal"
import { StatisticsCharts } from "@/components/civic/statistics-charts"

export const metadata: Metadata = getPageMetadata("statistics")

export default function StatisticsPage() {
  const snapshot = getCivicSnapshot()
  const pageCopy = snapshot.siteContent.pages.statistics ?? {
    eyebrow: "City Demographics & Competitiveness Index",
    title: "Iriga City Statistics & Key Indicators",
    subtitle:
      "Explore official population demographics from PSA, city revenue allocations from DBM, economic indicators, and DTI CMCI competitiveness rankings.",
  }
  const stats = getCityStatistics()
  const demo = stats.demographics
  const fiscal = stats.fiscalOverview
  const cmci = stats.competitivenessCmci
  const econ = stats.economicAndSocial
  const barangays = stats.barangayPopulations

  return (
    <CivicPageContainer className="space-y-10 py-4">
      {/* Hero Header */}
      <Reveal>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-blue-50/70 via-card to-card p-4 sm:p-6 lg:p-8 dark:from-blue-950/25">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
            <BarChart3 className="size-4" />
            <span>{pageCopy.eyebrow}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              Verified via PSA, DBM & DTI CMCI Records
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {pageCopy.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {pageCopy.subtitle}
          </p>

          {/* Quick Metrics Strip */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-border bg-background/90 p-3 shadow-2xs">
              <p className="text-[11px] font-medium text-muted-foreground">
                Population (2020)
              </p>
              <p className="mt-1 font-mono text-xl font-extrabold text-blue-600 dark:text-blue-400">
                {demo.totalPopulation2020.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground">PSA Census</p>
            </div>

            <div className="rounded-xl border border-border bg-background/90 p-3 shadow-2xs">
              <p className="text-[11px] font-medium text-muted-foreground">
                Land Area
              </p>
              <p className="mt-1 font-mono text-xl font-extrabold text-foreground">
                {demo.landAreaKm2} <span className="text-xs font-normal">km²</span>
              </p>
              <p className="text-[10px] text-muted-foreground">Iriga Territory</p>
            </div>

            <div className="rounded-xl border border-border bg-background/90 p-3 shadow-2xs">
              <p className="text-[11px] font-medium text-muted-foreground">
                Density
              </p>
              <p className="mt-1 font-mono text-xl font-extrabold text-foreground">
                {demo.densityPerKm2}{" "}
                <span className="text-xs font-normal">/ km²</span>
              </p>
              <p className="text-[10px] text-muted-foreground">Persons per km²</p>
            </div>

            <div className="rounded-xl border border-border bg-background/90 p-3 shadow-2xs">
              <p className="text-[11px] font-medium text-muted-foreground">
                FY 2025 NTA
              </p>
              <p className="mt-1 font-mono text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatPesoCompact(fiscal.latestNtaAmountPhp)}
              </p>
              <p className="text-[10px] text-muted-foreground">DBM Allotment</p>
            </div>

            <div className="rounded-xl border border-border bg-background/90 p-3 shadow-2xs">
              <p className="text-[11px] font-medium text-muted-foreground">
                20% Dev Fund
              </p>
              <p className="mt-1 font-mono text-xl font-extrabold text-amber-600 dark:text-amber-400">
                {formatPesoCompact(fiscal.developmentFundPhp)}
              </p>
              <p className="text-[10px] text-muted-foreground">Annual Share</p>
            </div>

            <div className="rounded-xl border border-border bg-background/90 p-3 shadow-2xs">
              <p className="text-[11px] font-medium text-muted-foreground">
                Barangays
              </p>
              <p className="mt-1 font-mono text-xl font-extrabold text-purple-600 dark:text-purple-400">
                {demo.barangayCount}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {demo.urbanBarangayCount} Urban • {demo.ruralBarangayCount} Rural
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Interactive City Data Charts (Chart.js) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Interactive City Data Charts
          </h2>
          <p className="text-xs text-muted-foreground">
            Explore official visual analytics for population growth, statutory budget distribution, top communities, and competitiveness pillars.
          </p>
        </div>
        <StatisticsCharts stats={stats} />
      </section>

      {/* Section 1: Demographics & Population Growth Trends */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            1. Population Trends & Demographics (PSA POPCEN)
          </h2>
          <p className="text-xs text-muted-foreground">
            Official demographic data published by the Philippine Statistics
            Authority (PSA) for the City of Iriga.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Historical Census Comparison */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs sm:p-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide text-muted-foreground">
              Historical Census Series (PSA)
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>2020 Census (Latest Official)</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {demo.totalPopulation2020.toLocaleString()} residents
                  </span>
                </div>
                <div className="mt-1.5 h-3 w-full rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-blue-600" style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>2015 Census</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">
                    {demo.totalPopulation2015.toLocaleString()} residents
                  </span>
                </div>
                <div className="mt-1.5 h-3 w-full rounded-full bg-muted">
                  <div
                    className="h-3 rounded-full bg-blue-400/80"
                    style={{
                      width: `${((demo.totalPopulation2015 / demo.totalPopulation2020) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>2010 Census</span>
                  <span className="font-mono text-slate-500">
                    {demo.totalPopulation2010.toLocaleString()} residents
                  </span>
                </div>
                <div className="mt-1.5 h-3 w-full rounded-full bg-muted">
                  <div
                    className="h-3 rounded-full bg-blue-300/70"
                    style={{
                      width: `${((demo.totalPopulation2010 / demo.totalPopulation2020) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-blue-200/60 bg-blue-50/70 p-3.5 text-xs text-blue-950 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-100">
              <p>
                <strong>Annual Population Growth Rate:</strong>{" "}
                {demo.annualGrowthRatePct}% per year between 2015 and 2020. Total
                estimated households:{" "}
                <strong>{demo.totalHouseholds.toLocaleString()}</strong>.
              </p>
            </div>
          </div>

          {/* Geographic & Land Distribution */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs sm:p-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide text-muted-foreground">
              Geographic & Territorial Profile
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5">
                <span className="text-muted-foreground">Total Land Area</span>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {demo.landAreaKm2} km²
                </p>
                <p className="text-[11px] text-muted-foreground">13,735 hectares</p>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5">
                <span className="text-muted-foreground">Population Density</span>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {demo.densityPerKm2} / km²
                </p>
                <p className="text-[11px] text-muted-foreground">Persons per sq. km</p>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5">
                <span className="text-muted-foreground">Urban Barangays</span>
                <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
                  {demo.urbanBarangayCount} Barangays
                </p>
                <p className="text-[11px] text-muted-foreground">Poblacion core & environs</p>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5">
                <span className="text-muted-foreground">Rural Barangays</span>
                <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {demo.ruralBarangayCount} Barangays
                </p>
                <p className="text-[11px] text-muted-foreground">Upland & agro-ecological</p>
              </div>
            </div>

            <p className="mt-5 text-xs text-muted-foreground">
              Dominant physical feature: <strong>Mount Iriga (Mount Asog)</strong>,
              an extinct volcano rising 1,196 meters above sea level with lush agro-forest
              and natural spring systems.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Population by Barangay (Ranked Bar Chart) */}
      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              2. Population Distribution Across All 36 Barangays
            </h2>
            <p className="text-xs text-muted-foreground">
              Ranked from largest to smallest population according to the PSA 2020 Census.
            </p>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-200">
            36 Barangays • Total: 114,457
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {barangays.map((b, idx) => (
              <div
                key={b.name}
                className="rounded-xl border border-border/70 bg-background p-3 text-xs transition-colors hover:border-blue-300 dark:hover:border-blue-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">
                    #{idx + 1}. Barangay {b.name}
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {b.population.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="truncate">{b.classification.split("/")[0]}</span>
                  <span>{b.pctOfCity}% of city</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-blue-500"
                    style={{
                      width: `${((b.population / 10792) * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Municipal Income Composition & Mandatory Funds */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            3. City Income Composition & Mandatory Funds (DBM Series)
          </h2>
          <p className="text-xs text-muted-foreground">
            Iriga City receives its annual National Tax Allotment (NTA) under the Mandanas-Garcia Supreme Court ruling, with statutory allocations prescribed by RA 7160.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/70 via-card to-card p-5 shadow-2xs dark:border-emerald-900/50 dark:from-emerald-950/25">
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              20% Development Fund
            </span>
            <p className="mt-3 font-mono text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {formatPesoCompact(fiscal.developmentFundPhp)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Mandatory capital investments, roads, and community facilities.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-card to-card p-5 shadow-2xs dark:border-amber-900/50 dark:from-amber-950/25">
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              5% Calamity / CDRRMO Fund
            </span>
            <p className="mt-3 font-mono text-2xl font-extrabold text-amber-700 dark:text-amber-400">
              {formatPesoCompact(fiscal.calamityFundPhp)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Disaster preparedness, rescue equipment, and emergency relief.
            </p>
          </div>

          <div className="rounded-2xl border border-purple-300/80 bg-gradient-to-br from-purple-50/70 via-card to-card p-5 shadow-2xs dark:border-purple-900/50 dark:from-purple-950/25">
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-900 dark:bg-purple-950 dark:text-purple-200">
              5% Gender & Dev (GAD)
            </span>
            <p className="mt-3 font-mono text-2xl font-extrabold text-purple-700 dark:text-purple-400">
              {formatPesoCompact(fiscal.gadFundPhp)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Women empowerment, maternal healthcare, and child protection.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-300/80 bg-gradient-to-br from-blue-50/70 via-card to-card p-5 shadow-2xs dark:border-blue-900/50 dark:from-blue-950/25">
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-200">
              10% SK / Youth Fund
            </span>
            <p className="mt-3 font-mono text-2xl font-extrabold text-blue-700 dark:text-blue-400">
              {formatPesoCompact(fiscal.youthSkFundPhp)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Youth leadership, sports development, and educational assistance.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: DTI Cities & Municipalities Competitiveness Index (CMCI) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            4. DTI Competitiveness Index (CMCI Pillars)
          </h2>
          <p className="text-xs text-muted-foreground">
            {cmci.category}. Benchmarked annually by the National Competitiveness Council and DTI.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cmci.pillars.map((pillar) => (
            <div
              key={pillar.name}
              className="civic-card-hover flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">
                    {pillar.name}
                  </h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                    {pillar.scoreOrRank}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
                <ul className="space-y-1.5 pt-2 text-xs">
                  {pillar.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-foreground/90">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {/* Social Welfare Card */}
          <div className="civic-card-hover flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">
                  Social Welfare & Inclusivity
                </h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 uppercase">
                  Community Impact
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Public service delivery indicators covering senior citizens, indigenous peoples, and local enterprise growth.
              </p>
              <ul className="space-y-2 pt-2 text-xs">
                <li className="flex justify-between border-b border-border/60 pb-1.5">
                  <span className="text-muted-foreground">Registered Businesses</span>
                  <span className="font-mono font-bold text-foreground">{econ.registeredBusinesses.toLocaleString()}+</span>
                </li>
                <li className="flex justify-between border-b border-border/60 pb-1.5">
                  <span className="text-muted-foreground">Senior Pension Beneficiaries</span>
                  <span className="font-mono font-bold text-foreground">{econ.seniorPensionBeneficiaries.toLocaleString()}+</span>
                </li>
                <li className="flex justify-between border-b border-border/60 pb-1.5">
                  <span className="text-muted-foreground">Poverty Incidence (PSA)</span>
                  <span className="font-mono font-bold text-foreground">{econ.povertyIncidencePct}%</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Major Commercial Hubs</span>
                  <span className="font-mono font-bold text-foreground">{econ.publicMarketsAndHubs} hubs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Citations & Primary Sources */}
      <section className="rounded-2xl border border-border bg-muted/20 p-5 sm:p-6">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide text-muted-foreground">
          Primary Sources & Verification Audit
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          All data points published on this page are verified against official government reports and censuses.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.citations.map((c, i) => (
            <CitationBadge key={i} citation={c} />
          ))}
        </div>
      </section>
    </CivicPageContainer>
  )
}
