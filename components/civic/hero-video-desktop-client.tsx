"use client"

import * as React from "react"
import { Play, Pause, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HeroMedia } from "@/lib/data/schemas"

interface HeroVideoDesktopClientProps {
  heroMedia?: HeroMedia
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
 * Desktop-only interactive video player & parallax controller.
 * Slices client bundle by mounting zero listeners on mobile (< 1024px).
 */
export function HeroVideoDesktopClient({
  heroMedia,
}: HeroVideoDesktopClientProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const isReducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )
  const [isPlaying, setIsPlaying] = React.useState(!isReducedMotion)
  const [canLoadVideo, setCanLoadVideo] = React.useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = React.useState(false)

  const video1080p = "/hero-background-1080p.mp4"

  // Responsive Parallax scroll listener for desktop viewports
  React.useEffect(() => {
    if (isReducedMotion) return
    if (typeof window === "undefined" || !window.matchMedia("(min-width: 1024px)").matches) return

    const container = document.getElementById("hero-container")
    const layer = document.getElementById("hero-parallax-layer")
    if (!container || !layer) return

    let ticking = false

    const updateParallax = () => {
      const rect = container.getBoundingClientRect()
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const scrollY = window.scrollY || window.pageYOffset || 0
        const maxTranslation = Math.max(100, Math.min(220, rect.height * 0.25))
        const offset = Math.min(maxTranslation, Math.max(0, scrollY * 0.35))
        layer.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.12)`
      }
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        ticking = true
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

  // Defer heavy 1080p video stream to desktop idle time
  React.useEffect(() => {
    if (isReducedMotion) return
    if (typeof window === "undefined") return

    // On mobile devices (< 1024px) or when data-saver is on, keep the fast optimized poster image
    if (window.innerWidth < 1024) return

    const nav = typeof navigator !== "undefined" ? (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }) : null
    if (nav?.connection?.saveData || nav?.connection?.effectiveType === "2g" || nav?.connection?.effectiveType === "slow-2g") {
      return
    }

    let timer: ReturnType<typeof setTimeout> | null = null
    let idleId: number | null = null

    if ("requestIdleCallback" in window) {
      idleId = (window as unknown as { requestIdleCallback: (cb: () => void, opts: { timeout: number }) => number }).requestIdleCallback(
        () => setCanLoadVideo(true),
        { timeout: 2500 }
      )
    } else {
      timer = setTimeout(() => setCanLoadVideo(true), 1500)
    }

    return () => {
      if (idleId !== null && "cancelIdleCallback" in window) {
        (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId)
      }
      if (timer) clearTimeout(timer)
    }
  }, [isReducedMotion])

  // Autoplay management once video is loaded
  React.useEffect(() => {
    const video = videoRef.current
    if (!video || !canLoadVideo) return

    if (isReducedMotion) {
      video.pause()
      return
    }

    video.defaultMuted = true
    video.muted = true
    video.play().catch(() => {})
  }, [isReducedMotion, canLoadVideo])

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
    <>
      {/* 2. Cinematic 1080p Video Layer — Deferred to Desktop Idle Time */}
      {canLoadVideo && !isReducedMotion ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedData={() => setIsVideoLoaded(true)}
          className={cn(
            "h-full w-full object-cover object-center transition-opacity duration-1000",
            isVideoLoaded ? "opacity-90 dark:opacity-70" : "opacity-0"
          )}
        >
          <source src={video1080p} type="video/mp4" />
        </video>
      ) : null}

      {/* Video Attribution & Controls — Desktop Viewports (>= 1024px) */}
      <div className="pointer-events-auto absolute right-3.5 bottom-3.5 z-20 hidden lg:flex max-w-[calc(100%-2rem)] flex-wrap items-center justify-end gap-2">
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

        {!isReducedMotion && canLoadVideo ? (
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
    </>
  )
}
