import Link from "next/link"
import {
  ExternalLink,
  ShieldCheck,
  Scale,
  HeartHandshake,
  FileText,
  MessageSquareHeart,
  Send,
  Globe,
} from "lucide-react"
import { FacebookLogo } from "@/components/civic/telecom-and-channel-icons"
import { BetterIrigaLogo } from "@/components/civic/better-iriga-logo"
import { getCivicSnapshot } from "@/lib/data/iriga-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function SiteFooter() {
  const snapshot = getCivicSnapshot()
  const brand = snapshot.siteContent.brand
  const navItems = snapshot.siteContent.navigation
  const siblingPortals = snapshot.siteContent.siblingPortals
  const primarySources = snapshot.dataSources.slice(0, 5)
  const officialWebsite =
    snapshot.officialChannels.find((c) => c.platform === "Official Website")
      ?.url ?? "https://iriga.gov.ph"

  return (
    <footer className="mt-16 border-t border-border bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand & Plain-Language Disclaimer */}
          <div className="flex flex-col gap-3">
            <div>
              <Link
                href="/"
                className="group inline-flex items-center gap-2"
                aria-label={`${brand.fullDomain} - Home`}
              >
                <BetterIrigaLogo
                  variant="horizontal"
                  forceTheme="dark"
                  alt={`${brand.fullDomain} Official Logo`}
                  className="h-12 sm:h-14 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
                />
              </Link>
              <div className="mt-1">
                <Badge
                  variant="outline"
                  className="border-blue-900/60 bg-blue-950/40 text-[11px] font-medium text-blue-300"
                >
                  {brand.regionBadge}
                </Badge>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              {brand.tagline}. Every service, official, budget figure, project,
              ordinance, and phone number is carefully checked and linked
              directly to an official government or BetterGov.ph public source.
            </p>

            <Card className="border-slate-800 bg-slate-900/90 text-slate-300 shadow-xs">
              <CardContent className="p-3 text-xs">
                <p className="font-semibold text-amber-400">
                  Independent Community Guide
                </p>
                <p className="mt-1 text-slate-400 leading-relaxed">
                  {brand.disclaimerBanner} For official City Hall transactions,
                  visit{" "}
                  <a
                    href={officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline hover:text-blue-300"
                  >
                    iriga.gov.ph
                  </a>
                  .
                </p>
              </CardContent>
            </Card>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 rounded-xl border-blue-900/60 bg-blue-950/40 text-blue-200 hover:bg-blue-900/60 hover:text-white"
            >
              <a
                href="https://www.facebook.com/irigacitygovt"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookLogo className="size-4 shrink-0" />
                <span className="truncate">Official Facebook: /irigacitygovt</span>
                <ExternalLink className="ml-auto size-3 text-blue-400 shrink-0" />
              </a>
            </Button>
          </div>

          {/* Column 2: Quick Links & Citizen's Charter */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold tracking-wider text-white uppercase">
              Quick Links
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition hover:text-white hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-lg border-slate-700 bg-slate-900 text-xs font-semibold text-blue-300 hover:border-blue-500 hover:text-white"
              >
                <a
                  href="https://iriga.gov.ph/wp-content/uploads/2022/08/CGO-IRIGA-CITIZENS-CHARTER-2022.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="size-3.5" />
                  Iriga Citizen&apos;s Charter (PDF)
                  <ExternalLink className="size-3" />
                </a>
              </Button>
            </div>
          </div>

          {/* Column 3: Official Sources & Civic Network (Enlisted Together) */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold tracking-wider text-white uppercase">
                Official Primary Sources
              </h3>
              <ul className="flex flex-col gap-1.5 text-xs">
                {primarySources.map((src) => (
                  <li key={src.id}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                    >
                      {src.name}
                      <ExternalLink className="size-3 shrink-0 text-slate-500" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="bg-slate-800/80" />

            <div className="flex flex-col gap-2">
              <div>
                <h3 className="text-xs font-semibold tracking-wider text-white uppercase flex items-center gap-1.5">
                  <Globe className="size-3.5 text-blue-400" />
                  Better LGU Civic Network
                </h3>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Sister portals under BetterGov.ph:
                </p>
              </div>
              <ul className="flex flex-col gap-1.5 text-xs">
                {siblingPortals.map((portal) => (
                  <li key={portal.name}>
                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-300 hover:text-white transition-colors"
                    >
                      {portal.name}
                      <ExternalLink className="size-3 shrink-0 text-blue-400/70" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 4: BetterSolano-style "Cost to the People of Iriga = ₱0" & Volunteer CTA */}
          <div className="flex flex-col gap-3">
            <Card
              role="status"
              aria-label={`${brand.costToPeopleLabel}: Zero Pesos`}
              className="rounded-2xl border-emerald-500/40 bg-gradient-to-br from-emerald-950/90 via-slate-900 to-blue-950/80 text-white shadow-md"
            >
              <CardContent className="p-4 text-xs">
                <p className="font-semibold tracking-wide text-slate-300 uppercase">
                  Community Transparency Pledge
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 text-sm font-bold text-white">
                  <span>{brand.costToPeopleLabel} =</span>
                  <Badge
                    variant="outline"
                    className="border-emerald-400/40 bg-emerald-500/20 font-mono text-base font-extrabold text-emerald-300 px-2.5 py-0.5"
                  >
                    {brand.costToPeopleValue}
                  </Badge>
                </div>
                <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                  100% volunteer-run public guide built for the people of Iriga
                  City, Camarines Sur.
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button
                asChild
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs"
              >
                <a
                  href={`mailto:${brand.volunteerEmail}?subject=Volunteering%20for%20BetterIriga.org`}
                >
                  <HeartHandshake className="size-4" />
                  Volunteer with us
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-xl border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:text-white"
              >
                <Link href="/freedom-wall?compose=true">
                  <MessageSquareHeart className="size-4 text-amber-400" />
                  Leave a Note on the Freedom Wall
                </Link>
              </Button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-emerald-500/40 bg-emerald-950/60 text-[11px] font-medium text-emerald-300 hover:bg-emerald-900/60 hover:text-emerald-200"
                >
                  <Link href="/verification">
                    <ShieldCheck className="size-3.5" />
                    Check Sources
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-blue-500/40 bg-blue-950/60 text-[11px] font-medium text-blue-300 hover:bg-blue-900/60 hover:text-blue-200"
                >
                  <Link href="/about#contribute">
                    <Send className="size-3.5" />
                    Share Update
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6">
          <Separator className="mb-6 bg-slate-800/80" />
          <div className="flex flex-col items-start justify-between gap-4 text-xs text-slate-400 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-white">
                &copy; 2026 {brand.fullDomain}
              </span>
              <Badge
                variant="outline"
                className="border-slate-800 bg-slate-900 text-[11px] font-medium text-slate-300"
              >
                Free Public Community Guide
              </Badge>
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-950/40 text-[11px] font-medium text-emerald-300 gap-1.5"
              >
                <ShieldCheck className="size-3.5" />
                100% Checked Against Official Sources
              </Badge>
              <Badge
                variant="outline"
                className="border-slate-800 bg-slate-900 text-[11px] font-medium text-slate-300 gap-1.5"
              >
                <Scale className="size-3.5 text-slate-400" />
                Respects Personal Privacy Laws
              </Badge>
            </div>
            <p>
              All public facts sourced from official government records •{" "}
              <Link href="/about#contribute" className="text-white underline hover:text-blue-300">
                Share an Official Document
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
