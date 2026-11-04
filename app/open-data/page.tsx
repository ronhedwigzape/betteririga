import type { Metadata } from "next"
import Link from "next/link"
import { Database, ArrowLeft, CheckCircle2 } from "lucide-react"
import { getCivicSnapshot, getBetterGovDatasets } from "@/lib/data/iriga-data"
import { OpenDataExplorer } from "@/components/civic/open-data-explorer"
import { BetterGovDatasetsExplorer } from "@/components/civic/bettergov-datasets-explorer"
import { Reveal } from "@/components/civic/reveal"

export const metadata: Metadata = {
  title: "Open Civic Data, BetterGov.ph APIs & Public Datasets | BetterIriga.org",
  description:
    "Explore 10 verified BetterGov.ph open datasets, PSGC geographic directory, budget APIs, and official REST endpoints powering BetterIriga.org.",
}

export default function OpenDataPage() {
  const snapshot = getCivicSnapshot()
  const betterGovDatasets = getBetterGovDatasets()
  const pageCopy = snapshot.siteContent.pages.openData ?? {
    eyebrow: "Public REST Endpoints & BetterGov.ph Civic APIs",
    title: "Open Civic Data Directory & Developer APIs",
    subtitle:
      "BetterIriga republishes 100% verified civic data as public REST endpoints, integrated with BetterGov.ph open datasets and the Philippine Standard Geographic Code (PSGC). Free for citizens, researchers, and developers.",
  }

  return (
    <div className="space-y-10 py-4">
      {/* Header Banner */}
      <Reveal>
        <div className="rounded-3xl border border-border bg-gradient-to-br from-blue-50/70 via-card to-card p-5 sm:p-8 dark:from-blue-950/25">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-800 dark:text-blue-300">
              <Database className="size-4" />
              <span>{pageCopy.eyebrow}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                Zero-Hallucination Verified Datasets
              </span>
            </div>

            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground shadow-2xs"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Tracked Works</span>
            </Link>
          </div>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {pageCopy.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {pageCopy.subtitle}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-xl border border-border/80 bg-background/80 p-3 shadow-2xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">
                BetterGov.ph Open Datasets
              </span>
              <div className="mt-1 text-xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                {betterGovDatasets.length} Datasets
              </div>
              <p className="text-[11px] text-muted-foreground">Elections, Geo, Tax, Works</p>
            </div>

            <div className="rounded-xl border border-border/80 bg-background/80 p-3 shadow-2xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">
                PSA PSGC Code
              </span>
              <div className="mt-1 text-xl font-black font-mono text-amber-700 dark:text-amber-400">
                0501716000
              </div>
              <p className="text-[11px] text-muted-foreground">36 Barangays mapped</p>
            </div>

            <div className="rounded-xl border border-border/80 bg-background/80 p-3 shadow-2xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">
                Civic REST Routes
              </span>
              <div className="mt-1 text-xl font-black font-mono text-blue-700 dark:text-blue-400">
                12 Routes
              </div>
              <p className="text-[11px] text-muted-foreground">JSON & OpenAPI</p>
            </div>

            <div className="rounded-xl border border-border/80 bg-background/80 p-3 shadow-2xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">
                Dataset Integrity
              </span>
              <div className="mt-1 text-xl font-black font-mono text-foreground truncate">
                SHA-256
              </div>
              <p className="text-[11px] text-muted-foreground">Cryptographic hash</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* BetterGov.ph Open Datasets Section */}
      <Reveal delayMs={30}>
        <BetterGovDatasetsExplorer datasets={betterGovDatasets} />
      </Reveal>

      {/* Interactive Open Data & API Explorer */}
      <Reveal delayMs={60}>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Public REST APIs & Civic Endpoints
            </h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Inspect raw JSON feeds and cURL commands for BetterGov.ph, PSGC, and BetterIriga endpoints.
            </p>
          </div>
          <OpenDataExplorer />
        </div>
      </Reveal>
    </div>
  )
}
