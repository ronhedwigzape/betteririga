import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ChevronRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  Banknote,
  Globe,
  HardHat,
  ExternalLink,
  ShieldCheck,
  Layers,
} from "lucide-react"
import {
  getProjectById,
  getAllProjectIds,
  formatPeso,
  getProjectsAndPrograms,
  getBetterGovRecords,
} from "@/lib/data/iriga-data"
import { CitationBadge } from "@/components/civic/citation-badge"
import { GapNotice } from "@/components/civic/gap-notice"
import { ProjectApiViewer } from "@/components/civic/project-api-viewer"
import { CivicPageContainer } from "@/components/civic/civic-page-container"
import { Reveal } from "@/components/civic/reveal"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return getAllProjectIds().map((id) => ({ id }))
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params
  const found = getProjectById(id)
  if (!found) {
    return {
      title: "Project Not Found | BetterIriga.org",
      description: "Tracked public works and social programs in Iriga City.",
    }
  }

  const { data } = found
  const summary =
    "summary" in data ? data.summary : (data.plainSummary ?? data.title)

  return {
    title: `${data.title} | Projects & Public Works | BetterIriga.org`,
    description: summary,
    openGraph: {
      title: `${data.title} | BetterIriga.org`,
      description: summary,
      type: "website",
    },
  }
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { id } = await params
  const record = getProjectById(id)

  if (!record) {
    notFound()
  }

  const isLgu = record.type === "lgu"
  const lguData = isLgu ? record.data : null
  const bgData = !isLgu ? record.data : null

  const title = record.data.title
  const category = record.data.category
  const status = record.data.status
  const location = record.data.location
  const duration = isLgu ? lguData?.period : bgData?.duration
  const summary = isLgu ? lguData?.summary : bgData?.plainSummary
  const citation = record.data.citation

  // Related projects in the same category or district
  const allLgu = getProjectsAndPrograms()
  const allBg = getBetterGovRecords()
  const related = [
    ...allLgu
      .filter((p) => p.id !== id && (p.category === category || isLgu))
      .slice(0, 2)
      .map((p) => ({
        id: p.id,
        title: p.title,
        amount:
          typeof p.amountPhp === "number"
            ? formatPeso(p.amountPhp)
            : p.amountNote,
        category: p.category,
        period: p.period,
      })),
    ...allBg
      .filter((p) => p.id !== id && !isLgu)
      .slice(0, 2)
      .map((p) => ({
        id: p.id,
        title: p.title,
        amount: p.amountDisplay,
        category: p.category,
        period: p.duration,
      })),
  ].slice(0, 3)

  return (
    <CivicPageContainer className="space-y-8 py-4">
      {/* Breadcrumb Navigation */}
      <Reveal>
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link
            href="/"
            className="transition hover:text-foreground hover:underline"
          >
            Home
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60" />
          <Link
            href="/projects"
            className="transition hover:text-foreground hover:underline"
          >
            Projects & Public Works
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60" />
          <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-md">
            {title}
          </span>
        </nav>
      </Reveal>

      {/* Main Project Hero Card using 100% shadcn UI */}
      <Reveal delayMs={50}>
        <Card className="rounded-3xl border-border bg-gradient-to-br from-card via-card to-muted/30 shadow-sm">
          <CardHeader className="gap-5 p-5 sm:p-8 pb-4">
            {/* Top Actions & Tags */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl shadow-2xs text-xs font-semibold"
              >
                <Link href="/projects">
                  <ArrowLeft className="size-3.5" />
                  <span>Back to Tracked Works</span>
                </Link>
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    "font-bold",
                    isLgu
                      ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                      : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                  )}
                >
                  {isLgu ? (
                    <span className="inline-flex items-center gap-1">
                      <HardHat className="size-3" />
                      City Hall Program • {category}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Globe className="size-3" />
                      BetterGov.ph • {category}
                    </span>
                  )}
                </Badge>

                {duration ? (
                  <Badge
                    variant="outline"
                    className="gap-1 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200 font-semibold"
                  >
                    <Calendar className="size-3 text-blue-600 dark:text-blue-400" />
                    <span>{duration}</span>
                  </Badge>
                ) : null}

                <Badge
                  variant="outline"
                  className={cn(
                    "font-bold",
                    status === "Completed" || status.includes("Completed")
                      ? "border-emerald-500/40 bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                      : status === "Ongoing" ||
                          status.includes("Ongoing") ||
                          status.includes("Awarded") ||
                          status.includes("Sync")
                        ? "border-amber-500/40 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                        : "border-purple-500/40 bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200"
                  )}
                >
                  {status}
                </Badge>
              </div>
            </div>

            {/* Project Title & Location */}
            <div className="space-y-3">
              <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {title}
              </CardTitle>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 shrink-0 text-blue-600" />
                  <span>
                    <strong>Location:</strong> {location}
                  </span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Building2 className="size-4 shrink-0 text-blue-600" />
                  <span>
                    <strong>Agency / Proponent:</strong>{" "}
                    {isLgu
                      ? lguData?.implementingAgency
                      : bgData?.contractorOrProponent}
                  </span>
                </div>
                {!isLgu && bgData?.district ? (
                  <>
                    <span>•</span>
                    <span>
                      <strong>District:</strong> {bgData.district}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-5 sm:p-8 pt-2">
            {/* High-Visibility Funding & Allocation Spotlight Card */}
            <Card className="rounded-2xl border-emerald-300 bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-background shadow-xs dark:border-emerald-800 dark:from-emerald-950/50 dark:via-emerald-950/20 dark:to-background">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Banknote className="size-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider dark:text-emerald-300">
                      {isLgu ? "Disclosed Project Budget" : "Monitored Public Allocation"}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 font-semibold"
                  >
                    {isLgu
                      ? lguData?.implementingAgency
                      : bgData?.fundingSource}
                  </Badge>
                </div>

                <div className="mt-3 text-3xl font-black font-mono tracking-tight text-emerald-700 dark:text-emerald-300 sm:text-4xl">
                  {isLgu
                    ? typeof lguData?.amountPhp === "number"
                      ? formatPeso(lguData.amountPhp)
                      : "₱0 Disclosed"
                    : bgData?.amountDisplay}
                </div>

                <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {isLgu
                    ? lguData?.amountNote
                    : `Funded under ${bgData?.fundingSource}. Implemented for Iriga City residents and tracked through official public records.`}
                </p>
              </CardContent>
            </Card>

            {/* Plain Language Summary */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                What This Project Is About
              </h2>
              <CardDescription className="text-sm leading-relaxed text-foreground sm:text-base">
                {summary}
              </CardDescription>
            </div>

            {/* Contract / Reference Details Card */}
            <Card className="rounded-2xl border-border/80 bg-muted/30 shadow-none">
              <CardContent className="grid gap-3 p-4 text-xs sm:grid-cols-2 sm:text-sm">
                <div>
                  <span className="text-muted-foreground">Record Identifier:</span>
                  <p className="font-mono font-semibold text-foreground">{id}</p>
                </div>
                {isLgu && lguData?.contractOrReferenceId ? (
                  <div>
                    <span className="text-muted-foreground">
                      Contract / Legislative Reference:
                    </span>
                    <p className="font-mono font-semibold text-foreground">
                      {lguData.contractOrReferenceId}
                    </p>
                  </div>
                ) : null}
                {isLgu && lguData?.contractor ? (
                  <div>
                    <span className="text-muted-foreground">Contractor Awarded:</span>
                    <p className="font-semibold text-foreground">
                      {lguData.contractor}
                    </p>
                  </div>
                ) : null}
                {duration ? (
                  <div>
                    <span className="text-muted-foreground">
                      Implementation Period:
                    </span>
                    <p className="font-semibold text-foreground">{duration}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Honest Gap Disclosure Notice */}
            {isLgu && lguData?.gaps ? (
              <GapNotice
                gaps={lguData.gaps}
                title="Official Contract Disclosures & Missing Details"
              />
            ) : null}
          </CardContent>

          {/* Direct Action Links in CardFooter */}
          <CardFooter className="flex flex-wrap items-center gap-3 border-t border-border p-5 sm:p-8 pt-4">
            <Button
              asChild
              className={cn(
                "rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-[0.99]",
                isLgu
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              <a
                href={citation.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" />
                <span>
                  {isLgu
                    ? "Open Official LGU / Agency Page ↗"
                    : "Open Official DPWH / BetterGov Portal ↗"}
                </span>
              </a>
            </Button>

            {citation.archiveUrl ? (
              <Button
                asChild
                variant="outline"
                className="rounded-xl text-xs font-semibold"
              >
                <a
                  href={citation.archiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>View Official Archive / Notice of Award ↗</span>
                </a>
              </Button>
            ) : null}

            <Button
              asChild
              variant="outline"
              className="rounded-xl text-xs font-semibold"
            >
              <Link href="/open-data">
                <Layers className="size-4 text-blue-600" />
                <span>Explore All Open APIs</span>
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </Reveal>

      {/* Dedicated Open Data & API Source Viewer */}
      <Reveal delayMs={100}>
        <section aria-labelledby="api-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 id="api-heading" className="text-base font-bold text-foreground">
                Official Provenance & Open API Source
              </h3>
              <p className="text-xs text-muted-foreground">
                Every record published on BetterIriga carries a primary source citation and retrieval date.
              </p>
            </div>
            <Link
              href="/open-data"
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Browse Open Data Directory →
            </Link>
          </div>

          <CitationBadge citation={citation} className="w-full p-4" />

          {/* Interactive JSON Inspector for Developers & Researchers */}
          <ProjectApiViewer
            data={record.data as unknown as Record<string, unknown>}
            apiEndpoint={
              !isLgu
                ? "https://budget.bettergov.ph/api/v1/hgab/2027/datasets/dpwh/projects?q=Iriga"
                : "/api/civic-data/projects"
            }
            sourceName={citation.sourceName}
          />
        </section>
      </Reveal>

      {/* Related Projects in Iriga City */}
      {related.length > 0 ? (
        <Reveal delayMs={150}>
          <section className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">
                Other Tracked Works in Iriga City
              </h3>
              <Link
                href="/projects"
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                View all 46 works →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/projects/${rel.id}`}
                  className="group rounded-2xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card className="civic-card-hover h-full flex flex-col justify-between rounded-2xl border-border bg-card shadow-2xs transition-colors group-hover:border-blue-500/50">
                    <CardHeader className="p-4 pb-2 space-y-2">
                      <Badge variant="secondary" className="w-fit text-[11px] font-semibold">
                        {rel.category}
                      </Badge>
                      <CardTitle className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {rel.title}
                      </CardTitle>
                    </CardHeader>
                    <CardFooter className="p-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {rel.amount}
                      </span>
                      <span className="text-muted-foreground">{rel.period}</span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      ) : null}
    </CivicPageContainer>
  )
}
