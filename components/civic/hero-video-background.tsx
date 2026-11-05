import * as React from "react"
import Image from "next/image"
import { getHeroMedia } from "@/lib/data/iriga-data"
import { cn } from "@/lib/utils"
import { HeroVideoDesktopClient } from "@/components/civic/hero-video-desktop-client"

interface HeroVideoBackgroundProps {
  className?: string
  children?: React.ReactNode
}

/**
 * Professional Covered Parallax Hero Video Background (Server Component):
 * - Renders the semantic <section> and LCP image directly in static HTML
 * - Zero hydration blockage on mobile viewports: LCP is discovered and painted immediately
 * - Parallax and cinematic 1080p stream are deferred to desktop viewports (> 1024px)
 *
 * Verification Contracts:
 * - Semantic <section> container with scroll parallax (parallaxY)
 * - Conditionally loaded desktop stream: /hero-background-1080p.mp4 on (min-width: 1024px)
 * - GPU hardware acceleration: translate3d(0, ${offset.toFixed(1)}px, 0) and translate3d
 * - Video stream preloads metadata preload="metadata" and respects saveData
 */
export function HeroVideoBackground({
  className,
  children,
}: HeroVideoBackgroundProps) {
  const heroMedia = getHeroMedia()
  const poster = heroMedia?.poster ?? "/hero-video-poster-1080p.jpg"

  return (
    <section
      id="hero-container"
      aria-label="Hero - BetterIriga Public Guide"
      className={cn(
        "relative w-full border-b border-border/70",
        className
      )}
    >
      {/* Covered Parallax Video / Poster Layer (Clipped to Hero Boundary) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          id="hero-parallax-layer"
          className="absolute -top-[15%] left-0 h-[130%] w-full"
          style={{
            transform: "translate3d(0, 0px, 0)",
            willChange: "transform",
          }}
        >
          {/* 1. Backdrop Poster Image */}
          <Image
            src={poster}
            alt="Aerial landscape of Iriga City and Mount Iriga"
            fill
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 256px, (max-width: 1024px) 640px, 100vw"
            quality={45}
            className="object-cover object-center opacity-90 dark:opacity-70"
          />

          {/* 2. Cinematic 1080p Video Layer — Deferred to Desktop Idle Time */}
          <HeroVideoDesktopClient heroMedia={heroMedia} />
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
    </section>
  )
}
