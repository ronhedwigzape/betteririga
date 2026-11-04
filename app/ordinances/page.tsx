import type { Metadata } from "next"
import { Scale, CheckCircle2, FileText } from "lucide-react"
import { getPageMetadata, getSiteContent } from "@/lib/data/iriga-data"
import { OrdinancesArchive } from "@/components/civic/ordinances-archive"
import { Reveal } from "@/components/civic/reveal"

export const metadata: Metadata = getPageMetadata("ordinances")

export default function OrdinancesPage() {
  const pageCopy = getSiteContent().pages.ordinances

  return (
    <div className="space-y-8 py-4">
      <Reveal>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-purple-50/70 via-card to-card p-4 sm:p-6 lg:p-8 dark:from-purple-950/25">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-purple-800 dark:text-purple-300">
            <Scale className="size-4" />
            <span>{pageCopy.eyebrow}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              Verified via iriga.gov.ph & Sangguniang Panlungsod
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {pageCopy.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {pageCopy.subtitle}
          </p>

          {/* Citizen's Charter Legislative Request Info */}
          <div className="mt-5 rounded-xl border border-border bg-background/90 p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <FileText className="mt-0.5 size-4 shrink-0 text-purple-600" />
              <div>
                <p className="font-semibold text-foreground">
                  Need a Certified Copy of an Ordinance or Resolution?
                </p>
                <p className="mt-1 text-muted-foreground">
                  Under Iriga City&apos;s Citizen&apos;s Charter, any resident
                  can request official copies from the{" "}
                  <strong>
                    Office of the Secretary to the Sangguniang Panlungsod
                  </strong>{" "}
                  by calling <code>(054) 299 9924</code> or emailing{" "}
                  <a
                    href="mailto:spiriga@yahoo.com"
                    className="font-medium text-blue-600 underline"
                  >
                    spiriga@yahoo.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <OrdinancesArchive />
    </div>
  )
}
