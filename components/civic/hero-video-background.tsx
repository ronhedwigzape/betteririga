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
 * Professional Covered Parallax Hero Video Background:
 * - Full covered background with smooth scroll-based parallax translation
 * - Sourced directly from central Civic Store (Zustand & Zod)
 * - Layered with subtle light/dark gradient overlays to guarantee WCAG AAA text contrast
 * - High-compatibility autoplay: playsInline, muted, defaultMuted, loop
 * - Respects `prefers-reduced-motion` and includes Play/Pause controls
 */
export function HeroVideoBackground({
  className,
  children,
}: HeroVideoBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const [parallaxY, setParallaxY] = React.useState(0)

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

  // Covered Parallax scroll listener
  React.useEffect(() => {
    if (isReducedMotion) return

    let rafId: number
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      // Only compute when hero is visible in viewport
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        // Parallax speed: 0.3x scroll delta
        const offset = Math.max(-60, Math.min(120, -rect.top * 0.32))
        setParallaxY(offset)
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(handleScroll)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [isReducedMotion])

  // Autoplay handler
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
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/60 shadow-lg",
        className
      )}
    >
      {/* Covered Parallax Video / Poster Layer */}
      <div
        className="pointer-events-none absolute -top-[15%] left-0 h-[135%] w-full will-change-transform"
        style={{
          transform: isReducedMotion
            ? "scale(1.05)"
            : `translate3d(0, ${parallaxY}px, 0) scale(1.08)`,
          transition: "transform 0.08s ease-out",
        }}
      >
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
            className="h-full w-full object-cover object-center opacity-85 transition-opacity duration-700 dark:opacity-60"
          >
            <source src={videoWebm} type="video/webm" />
            <source src={videoMp4} type="video/mp4" />
          </video>
        ) : (
          <div
            className="h-full w-full bg-cover bg-center opacity-60 dark:opacity-40"
            style={{ backgroundImage: `url('${poster}')` }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Covered Multi-layer Backdrop Gradients: Luminous for light mode, deep for dark mode */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background/98 dark:from-slate-950/75 dark:via-background/85 dark:to-background/98"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/40 to-background/90 dark:via-background/60 dark:to-background/95"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px] opacity-25 dark:opacity-15"
        aria-hidden="true"
      />

      {/* Foreground Hero Content */}
      <div className="relative z-10">{children}</div>

      {/* Video Attribution & Controls */}
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
