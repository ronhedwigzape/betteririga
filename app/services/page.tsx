import type { Metadata } from "next"
import { getCivicSnapshot, getPageMetadata } from "@/lib/data/iriga-data"
import { ServicesDirectory } from "@/components/civic/services-directory"
import { Reveal } from "@/components/civic/reveal"

export const metadata: Metadata = getPageMetadata("services")

export default function ServicesPage() {
  const snapshot = getCivicSnapshot()
  const pageCopy = snapshot.siteContent.pages.services

  return (
    <div className="space-y-8 pb-10">
      <Reveal>
        <header className="rounded-3xl border border-border bg-gradient-to-br from-blue-50/80 via-background to-background p-4 sm:p-6 lg:p-8 shadow-2xs dark:from-blue-950/30">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold tracking-wide text-blue-900 uppercase dark:bg-blue-950 dark:text-blue-200">
            {pageCopy.eyebrow}
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {pageCopy.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {pageCopy.subtitle}
          </p>
        </header>
      </Reveal>

      <ServicesDirectory services={snapshot.services} />
    </div>
  )
}

