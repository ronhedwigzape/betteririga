import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import {
  Landmark,
  FileSpreadsheet,
  HardHat,
  Scale,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe,
  Briefcase,
  MessageSquareHeart,
  FileText,
} from "lucide-react"
import {
  formatPesoCompact,
  getCivicSnapshot,
  getPageMetadata,
  getVerificationLedgerSummary,
  getNationalBudget,
} from "@/lib/data/iriga-data"
import { GlobalCivicSearch } from "@/components/civic/global-civic-search"
import { CitationBadge } from "@/components/civic/citation-badge"
import { BetterIrigaLogo } from "@/components/civic/better-iriga-logo"
import { CivicPageContainer } from "@/components/civic/civic-page-container"
import { HeroVideoBackground } from "@/components/civic/hero-video-background"
import { AnimatedHeroTitle } from "@/components/civic/animated-hero-title"
import { FreedomWallCtaSection } from "@/components/civic/freedom-wall-cta"
import { Reveal } from "@/components/civic/reveal"

import { LivelySectionsLazy } from "@/components/civic/lively-sections-lazy"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const metadata: Metadata = getPageMetadata("home")

function getPillarIcon(id: string) {
  switch (id) {
    case "services":
      return Briefcase
    case "officials":
      return Landmark
    case "budget":
      return FileSpreadsheet
    case "projects":
      return HardHat
    case "ordinances":
      return Scale
    case "contacts":
      return PhoneCall
    case "freedom-wall":
      return MessageSquareHeart
    default:
      return ShieldCheck
  }
}

