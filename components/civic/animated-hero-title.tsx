"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"

interface AnimatedHeroTitleProps {
  highlight: string
  title: string
  pillars?: string[]
}

const DEFAULT_PILLARS = [
  "100% Traced to Official Primary Sources",
  "Zero Guesswork & Full Fiscal Transparency",
  "Citizen's Charter & Sangguniang Panlungsod Laws",
  "24/7 Hotlines & Community Freedom Wall",
]

/**
 * Professional Animated Hero Title Heading.
 * - Shimmering gradient animation on the brand highlight
 * - Generous bottom padding and margin under the highlight so font descenders (g, y, colon) are 100% visible
 * - Smooth rotating civic commitment badge
 * - High-contrast typography designed for maximum readability
 */
export function AnimatedHeroTitle({
  highlight,
  title,
  pillars: customPillars,
}: AnimatedHeroTitleProps) {
  const pillars = customPillars && customPillars.length > 0 ? customPillars : DEFAULT_PILLARS

  const [pillarIndex, setPillarIndex] = React.useState(0)
  const [fadeState, setFadeState] = React.useState<"in" | "out">("in")

  React.useEffect(() => {
    let interval: number | null = null
    let timeout: number | null = null

    const startAnimation = () => {
      interval = window.setInterval(() => {
        setFadeState("out")
        timeout = window.setTimeout(() => {
          setPillarIndex((prev) => (prev + 1) % pillars.length)
          setFadeState("in")
        }, 350)
      }, 7000)
    }

    const win =
      typeof window !== "undefined"
        ? (window as unknown as Window & {
            requestIdleCallback?: (
              cb: () => void,
              opts: { timeout: number }
            ) => number
            cancelIdleCallback?: (id: number) => void
          })
        : null

    const idleId =
      win && typeof win.requestIdleCallback === "function"
        ? win.requestIdleCallback(startAnimation, { timeout: 5000 })
        : setTimeout(startAnimation, 4500)

    return () => {
      if (interval) clearInterval(interval)
      if (timeout) clearTimeout(timeout)
      if (
        typeof idleId === "number" &&
        win &&
        typeof win.cancelIdleCallback === "function"
      ) {
        win.cancelIdleCallback(idleId)
      } else if (typeof idleId === "number") {
        clearTimeout(idleId)
      }
    }
  }, [pillars])

  return (
    <div className="space-y-3">
      {/* Dynamic Civic Commitment Pill */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-800 transition-all duration-300 dark:border-blue-400/25 dark:bg-blue-400/10 dark:text-blue-300">
          <Sparkles className="size-3 animate-civic-pulse text-blue-600 dark:text-blue-400" />
          <span
            className={`transition-opacity duration-300 ${
              fadeState === "in" ? "opacity-100" : "opacity-0"
            }`}
          >
            {pillars[pillarIndex]}
          </span>
        </div>
      </div>

      {/* Main Title Heading — Unified inline formatting context for instant text LCP */}
      <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.18] sm:leading-[1.22]">
        <span className="text-blue-700 dark:text-blue-400">
          {highlight}:
        </span>{" "}
        <br />
        <span className="text-foreground drop-shadow-xs">
          {title}
        </span>
      </h1>
    </div>
  )
}

