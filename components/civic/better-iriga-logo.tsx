import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface BetterIrigaLogoProps {
  variant?: "horizontal" | "emblem" | "banner"
  forceTheme?: "light" | "dark"
  size?: number
  width?: number
  height?: number
  className?: string
  priority?: boolean
  alt?: string
  logos?: {
    lightMode?: string
    darkMode?: string
    horizontalLight?: string
    horizontalDark?: string
    bannerOnBlue?: string
    bannerOnWhite?: string
    badge?: string
    alt?: string
  }
}

const DEFAULT_LOGOS = {
  lightMode: "/BetterIriga-Blue-Foreground-Transparent.png",
  darkMode: "/BetterIriga-White-Foreground-Transparent.png",
  horizontalLight: "/BetterIriga-Clean-LightMode-Blue-Transparent.png",
  horizontalDark: "/BetterIriga-Clean-DarkMode-White-Transparent.png",
  bannerOnBlue: "/BetterIriga-Clean-Banner-OnBlue.png",
  bannerOnWhite: "/BetterIriga-Clean-Banner-OnWhite.png",
  badge: "/BetterIriga-Badge-BlueAndWhite-Transparent.png",
  alt: "BetterIriga.org Official Emblem",
}

/**
 * Responsive BetterIriga Brand Logo:
 * - variant="horizontal": Uses the 1360x360 horizontal transparent lockup (Blue for Light, White for Dark)
 * - variant="banner": Uses the 1360x360 banner lockup with solid background (OnWhite for Light, OnBlue for Dark)
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
  logos: customLogos,
}: BetterIrigaLogoProps) {
  const logos = customLogos ?? DEFAULT_LOGOS

  if (variant === "banner") {
    const lightSrc =
      logos?.bannerOnWhite ?? "/BetterIriga-Clean-Banner-OnWhite.png"
    const darkSrc =
      logos?.bannerOnBlue ?? "/BetterIriga-Clean-Banner-OnBlue.png"
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
        {/* Light Mode: Banner On White */}
        <Image
          src={lightSrc}
          alt={alt}
          width={renderedWidth}
          height={renderedHeight}
          priority={priority}
          className="h-full w-auto max-w-full object-contain dark:hidden"
        />
        {/* Dark Mode: Banner On Blue (Lazy loaded on default light SSR) */}
        <Image
          src={darkSrc}
          alt={alt}
          width={renderedWidth}
          height={renderedHeight}
          className="hidden h-full w-auto max-w-full object-contain dark:block"
        />
      </div>
    )
  }

  if (variant === "horizontal") {
    const lightSrc =
      logos?.horizontalLight ??
      "/BetterIriga-Clean-LightMode-Blue-Transparent.png"
    const darkSrc =
      logos?.horizontalDark ??
      "/BetterIriga-Clean-DarkMode-White-Transparent.png"
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
          quality={50}
          sizes="(max-width: 640px) 140px, (max-width: 1024px) 160px, 180px"
          priority={priority}
          fetchPriority={priority ? "high" : undefined}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          className="h-full w-auto max-w-full object-contain dark:hidden"
        />
        {/* Dark Mode: Horizontal White Lockup (Lazy loaded on default light SSR) */}
        <Image
          src={darkSrc}
          alt={alt}
          width={renderedWidth}
          height={renderedHeight}
          quality={50}
          sizes="(max-width: 640px) 140px, (max-width: 1024px) 160px, 180px"
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
        quality={45}
        sizes="(max-width: 640px) 96px, (max-width: 1024px) 144px, 192px"
        priority={priority}
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        className="h-full w-full object-contain dark:hidden"
      />
      {/* Dark Mode: White Foreground Emblem (Lazy loaded on default light SSR) */}
      <Image
        src={darkSrc}
        alt={alt}
        width={size}
        height={size}
        quality={45}
        sizes="(max-width: 640px) 96px, (max-width: 1024px) 144px, 192px"
        className="hidden h-full w-full object-contain dark:block"
      />
    </div>
  )
}
