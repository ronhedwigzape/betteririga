"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  PhoneCall,
  ShieldAlert,
  Building2,
  Landmark,
  FileText,
  HardHat,
  Phone,
  Info,
  ShieldCheck,
  Menu,
  X,
  Sun,
  Moon,
  ExternalLink,
  CheckCircle2,
  Briefcase,
  BarChart3,
  Scale,
  MessageSquareHeart,
  CloudSun,
  Calendar,
  Clock,
  Coins,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { BetterIrigaLogo } from "@/components/civic/better-iriga-logo"
import { CarrierIconOnly } from "@/components/civic/telecom-and-channel-icons"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const NAV_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Building2,
  services: Briefcase,
  officials: Landmark,
  budget: FileText,
  projects: HardHat,
  legislative: Scale,
  statistics: BarChart3,
  contacts: Phone,
  freedomWall: MessageSquareHeart,
  verification: ShieldCheck,
  about: Info,
}

const LivePhtClock = React.memo(function LivePhtClock() {
  const [phtDateTime, setPhtDateTime] = React.useState<{
    date: string
    time: string
  }>({
    date: "Iriga City, PH",
    time: "PHT (UTC+8)",
  })

  React.useEffect(() => {
    // On mobile screens (< 768px), the clock is hidden (hidden md:inline-flex).
    // Avoid running 1s tick intervals on mobile devices completely.
    if (typeof window === "undefined" || window.innerWidth < 768) return

    const dateFormatter = new Intl.DateTimeFormat("en-PH", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "numeric",
      year: "numeric",
    })

    const timeFormatter = new Intl.DateTimeFormat("en-PH", {
      timeZone: "Asia/Manila",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })

    const updateClock = () => {
      const now = new Date()
      const dateStr = dateFormatter.format(now)
      const timeStr = timeFormatter.format(now)
      setPhtDateTime({ date: dateStr, time: `${timeStr} PHT` })
    }

    let interval: number | null = null
    const startClock = () => {
      updateClock()
      interval = window.setInterval(updateClock, 1000)
    }

    const timer = setTimeout(startClock, 6000)

    return () => {
      clearTimeout(timer)
      if (interval) clearInterval(interval)
    }
  }, [])

  return (
    <span className="hidden items-center gap-1 font-mono text-[11px] text-blue-900 md:inline-flex dark:text-blue-200">
      <Calendar className="size-3" />
      {phtDateTime.date} • <Clock className="size-3" /> {phtDateTime.time}
    </span>
  )
})

