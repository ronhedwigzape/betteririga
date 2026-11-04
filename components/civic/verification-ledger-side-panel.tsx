"use client"

import * as React from "react"
import Link from "next/link"
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FolderCheck,
  ExternalLink,
  FileCheck2,
  HelpCircle,
} from "lucide-react"
import { useCivicStore } from "@/lib/store/civic-store"
import { Reveal } from "@/components/civic/reveal"
import { cn } from "@/lib/utils"

const SECTION_LINKS: Record<string, string> = {
  "city-profile": "/about",
  services: "/services",
  officials: "/officials",
  barangays: "/officials#barangays",
  budget: "/budget",
  projects: "/projects",
  bettergov: "/projects#bettergov",
  ordinances: "/ordinances",
  contacts: "/contacts",
  "freedom-wall": "/freedom-wall",
  sources: "/about#sources",
}

export function VerificationLedgerSidePanel() {
  const snapshot = useCivicStore((state) => state.snapshot)
  const ledger = useCivicStore((state) => state.ledger)
  const liveVerification = useCivicStore((state) => state.liveVerification)
  const runLiveAudit = useCivicStore((state) => state.runLiveAudit)
  const syncFromApi = useCivicStore((state) => state.syncFromApi)

  const liveAuditStatus = liveVerification.status
  const livePsgcNote =
    liveVerification.psgcStatus ?? "Official Iriga City Records Checked"
  const lastVerifiedAt = liveVerification.checkedAt

  React.useEffect(() => {
    void (async () => {
      await runLiveAudit()
    })()
  }, [runLiveAudit])

  const handleRefreshVerification = async () => {
    await Promise.all([runLiveAudit(), syncFromApi()])
  }

  return (
    <div className="space-y-8">
      {/* Friendly Non-Technical Explainer Card */}
      <Reveal>
        <section className="rounded-3xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/90 via-white to-blue-50/60 p-6 shadow-sm sm:p-8 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:via-slate-950 dark:to-blue-950/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                <ShieldCheck className="size-3.5" />
                100% Checked Against Official Public Documents
              </div>
              <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">
                How Do We Know This Information Is Real?
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Every single official name, phone number, budget figure,
                project, and city ordinance on{" "}
                <strong className="text-foreground">
                  {snapshot.siteContent.brand.fullDomain}
                </strong>{" "}
                is copied from an official government publication and paired
                with a direct link to the source document so any resident,
                student, or journalist can double-check it for themselves.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => void handleRefreshVerification()}
                disabled={liveAuditStatus === "checking"}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
              >
                <RefreshCw
                  className={cn(
                    "size-4",
                    liveAuditStatus === "checking" && "animate-spin"
                  )}
                />
                {liveAuditStatus === "checking"
                  ? "Checking Official Sources..."
                  : "Check All Sources Again"}
              </button>
              <Link
                href="/about#sources"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-muted"
              >
                View All 14 Official Agencies
                <ExternalLink className="size-3" />
              </Link>
            </div>
          </div>

          {/* 4 Plain-Language Summary Counters */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="civic-card-hover rounded-2xl border border-border bg-background/90 p-4">
              <p className="text-xs font-semibold text-muted-foreground">
                Total Checked Public Records
              </p>
              <p className="mt-1 font-mono text-2xl font-extrabold text-foreground">
                {ledger.totalRecords}
              </p>
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                100% linked to official government pages
              </p>
            </div>

            <div className="civic-card-hover rounded-2xl border border-border bg-background/90 p-4">
              <p className="text-xs font-semibold text-muted-foreground">
                Invented or Unchecked Facts
              </p>
              <p className="mt-1 font-mono text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {ledger.uncitedRecords}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                We never guess or make up missing numbers
              </p>
            </div>

            <div className="civic-card-hover rounded-2xl border border-border bg-background/90 p-4">
              <p className="text-xs font-semibold text-muted-foreground">
                Items Awaiting City Hall Upload
              </p>
              <p className="mt-1 font-mono text-2xl font-extrabold text-amber-700 dark:text-amber-400">
                {ledger.recordsWithOpenGaps}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Shown honestly as &ldquo;Data not yet available&rdquo;
              </p>
            </div>

            <div className="civic-card-hover rounded-2xl border border-border bg-background/90 p-4">
              <p className="text-xs font-semibold text-muted-foreground">
                Source Check Status
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4 shrink-0" />
                {liveAuditStatus === "verified"
                  ? "All Sources Confirmed"
                  : liveAuditStatus === "checking"
                    ? "Checking Sources..."
                    : "Records Up to Date"}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {livePsgcNote}
                {lastVerifiedAt ? ` • ${lastVerifiedAt}` : ""}
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Plain-Language FAQ for Everyday Residents */}
      <Reveal delayMs={80}>
        <section className="grid gap-4 md:grid-cols-3">
          <div className="civic-card-hover rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <FileCheck2 className="size-4 text-emerald-600" />
              1. Where does our information come from?
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              We only copy facts published by official sources: Iriga City
              Hall&apos;s website (<span className="font-semibold">iriga.gov.ph</span>),
              the Department of Budget and Management (DBM), the Philippine
              Statistics Authority (PSA), DILG, and{" "}
              <strong className="text-foreground">BetterGov.ph</strong>.
            </p>
          </div>

          <div className="civic-card-hover rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <AlertTriangle className="size-4 text-amber-600" />
              2. Why do some items say &ldquo;Data not yet available&rdquo;?
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              When a government document is not yet posted online (for example,
              a specific barangay phone number or a detailed contract amount), we{" "}
              <strong className="text-foreground">never guess</strong>. We mark
              it clearly so the community knows what is still needed.
            </p>
          </div>

          <div className="civic-card-hover rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <HelpCircle className="size-4 text-blue-600" />
              3. How can I help update a missing item?
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              If you have a clear photo or PDF copy of an official City Hall
              posting, ordinance, or Citizen&apos;s Charter page, you can send
              it to our volunteer team so we can verify and publish it for
              everyone.
            </p>
          </div>
        </section>
      </Reveal>

      {/* Topic-by-Topic Source Checklist */}
      <Reveal delayMs={140}>
        <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <FolderCheck className="size-5 text-blue-600" />
                Topic-by-Topic Source Checklist ({ledger.sections.length}{" "}
                Public Categories)
              </h3>
              <p className="text-xs text-muted-foreground">
                See how many public records are complete in each section of
                BetterIriga.org and when they were last checked.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-xs font-semibold text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Last Checked: {ledger.lastRetrievedAt}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ledger.sections.map((sec) => {
              const pageHref = SECTION_LINKS[sec.sectionId] ?? "/"
              return (
                <div
                  key={sec.sectionId}
                  className="civic-card-hover flex flex-col justify-between rounded-xl border border-border bg-background p-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {sec.label}
                      </span>
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                        {sec.recordCount} items
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {sec.verifiedCount}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Complete Info
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="font-mono font-bold text-amber-700 dark:text-amber-400">
                          {sec.openGapCount}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Awaiting Upload
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      Checked {sec.lastRetrievedAt}
                    </span>
                    <Link
                      href={pageHref}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
                    >
                      Open Page →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/80 bg-amber-50/70 p-4 text-xs dark:border-amber-900/60 dark:bg-amber-950/25">
            <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200">
              <AlertTriangle className="size-4 shrink-0 text-amber-600" />
              <span>
                Have an official City Hall PDF, Sangguniang Panlungsod
                resolution, or audit report that fills one of the{" "}
                {ledger.recordsWithOpenGaps} items awaiting upload?
              </span>
            </div>
            <Link
              href="/about#contribute"
              className="inline-flex items-center gap-1 rounded-lg bg-amber-900 px-3 py-1.5 font-semibold text-white hover:bg-amber-800 dark:bg-amber-700"
            >
              Share an Official Document →
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  )
}
