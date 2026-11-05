"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  X,
  Code2,
  Layers,
  Database,
  Languages,
  Megaphone,
  HeartHandshake,
  MessageSquareHeart,
} from "lucide-react"
import type { SiteContent } from "@/lib/data/schemas"

const DISMISSED_STORAGE_KEY = "betteririga:volunteer-popup:dismissed:v1"

interface VolunteerModalProps {
  brand?: SiteContent["brand"]
  modalCopy?: SiteContent["volunteerModal"]
}

const DEFAULT_BRAND: SiteContent["brand"] = {
  name: "Iriga City",
  domainSuffix: "org",
  fullDomain: "BetterIriga.org",
  regionBadge: "Bicol Region V",
  tagline: "The People's Guide to Iriga City",
  hotlineBarLabel: "Emergency Hotlines",
  cityQuickBadge: "Component City of Camarines Sur",
  disclaimerBanner: "Independent civic initiative",
  verifiedPillText: "Verified Civic Data",
  costToPeopleLabel: "Cost to the People of Iriga",
  costToPeopleValue: "₱0 (Free Forever)",
  volunteerEmail: "volunteer@bettergov.ph",
  communityUrl: "https://bettergov.ph",
  verifyLinkLabel: "Transparency Ledger",
}

const DEFAULT_MODAL_COPY: SiteContent["volunteerModal"] = {
  title: "Be Part of Something Greater",
  subtitle: "Iriga City, Camarines Sur deserves a clear, honest, and easy-to-use public guide. Help us keep it growing for every Irigueño.",
  lead: "We welcome fellow Irigueños and Bicolanos who want to help their community through their skills:",
  roles: [
    "Community Writers",
    "Visual & Print Guides",
    "Public Records Research",
    "Bicol / Rinconada Translation",
    "Barangay Outreach",
  ],
  primaryCtaLabel: "I Want to Volunteer",
  secondaryCtaLabel: "Visit Freedom Wall",
  skipLabel: "Maybe Later",
}

function getRoleIcon(index: number) {
  switch (index) {
    case 0:
      return Code2
    case 1:
      return Layers
    case 2:
      return Database
    case 3:
      return Languages
    default:
      return Megaphone
  }
}

export function VolunteerModal({
  brand = DEFAULT_BRAND,
  modalCopy = DEFAULT_MODAL_COPY,
}: VolunteerModalProps) {
  const [open, setOpen] = React.useState(false)

  const dismiss = React.useCallback(() => {
    setOpen(false)
    try {
      window.sessionStorage.setItem(DISMISSED_STORAGE_KEY, "1")
    } catch {
      // Ignore storage error
    }
  }, [])

  React.useEffect(() => {
    try {
      const alreadyDismissed = window.sessionStorage.getItem(
        DISMISSED_STORAGE_KEY
      )
      if (alreadyDismissed) return
    } catch {
      // Ignore storage error
    }

    // Polite, non-intrusive delay for civic volunteer modal (12s)
    const timer = window.setTimeout(() => {
      setOpen(true)
    }, 12000)

    return () => window.clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, dismiss])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vol-popup-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss()
      }}
    >
      <div className="animate-civic-scale-in relative w-full max-w-lg overflow-hidden rounded-3xl border border-blue-400/30 bg-card shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close volunteer popup"
          className="absolute top-3.5 right-3.5 z-10 flex size-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
        >
          <X className="size-4" />
        </button>

        {/* Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-900 px-6 pt-7 pb-6 text-center text-white">
          <div className="mx-auto mb-3 flex justify-center">
            <Image
              src="/BetterIriga-White-Foreground-Transparent.png"
              alt={brand.fullDomain}
              width={68}
              height={68}
              className="size-16 object-contain drop-shadow-md"
            />
          </div>
          <span className="inline-block rounded-full bg-white/15 px-3 py-0.5 text-[11px] font-semibold tracking-wide text-blue-100 uppercase">
            {brand.fullDomain} • {brand.costToPeopleLabel} ={" "}
            {brand.costToPeopleValue}
          </span>
          <h2
            id="vol-popup-title"
            className="mt-2 text-2xl font-extrabold tracking-tight"
          >
            {modalCopy.title}
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-blue-100/95">
            {modalCopy.subtitle}
          </p>
        </div>

        {/* Body */}
        <div className="space-y-5 p-6">
          <p className="text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {modalCopy.lead}
          </p>

          <div
            role="list"
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {modalCopy.roles.map((role, index) => {
              const Icon = getRoleIcon(index)
              return (
                <div
                  key={role}
                  role="listitem"
                  className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs font-semibold text-foreground"
                >
                  <Icon className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>{role}</span>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <a
              href={`mailto:${brand.volunteerEmail}?subject=Volunteering%20for%20BetterIriga.org`}
              onClick={dismiss}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500"
            >
              <HeartHandshake className="size-4" />
              {modalCopy.primaryCtaLabel}
            </a>

            <Link
              href="/freedom-wall"
              onClick={dismiss}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-300 bg-blue-50/70 px-4 py-3 text-xs font-bold text-blue-900 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200"
            >
              <MessageSquareHeart className="size-4" />
              {modalCopy.secondaryCtaLabel}
            </Link>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={dismiss}
              className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {modalCopy.skipLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
