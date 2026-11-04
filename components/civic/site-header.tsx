"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"
import { useCivicStore } from "@/lib/store/civic-store"
import { Button } from "@/components/ui/button"
import { BetterIrigaLogo } from "@/components/civic/better-iriga-logo"
import { CarrierIconOnly } from "@/components/civic/telecom-and-channel-icons"
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
    const updateClock = () => {
      const now = new Date()
      const dateStr = new Intl.DateTimeFormat("en-PH", {
        timeZone: "Asia/Manila",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(now)
      const timeStr = new Intl.DateTimeFormat("en-PH", {
        timeZone: "Asia/Manila",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now)
      setPhtDateTime({ date: dateStr, time: `${timeStr} PHT` })
    }
    updateClock()
    const timer = window.setInterval(updateClock, 1000)
    return () => window.clearInterval(timer)
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

    return () => {
      active = false
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

export function SiteHeader() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const snapshot = useCivicStore((state) => state.snapshot)
  const brand = snapshot.siteContent.brand
  const navItems = snapshot.siteContent.navigation
  const primaryHotlines = snapshot.emergencyHotlines.slice(0, 6)
  const weatherBaseline = snapshot.cityProfile.weatherBaseline
  const geo = snapshot.cityProfile.geo
  const officialWebsite =
    snapshot.officialChannels.find((c) => c.platform === "Official Website")
      ?.url ?? "https://iriga.gov.ph"

  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev))
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Render-phase state adjustment: close mobile menu when navigating
  const [prevPathname, setPrevPathname] = React.useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setMobileOpen(false)
  }

  return (
    <>
      {/* 1. Top Emergency Hotline Bar (BetterLibmanan TopUtilityBar style) */}
      <div className="w-full max-w-full overflow-hidden bg-slate-950 text-slate-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 text-xs sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:gap-x-4">
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-400">
              <PhoneCall className="size-3.5 animate-civic-pulse" />
              {brand.hotlineBarLabel}
            </span>
            {primaryHotlines.map((hotline) => (
              <a
                key={hotline.id}
                href={hotline.telHref}
                className="inline-flex items-center gap-1.5 text-slate-200 transition hover:text-amber-300"
              >
                <CarrierIconOnly
                  number={hotline.number}
                  networkOrType={hotline.networkOrType}
                  className="size-3.5"
                />
                <span className="text-slate-400">{hotline.label}:</span>
                <span className="font-mono font-semibold">{hotline.number}</span>
              </a>
            ))}
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
              {brand.cityQuickBadge}
            </span>
            <a
              href={officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-300 underline-offset-2 hover:text-white hover:underline"
            >
              iriga.gov.ph
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Sticky Navigation Bar (BetterLibmanan sticky top-0 Navbar architecture) */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-shadow duration-200 supports-[backdrop-filter]:bg-background/90",
          isScrolled ? "shadow-md ring-1 ring-border/40" : "shadow-xs"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5 sm:gap-3 sm:py-3 sm:px-6 lg:px-8">
          <Link href="/" className="group flex min-w-0 shrink items-center gap-2.5 sm:gap-3">
            <BetterIrigaLogo
              size={44}
              priority
              alt={`${brand.fullDomain} Official Emblem`}
              className="size-10 sm:size-11 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="truncate text-base font-bold tracking-tight text-foreground sm:text-lg">
                  {brand.name}
                  <span className="text-blue-600 dark:text-blue-400">
                    {brand.domainSuffix}
                  </span>
                </span>
                <span className="hidden rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-blue-800 uppercase xl:inline-block dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {brand.regionBadge}
                </span>
              </div>
              <p className="truncate text-[11px] text-muted-foreground sm:text-xs">{brand.tagline}</p>
            </div>
          </Link>

          {/* Desktop Nav — One-word labels allow clean display on lg+ screens */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-0.5 lg:flex xl:gap-1"
          >
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-2 py-1.5 text-xs font-semibold transition-all xl:px-2.5",
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
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

        {/* Mobile Navigation Drawer */}
        {mobileOpen ? (
          <div className="animate-civic-fade-up border-t border-border bg-background px-4 py-3 lg:hidden">
            <nav className="grid grid-cols-2 gap-1.5" aria-label="Mobile navigation">
              {navItems.map((item) => {
                const Icon = NAV_ICON_MAP[item.iconKey ?? ""] ?? Landmark
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold",
                      active
                        ? "bg-blue-600 text-white"
                        : "text-foreground/80 hover:bg-muted"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        ) : null}
      </header>

      {/* 3. Community Guide & Live Info Strip (BetterLibmanan BottomUtilityBar style) */}
      <div className="w-full max-w-full overflow-hidden border-b border-blue-200/70 bg-blue-50/90 text-blue-950 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-xs sm:px-6 lg:px-8">
          <p className="flex min-w-0 flex-1 items-center gap-1.5">
            <ShieldAlert className="size-3.5 shrink-0 text-blue-700 dark:text-blue-400" />
            <span className="truncate">{brand.disclaimerBanner}</span>
          </p>
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