export default function HomePage() {
  const snapshot = getCivicSnapshot()
  const ledger = getVerificationLedgerSummary()
  const profile = snapshot.cityProfile
  const homeCopy = snapshot.siteContent.home
  const elected2025 = snapshot.electedOfficials.filter(
    (o) => o.term === "2025-2028"
  )
  const appointed = snapshot.appointedOfficials
  const barangays = snapshot.barangays
  const offices = snapshot.offices
  const hotlines = snapshot.emergencyHotlines
  const betterGovRecords = snapshot.betterGovRecords

  // Retrieve the latest available fiscal and public works data
  const nationalBudget = getNationalBudget()
  const latestDistrictWork = nationalBudget.camSur5thDistrictLedger.years
    .filter((y) => y.stage === "gaa")
    .sort((a, b) => b.fy - a.fy)[0]
  const latestNta = [...snapshot.nationalTaxAllotments].sort(
    (a, b) => b.fiscalYear - a.fiscalYear
  )[0]

  const mayor = elected2025.find((o) => o.position === "City Mayor")
  const viceMayor = elected2025.find((o) => o.position === "City Vice Mayor")
  const councilors = elected2025.filter((o) =>
    o.position.includes("Sangguniang Panlungsod")
  )

  return (
    <div className="w-full">
      {/* Covered Parallax Hero Section — Maxxed Out at ALL Breakpoints */}
      <HeroVideoBackground className="w-full border-b border-border/70 pt-10 pb-14 sm:pt-14 sm:pb-18 lg:pt-16 lg:pb-20">
        <div className="mx-auto max-w-4xl text-center">
            {/* Enlarged Official Emblem */}
            <div className="mb-6 flex justify-center">
              <BetterIrigaLogo
                size={180}
                priority
                alt={`${snapshot.siteContent.brand.fullDomain} Official Emblem`}
                className="size-16 sm:size-36 md:size-40 lg:size-48 transition-transform duration-500 hover:scale-105 sm:drop-shadow-2xl"
              />
            </div>

            <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-blue-200/90 bg-white/95 px-4 py-1 text-xs font-semibold text-blue-900 shadow-xs dark:border-blue-800 dark:bg-slate-900/95 dark:text-blue-200">
              <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{homeCopy.heroBadgePrefix}</span>
              <span className="text-muted-foreground">•</span>
              <span>{ledger.totalRecords} Verified Records</span>
              <span className="text-muted-foreground">•</span>
              <Link
                href="/verification"
                prefetch={false}
                className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-800 dark:text-blue-300"
              >
                100% Checked Sources
              </Link>
            </div>

            <div className="mt-5">
              <AnimatedHeroTitle
                highlight={homeCopy.heroTitleHighlight}
                title={homeCopy.heroTitleMain}
                pillars={snapshot.siteContent.home.civicPillars}
              />
            </div>

            <div className="mx-auto mt-4 max-w-3xl">
              <p className="rounded-2xl border border-border/60 bg-background/90 px-4 py-3 text-sm font-medium leading-relaxed text-foreground shadow-xs backdrop-blur-md sm:text-base dark:border-white/15 dark:bg-slate-950/85 dark:text-slate-100">
                {homeCopy.heroSubtitle}
              </p>
            </div>

            {/* Community Freedom Wall Shortcut (100% shadcn UI) */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="group h-8 gap-2 rounded-full border-amber-500/40 bg-amber-50/90 text-amber-950 shadow-2xs backdrop-blur-md transition-all duration-200 hover:border-amber-500/70 hover:bg-amber-100/90 hover:scale-[1.02] active:scale-95 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/60"
              >
                <Link href="/freedom-wall" prefetch={false}>
                  <MessageSquareHeart className="size-3.5 text-amber-600 transition-transform duration-200 group-hover:scale-110 dark:text-amber-400" />
                  <span className="font-semibold text-xs">Community Freedom Wall</span>
                  <Badge
                    variant="secondary"
                    className="h-4.5 rounded-full bg-amber-200/80 px-1.5 text-[10px] font-bold text-amber-800 transition-colors group-hover:bg-amber-300 dark:bg-amber-900/60 dark:text-amber-200"
                  >
                    Post a Note
                  </Badge>
                  <ArrowRight className="size-3 text-amber-700 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-amber-300" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Search Engine */}
          <div className="mx-auto mt-8 max-w-4xl">
            <GlobalCivicSearch
              quickFilters={snapshot.siteContent.searchFilters}
              homeCopy={homeCopy}
            />
          </div>

          {/* Key City Facts Cards (Natural Standalone Cards) */}
          <Suspense fallback={null}>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Card className="civic-card-hover border-border bg-card/90 backdrop-blur-xs p-3.5 shadow-2xs">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">
                  Residents (2024 Census)
                </p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {profile.population2024.toLocaleString()}
                </p>
                <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                  Up from {profile.population2020.toLocaleString()} in 2020
                </p>
              </Card>

              <Link href="/budget" prefetch={false} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                <Card className="civic-card-hover h-full border-border bg-card/90 backdrop-blur-xs p-3.5 shadow-2xs hover:border-blue-500/50 transition-colors">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">
                    {latestDistrictWork && latestDistrictWork.fy > latestNta.fiscalYear
                      ? `${latestDistrictWork.fy} Public Works (GAA)`
                      : `${latestNta.fiscalYear} National Allotment`}
                  </p>
                  <p className="mt-1 text-xl font-bold text-blue-700 dark:text-blue-400">
                    {latestDistrictWork && latestDistrictWork.fy > latestNta.fiscalYear
                      ? latestDistrictWork.displayAmount
                      : formatPesoCompact(latestNta.amountPhp)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {latestDistrictWork && latestDistrictWork.fy > latestNta.fiscalYear
                      ? `CamSur 5th DEO • ₱${(latestNta.amountPhp / 1_000_000).toFixed(1)}M NTA`
                      : `DBM LBM No. 90 (${latestNta.yoyChangePct ? `+${latestNta.yoyChangePct}%` : "Allocated"})`}
                  </p>
                </Card>
              </Link>

              <Card className="civic-card-hover border-border bg-card/90 backdrop-blur-xs p-3.5 shadow-2xs">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">
                  Total Barangays
                </p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {barangays.length} Barangays
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {profile.urbanPopulationPct}% Urban •{" "}
                  {profile.ruralPopulationPct}% Rural
                </p>
              </Card>

              <Card className="civic-card-hover border-border bg-card/90 backdrop-blur-xs p-3.5 shadow-2xs">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">
                  Land Area
                </p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {profile.landAreaSqKm} sq. km
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {profile.landUseBreakdown.agriculturalPct}% Agricultural Land
                </p>
              </Card>

              <Card className="civic-card-hover border-border bg-card/90 backdrop-blur-xs p-3.5 shadow-2xs">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">
                  City Hall Offices
                </p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {offices.length} Offices
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Landline (054) 299-xxxx
                </p>
              </Card>

              <Card className="civic-card-hover border-border bg-card/90 backdrop-blur-xs p-3.5 shadow-2xs">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">
                  Postal / ZIP Code
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-foreground">
                  {profile.geo.postalCode}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  5th District (Rinconada)
                </p>
              </Card>
            </div>

            <div className="mt-4">
              <CitationBadge citation={profile.citation} compact />
            </div>
          </Suspense>
        </HeroVideoBackground>

      {/* Main Civic Container for subsequent homepage sections */}
      <CivicPageContainer className="space-y-16 py-8 sm:py-12 pb-16">
        {/* Popular Municipal Services Section (Natural Surface Cards - No Outer Card Wrapper) */}
        <Suspense fallback={null}>
          <Reveal>
          <section className="space-y-6">
          <div className="flex flex-col justify-between gap-3 border-b border-border/80 pb-4 sm:flex-row sm:items-end">
            <div>
              <Badge variant="secondary" className="font-semibold text-blue-700 dark:text-blue-300">
                Iriga City Citizen&apos;s Charter Directory
              </Badge>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Popular City Hall Services
              </h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Quick access to the most frequently requested certificates,
                permits, tax payments, and social services in Iriga City.
              </p>
            </div>
            <Button asChild className="rounded-xl shadow-xs">
              <Link href="/services" prefetch={false}>
                View All {snapshot.services.length} City Services
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {snapshot.services.slice(0, 5).map((service) => (
              <Card
                key={service.id}
                className="civic-card-hover group flex flex-col justify-between border-border bg-card shadow-xs transition-all hover:border-blue-600"
              >
                <Link
                  href={`/services#${service.id}`}
                  prefetch={false}
                  className="flex flex-1 flex-col justify-between p-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-400/15 dark:text-blue-300">
                        <FileText className="size-5" />
                      </span>
                      <Badge variant="outline" className="text-[11px] font-semibold">
                        {service.category}
                      </Badge>
                    </div>
                    <h3 className="mt-3 text-base font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {service.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {service.summary}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-2.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <span className="truncate">{service.officeName}</span>
                    <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </Card>
            ))}

            {/* 6th Card: View Complete Directory + Freedom Wall CTA */}
            <Card className="civic-card-hover group border-blue-300/80 bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-sm">
              <Link
                href="/services"
                prefetch={false}
                className="flex h-full flex-col justify-between p-5 text-white"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-white">
                      <Briefcase className="size-5" />
                    </span>
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 text-[11px] font-bold">
                      29 City Hall Offices
                    </Badge>
                  </div>
                  <h3 className="mt-3 text-base font-extrabold text-white">
                    Browse Complete Iriga Services Directory
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-blue-100">
                    See all {snapshot.services.length} Citizen&apos;s Charter
                    services — including Senior/PWD IDs, CSWDO crisis aid,
                    Health/Sanitary permits, PESO jobs, Agriculture RSBSA, and
                    SP ordinances.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-2.5 text-xs font-bold text-amber-300">
                  <span>Open Full Services Guide</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Card>
          </div>
        </section>
        </Reveal>
      </Suspense>

      {/* Civic Pillar Cards (100% shadcn UI Cards) */}
      <Suspense fallback={null}>
        <Reveal delayMs={40}>
        <section className="civic-section-defer space-y-6">
        <div className="flex flex-col justify-between gap-2 border-b border-border/80 pb-4 sm:flex-row sm:items-end">
            <div>
              <Badge variant="outline" className="font-semibold text-muted-foreground">
                Core Transparency Framework
              </Badge>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {homeCopy.pillarsHeading}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {homeCopy.pillarsSubheading}
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/verification" prefetch={false}>
                See How We Check Our Facts
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {homeCopy.pillars.map((pillar) => {
              const Icon = getPillarIcon(pillar.id)
              return (
                <Card
                  key={pillar.id}
                  className="civic-card-hover group flex flex-col justify-between border-border bg-card shadow-xs transition-all hover:border-blue-600"
                >
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/20 dark:text-blue-300">
                        <Icon className="size-5" />
                      </div>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-semibold">
                        {pillar.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {pillar.title}
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                      {pillar.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="border-t border-border/70 pt-3 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <Link href={pillar.href} prefetch={false} className="inline-flex w-full items-center justify-between">
                      <span>{pillar.cta}</span>
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </section>
        </Reveal>
      </Suspense>

      {/* Dedicated BetterGov.ph Open Data Showcase Section (Natural Surface Cards - No Outer Card Wrapper) */}
      <Suspense fallback={null}>
        <Reveal delayMs={60}>
        <section className="civic-section-defer space-y-6">
        <div className="flex flex-col justify-between gap-4 border-b border-border/80 pb-4 lg:flex-row lg:items-center">
            <div className="space-y-1.5">
              <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                <Globe className="size-3.5" />
                BetterGov.ph Open Data Integration
              </Badge>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {homeCopy.betterGovHighlightTitle}
              </h2>
              <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {homeCopy.betterGovHighlightSubtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <a
                  href="https://transparency.bettergov.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-1.5"
                >
                  transparency.bettergov.ph
                  <ExternalLink className="size-3.5 text-blue-600" />
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <a
                  href="https://budget.bettergov.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-1.5"
                >
                  budget.bettergov.ph
                  <ExternalLink className="size-3.5 text-emerald-600" />
                </a>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {betterGovRecords.slice(0, 6).map((record) => (
              <Card
                key={record.id}
                className="civic-card-hover flex flex-col justify-between border-border bg-card p-5 shadow-xs transition-all hover:border-blue-500"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 text-[11px] font-bold">
                      {record.category}
                    </Badge>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 text-[11px] font-semibold">
                      {record.status}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    {record.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {record.plainSummary}
                  </p>
                  <div className="space-y-1 rounded-xl bg-muted/50 p-2.5 text-[11px]">
                    <p>
                      <strong className="text-foreground">Location:</strong>{" "}
                      {record.location}
                    </p>
                    <p>
                      <strong className="text-foreground">Proponent:</strong>{" "}
                      {record.contractorOrProponent}
                    </p>
                    <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {record.amountDisplay}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-2">
                  <CitationBadge citation={record.citation} compact />
                </div>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4 text-xs">
            <span className="text-muted-foreground">
              Showing <strong>6</strong> of{" "}
              <strong>{betterGovRecords.length}</strong> verified BetterGov.ph
              public records for Iriga City & Camarines Sur 5th District.
            </span>
            <Button asChild size="sm" className="rounded-xl">
              <Link href="/projects" prefetch={false}>
                Browse All {betterGovRecords.length} BetterGov.ph Records →
              </Link>
            </Button>
          </div>
        </section>
        </Reveal>
      </Suspense>

      {/* Executive & Legislative Leadership (Natural Surface Cards - No Outer Card Wrapper) */}
      <Suspense fallback={null}>
        <Reveal delayMs={80}>
        <section className="civic-section-defer space-y-6">
        <div className="flex flex-col justify-between gap-4 border-b border-border/80 pb-4 sm:flex-row sm:items-center">
            <div>
              <Badge variant="secondary" className="font-semibold text-blue-700 dark:text-blue-300">
                Current City Leadership (2025–2028 Term)
              </Badge>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Who Are Iriga City&apos;s Elected Leaders?
              </h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Sworn into office on June 13, 2025 at the Iriga City Sports
                Center following the May 12, 2025 local elections.
              </p>
            </div>
            <Button asChild className="rounded-xl shadow-xs">
              <Link href="/officials" prefetch={false}>
                See All {elected2025.length + appointed.length} Officials & 36
                Barangays
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {mayor ? (
              <Card className="civic-card-hover border-blue-200/80 bg-blue-50/40 p-5 shadow-xs dark:border-blue-900/60 dark:bg-blue-950/25">
                <Badge variant="default" className="bg-blue-600 text-white tracking-wider uppercase text-[10px] font-bold">
                  City Mayor (Local Chief Executive)
                </Badge>
                <h3 className="mt-2.5 text-xl font-bold text-foreground">
                  {mayor.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {mayor.notes}
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-foreground/90 border-t border-border/60 pt-3">
                  <span>Phone: {mayor.officePhone}</span>
                  <span>Email: {mayor.officeEmail}</span>
                </div>
              </Card>
            ) : null}

            {viceMayor ? (
              <Card className="civic-card-hover border-border bg-card p-5 shadow-xs">
                <Badge variant="secondary" className="bg-slate-800 text-white tracking-wider uppercase text-[10px] font-bold dark:bg-slate-700">
                  City Vice Mayor & Presiding Officer
                </Badge>
                <h3 className="mt-2.5 text-xl font-bold text-foreground">
                  {viceMayor.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {viceMayor.notes}
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-foreground/90 border-t border-border/60 pt-3">
                  <span>Phone: {viceMayor.officePhone}</span>
                  <span>Email: {viceMayor.officeEmail}</span>
                </div>
              </Card>
            ) : null}
          </div>

          <div>
            <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-3">
              Sangguniang Panlungsod (10 Elected City Councilors for 2025–2028)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {councilors.map((councilor, idx) => (
                <Card
                  key={councilor.id}
                  className="civic-card-hover border-border bg-card p-3.5 shadow-2xs text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Councilor #{idx + 1}</span>
                    {councilor.party ? (
                      <Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px]">
                        {councilor.party}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1.5 font-bold text-foreground text-sm">
                    {councilor.name}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {mayor ? (
            <div>
              <CitationBadge citation={mayor.citation} />
            </div>
          ) : null}
        </section>
        </Reveal>
      </Suspense>

      {/* Lively Sections: Live Weather + Interactive Map, History of Iriga, and Live Facebook Page */}
      <Suspense fallback={null}>
        <Reveal delayMs={100} className="civic-section-defer">
          <LivelySectionsLazy />
        </Reveal>
      </Suspense>

      {/* Community Freedom Wall Sticky-Note CTA */}
      <Suspense fallback={null}>
        <Reveal delayMs={110} className="civic-section-defer">
          <FreedomWallCtaSection />
        </Reveal>
      </Suspense>

      {/* Emergency Hotlines & Plain-Language Accuracy Section (Natural Surface Cards) */}
      <Suspense fallback={null}>
        <Reveal delayMs={120}>
        <section className="civic-section-defer grid gap-6 lg:grid-cols-3">
        {/* Emergency Hotlines Cards */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
            <div>
              <Badge variant="destructive" className="bg-rose-600 text-white text-xs font-bold">
                24/7 Emergency & Rescue Numbers
              </Badge>
              <h2 className="mt-1.5 text-xl font-bold text-foreground">
                Need Immediate Help in Iriga City?
              </h2>
            </div>
            <Button asChild variant="link" size="sm" className="text-rose-600 hover:text-rose-700 p-0 h-auto">
              <Link href="/contacts" prefetch={false}>
                See All {offices.length} City Hall Offices →
              </Link>
            </Button>
          </div>

          <TooltipProvider delayDuration={300}>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {hotlines.slice(0, 6).map((h) => (
                <Tooltip key={h.id}>
                  <TooltipTrigger asChild>
                    <Card
                      title={`${h.label} (${h.agency}) • ${h.number} • Tap to call immediately`}
                      className="civic-card-hover border-rose-200/80 bg-card p-4 shadow-xs transition-all hover:border-rose-500 hover:shadow-sm dark:border-rose-900/60 cursor-pointer"
                    >
                      <a href={h.telHref} className="block space-y-1">
                        <p className="text-[11px] font-medium text-muted-foreground truncate">
                          {h.label}
                        </p>
                        <p className="font-mono text-base font-bold text-rose-700 dark:text-rose-400">
                          {h.number}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Tap to Call • {h.networkOrType}
                        </p>
                      </a>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-xs">
                    <p className="font-bold text-foreground">{h.label} ({h.agency})</p>
                    <p className="text-muted-foreground font-mono">{h.number} • {h.networkOrType}</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Click / Tap to dial immediately</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>

        {/* Honest Gap Reporting Card */}
        <Card className="flex flex-col justify-between border-amber-300/80 bg-amber-50/50 p-6 shadow-xs dark:border-amber-900/60 dark:bg-amber-950/25">
          <div>
            <Badge variant="outline" className="bg-amber-200/80 text-amber-950 border-amber-400 dark:bg-amber-900 dark:text-amber-100 gap-1.5">
              <AlertTriangle className="size-3.5" />
              Our Honest Data Promise
            </Badge>
            <h3 className="mt-3.5 text-lg font-bold text-foreground">
              We Never Guess or Make Up Numbers
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              If a specific phone number, barangay hall email, or contract
              amount is not yet posted on an official government website, we
              mark it clearly as <strong>&ldquo;Data not yet available&rdquo;</strong>{" "}
              instead of guessing. You can review all{" "}
              <strong>{ledger.totalRecords}</strong> checked public records on
              our source checklist page.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2.5">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs">
              <Link href="/verification" prefetch={false} className="gap-1.5">
                <ShieldCheck className="size-4" />
                See Our Source Checklist
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-amber-400 text-amber-950 hover:bg-amber-100 rounded-xl dark:text-amber-200 dark:hover:bg-amber-950/50">
              <Link href="/about#contribute" prefetch={false} className="gap-1.5">
                <CheckCircle2 className="size-4 text-amber-600" />
                Share an Official Document
              </Link>
            </Button>
          </div>
        </Card>
      </section>
      </Reveal>
      </Suspense>
      </CivicPageContainer>
    </div>
  )
}
