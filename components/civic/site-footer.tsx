import Image from "next/image"
import Link from "next/link"
import {
  ExternalLink,
  ShieldCheck,
  Scale,
  HeartHandshake,
  FileText,
  MessageSquareHeart,
  Send,
} from "lucide-react"
import { FacebookLogo } from "@/components/civic/telecom-and-channel-icons"
import { getCivicSnapshot } from "@/lib/data/iriga-data"

export function SiteFooter() {
  const snapshot = getCivicSnapshot()
  const brand = snapshot.siteContent.brand
  const navItems = snapshot.siteContent.navigation
  const siblingPortals = snapshot.siteContent.siblingPortals
  const primarySources = snapshot.dataSources.slice(0, 6)
  const officialWebsite =
    snapshot.officialChannels.find((c) => c.platform === "Official Website")
      ?.url ?? "https://iriga.gov.ph"

  return (
    <footer className="mt-16 border-t border-border bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand & Plain-Language Disclaimer */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Image
                src="/BetterIriga-White-Foreground-Transparent.png"
                alt={`${brand.fullDomain} Logo`}
                width={44}
                height={44}
                className="size-11 shrink-0 object-contain"
              />
              <div>
                <span className="text-lg font-bold text-white">
                  {brand.fullDomain}
                </span>
                <p className="text-[11px] text-blue-300">{brand.regionBadge}</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              {brand.tagline}. Every service, official, budget figure, project,
              ordinance, and phone number is carefully checked and linked
              directly to an official government or BetterGov.ph public source.
            </p>
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-xs text-slate-300">
              <p className="font-semibold text-amber-400">
                Independent Community Guide
              </p>
              <p className="mt-1 text-slate-400">
                {brand.disclaimerBanner} For official City Hall transactions,
                visit{" "}
                <a
                  href={officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline"
                >
                  iriga.gov.ph
                </a>
                .
              </p>
            </div>
            <a
              href="https://www.facebook.com/irigacitygovt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-900/60 bg-blue-950/40 px-3 py-2 text-xs font-semibold text-blue-200 transition hover:bg-blue-900/60 hover:text-white"
            >
              <FacebookLogo className="size-4" />
              Official City Facebook: /irigacitygovt
              <ExternalLink className="ml-auto size-3 text-blue-400" />
            </a>
          </div>

          {/* Column 2: Quick Links & Citizen's Charter */}
          <div className="space-y-3">
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
              <a
                href="https://iriga.gov.ph/wp-content/uploads/2022/08/CGO-IRIGA-CITIZENS-CHARTER-2022.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-blue-300 transition hover:border-blue-500 hover:text-white"
              >
                <FileText className="size-3.5" />
                Iriga Citizen&apos;s Charter (PDF)
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>

          {/* Column 3: Official Primary Sources & BetterGov Network */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-white uppercase">
              Official Sources & Civic Network
            </h3>
            <ul className="space-y-1.5 text-xs">
              {primarySources.slice(0, 4).map((src) => (
                <li key={src.id}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-white"
                  >
                    {src.name}
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                </li>
              ))}
              {siblingPortals.slice(0, 4).map((portal) => (
                <li key={portal.name}>
                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-300 hover:text-white"
                  >
                    {portal.name}
                    <ExternalLink className="size-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: BetterSolano-style "Cost to the People of Iriga = ₱0" & Volunteer CTA */}
          <div className="space-y-3">
            <div
              role="status"
              aria-label={`${brand.costToPeopleLabel}: Zero Pesos`}
              className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/90 via-slate-900 to-blue-950/80 p-4 shadow-md"
            >
              <p className="text-xs font-semibold tracking-wide text-slate-300 uppercase">
                Community Transparency Pledge
              </p>
              <p className="mt-1.5 text-sm font-bold text-white">
                {brand.costToPeopleLabel} ={" "}
                <span className="inline-block rounded-lg bg-emerald-500/20 px-2.5 py-0.5 font-mono text-lg font-extrabold text-emerald-300">
                  {brand.costToPeopleValue}
                </span>
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                100% volunteer-run public guide built for the people of Iriga
                City, Camarines Sur.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={`mailto:${brand.volunteerEmail}?subject=Volunteering%20for%20BetterIriga.org`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-500"
              >
                <HeartHandshake className="size-4" />
                Volunteer with us
              </a>

              <Link
                href="/freedom-wall?compose=true"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                <MessageSquareHeart className="size-4 text-amber-400" />
                Leave a Note on the Freedom Wall
              </Link>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/verification"
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-1.5 text-[11px] font-medium text-emerald-300 hover:bg-emerald-900/60"
                >
                  <ShieldCheck className="size-3.5" />
                  Check Our Sources
                </Link>
                <Link
                  href="/about#contribute"
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-blue-500/40 bg-blue-950/60 px-2.5 py-1.5 text-[11px] font-medium text-blue-300 hover:bg-blue-900/60"
                >
                  <Send className="size-3.5" />
                  Share an Update
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-white">
              &copy; 2026 {brand.fullDomain}
            </span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
              Free Public Community Guide
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="size-4" />
              100% Checked Against Official Sources
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Scale className="size-4 text-slate-400" />
              Respects Personal Privacy Laws
            </span>
          </div>
          <p>
            All public facts sourced from official government records •{" "}
            <Link href="/about#contribute" className="text-white underline">
              Share an Official Document
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
