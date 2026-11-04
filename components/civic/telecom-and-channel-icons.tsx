import * as React from "react"
import Image from "next/image"
import { detectCarrier } from "@/lib/data/iriga-data"
import { cn } from "@/lib/utils"

/**
 * Official Smart Communications brand logo.
 * Backed by a clean white container with subtle border so it remains vibrant
 * and high-contrast across both dark and light mode themes.
 */
export function SmartLogo({
  className,
  variant = "icon",
}: {
  className?: string
  variant?: "icon" | "full"
}) {
  if (variant === "full") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md border border-slate-200/90 bg-white px-1.5 py-0.5 shadow-2xs dark:border-white/20",
          className
        )}
      >
        <Image
          src="/carriers/smart.png"
          alt="Smart Communications"
          width={56}
          height={18}
          className="h-3.5 w-auto object-contain"
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm border border-slate-200/90 bg-white p-0.5 shadow-2xs dark:border-white/20",
        className ?? "size-4"
      )}
    >
      <Image
        src="/carriers/smart-icon.png"
        alt="Smart Communications"
        width={20}
        height={20}
        className="size-full object-contain"
      />
    </span>
  )
}

/**
 * Official Globe Telecom brand logo.
 * Backed by a clean white container with subtle border so it remains vibrant
 * and high-contrast across both dark and light mode themes.
 */
export function GlobeTelecomLogo({
  className,
  variant = "icon",
}: {
  className?: string
  variant?: "icon" | "full"
}) {
  if (variant === "full") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md border border-slate-200/90 bg-white px-1.5 py-0.5 shadow-2xs dark:border-white/20",
          className
        )}
      >
        <Image
          src="/carriers/globe.png"
          alt="Globe Telecom"
          width={50}
          height={18}
          className="h-3.5 w-auto object-contain"
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm border border-slate-200/90 bg-white p-0.5 shadow-2xs dark:border-white/20",
        className ?? "size-4"
      )}
    >
      <Image
        src="/carriers/globe-icon.png"
        alt="Globe Telecom"
        width={20}
        height={20}
        className="size-full object-contain"
      />
    </span>
  )
}

/**
 * Landline / PLDT telephone receiver icon with white background backing.
 */
export function LandlineLogo({
  className,
}: {
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm border border-slate-200/90 bg-white p-0.5 shadow-2xs dark:border-white/20",
        className ?? "size-4"
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-full"
        aria-label="Landline / PLDT"
      >
        <rect width="24" height="24" rx="4" fill="#DC2626" />
        <path
          d="M7 8.5C7 7.67 7.67 7 8.5 7h1.4c.4 0 .76.24.9.61l.7 1.87a1 1 0 0 1-.25 1.07l-.9.9a7.6 7.6 0 0 0 3.7 3.7l.9-.9a1 1 0 0 1 1.07-.25l1.87.7c.37.14.61.5.61.9v1.4c0 .83-.67 1.5-1.5 1.5-6.07 0-11-4.93-11-11v-1.4z"
          fill="#FFFFFF"
        />
      </svg>
    </span>
  )
}

/**
 * Official Facebook brand blue tile icon.
 */
export function FacebookLogo({
  className = "size-4",
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      aria-label="Facebook"
    >
      <rect width="24" height="24" rx="6" fill="#1877F2" />
      <path
        d="M15.5 13.5l.5-3.5h-3.4V7.7c0-.96.27-1.6 1.63-1.6H16V3.05C15.3 2.95 14.2 2.85 13 2.85c-2.5 0-4.2 1.53-4.2 4.35V10H6v3.5h2.8V22h3.8v-8.5h2.9z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

/**
 * Universal Carrier badge detector for Philippine hotlines.
 * Displays official carrier logo inside a white pill for crisp presentation in both light & dark modes.
 */
export function CarrierBadge({
  number,
  networkOrType,
  showLabel = true,
}: {
  number?: string
  networkOrType?: string
  showLabel?: boolean
}) {
  const carrier = detectCarrier(number, networkOrType)

  if (carrier === "smart") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-2 py-0.5 text-[11px] font-bold text-emerald-800 shadow-2xs dark:border-emerald-700/80 dark:bg-slate-900 dark:text-emerald-300">
        <SmartLogo className="size-4" />
        {showLabel ? "Smart" : null}
      </span>
    )
  }

  if (carrier === "globe") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-white px-2 py-0.5 text-[11px] font-bold text-blue-800 shadow-2xs dark:border-blue-700/80 dark:bg-slate-900 dark:text-blue-300">
        <GlobeTelecomLogo className="size-4" />
        {showLabel ? "Globe" : null}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-800 shadow-2xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <LandlineLogo className="size-4" />
      {showLabel ? "Landline" : null}
    </span>
  )
}

/**
 * Single carrier logo helper for compact ticker rows and directory cards.
 * Backed by a white square container so it pops in both dark mode headers and light mode directories.
 */
export function CarrierIconOnly({
  number,
  networkOrType,
  className = "size-4",
}: {
  number?: string
  networkOrType?: string
  className?: string
}) {
  const carrier = detectCarrier(number, networkOrType)

  if (carrier === "smart") {
    return <SmartLogo className={className} />
  }

  if (carrier === "globe") {
    return <GlobeTelecomLogo className={className} />
  }

  return <LandlineLogo className={className} />
}
