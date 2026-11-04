"use client"

import * as React from "react"
import Image from "next/image"
import { useCivicStore } from "@/lib/store/civic-store"
import { cn } from "@/lib/utils"

export interface BetterIrigaLogoProps {
  variant?: "horizontal" | "emblem"
  forceTheme?: "light" | "dark"
  size?: number
  width?: number
  height?: number
  className?: string
  priority?: boolean
  alt?: string
}

/**
 * Responsive BetterIriga Brand Logo:
 * - variant="horizontal": Uses the 1360x360 horizontal lockup (Blue for Light, White for Dark)
 * - variant="emblem": Uses the square official emblem (Blue for Light, White for Dark)
 * - forceTheme: Forces "light" or "dark" variant regardless of current theme (e.g. for always-dark footers)
 *
 * Rendered using CSS classes (dark:hidden / hidden dark:block) for instant,
 * flicker-free, zero-hydration-mismatch theme transitions.
 */
export function BetterIrigaLogo({
  variant = "emblem",
  forceTheme,
  size = 40,
  width,
  height,
  className,
  priority = false,
  alt = "BetterIriga official logo",
}: BetterIrigaLogoProps) {
  const logos = useCivicStore((state) => state.snapshot.siteContent.brand.logos)

  if (variant === "horizontal") {
    const lightSrc =
      logos?.horizontalLight ?? "/BetterIriga-Horizontal-LightMode-Blue.png"
    const darkSrc =
      logos?.horizontalDark ?? "/BetterIriga-Horizontal-DarkMode-White.png"
    const renderedWidth = width ?? 180
    const renderedHeight = height ?? 48

    if (forceTheme === "dark") {
      return (
        <div className={cn("relative shrink-0 select-none", className)}>
          <Image
            src={darkSrc}
            alt={alt}
            width={renderedWidth}
            height={renderedHeight}
            priority={priority}
            className="h-full w-auto max-w-full object-contain"
          />
        </div>
      )
    }

    if (forceTheme === "light") {
      return (
        <div className={cn("relative shrink-0 select-none", className)}>
          <Image
            src={lightSrc}
            alt={alt}
            width={renderedWidth}
            height={renderedHeight}
            priority={priority}
            className="h-full w-auto max-w-full object-contain"
          />
        </div>
      )
    }

    return (
      <div className={cn("relative shrink-0 select-none", className)}>
        {/* Light Mode: Horizontal Blue Lockup */}
        <Image
          src={lightSrc}
          alt={alt}
          width={renderedWidth}
          height={renderedHeight}
          priority={priority}
          className="h-full w-auto max-w-full object-contain dark:hidden"
        />
        {/* Dark Mode: Horizontal White Lockup */}
        <Image
          src={darkSrc}
          alt={alt}
          width={renderedWidth}
          height={renderedHeight}
          priority={priority}
          className="hidden h-full w-auto max-w-full object-contain dark:block"
        />
      </div>
    )
  }

  // Default: Square Emblem
  const lightSrc =
    logos?.lightMode ?? "/BetterIriga-Blue-Foreground-Transparent.png"
  const darkSrc =
    logos?.darkMode ?? "/BetterIriga-White-Foreground-Transparent.png"

  if (forceTheme === "dark") {
    return (
      <div
        className={cn("relative shrink-0 select-none", className)}
        style={{ width: width ?? size, height: height ?? size }}
      >
        <Image
          src={darkSrc}
          alt={alt}
          width={width ?? size}
          height={height ?? size}
          priority={priority}
          className="h-full w-full object-contain"
        />
      </div>
    )
  }

  if (forceTheme === "light") {
    return (
      <div
        className={cn("relative shrink-0 select-none", className)}
        style={{ width: width ?? size, height: height ?? size }}
      >
        <Image
          src={lightSrc}
          alt={alt}
          width={width ?? size}
          height={height ?? size}
          priority={priority}
          className="h-full w-full object-contain"
        />
      </div>
    )
  }

  return (
    <div
      className={cn("relative shrink-0 select-none", className)}
      style={!className?.includes("size-") ? { width: size, height: size } : undefined}
    >
      {/* Light Mode: Blue Foreground Emblem */}
      <Image
        src={lightSrc}
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        className="h-full w-full object-contain dark:hidden"
      />
      {/* Dark Mode: White Foreground Emblem */}
      <Image
        src={darkSrc}
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        className="hidden h-full w-full object-contain dark:block"
      />
    </div>
  )
}
