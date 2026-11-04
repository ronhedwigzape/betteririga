import { CivicPageContainer } from "@/components/civic/civic-page-container"
import type { Metadata } from "next"
import {
  Scale,
  Landmark,
  CheckCircle2,
  FileText,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  BookOpen,
} from "lucide-react"
import {
  getCivicSnapshot,
  getPageMetadata,
  getOrdinancesAndResolutions,
} from "@/lib/data/iriga-data"
import { OrdinancesArchive } from "@/components/civic/ordinances-archive"
import { CitationBadge } from "@/components/civic/citation-badge"
import { Reveal } from "@/components/civic/reveal"

export const metadata: Metadata = getPageMetadata("legislative")

export default function LegislativePage() {
  const snapshot = getCivicSnapshot()
  const pageCopy = snapshot.siteContent.pages.legislative ?? {
    eyebrow: "City Council & Local Legislation Guide",
    title: "Sangguniang Panlungsod & City Ordinances",
    subtitle:
      "Meet the presiding officer Vice Mayor Edsel Dimaiwat, elected city councilors, and browse verified local ordinances and resolutions with direct citations.",
  }

  const elected2025 = snapshot.electedOfficials.filter(
    (o) => o.term === "2025-2028"
  )
  const viceMayor = elected2025.find((o) => o.position.includes("Vice Mayor"))
  const councilors = elected2025.filter(
    (o) => o.roleCategory === "Legislative" && !o.position.includes("Vice Mayor")
  )
  const exOfficio = elected2025.filter(
    (o) => o.roleCategory === "Ex-Officio"
  )
  const spOffice = snapshot.offices.find((o) => o.id === "off-sp")
  const ordinances = getOrdinancesAndResolutions()

  return (
    <CivicPageContainer className="space-y-10 py-4">
      {/* Hero */}
      <Reveal>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-purple-50/70 via-card to-card p-4 sm:p-6 lg:p-8 dark:from-purple-950/25">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-purple-800 dark:text-purple-300">
            <Scale className="size-4" />
            <span>{pageCopy.eyebrow}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              100% Verified via Sangguniang Panlungsod & COMELEC
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {pageCopy.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {pageCopy.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 font-bold text-purple-900 dark:bg-purple-950 dark:text-purple-200">
              <Landmark className="size-3.5" />
              12 Council Members (1 Vice Mayor + 10 Regular + Ex-Officio)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-200">
              <BookOpen className="size-3.5" />
              {ordinances.length} Verified Ordinances & Resolutions Published
            </span>
          </div>
        </div>
      </Reveal>

      {/* Section 1: Presiding Officer & Legislative Council */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            1. The Legislative Council (Sangguniang Panlungsod)
          </h2>
          <p className="text-xs text-muted-foreground">
            The legislative body of Iriga City enacts local laws (ordinances) and
            official policy statements (resolutions) under Republic Act No. 7160
            (Local Government Code of 1991).
          </p>
        </div>

        {/* Presiding Officer Card */}
        {viceMayor ? (
          <div className="rounded-2xl border-2 border-purple-300/80 bg-gradient-to-br from-purple-50/80 via-card to-card p-5 shadow-sm dark:border-purple-900/60 dark:from-purple-950/30">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="inline-block rounded-full bg-purple-600 px-3 py-0.5 text-xs font-bold text-white">
                  Presiding Officer of the Sangguniang Panlungsod
                </span>
                <h3 className="mt-2 text-xl font-extrabold text-foreground">
                  {viceMayor.name}
                </h3>
                <p className="text-xs font-semibold text-purple-800 dark:text-purple-300">
                  {viceMayor.position} • Term: {viceMayor.term}
                </p>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                  {viceMayor.notes}
                </p>
              </div>
              <CitationBadge citation={viceMayor.citation} compact />
            </div>
          </div>
        ) : null}

        {/* 10 Elected Sangguniang Panlungsod Councilors Grid */}
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-muted-foreground">
            Elected City Councilors (Sangguniang Panlungsod Members 2025–2028)
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {councilors.map((c, idx) => (
              <div
                key={c.id}
                className="civic-card-hover flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-bold text-purple-700 dark:text-purple-400">
                      Councilor Rank #{idx + 1}
                    </span>
                    <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px]">
                      {c.term}
                    </span>
                  </div>
                  <h4 className="mt-1.5 text-sm font-bold text-foreground">
                    {c.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {c.position}
                  </p>
                </div>
                <div className="mt-3 border-t border-border/60 pt-2">
                  <CitationBadge citation={c.citation} compact />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ex-Officio Council Members */}
        {exOfficio.length > 0 ? (
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-muted-foreground">
              Ex-Officio Council Members
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {exOfficio.map((c) => (
                <div
                  key={c.id}
                  className="civic-card-hover flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-2xs"
                >
                  <div>
                    <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-200">
                      Ex-Officio Member
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-foreground">
                      {c.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{c.position}</p>
                  </div>
                  <div className="mt-3 border-t border-border/60 pt-2">
                    <CitationBadge citation={c.citation} compact />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Section 2: Citizen's Charter — How to Request Certified Copies */}
      <section className="rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50/50 via-card to-card p-5 sm:p-6 dark:border-purple-900/50 dark:from-purple-950/20">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white">
              <FileText className="size-3.5" />
              Citizen&apos;s Charter Service
            </span>
            <h3 className="text-lg font-bold text-foreground">
              How to Request Certified True Copies of Ordinances & Resolutions
            </h3>
            <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Any resident, student, or researcher can request certified copies of
              enacted legislation from the{" "}
              <strong>Office of the Secretary to the Sangguniang Panlungsod</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
              {spOffice?.landline ? (
                <a
                  href={`tel:${spOffice.landline.replace(/[^0-9+]/g, "")}`}
                  className="inline-flex items-center gap-1.5 font-mono font-semibold text-foreground hover:text-purple-600"
                >
                  <Phone className="size-3.5 text-purple-600" />
                  {spOffice.landline}
                </a>
              ) : null}
              {spOffice?.email ? (
                <a
                  href={`mailto:${spOffice.email}`}
                  className="inline-flex items-center gap-1.5 font-mono font-semibold text-foreground hover:text-purple-600"
                >
                  <Mail className="size-3.5 text-purple-600" />
                  {spOffice.email}
                </a>
              ) : null}
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-3.5 text-purple-600" />
                Sangguniang Panlungsod Building, City Hall Complex
              </span>
            </div>
          </div>

          <a
            href="https://iriga.gov.ph/wp-content/uploads/2022/08/CGO-IRIGA-CITIZENS-CHARTER-2022.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-purple-500"
          >
            <FileText className="size-4" />
            Download Citizen&apos;s Charter (PDF)
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </section>

      {/* Section 3: Below It — Enacted Ordinances & Resolutions Archive */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            2. Enacted Ordinances & Resolutions Archive
          </h2>
          <p className="text-xs text-muted-foreground">
            Search and filter verified local measures enacted by the Sangguniang
            Panlungsod of Iriga City. Tap any card to read plain-language summaries
            and download official copies.
          </p>
        </div>

        <OrdinancesArchive measures={ordinances} />
      </section>
    </CivicPageContainer>
  )
}