const LiveWeatherTicker = React.memo(function LiveWeatherTicker({
  latitude,
  longitude,
  initialWeather,
  initialUsdPhp,
}: {
  latitude: number
  longitude: number
  initialWeather: string
  initialUsdPhp: string
}) {
  const [weatherSummary, setWeatherSummary] = React.useState(initialWeather)
  const [usdPhpRate, setUsdPhpRate] = React.useState(initialUsdPhp)

  React.useEffect(() => {
    let active = true

    const fetchTickerData = () => {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=Asia%2FManila`
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!active || !data?.current) return
          const temp = Math.round(Number(data.current.temperature_2m))
          if (!Number.isNaN(temp)) {
            setWeatherSummary(`${temp}°C • Iriga City`)
          }
        })
        .catch(() => {})

      fetch("https://open.er-api.com/v6/latest/USD")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!active || !data?.rates?.PHP) return
          const php = Number(data.rates.PHP)
          if (!Number.isNaN(php)) {
            setUsdPhpRate(`1 USD = ₱${php.toFixed(2)}`)
          }
        })
        .catch(() => {})
    }

    // Defer non-critical background fetches until well after initial load
    const timer = setTimeout(fetchTickerData, 8000)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [latitude, longitude])

  return (
    <>
      <span className="hidden items-center gap-1 font-medium text-blue-900 sm:inline-flex dark:text-blue-200">
        <Coins className="size-3.5 text-amber-600 dark:text-amber-400" />
        {usdPhpRate}
      </span>
      <a
        href="#weather-map"
        className="inline-flex items-center gap-1 font-medium text-blue-900 hover:underline dark:text-blue-200"
      >
        <CloudSun className="size-3.5 text-amber-600 dark:text-amber-400" />
        {weatherSummary}
      </a>
    </>
  )
})

import type {
  SiteContent,
  EmergencyHotline,
  CityProfile,
  TransparencyPortal,
} from "@/lib/data/schemas"

export interface SiteHeaderData {
  brand: SiteContent["brand"]
  navItems: SiteContent["navigation"]
  transparencyPortals: TransparencyPortal[]
  primaryHotlines: EmergencyHotline[]
  weatherBaseline: CityProfile["weatherBaseline"]
  geo: CityProfile["geo"]
  officialWebsite?: string
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

const DEFAULT_NAV: SiteContent["navigation"] = [
  { label: "Home", href: "/", iconKey: "home" },
  { label: "Services", href: "/services", iconKey: "services" },
  { label: "Officials", href: "/officials", iconKey: "officials" },
  { label: "Laws", href: "/legislative", iconKey: "legislative" },
  { label: "Budget", href: "/budget", iconKey: "budget" },
  { label: "Stats", href: "/statistics", iconKey: "statistics" },
  { label: "Projects", href: "/projects", iconKey: "projects" },
  { label: "Contacts", href: "/contacts", iconKey: "contacts" },
  { label: "Wall", href: "/freedom-wall", iconKey: "freedom-wall" },
  { label: "About", href: "/about", iconKey: "about" },
]

const DEFAULT_PORTALS: TransparencyPortal[] = [
  {
    label: "Iriga, Camarines Sur",
    href: "https://transparency-portal-iriga.betteririga.org/",
    description: "City LGU Public Disclosures",
  },
  {
    label: "BetterGov.ph Network",
    href: "https://bettergov.ph/",
    description: "Open Data & Transparency",
  },
  {
    label: "DPWH CamSur 5th DEO",
    href: "https://bettergov.ph/infrastructure/camsur-5th",
    description: "District Public Works Tracker",
  },
]

const DEFAULT_HOTLINES: EmergencyHotline[] = [
  {
    id: "cdrmo-landline",
    agency: "CDRRMO",
    label: "CDRRMO Rescue Landline",
    number: "(054) 299 9918",
    telHref: "tel:0542999918",
    networkOrType: "Landline (054)",
    priority: "primary",
    citation: {
      sourceUrl: "https://iriga.gov.ph",
      sourceName: "City of Iriga",
      retrievedAt: "2025-01-01",
    },
  },
  {
    id: "cdrmo-smart",
    agency: "CDRRMO",
    label: "CDRRMO Rescue Smart",
    number: "0921 636 4018",
    telHref: "tel:09216364018",
    networkOrType: "Smart Mobile",
    priority: "primary",
    citation: {
      sourceUrl: "https://iriga.gov.ph",
      sourceName: "City of Iriga",
      retrievedAt: "2025-01-01",
    },
  },
  {
    id: "national-emergency",
    agency: "911",
    label: "National Emergency Hotline",
    number: "911",
    telHref: "tel:911",
    networkOrType: "National Emergency",
    priority: "primary",
    citation: {
      sourceUrl: "https://iriga.gov.ph",
      sourceName: "City of Iriga",
      retrievedAt: "2025-01-01",
    },
  },
]

const DEFAULT_WEATHER_BASELINE: CityProfile["weatherBaseline"] = {
  temperatureC: 30,
  conditionLabel: "Partly Cloudy",
  humidityPct: 75,
  windKmh: 12,
  usdPhpFallback: "₱58.50",
  hourly: [
    { timeLabel: "8:00 AM", tempC: 28, isRainy: false },
    { timeLabel: "12:00 PM", tempC: 32, isRainy: false },
    { timeLabel: "4:00 PM", tempC: 30, isRainy: false },
  ],
}

const DEFAULT_GEO: CityProfile["geo"] = {
  latitude: 13.4167,
  longitude: 123.4167,
  postalCode: "4431",
  osmEmbedUrl: "https://www.openstreetmap.org",
  osmLinkUrl: "https://www.openstreetmap.org",
  landmarks: ["Mount Iriga"],
}

export function SiteHeader({ initialData }: { initialData?: SiteHeaderData } = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [guideOpen, setGuideOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [optimisticHref, setOptimisticHref] = React.useState<string | null>(
    null
  )
  const [prefetchReady, setPrefetchReady] = React.useState(false)

  const brand = initialData?.brand ?? DEFAULT_BRAND
  const navItems = initialData?.navItems ?? DEFAULT_NAV
  const transparencyPortals = initialData?.transparencyPortals ?? DEFAULT_PORTALS
  const primaryHotlines = initialData?.primaryHotlines ?? DEFAULT_HOTLINES
  const weatherBaseline = initialData?.weatherBaseline ?? DEFAULT_WEATHER_BASELINE
  const geo = initialData?.geo ?? DEFAULT_GEO
  const officialWebsite = initialData?.officialWebsite ?? "https://iriga.gov.ph"

  // Warm all navigation routes right after the initial LCP window so clicking any tab is 0ms instant
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setPrefetchReady(true)
      for (const item of navItems) {
        try {
          router.prefetch(item.href)
        } catch {
          // Ignore router prefetch errors in non-Next test environments
        }
      }
      try {
        router.prefetch("/verification")
      } catch {
        // Ignore router prefetch errors in non-Next test environments
      }
    }, 1500)
    return () => window.clearTimeout(timer)
  }, [navItems, router])

  const warmRoute = React.useCallback(
    (href: string) => {
      try {
        router.prefetch(href)
      } catch {
        // Ignore in test environments
      }
    },
    [router]
  )

  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev))
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Guard against scroll-locking margins/paddings from Radix modals, dialogs, and dropdowns
  React.useEffect(() => {
    if (typeof document === "undefined") return

    const resetScrollLockGaps = () => {
      const isLocked =
        document.body.hasAttribute("data-scroll-locked") ||
        document.documentElement.hasAttribute("data-scroll-locked")
      if (!isLocked) return

      if (document.body.style.marginRight && document.body.style.marginRight !== "0px") {
        document.body.style.marginRight = "0px"
      }
      if (document.body.style.paddingRight && document.body.style.paddingRight !== "0px") {
        document.body.style.paddingRight = "0px"
      }
      if (document.documentElement.style.marginRight && document.documentElement.style.marginRight !== "0px") {
        document.documentElement.style.marginRight = "0px"
      }
      if (document.documentElement.style.paddingRight && document.documentElement.style.paddingRight !== "0px") {
        document.documentElement.style.paddingRight = "0px"
      }
    }

    const observer = new MutationObserver(() => {
      resetScrollLockGaps()
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-scroll-locked", "style"],
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-scroll-locked", "style"],
    })

    resetScrollLockGaps()

    return () => {
      observer.disconnect()
    }
  }, [])

  // Render-phase state adjustment: close mobile menu, guide modal, and clear optimistic tab when pathname updates
  const [prevPathname, setPrevPathname] = React.useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setOptimisticHref(null)
    setMobileOpen(false)
    setGuideOpen(false)
  }

  const effectivePath = optimisticHref ?? pathname

  return (
    <>
      {/* 1. Top Emergency Hotline Bar (Upper Right Redirection & Compact Hotlines) */}
      <div className="w-full max-w-full overflow-hidden bg-slate-950 text-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-1.5 text-xs sm:gap-4 sm:px-6 lg:px-8">
          {/* Left: Compact Hotlines */}
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 sm:gap-2">
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-amber-400">
              <PhoneCall className="size-3.5 animate-civic-pulse" />
              <span className="hidden sm:inline">Emergency:</span>
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {primaryHotlines.map((hotline) => (
                <Tooltip key={hotline.id}>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="outline"
                      size="xs"
                      title={`${hotline.agency} • ${hotline.label} • Click to call ${hotline.number}`}
                      className="h-6 shrink-0 gap-1 rounded-md border-slate-800 bg-slate-900/90 px-2 text-[11px] font-medium text-slate-200 transition-all hover:border-amber-500/50 hover:bg-slate-800 hover:text-amber-300 active:scale-95"
                    >
                      <a href={hotline.telHref}>
                        <CarrierIconOnly
                          number={hotline.number}
                          networkOrType={hotline.networkOrType}
                          className="size-3"
                        />
                        <span className="font-mono font-semibold text-slate-100">
                          {hotline.number}
                        </span>
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs bg-slate-900 text-slate-100 border-slate-800">
                    <p className="font-bold text-amber-300">{hotline.agency}</p>
                    <p className="text-[11px] text-slate-300">{hotline.label} • {hotline.networkOrType}</p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">Click to call {hotline.number}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Upper Right: Official LGU Portal Redirection & City Details */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Badge
              variant="outline"
              className="hidden md:inline-flex border-slate-700/60 bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-300 rounded-md"
            >
              {brand.cityQuickBadge}
            </Badge>
            <Button
              asChild
              variant="outline"
              size="xs"
              className="h-6 gap-1.5 rounded-full border-blue-600/70 bg-blue-950/90 px-2.5 text-[11px] font-semibold text-blue-200 shadow-xs transition-all hover:border-blue-500 hover:bg-blue-900 hover:text-white active:scale-95"
            >
              <a
                href={officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                title="Visit Official City Government of Iriga Website (iriga.gov.ph)"
              >
                <span className="hidden sm:inline text-slate-300">Official Portal:</span>
                <span className="font-bold underline-offset-2 hover:underline">
                  iriga.gov.ph
                </span>
                <ExternalLink className="size-3 text-blue-400" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Main Sticky Navigation Bar */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-shadow duration-200 supports-[backdrop-filter]:bg-background/90",
          isScrolled ? "shadow-md ring-1 ring-border/40" : "shadow-xs"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5 sm:gap-3 sm:py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            prefetch={prefetchReady ? undefined : false}
            onPointerEnter={() => warmRoute("/")}
            onClick={() => setOptimisticHref("/")}
            className="group flex min-w-0 shrink items-center gap-2 sm:gap-2.5"
            aria-label={`${brand.fullDomain} - Home`}
          >
            <BetterIrigaLogo
              variant="horizontal"
              alt={`${brand.fullDomain} Official Logo`}
              className="h-8 sm:h-9 md:h-10 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
            />
            <span className="sr-only">
              {brand.fullDomain} - {brand.tagline}
            </span>
          </Link>

          {/* Desktop Nav — 100% shadcn UI Navigation Controls */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-0.5 lg:flex xl:gap-1"
          >
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? effectivePath === "/"
                  : effectivePath?.startsWith(item.href)
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 rounded-lg px-2 text-xs font-semibold xl:px-2.5 transition-all active:scale-95",
                    active
                      ? "bg-blue-600 text-white shadow-xs hover:bg-blue-500 hover:text-white"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Link
                    href={item.href}
                    prefetch={prefetchReady ? undefined : false}
                    onPointerEnter={() => warmRoute(item.href)}
                    onFocus={() => warmRoute(item.href)}
                    onClick={() => setOptimisticHref(item.href)}
                  >
                    {item.label}
                  </Link>
                </Button>
              )
            })}

            {/* Transparency Portals Dropdown (100% shadcn UI, modal={false} prevents body scroll lock whitespace) */}
            {transparencyPortals.length > 0 ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 rounded-lg px-2 text-xs font-semibold text-foreground/80 hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground xl:px-2.5 cursor-pointer transition-all active:scale-95"
                    aria-label="Transparency Portals"
                  >
                    <span>Transparency</span>
                    <ChevronDown className="size-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={6}
                  className="w-80 rounded-xl border border-border/80 bg-popover/98 p-1.5 shadow-xl backdrop-blur-md"
                >
                  <div className="px-2.5 py-1.5 text-xs font-bold text-foreground">
                    Transparency Portals
                  </div>
                  <div className="px-2.5 pb-1.5 text-[11px] text-muted-foreground leading-snug">
                    Official portals tracking local budgets, public works & civic data.
                  </div>
                  <DropdownMenuSeparator className="my-1" />
                  {transparencyPortals.map((portal) => (
                    <DropdownMenuItem
                      key={portal.href}
                      asChild
                      className="cursor-pointer rounded-lg p-2 focus:bg-muted focus:text-foreground"
                    >
                      <a
                        href={portal.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-xs text-foreground">
                            {portal.label}
                          </span>
                          <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                        </div>
                        {portal.description ? (
                          <span className="text-[11px] text-muted-foreground line-clamp-1 font-normal">
                            {portal.description}
                          </span>
                        ) : null}
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              aria-label="Toggle color theme"
              title="Toggle light/dark mode"
            >
              <Sun className="hidden size-4 dark:block" />
              <Moon className="block size-4 dark:hidden" />
            </Button>

            <Button
              variant="outline"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer (100% shadcn UI) */}
        {mobileOpen ? (
          <div className="animate-civic-fade-up border-t border-border bg-background px-4 py-3 lg:hidden">
            <nav className="grid grid-cols-2 gap-1.5" aria-label="Mobile navigation">
              {navItems.map((item) => {
                const Icon = NAV_ICON_MAP[item.iconKey ?? ""] ?? Landmark
                const active =
                  item.href === "/"
                    ? effectivePath === "/"
                    : effectivePath?.startsWith(item.href)
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={active ? "default" : "outline"}
                    className={cn(
                      "h-10 justify-start gap-2.5 rounded-lg px-3 text-sm font-semibold transition-all active:scale-95",
                      active
                        ? "bg-blue-600 text-white shadow-xs hover:bg-blue-500 hover:text-white"
                        : "border-border/70 bg-card/60 text-foreground/85 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Link
                      href={item.href}
                      prefetch={prefetchReady ? undefined : false}
                      onPointerEnter={() => warmRoute(item.href)}
                      onTouchStart={() => warmRoute(item.href)}
                      onClick={() => {
                        setOptimisticHref(item.href)
                        setMobileOpen(false)
                      }}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                )
              })}
            </nav>

            {/* Mobile Transparency Portals Section */}
            {transparencyPortals.length > 0 ? (
              <div className="mt-3 border-t border-border/80 pt-3">
                <div className="mb-2 flex items-center justify-between px-1 text-xs font-bold text-foreground">
                  <span>Transparency Portals</span>
                  <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider">
                    External Portals
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {transparencyPortals.map((portal) => (
                    <Button
                      key={portal.href}
                      asChild
                      variant="outline"
                      className="h-auto w-full justify-between rounded-lg border-border/70 bg-card/60 px-3 py-2.5 text-xs transition-colors hover:bg-muted hover:text-foreground active:scale-98"
                    >
                      <a
                        href={portal.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileOpen(false)}
                      >
                        <div className="flex min-w-0 flex-col text-left pr-2">
                          <span className="truncate font-semibold text-foreground">
                            {portal.label}
                          </span>
                          {portal.description ? (
                            <span className="truncate text-[11px] font-normal text-muted-foreground">
                              {portal.description}
                            </span>
                          ) : null}
                        </div>
                        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      {/* 3. Community Guide & Live Info Strip (BetterLibmanan BottomUtilityBar style) */}
      <div className="w-full max-w-full overflow-hidden border-b border-blue-200/70 bg-blue-50/90 text-blue-950 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-xs sm:px-6 lg:px-8">
          {/* Left: Clickable Community Guide Notice opening a pure shadcn Modal */}
          <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                className="group h-auto -ml-1 gap-1.5 p-1 text-left text-xs font-semibold text-blue-950 hover:bg-blue-100/70 hover:text-blue-700 dark:text-blue-200 dark:hover:bg-blue-900/40 dark:hover:text-white"
                title="Click to read Community Guide & Civic Transparency Notice"
              >
                <ShieldAlert className="size-3.5 shrink-0 text-amber-600 transition-transform group-hover:scale-110 dark:text-amber-400" />
                <span className="font-bold underline underline-offset-2 decoration-blue-400/60 group-hover:decoration-blue-700">
                  Community Guide
                </span>
                <span className="hidden text-[11px] font-normal text-blue-800/80 sm:inline dark:text-blue-300/80">
                  • Independent Public Guide (Click to read)
                </span>
              </Button>
            </DialogTrigger>
            {guideOpen ? (
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg text-foreground">
                    <ShieldAlert className="size-5 text-amber-600 shrink-0" />
                    <span>About This Community Guide</span>
                  </DialogTitle>
                  <DialogDescription className="text-left text-sm text-muted-foreground pt-2 space-y-3 leading-relaxed">
                    <span className="block">
                      <strong>BetterIriga.org</strong> is an independent, volunteer-run civic transparency initiative organized under <strong>BetterGov.ph</strong>.
                    </span>
                    <span className="block">
                      This website is <strong>not</strong> an official website of the City Government of Iriga. It is created by civic volunteers to help Irigueños easily access public services, budget disclosures, city officials, ordinances, and hotlines at <strong>₱0 cost to the people</strong>.
                    </span>
                    <span className="block">
                      Every factual record published on this platform is cited directly from primary public sources (such as <em>iriga.gov.ph</em>, DBM, PSA, and DPWH).
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border">
                  <DialogClose asChild>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Close
                    </Button>
                  </DialogClose>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => {
                      setOptimisticHref("/about")
                      setGuideOpen(false)
                    }}
                  >
                    <Link href="/about">Learn More in About</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      setOptimisticHref("/verification")
                      setGuideOpen(false)
                    }}
                  >
                    <Link href="/verification">View Verification Ledger</Link>
                  </Button>
                </DialogFooter>
              </DialogContent>
            ) : null}
          </Dialog>
          <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:gap-3">
            <LiveWeatherTicker
              latitude={geo.latitude}
              longitude={geo.longitude}
              initialWeather={`${weatherBaseline.temperatureC}°C • Iriga`}
              initialUsdPhp={weatherBaseline.usdPhpFallback}
            />
            <LivePhtClock />
            <span className="inline-flex items-center gap-1 font-medium text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="size-3.5" />
              <Link
                href="/verification"
                prefetch={prefetchReady ? undefined : false}
                onPointerEnter={() => warmRoute("/verification")}
                onClick={() => setOptimisticHref("/verification")}
                className="font-semibold underline underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {brand.verifyLinkLabel}
              </Link>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
