import { CivicPageContainer } from "@/components/civic/civic-page-container"
import type { Metadata } from "next"
import { getCivicSnapshot, getPageMetadata } from "@/lib/data/iriga-data"
import { FreedomWallBoard } from "@/components/civic/freedom-wall-board"
import { Reveal } from "@/components/civic/reveal"

export const metadata: Metadata = getPageMetadata("freedomWall")

export default function FreedomWallPage() {
  const snapshot = getCivicSnapshot()
  const pageCopy = snapshot.siteContent.pages.freedomWall

  return (
    <CivicPageContainer className="space-y-6 pb-10">
      <Reveal>
        <header className="rounded-3xl border border-border bg-gradient-to-br from-blue-50/80 via-background to-amber-50/30 p-4 sm:p-6 lg:p-8 shadow-2xs dark:from-blue-950/30 dark:to-amber-950/15">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold tracking-wide text-blue-900 uppercase dark:bg-blue-950 dark:text-blue-200">
            {pageCopy.eyebrow}
          </span>
          <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {pageCopy.title}
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {pageCopy.subtitle}
          </p>
        </header>
      </Reveal>

      <Reveal delayMs={40}>
        <FreedomWallBoard />
      </Reveal>
    </CivicPageContainer>
  )
}
