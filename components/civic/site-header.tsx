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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { BetterIrigaLogo } from "@/components/civic/better-iriga-logo"
import { CarrierIconOnly } from "@/components/civic/telecom-and-channel-icons"
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
  const [guideOpen, setGuideOpen] = React.useState(false)
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

  // Render-phase state adjustment: close mobile menu and guide modal when navigating
  const [prevPathname, setPrevPathname] = React.useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setMobileOpen(false)
    setGuideOpen(false)
  }

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
                    <a
                      href={hotline.telHref}
                      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-800 bg-slate-900/90 px-2 py-0.5 text-[11px] font-medium text-slate-200 transition-colors hover:border-amber-500/50 hover:bg-slate-800 hover:text-amber-300"
                    >
                      <CarrierIconOnly
                        number={hotline.number}
                        networkOrType={hotline.networkOrType}
                        className="size-3"
                      />
                      <span className="font-mono font-semibold text-slate-100">
                        {hotline.number}
                      </span>
                    </a>
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
            <span className="hidden md:inline-block rounded-md border border-slate-700/60 bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-300">
              {brand.cityQuickBadge}
            </span>
            <a
              href={officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-600/70 bg-blue-950/90 px-2.5 py-0.5 text-[11px] font-semibold text-blue-200 shadow-xs transition-colors hover:border-blue-500 hover:bg-blue-900 hover:text-white"
              title="Visit Official City Government of Iriga Website (iriga.gov.ph)"
            >
              <span className="hidden sm:inline text-slate-300">Official Portal:</span>
              <span className="font-bold underline-offset-2 hover:underline">
                iriga.gov.ph
              </span>
              <ExternalLink className="size-3 text-blue-400" />
            </a>
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
            className="group flex min-w-0 shrink items-center gap-2 sm:gap-2.5"
            aria-label={`${brand.fullDomain} - Home`}
          >
            <BetterIrigaLogo
              variant="horizontal"
              priority
              alt={`${brand.fullDomain} Official Logo`}
              className="h-8 sm:h-9 md:h-10 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
            />
            <span className="sr-only">
              {brand.fullDomain} - {brand.tagline}
            </span>
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
          {/* Left: Clickable Community Guide Notice opening a pure shadcn Modal */}
          <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="group flex min-w-0 items-center gap-1.5 text-xs font-semibold text-blue-950 hover:text-blue-700 dark:text-blue-200 dark:hover:text-white transition-colors cursor-pointer text-left"
                title="Click to read Community Guide & Civic Transparency Notice"
              >
                <ShieldAlert className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="underline underline-offset-2 decoration-blue-400/60 group-hover:decoration-blue-700 font-bold">
                  Community Guide
                </span>
                <span className="hidden sm:inline text-[11px] font-normal text-blue-800/80 dark:text-blue-300/80">
                  • Independent Public Guide (Click to read)
                </span>
              </button>
            </DialogTrigger>
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
                  onClick={() => setGuideOpen(false)}
                >
                  <Link href="/about">Learn More in About</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setGuideOpen(false)}
                >
                  <Link href="/verification">View Verification Ledger</Link>
                </Button>
              </DialogFooter>
            </DialogContent>
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
