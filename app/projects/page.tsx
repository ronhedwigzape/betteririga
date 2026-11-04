import type { Metadata } from "next"
import { HardHat, CheckCircle2 } from "lucide-react"
import { getCivicSnapshot, getPageMetadata } from "@/lib/data/iriga-data"
import { ProjectsExplorer } from "@/components/civic/projects-explorer"
import { Reveal } from "@/components/civic/reveal"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = getPageMetadata("projects")

export default function ProjectsPage() {
  const snapshot = getCivicSnapshot()
  const pageCopy = snapshot.siteContent.pages.projects

  return (
    <div className="space-y-8 py-4">
      <Reveal>
        <Card className="rounded-3xl border border-border bg-gradient-to-br from-amber-50/70 via-card to-card p-5 sm:p-8 dark:from-amber-950/25">
          <CardHeader className="p-0 gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1.5 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold">
                <HardHat className="size-3.5" />
                <span>{pageCopy.eyebrow}</span>
              </Badge>
              <Badge variant="outline" className="gap-1 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-3" />
                <span>Verified via LGU Iriga & BetterGov.ph</span>
              </Badge>
            </div>

            <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {pageCopy.title}
            </CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {pageCopy.subtitle}
            </CardDescription>
          </CardHeader>
        </Card>
      </Reveal>

      <ProjectsExplorer
        projects={snapshot.projectsAndPrograms}
        betterGovRecords={snapshot.betterGovRecords}
      />
    </div>
  )
}
