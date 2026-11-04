import Link from "next/link"
import { Sparkles, MessageSquareHeart } from "lucide-react"
import { getCivicSnapshot } from "@/lib/data/iriga-data"
import { cn } from "@/lib/utils"

/**
 * Homepage Freedom Wall CTA Section.
 * Lightweight Server Component so the homepage does not pull in the heavy
 * interactive drag/zoom canvas bundle.
 */
export function FreedomWallCtaSection() {
  const snapshot = getCivicSnapshot()
  const uiCopy = snapshot.freedomWall.uiCopy

  const sampleStickies = [
    {
      text: "Sana mas maliwanag ang streetlights sa daan papuntang paaralan 💛",
      color: "bg-yellow-100 border-yellow-300 text-yellow-900",
      rotate: "-rotate-3",
    },
    {
      text: "Proud to be Irigueño! Mabuhay ang Tinagba Festival 🎉",
      color: "bg-pink-100 border-pink-300 text-pink-900",
      rotate: "rotate-2",
    },
    {
      text: "Salamat sa mabilis na tulong ng emergency rescue team 🙏",
      color: "bg-blue-100 border-blue-300 text-blue-900",
      rotate: "rotate-1",
    },
    {
      text: "More trees and clean parks around Iriga City Plaza 🌱",
      color: "bg-green-100 border-green-300 text-green-900",
      rotate: "-rotate-2",
    },
  ]

  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-yellow-50/70 to-orange-50/80 p-6 shadow-xs sm:p-10 dark:border-amber-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20">
      <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="max-w-xl text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-100/90 px-3 py-1 text-xs font-bold tracking-wide text-amber-900 uppercase dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
            <Sparkles className="size-3.5" />
            {uiCopy.ctaSectionEyebrow}
          </span>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {uiCopy.ctaSectionTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {uiCopy.ctaSectionSubtitle}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              href="/freedom-wall?compose=true"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <MessageSquareHeart className="size-4" />
              {uiCopy.ctaPrimaryButtonLabel}
            </Link>
            <Link
              href="/freedom-wall"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground shadow-2xs transition-colors hover:border-blue-400 hover:text-blue-700"
            >
              {uiCopy.ctaSecondaryButtonLabel}
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {uiCopy.ctaTrustNote}
          </p>
        </div>

        {/* Decorative Sticky-Note Preview Cards */}
        <div
          aria-hidden="true"
          className="grid shrink-0 grid-cols-2 gap-3 sm:gap-4"
        >
          {sampleStickies.map((card, idx) => (
            <div
              key={idx}
              className={cn(
                "w-38 rounded-2xl border-2 p-3.5 text-xs leading-snug font-medium shadow-md sm:w-44",
                card.color,
                card.rotate
              )}
            >
              {card.text}
              <div className="mt-2 text-[10px] font-semibold opacity-45">
                {uiCopy.anonymousFooterLabel}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

