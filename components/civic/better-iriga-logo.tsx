"use client"

import * as React from "react"
import Image from "next/image"
import { useCivicStore } from "@/lib/store/civic-store"
import { cn } from "@/lib/utils"

export interface BetterIrigaLogoProps {
  size?: number
  className?: string
  priority?: boolean
  alt?: string
}

/**
 * Responsive BetterIriga Emblem:
 * - Uses the Blue foreground logo in light mode
 * - Uses the White foreground logo in dark mode
 * Implemented via CSS classes (dark:hidden / hidden dark:block) for instant,
 * flicker-free, and zero-hydration-mismatch theme transitions.
 * Logo paths are supplied by the central Civic Store.
 */
export function BetterIrigaLogo({
  size = 36,
  className,
  priority = false,
  alt = "BetterIriga official emblem",
}: BetterIrigaLogoProps) {
  const logos = useCivicStore((state) => state.snapshot.siteContent.brand.logos)
  const lightSrc =
    logos?.lightMode ?? "/BetterIriga-Blue-Foreground-Transparent.png"
  const darkSrc =
    logos?.darkMode ?? "/BetterIriga-White-Foreground-Transparent.png"

  return (
    <div
      className={cn("relative shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    >
      {/* Light Mode: Blue Foreground Logo */}
      <Image
        src={lightSrc}
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        className="h-full w-full object-contain dark:hidden"
      />
      {/* Dark Mode: White Foreground Logo */}
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

