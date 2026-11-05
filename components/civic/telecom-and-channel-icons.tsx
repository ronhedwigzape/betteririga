import * as React from "react"
import Image from "next/image"
import { detectCarrier } from "@/lib/data/carrier-utils"
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
          loading="lazy"
          decoding="async"
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
        loading="lazy"
        decoding="async"
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
          loading="lazy"
          decoding="async"
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
        loading="lazy"
        decoding="async"
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
        <rect width="24" height="24" rx="4" fill="#0284C7" />
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

/**
 * Official Facebook Blue Verified Badge.
 * The authentic 12-point scalloped blue rosette (#0866FF) with rounded white checkmark
 * seen on verified Facebook government and public figure pages.
 */
export function FacebookVerifiedBadge({
  className = "size-4",
  title = "Verified City Hall Page",
}: {
  className?: string
  title?: string
}) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      title={title}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-full"
        aria-label={title}
      >
        <path
          fill="#0866FF"
          d="M 11.54 3.22 Q 12.00 3.60 12.46 3.22 L 13.82 2.08 Q 14.90 1.18 15.38 2.50 L 15.99 4.16 Q 16.20 4.73 16.79 4.62 L 18.54 4.32 Q 19.92 4.08 19.68 5.46 L 19.38 7.21 Q 19.27 7.80 19.84 8.01 L 21.50 8.62 Q 22.82 9.10 21.92 10.18 L 20.78 11.54 Q 20.40 12.00 20.78 12.46 L 21.92 13.82 Q 22.82 14.90 21.50 15.38 L 19.84 15.99 Q 19.27 16.20 19.38 16.79 L 19.68 18.54 Q 19.92 19.92 18.54 19.68 L 16.79 19.38 Q 16.20 19.27 15.99 19.84 L 15.38 21.50 Q 14.90 22.82 13.82 21.92 L 12.46 20.78 Q 12.00 20.40 11.54 20.78 L 10.18 21.92 Q 9.10 22.82 8.62 21.50 L 8.01 19.84 Q 7.80 19.27 7.21 19.38 L 5.46 19.68 Q 4.08 19.92 4.32 18.54 L 4.62 16.79 Q 4.73 16.20 4.16 15.99 L 2.50 15.38 Q 1.18 14.90 2.08 13.82 L 3.22 12.46 Q 3.60 12.00 3.22 11.54 L 2.08 10.18 Q 1.18 9.10 2.50 8.62 L 4.16 8.01 Q 4.73 7.80 4.62 7.21 L 4.32 5.46 Q 4.08 4.08 5.46 4.32 L 7.21 4.62 Q 7.80 4.73 8.01 4.16 L 8.62 2.50 Q 9.10 1.18 10.18 2.08 Z"
        />
        <path
          d="M7.4 12.0 L10.5 15.1 L16.6 9.0"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
