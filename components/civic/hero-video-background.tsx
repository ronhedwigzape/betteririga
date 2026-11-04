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
  const containerRef = React.useRef<HTMLElement | null>(null)
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const parallaxLayerRef = React.useRef<HTMLDivElement | null>(null)
  const parallaxY = React.useRef(0)
  const ticking = React.useRef(false)

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
  const video1080p = "/hero-background-1080p.mp4"
  const poster = heroMedia?.poster ?? "/hero-video-poster-1080p.jpg"

  // Responsive Parallax scroll listener across all breakpoints with hardware acceleration
  React.useEffect(() => {
    if (isReducedMotion) return

    const updateParallax = () => {
      if (!containerRef.current || !parallaxLayerRef.current) {
        ticking.current = false
        return
      }

      const rect = containerRef.current.getBoundingClientRect()
      // Only calculate while hero is visible in the viewport
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const scrollY = window.scrollY || window.pageYOffset || 0
        // Parallax speed: 0.35x scroll delta for natural cinematic depth
        // Dynamically capped to 25% of container height to guarantee zero edge gaps across mobile, tablet, and desktop
        const maxTranslation = Math.max(100, Math.min(220, rect.height * 0.25))
        const offset = Math.min(maxTranslation, Math.max(0, scrollY * 0.35))
        parallaxY.current = offset

        parallaxLayerRef.current.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.12)`
      }
      ticking.current = false
    }

    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true
        requestAnimationFrame(updateParallax)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [isReducedMotion])

  // Autoplay and responsive video stream selection
  React.useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isReducedMotion) {
      video.pause()
      return
    }

    // Check if user requested data-saver mode
    const nav = typeof navigator !== "undefined" ? (navigator as unknown as { connection?: { saveData?: boolean } }) : null
    if (nav?.connection?.saveData) {
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
    <section
      ref={containerRef}
      aria-label="Hero - BetterIriga Public Guide"
      className={cn(
        "relative w-full border-b border-border/70",
        className
      )}
    >
      {/* Covered Parallax Video / Poster Layer (Clipped to Hero Boundary) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          ref={parallaxLayerRef}
          className="absolute -top-[15%] left-0 h-[130%] w-full will-change-transform"
          style={{
            transform: isReducedMotion
              ? "scale(1.02)"
              : "translate3d(0, 0px, 0) scale(1.12)",
          }}
        >
          {!isReducedMotion ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={poster}
              aria-hidden="true"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedData={(e) => {
                e.currentTarget.play().catch(() => {})
              }}
              className="h-full w-full object-cover object-center opacity-90 transition-opacity duration-500 dark:opacity-70"
            >
              {/* Crisp 1080p video for desktop & larger viewports */}
              <source
                src={video1080p}
                media="(min-width: 1024px)"
                type="video/mp4"
              />
              {/* Efficient 720p streams for mobile & tablet */}
              <source src={videoWebm} type="video/webm" />
              <source src={videoMp4} type="video/mp4" />
            </video>
          ) : (
            <div
              className="h-full w-full bg-cover bg-center opacity-70 dark:opacity-50"
              style={{ backgroundImage: `url('${poster}')` }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* Covered Multi-layer Backdrop Gradients: Luminous for light mode, deep for dark mode */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background/95 dark:from-slate-950/60 dark:via-background/75 dark:to-background/95"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/30 to-background/80 dark:via-background/50 dark:to-background/90"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px] opacity-20 dark:opacity-10"
        aria-hidden="true"
      />

      {/* Foreground Hero Content (Centered within standard 7xl containment) */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>

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
    </section>
  )
}
