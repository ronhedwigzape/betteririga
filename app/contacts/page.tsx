import { CivicPageContainer } from "@/components/civic/civic-page-container"
import type { Metadata } from "next"
import {
  PhoneCall,
  Globe,
  ExternalLink,
  CheckCircle2,
  MapPin,
  AlertTriangle,
  Building2,
  HeartPulse,
  Users,
  Shield,
} from "lucide-react"
import { getCivicSnapshot, getPageMetadata } from "@/lib/data/iriga-data"
import { ContactsDirectory } from "@/components/civic/contacts-directory"
import { CitationBadge } from "@/components/civic/citation-badge"
import {
  CarrierBadge,
  FacebookLogo,
} from "@/components/civic/telecom-and-channel-icons"
import { Reveal } from "@/components/civic/reveal"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

export const metadata: Metadata = getPageMetadata("contacts")

function getHotlineDepartmentBadge(id: string) {
  if (id.includes("cdrrmo")) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-amber-300 bg-amber-50 text-amber-900 text-[10px] font-semibold dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
      >
        <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
        Rescue & Flood
      </Badge>
    )
  }
  if (id.includes("mayor")) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-blue-300 bg-blue-50 text-blue-900 text-[10px] font-semibold dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200"
      >
        <Building2 className="size-3 text-blue-600 dark:text-blue-400" />
        Mayor&apos;s Office
      </Badge>
    )
  }
  if (id.includes("cho")) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-rose-300 bg-rose-50 text-rose-900 text-[10px] font-semibold dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
      >
        <HeartPulse className="size-3 text-rose-600 dark:text-rose-400" />
        Health & Medical
      </Badge>
    )
  }
  if (id.includes("cswdo")) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-purple-300 bg-purple-50 text-purple-900 text-[10px] font-semibold dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-200"
      >
        <Users className="size-3 text-purple-600 dark:text-purple-400" />
        Social Welfare
      </Badge>
    )
  }
  if (id.includes("csu")) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-indigo-300 bg-indigo-50 text-indigo-900 text-[10px] font-semibold dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200"
      >
        <Shield className="size-3 text-indigo-600 dark:text-indigo-400" />
        Civil Security
      </Badge>
    )
  }
  if (id.includes("911")) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-emerald-300 bg-emerald-50 text-emerald-900 text-[10px] font-semibold dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
      >
        <PhoneCall className="size-3 text-emerald-600 dark:text-emerald-400" />
        National 911
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="border-slate-300 bg-slate-50 text-slate-800 text-[10px] font-semibold dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
      Official Hotline
    </Badge>
  )
}

export default function ContactsPage() {
  const snapshot = getCivicSnapshot()
  const pageCopy = snapshot.siteContent.pages.contacts
  const hotlines = snapshot.emergencyHotlines
  const channels = snapshot.officialChannels
  const profile = snapshot.cityProfile

  return (
    <CivicPageContainer className="space-y-10 py-4">
      {/* Hero */}
      <Reveal>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-rose-50/70 via-card to-card p-4 sm:p-6 lg:p-8 dark:from-rose-950/25">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400">
            <PhoneCall className="size-4" />
            <span>{pageCopy.eyebrow}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              Verified via iriga.gov.ph/contact-us-2/
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {pageCopy.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {pageCopy.subtitle}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium">
            <MapPin className="size-3.5 text-rose-600" />
            <span>
              <strong>Iriga City Hall Address:</strong>{" "}
              {profile.cityHallAddress}
            </span>
          </p>
        </div>
      </Reveal>

      {/* Section 1: 24/7 Emergency Hotlines */}
      <Reveal delayMs={60}>
        <section id="hotlines" className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              1. 24/7 Emergency & Rescue Hotlines
            </h2>
            <p className="text-xs text-muted-foreground">
              Tap any number to call right away on your phone. The Iriga City
              CDRRMO Command Center coordinates ambulance, rescue, police, and
              fire assistance.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotlines.map((hotline) => (
              <Tooltip key={hotline.id}>
                <TooltipTrigger asChild>
                  <Card className="civic-card-hover flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs hover:border-blue-500 transition-colors cursor-pointer">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <CarrierBadge
                          number={hotline.number}
                          networkOrType={hotline.networkOrType}
                        />
                        <span className="shrink-0">
                          {getHotlineDepartmentBadge(hotline.id)}
                        </span>
                      </div>

                      <h3 className="mt-2.5 text-sm font-semibold text-muted-foreground">
                        {hotline.label}
                      </h3>
                      <a
                        href={hotline.telHref}
                        className="mt-1 block font-mono text-2xl font-extrabold text-foreground hover:text-blue-600 hover:underline transition-colors"
                      >
                        {hotline.number}
                      </a>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {hotline.agency}
                      </p>
                    </div>

                    <div className="mt-4 pt-2">
                      <CitationBadge citation={hotline.citation} compact />
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-xs">
                  <p className="font-bold text-foreground">{hotline.label} — {hotline.agency}</p>
                  <p className="text-muted-foreground font-mono">{hotline.number} • {hotline.networkOrType}</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Click / Tap to dial immediately</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Section 2: Official Digital & Social Media Channels */}
      <Reveal delayMs={100}>
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              2. Official City Website & Social Media Pages
            </h2>
            <p className="text-xs text-muted-foreground">
              Follow these verified pages for official announcements from the
              City Government of Iriga and BetterGov.ph.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {channels.map((channel) => (
              <Card
                key={channel.id}
                className="civic-card-hover flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs"
              >
                <div className="space-y-2">
                  {channel.platform === "Facebook Page" ? (
                    <Badge variant="secondary" className="gap-1.5 bg-blue-100/90 text-blue-900 dark:bg-blue-950 dark:text-blue-200 font-bold">
                      <FacebookLogo className="size-3.5" />
                      Facebook Page
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1.5 font-semibold text-blue-800 dark:text-blue-200">
                      <Globe className="size-3.5" />
                      {channel.platform}
                    </Badge>
                  )}
                  <h3 className="text-base font-bold text-foreground">
                    {channel.name}
                  </h3>
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-blue-600 underline dark:text-blue-400"
                  >
                    {channel.url}
                    <ExternalLink className="size-3" />
                  </a>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {channel.verifiedNote}
                  </p>
                </div>
                <div className="mt-4 pt-2">
                  <CitationBadge citation={channel.citation} compact />
                </div>
              </Card>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Section 3: All 29 City Hall Offices Directory */}
      <Reveal delayMs={140}>
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              3. Phone & Email Directory for All 29 City Hall Offices
            </h2>
            <p className="text-xs text-muted-foreground">
              Verified from <code>https://iriga.gov.ph/contact-us-2/</code>.
              Where an office phone or email was left blank on City Hall&apos;s
              official directory, we show{" "}
              <strong>&ldquo;Data not yet available&rdquo;</strong>.
            </p>
          </div>

          <ContactsDirectory />
        </section>
      </Reveal>
    </CivicPageContainer>
  )
}
