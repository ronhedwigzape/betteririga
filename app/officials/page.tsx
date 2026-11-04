import type { Metadata } from "next"
import { Landmark, CheckCircle2 } from "lucide-react"
import { getPageMetadata, getSiteContent } from "@/lib/data/iriga-data"
import { OfficialsDirectory } from "@/components/civic/officials-directory"
import { Reveal } from "@/components/civic/reveal"

export const metadata: Metadata = getPageMetadata("officials")

export default function OfficialsPage() {
  const pageCopy = getSiteContent().pages.officials

  return (
    <div className="space-y-8 py-4">
      <Reveal>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-blue-50/70 via-card to-card p-4 sm:p-6 lg:p-8 dark:from-blue-950/30">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
            <Landmark className="size-4" />
            <span>{pageCopy.eyebrow}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              Verified against LGU Iriga & COMELEC 2025 Records
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

      <OfficialsDirectory />
    </div>
  )
}
