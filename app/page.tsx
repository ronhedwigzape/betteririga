import type { Metadata } from "next"
import Link from "next/link"
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
} from "@/lib/data/iriga-data"
import { GlobalCivicSearch } from "@/components/civic/global-civic-search"
import { CitationBadge } from "@/components/civic/citation-badge"
import { Reveal } from "@/components/civic/reveal"
import { BetterIrigaLogo } from "@/components/civic/better-iriga-logo"
import { HeroVideoBackground } from "@/components/civic/hero-video-background"
import { AnimatedHeroTitle } from "@/components/civic/animated-hero-title"
import { IrigaLivelySections } from "@/components/civic/iriga-lively-sections"
import { FreedomWallCtaSection } from "@/components/civic/freedom-wall-cta"

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
  const fy2025Nta = snapshot.nationalTaxAllotments[0]
  const offices = snapshot.offices
  const hotlines = snapshot.emergencyHotlines
  const betterGovRecords = snapshot.betterGovRecords

  const mayor = elected2025.find((o) => o.position === "City Mayor")
  const viceMayor = elected2025.find((o) => o.position === "City Vice Mayor")
  const councilors = elected2025.filter((o) =>
    o.position.includes("Sangguniang Panlungsod")
  )

  return (
    <div className="space-y-14 pb-8">
      {/* Hero Section */}
      <Reveal>
        <HeroVideoBackground className="px-4 pt-10 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <BetterIrigaLogo
                size={180}
                priority
                alt={`${snapshot.siteContent.brand.fullDomain} Official Emblem`}
                className="size-32 sm:size-40 md:size-44 lg:size-48 transition-transform duration-500 hover:scale-105 drop-shadow-2xl"
              />
            </div>

            <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-blue-200 bg-white/95 px-3.5 py-1 text-xs font-medium text-blue-900 shadow-2xs dark:border-blue-800 dark:bg-slate-900 dark:text-blue-200">
              <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{homeCopy.heroBadgePrefix}</span>
              <span className="text-muted-foreground">•</span>
              <span>{ledger.totalRecords} Verified Records</span>
              <span className="text-muted-foreground">•</span>
              <Link
                href="/verification"
                className="font-semibold text-blue-700 underline underline-offset-2 dark:text-blue-300"
              >
                100% Checked Sources
              </Link>
            </div>

            <div className="mt-5">
              <AnimatedHeroTitle
                highlight={homeCopy.heroTitleHighlight}
                title={homeCopy.heroTitleMain}
              />
            </div>

            <div className="mx-auto mt-4 max-w-3xl">
              <p className="rounded-2xl border border-border/60 bg-background/85 px-4 py-3 text-sm font-medium leading-relaxed text-foreground shadow-2xs backdrop-blur-md sm:text-base dark:border-white/15 dark:bg-slate-950/85 dark:text-slate-100">
                {homeCopy.heroSubtitle}
              </p>
            </div>
          </div>

          {/* Search Engine */}
          <div className="mx-auto mt-8 max-w-4xl">
            <GlobalCivicSearch />
          </div>

          {/* Key City Facts Bar */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="civic-card-hover rounded-xl border border-border bg-card p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-muted-foreground uppercase">
                Residents (2024 Census)
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {profile.population2024.toLocaleString()}
              </p>
              <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                Up from {profile.population2020.toLocaleString()} in 2020
              </p>
            </div>

            <div className="civic-card-hover rounded-xl border border-border bg-card p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-muted-foreground uppercase">
                2025 National Allotment
              </p>
              <p className="mt-1 text-xl font-bold text-blue-700 dark:text-blue-400">
                {formatPesoCompact(fy2025Nta.amountPhp)}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                DBM LBM No. 90 (+18.3% vs 2024)
              </p>
            </div>

            <div className="civic-card-hover rounded-xl border border-border bg-card p-3.5 shadow-2xs">
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
            </div>

            <div className="civic-card-hover rounded-xl border border-border bg-card p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-muted-foreground uppercase">
                Land Area
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {profile.landAreaSqKm} sq. km
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {profile.landUseBreakdown.agriculturalPct}% Agricultural Land
              </p>
            </div>

            <div className="civic-card-hover rounded-xl border border-border bg-card p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-muted-foreground uppercase">
                City Hall Offices
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {offices.length} Offices
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Landline (054) 299-xxxx
              </p>
            </div>

            <div className="civic-card-hover rounded-xl border border-border bg-card p-3.5 shadow-2xs">
              <p className="text-[11px] font-medium text-muted-foreground uppercase">
                Postal / ZIP Code
              </p>
              <p className="mt-1 font-mono text-xl font-bold text-foreground">
                {profile.geo.postalCode}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                5th District (Rinconada)
              </p>
            </div>
          </div>

          <div className="mt-4">
            <CitationBadge citation={profile.citation} compact />
          </div>
        </HeroVideoBackground>
      </Reveal>

      {/* Popular Municipal Services Quick-Access Section (BetterSolano-style) */}
      <Reveal delayMs={40}>
        <section className="rounded-3xl border border-border bg-card p-6 shadow-xs sm:p-8">
          <div className="flex flex-col justify-between gap-2 border-b border-border pb-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                Iriga City Citizen&apos;s Charter Directory
              </span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
                Popular City Hall Services
              </h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Quick access to the most frequently requested certificates,
                permits, tax payments, and social services in Iriga City.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-500"
            >
              View All {snapshot.services.length} City Services
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {snapshot.services.slice(0, 5).map((service) => (
              <Link
                key={service.id}
                href={`/services#${service.id}`}
                className="civic-card-hover group flex flex-col justify-between rounded-2xl border border-border bg-background p-5 hover:border-blue-600"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-400/15 dark:text-blue-300">
                      <FileText className="size-5" />
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {service.category}
                    </span>
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
            ))}

            {/* 6th Card: View Complete Directory + Freedom Wall CTA */}
            <Link
              href="/services"
              className="civic-card-hover group flex flex-col justify-between rounded-2xl border border-blue-300/80 bg-gradient-to-br from-blue-600 to-indigo-800 p-5 text-white shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-white">
                    <Briefcase className="size-5" />
                  </span>
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold">
                    29 City Hall Offices
                  </span>
                </div>
                <h3 className="mt-3 text-base font-extrabold">
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
          </div>
        </section>
      </Reveal>

      {/* Civic Pillar Cards from Store */}
      <Reveal delayMs={60}>
        <section>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {homeCopy.pillarsHeading}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {homeCopy.pillarsSubheading}
              </p>
            </div>
            <Link
              href="/verification"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              See How We Check Our Facts
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {homeCopy.pillars.map((pillar) => {
              const Icon = getPillarIcon(pillar.id)
              return (
                <Link
                  key={pillar.id}
                  href={pillar.href}
                  className="civic-card-hover group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-2xs hover:border-blue-600"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/20 dark:text-blue-300">
                        <Icon className="size-5" />
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                        {pillar.badge}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {pillar.description}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <span>{pillar.cta}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </Reveal>

      {/* Dedicated BetterGov.ph Open Data Showcase Section */}
      <Reveal delayMs={100}>
        <section className="rounded-3xl border border-blue-300/80 bg-gradient-to-br from-blue-50/80 via-card to-emerald-50/40 p-6 shadow-xs sm:p-8 dark:border-blue-900/60 dark:from-blue-950/30 dark:via-card dark:to-emerald-950/20">
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 lg:flex-row lg:items-center">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                <Globe className="size-3.5" />
                BetterGov.ph Open Data Integration
              </div>
              <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">
                {homeCopy.betterGovHighlightTitle}
              </h2>
              <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {homeCopy.betterGovHighlightSubtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://transparency.bettergov.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
              >
                transparency.bettergov.ph
                <ExternalLink className="size-3.5 text-blue-600" />
              </a>
              <a
                href="https://budget.bettergov.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
              >
                budget.bettergov.ph
                <ExternalLink className="size-3.5 text-emerald-600" />
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {betterGovRecords.slice(0, 6).map((record) => (
              <article
                key={record.id}
                className="civic-card-hover flex flex-col justify-between rounded-2xl border border-border bg-background/95 p-5"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-200">
                      {record.category}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                      {record.status}
                    </span>
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
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs">
            <span className="text-muted-foreground">
              Showing <strong>6</strong> of{" "}
              <strong>{betterGovRecords.length}</strong> verified BetterGov.ph
              public records for Iriga City & Camarines Sur 5th District.
            </span>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white shadow-xs transition hover:bg-blue-700"
            >
              Browse All {betterGovRecords.length} BetterGov.ph Records →
            </Link>
          </div>
        </section>
      </Reveal>

      {/* Executive & Legislative Snapshot */}
      <Reveal delayMs={120}>
        <section className="rounded-2xl border border-border bg-card p-6 shadow-2xs sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
            <div>
              <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                Current City Leadership (2025–2028 Term)
              </span>
              <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
                Who Are Iriga City&apos;s Elected Leaders?
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Sworn into office on June 13, 2025 at the Iriga City Sports
                Center following the May 12, 2025 local elections.
              </p>
            </div>
            <Link
              href="/officials"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
            >
              See All {elected2025.length + appointed.length} Officials & 36
              Barangays
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {mayor ? (
              <div className="civic-card-hover rounded-xl border border-blue-200/80 bg-blue-50/50 p-4 dark:border-blue-900/60 dark:bg-blue-950/25">
                <span className="inline-block rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                  City Mayor (Local Chief Executive)
                </span>
                <h3 className="mt-2 text-lg font-bold text-foreground">
                  {mayor.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {mayor.notes}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-foreground/90">
                  <span>Phone: {mayor.officePhone}</span>
                  <span>Email: {mayor.officeEmail}</span>
                </div>
              </div>
            ) : null}

            {viceMayor ? (
              <div className="civic-card-hover rounded-xl border border-border bg-muted/30 p-4">
                <span className="inline-block rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase dark:bg-slate-700">
                  City Vice Mayor & Presiding Officer
                </span>
                <h3 className="mt-2 text-lg font-bold text-foreground">
                  {viceMayor.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {viceMayor.notes}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-foreground/90">
                  <span>Phone: {viceMayor.officePhone}</span>
                  <span>Email: {viceMayor.officeEmail}</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Sangguniang Panlungsod (10 Elected City Councilors for 2025–2028)
            </h3>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
              {councilors.map((councilor, idx) => (
                <div
                  key={councilor.id}
                  className="civic-card-hover rounded-xl border border-border bg-background p-3 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Councilor #{idx + 1}</span>
                    {councilor.party ? (
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                        {councilor.party}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 font-bold text-foreground">
                    {councilor.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {mayor ? (
            <div className="mt-5">
              <CitationBadge citation={mayor.citation} />
            </div>
          ) : null}
        </section>
      </Reveal>

      {/* Lively Sections: Live Weather + Interactive Map, History of Iriga, and Live Facebook Page */}
      <IrigaLivelySections />

      {/* BetterLibmanan-Style Community Freedom Wall Sticky-Note CTA */}
      <Reveal delayMs={130}>
        <FreedomWallCtaSection />
      </Reveal>

      {/* Emergency Hotlines & Plain-Language Accuracy Callout */}
      <Reveal delayMs={140}>
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Emergency Hotlines Card */}
          <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-6 lg:col-span-2 dark:border-rose-900/50 dark:bg-rose-950/20">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-400">
                  24/7 Emergency & Rescue Numbers
                </span>
                <h2 className="mt-1 text-xl font-bold text-foreground">
                  Need Immediate Help in Iriga City?
                </h2>
              </div>
              <Link
                href="/contacts"
                className="text-xs font-semibold text-rose-700 underline hover:text-rose-800 dark:text-rose-300"
              >
                See All {offices.length} City Hall Offices →
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {hotlines.slice(0, 6).map((h) => (
                <a
                  key={h.id}
                  href={h.telHref}
                  className="civic-card-hover rounded-xl border border-rose-200/80 bg-background p-3.5 hover:border-rose-500 dark:border-rose-900/60"
                >
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {h.label}
                  </p>
                  <p className="mt-1 font-mono text-base font-bold text-rose-700 dark:text-rose-400">
                    {h.number}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Tap to Call • {h.networkOrType}
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Honest Gap Reporting Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-amber-300/80 bg-amber-50/60 p-6 dark:border-amber-900/60 dark:bg-amber-950/25">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-bold text-amber-950 dark:bg-amber-900 dark:text-amber-100">
                <AlertTriangle className="size-3.5" />
                Our Honest Data Promise
              </div>
              <h3 className="mt-3 text-lg font-bold text-foreground">
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
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/verification"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                <ShieldCheck className="size-4" />
                See Our Source Checklist
              </Link>
              <Link
                href="/about#contribute"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-400 bg-background px-4 py-2 text-xs font-semibold text-amber-950 transition hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-950/50"
              >
                <CheckCircle2 className="size-4 text-amber-600" />
                Share an Official Document
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  )
}
