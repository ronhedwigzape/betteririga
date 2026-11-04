import { CivicPageContainer } from "@/components/civic/civic-page-container"
import type { Metadata } from "next"
import Link from "next/link"
import {
  ShieldCheck,
  BookOpenCheck,
  Scale,
  HeartHandshake,
  ExternalLink,
  CheckCircle2,
  Send,
  MessageSquareHeart,
} from "lucide-react"
import {
  getCivicSnapshot,
  getPageMetadata,
  validateCivicDataset,
} from "@/lib/data/iriga-data"
import { CitationBadge } from "@/components/civic/citation-badge"
import { Reveal } from "@/components/civic/reveal"

export const metadata: Metadata = getPageMetadata("about")

export default function AboutPage() {
  const snapshot = getCivicSnapshot()
  const brand = snapshot.siteContent.brand
  const pageCopy = snapshot.siteContent.pages.about
  const sources = snapshot.dataSources
  const profile = snapshot.cityProfile
  const validation = validateCivicDataset()

  return (
    <CivicPageContainer className="space-y-10 py-4">
      {/* Hero */}
      <Reveal>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-blue-50/70 via-card to-card p-4 sm:p-6 lg:p-8 dark:from-blue-950/25">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
            <ShieldCheck className="size-4" />
            <span>{pageCopy.eyebrow}</span>
          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {pageCopy.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {pageCopy.subtitle}
          </p>

          {/* Plain-Language Accuracy Status Strip */}
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-emerald-300/80 bg-emerald-50/80 p-4 text-xs text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/35 dark:text-emerald-200">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                Source Accuracy Check: {validation.totalRecords} Checked Public
                Records • {validation.errors.length} Unchecked Claims
              </span>
            </div>
            <span>•</span>
            <span>
              City Postal Code:{" "}
              <strong className="font-mono">{profile.geo.postalCode}</strong>
            </span>
            <span>•</span>
            <Link href="/verification" className="font-semibold underline">
              See Our Source Checklist →
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Section 1: Our 3 Core Promises in Plain Language */}
      <Reveal delayMs={60}>
        <section className="grid gap-5 md:grid-cols-3">
          <div className="civic-card-hover rounded-2xl border border-border bg-card p-6 shadow-2xs">
            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">
              Promise #1
            </span>
            <h2 className="mt-3 text-base font-bold text-foreground">
              Independent Community Guide
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              BetterIriga.org is a volunteer community project and not an
              official City Hall website. Every item links back to the official
              government page where the information was published.
            </p>
          </div>

          <div className="civic-card-hover rounded-2xl border border-border bg-card p-6 shadow-2xs">
            <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
              Promise #2
            </span>
            <h2 className="mt-3 text-base font-bold text-foreground">
              Carefully Organized & Double-Checked Records
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Every service, phone number, official name, budget figure, and
              ordinance is kept in one organized public directory and checked
              against its official document before it appears on any page.
            </p>
          </div>

          <div className="civic-card-hover rounded-2xl border border-border bg-card p-6 shadow-2xs">
            <span className="rounded-md bg-amber-600 px-2 py-0.5 text-[11px] font-bold text-white">
              Promise #3
            </span>
            <h2 className="mt-3 text-base font-bold text-foreground">
              We Never Guess or Make Up Facts
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              We never guess an official&apos;s name, peso amount, ordinance
              number, or phone number. If a record is not yet published online,
              we show it openly as{" "}
              <strong>&ldquo;Data not yet available&rdquo;</strong>.
            </p>
          </div>
        </section>
      </Reveal>

      {/* Section 2: Personal Privacy Protection Notice */}
      <Reveal delayMs={100}>
        <section className="rounded-2xl border border-rose-300/80 bg-rose-50/50 p-6 sm:p-8 dark:border-rose-900/60 dark:bg-rose-950/20">
          <div className="flex items-start gap-3">
            <Scale className="mt-1 size-5 shrink-0 text-rose-700 dark:text-rose-400" />
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                Respecting Personal Privacy (Why Individual National ID Records
                Are Never Shown)
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Under <strong>Republic Act No. 11055</strong> (the{" "}
                <em>Philippine Identification System Act</em>) and the{" "}
                <strong>Data Privacy Act of 2012 (RA 10173)</strong>, personal
                National ID registration records are strictly private and cannot
                be shared publicly. BetterIriga.org only publishes official
                city-wide population totals from the{" "}
                <strong>
                  Philippine Statistics Authority (PSA) 2024 & 2020 Census
                </strong>
                .
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Section 3: Official Data Sources */}
      <Reveal delayMs={140}>
        <section id="sources" className="scroll-mt-24 space-y-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-blue-700 uppercase dark:text-blue-400">
              <BookOpenCheck className="size-4" />
              Official Public Sources ({sources.length} Verified Agencies &
              Portals)
            </span>
            <h2 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
              Where BetterIriga.org Gets Its Public Information
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {sources.map((src) => (
              <article
                key={src.id}
                className="civic-card-hover flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold">
                      {src.format}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                      {src.accessType}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {src.name}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground">
                      Published by: {src.ownerAgency}
                    </p>
                  </div>

                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 underline dark:text-blue-400"
                  >
                    {src.url}
                    <ExternalLink className="size-3" />
                  </a>

                  <p className="text-xs leading-relaxed text-foreground/90">
                    {src.irigaCoverage}
                  </p>

                  <p className="rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
                    <strong>How we use it:</strong> {src.notes}
                  </p>
                </div>

                <div className="mt-4 pt-2">
                  <CitationBadge citation={src.citation} compact />
                </div>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Section 4: Friendly Community & Volunteer Guide */}
      <Reveal delayMs={180}>
        <section
          id="contribute"
          className="scroll-mt-24 grid gap-6 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:grid-cols-2"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-blue-700 uppercase dark:text-blue-400">
              <Send className="size-4" />
              Share an Official Update or Document
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Spotted an Outdated Phone Number or New City Ordinance?
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              BetterIriga.org stays accurate thanks to everyday Irigueños,
              barangay workers, teachers, students, and local business owners
              who share newly posted public documents.
            </p>
            <ol className="list-decimal space-y-1.5 pl-5 text-xs text-muted-foreground">
              <li>
                Take a clear photo or save the official link/PDF from City Hall,
                your Barangay Hall, or a national government agency.
              </li>
              <li>
                Email it to our volunteer team at{" "}
                <a
                  href={`mailto:${brand.volunteerEmail}`}
                  className="font-semibold text-blue-600 underline"
                >
                  {brand.volunteerEmail}
                </a>{" "}
                so we can verify the date and source.
              </li>
              <li>
                Once confirmed against the official document, we publish it with
                a source link for the whole city to use!
              </li>
            </ol>
          </div>

          <div className="flex flex-col justify-between space-y-4 rounded-2xl border border-blue-200/80 bg-blue-50/50 p-5 dark:border-blue-900/50 dark:bg-blue-950/25">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                <HeartHandshake className="size-4" />
                Join the BetterIriga Volunteer Community
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Built for Iriga at {brand.costToPeopleValue} Cost to Taxpayers
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Whether you can help gather public documents, write clear
                Rinconada or Bikol summaries, check office hotlines, or share a
                sticky note on our community Freedom Wall, your voice is welcome
                here.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <a
                href={`mailto:${brand.volunteerEmail}?subject=Volunteering%20for%20BetterIriga.org`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                <HeartHandshake className="size-3.5" />
                Email Volunteer Team
              </a>
              <Link
                href="/freedom-wall?compose=true"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-muted"
              >
                <MessageSquareHeart className="size-3.5 text-amber-600" />
                Post a Note on the Freedom Wall
              </Link>
              <Link
                href="/verification"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-muted"
              >
                See Our Source Checklist →
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </CivicPageContainer>
  )
}
