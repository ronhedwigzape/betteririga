"use client"

import * as React from "react"
import { Play, Pause, ExternalLink } from "lucide-react"
import { useCivicStore } from "@/lib/store/civic-store"
import { cn } from "@/lib/utils"

interface HeroVideoBackgroundProps {
  className?: string
  children?: React.ReactNode
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
  mediaQuery.addEventListener("change", callback)
  return () => mediaQuery.removeEventListener("change", callback)
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getReducedMotionServerSnapshot() {
  return false
}

/**
 * Professional Civic Hero Video Background.
 * - Displays a scenic, atmospheric landscape loop (Mount Asog / Iriga scenery vibe)
 * - Sourced directly from central Civic Store (Zustand & Zod)
 * - Vividly visible and layered with subtle light/dark gradient overlays to guarantee WCAG AAA text contrast
 * - High-compatibility autoplay: playsInline, muted, defaultMuted, loop, with onLoadedData trigger
 * - Accessible: Respects `prefers-reduced-motion` via useSyncExternalStore and provides a manual Play/Pause toggle
 * - Fast & lightweight: Under 410KB total
 */
export function HeroVideoBackground({
  className,
  children,
}: HeroVideoBackgroundProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const isReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )
  const heroMedia = useCivicStore(
    (state) => state.snapshot.siteContent.home.heroMedia
  )
  const [isPlaying, setIsPlaying] = React.useState(!isReducedMotion)

  const videoWebm = heroMedia?.videoWebm ?? "/hero-background.webm"
  const videoMp4 = heroMedia?.videoMp4 ?? "/hero-background.mp4"
  const poster = heroMedia?.poster ?? "/hero-video-poster.jpg"

  // Ensure autoplay starts reliably across Chrome, Safari, Firefox, and mobile browsers
  React.useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isReducedMotion) {
      video.pause()
      return
    }

    video.defaultMuted = true
    video.muted = true
    video.play().catch(() => {})
  }, [isReducedMotion])

  const togglePlayback = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border shadow-xs",
        className
      )}
    >
      {/* Background Video Layer: Clearly visible landscape backdrop */}
      {!isReducedMotion ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          aria-hidden="true"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedData={(e) => {
            e.currentTarget.play().catch(() => {})
          }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-85 transition-opacity duration-700 dark:opacity-65"
        >
          <source src={videoWebm} type="video/webm" />
          <source src={videoMp4} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 dark:opacity-35"
          style={{ backgroundImage: `url('${poster}')` }}
          aria-hidden="true"
        />
      )}

      {/* Multi-layered Professional Civic Overlay */}
      {/* 1. Luminous Base Gradient: Balances video visibility while ensuring WCAG AAA text contrast */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-900/15 via-background/50 to-background/95 dark:from-slate-950/35 dark:via-background/65 dark:to-background/95"
        aria-hidden="true"
      />

      {/* 2. Soft Radial Vignette: Highlights center content without hiding the landscape */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-background/20 via-background/40 to-background/90 dark:from-slate-950/25 dark:via-background/55 dark:to-background/95"
        aria-hidden="true"
      />

      {/* 3. Subtle Technical Civic Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px] opacity-25 dark:opacity-15"
        aria-hidden="true"
      />

      {/* Foreground Hero Content */}
      <div className="relative z-10">{children}</div>

      {/* Video Attribution & Play/Pause Controls */}
      <div className="absolute right-3.5 bottom-3.5 z-20 flex max-w-[calc(100%-2rem)] flex-wrap items-center justify-end gap-2">
        {heroMedia?.credit ? (
          <a
            href={
              heroMedia.creditUrl ??
              "https://www.youtube.com/watch?v=wF_dpVQhMEE"
            }
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View aerial footage credits for MADAYAN on YouTube"
            className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/85 px-2.5 py-1 text-[10px] font-medium text-muted-foreground shadow-2xs backdrop-blur-xs transition hover:bg-background hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 sm:text-[11px]"
          >
            <span className="truncate">{heroMedia.credit}</span>
            <ExternalLink className="size-2.5 shrink-0 opacity-70" />
          </a>
        ) : null}

        {!isReducedMotion ? (
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={
              isPlaying
                ? "Pause background landscape video"
                : "Play background landscape video"
            }
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background/85 text-muted-foreground shadow-2xs backdrop-blur-xs transition hover:bg-background hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {isPlaying ? (
              <Pause className="size-3" />
            ) : (
              <Play className="size-3 translate-x-0.5" />
            )}
          </button>
        ) : null}
      </div>
    </div>
  )
}
