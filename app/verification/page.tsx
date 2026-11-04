import type { Metadata } from "next"
import { ShieldCheck, CheckCircle2 } from "lucide-react"
import { VerificationLedgerSidePanel } from "@/components/civic/verification-ledger-side-panel"
import { getPageMetadata, getSiteContent } from "@/lib/data/iriga-data"
import { Reveal } from "@/components/civic/reveal"

export const metadata: Metadata = getPageMetadata("verification")

export default function VerificationPage() {
  const siteContent = getSiteContent()
  const pageCopy = siteContent.pages.verification

  return (
    <div className="space-y-8 py-4">
      <Reveal>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-emerald-50/70 via-card to-card p-4 sm:p-6 lg:p-8 dark:from-emerald-950/25">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="size-4" />
            <span>{pageCopy.eyebrow}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400">
              <CheckCircle2 className="size-3.5" />
              Official Source Checklist
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {pageCopy.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {pageCopy.subtitle}
          </p>
        </div>
      </Reveal>

      <VerificationLedgerSidePanel />
    </div>
  )
}
