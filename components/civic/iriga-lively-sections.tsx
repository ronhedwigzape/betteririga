"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  CloudSun,
  CloudRain,
  Sun,
  Droplets,
  Wind,
  MapPin,
  ExternalLink,
  BookOpen,
  Compass,
  Mountain,
  Megaphone,
  Calendar,
  Radio,
  ArrowRight,
  RefreshCw,
} from "lucide-react"
import { useCivicStore } from "@/lib/store/civic-store"
import { CitationBadge } from "@/components/civic/citation-badge"
import { FacebookLogo, FacebookVerifiedBadge } from "@/components/civic/telecom-and-channel-icons"
import { Reveal } from "@/components/civic/reveal"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface WeatherSnapshot {
  temperatureC: number
  conditionLabel: string
  humidityPct: number
  windKmh: number
  isLive: boolean
  weatherCode?: number
  hourly: Array<{
    timeLabel: string
    tempC: number
    isRainy: boolean
  }>
}

type WeatherVideoTheme = "rainy" | "cloudy" | "sunny"

const WEATHER_VIDEO_ASSETS: Record<
  WeatherVideoTheme,
  { mp4: string; webm: string; poster: string; label: string }
> = {
  sunny: {
    mp4: "/weather/sunny.mp4",
    webm: "/weather/sunny.webm",
    poster: "/weather/sunny-poster.jpg",
    label: "Sunny Skies (Iriga City)",
  },
  cloudy: {
    mp4: "/weather/cloudy.mp4",
    webm: "/weather/cloudy.webm",
    poster: "/weather/cloudy-poster.jpg",
    label: "Mountain Clouds & Overcast",
  },
  rainy: {
    mp4: "/weather/rainy.mp4",
    webm: "/weather/rainy.webm",
    poster: "/weather/rainy-poster.jpg",
    label: "Tropical Rain & Showers",
  },
}

function resolveWeatherTheme(
  code?: number,
  conditionLabel?: string
): WeatherVideoTheme {
  if (code !== undefined) {
    if (code >= 51) return "rainy"
    if (code === 2 || code === 3 || code === 45 || code === 48) return "cloudy"
    return "sunny"
  }
  const str = (conditionLabel ?? "").toLowerCase()
  if (
    str.includes("rain") ||
    str.includes("shower") ||
    str.includes("drizzle") ||
    str.includes("storm")
  ) {
    return "rainy"
  }
  if (
    str.includes("cloud") ||
    str.includes("overcast") ||
    str.includes("fog")
  ) {
    return "cloudy"
  }
  return "sunny"
}

export function IrigaLivelySections() {
  const snapshot = useCivicStore((state) => state.snapshot)
  const profile = snapshot.cityProfile
  const geo = profile.geo
  const weatherBaseline = profile.weatherBaseline
  const fbChannel =
    snapshot.officialChannels.find((c) => c.platform === "Facebook Page") ??
    snapshot.officialChannels[1]

  const [weather, setWeather] = React.useState<WeatherSnapshot>({
    temperatureC: weatherBaseline.temperatureC,
    conditionLabel: weatherBaseline.conditionLabel,
    humidityPct: weatherBaseline.humidityPct,
    windKmh: weatherBaseline.windKmh,
    isLive: false,
    hourly: weatherBaseline.hourly,
  })
  const [refreshingWeather, setRefreshingWeather] = React.useState(false)

  const weatherTheme = resolveWeatherTheme(
    weather.weatherCode,
    weather.conditionLabel
  )
  const currentVideo = WEATHER_VIDEO_ASSETS[weatherTheme]
  const videoRef = React.useRef<HTMLVideoElement>(null)

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {})
      }
    }
  }, [weatherTheme])

  const fetchLiveWeather = React.useCallback(async () => {
    setRefreshingWeather(true)
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&forecast_days=1&timezone=Asia%2FManila`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Weather fetch failed")
      const data = await res.json()
      if (data?.current) {
        const tempC = Math.round(Number(data.current.temperature_2m))
        const humidity = Math.round(Number(data.current.relative_humidity_2m))
        const wind = Math.round(Number(data.current.wind_speed_10m))
        const wCode = Number(data.current.weather_code ?? 0)

        const hourlyItems: WeatherSnapshot["hourly"] = []
        const times: string[] = data?.hourly?.time ?? []
        const temps: number[] = data?.hourly?.temperature_2m ?? []
        const codes: number[] = data?.hourly?.weather_code ?? []
        const targetHours = [9, 12, 15, 18]

        for (const hr of targetHours) {
          const idx = hr < times.length ? hr : 0
          const tVal = Math.round(Number(temps[idx] ?? tempC))
          const cVal = Number(codes[idx] ?? 1)
          const label =
            hr === 12 ? "12 PM" : hr > 12 ? `${hr - 12} PM` : `${hr} AM`
          hourlyItems.push({
            timeLabel: label,
            tempC: Number.isNaN(tVal) ? 29 : tVal,
            isRainy: cVal >= 51,
          })
        }

        setWeather({
          temperatureC: Number.isNaN(tempC) ? 31 : tempC,
          conditionLabel:
            wCode >= 51 ? "Tropical Showers" : wCode >= 2 ? "Partly Cloudy" : "Mainly Clear",
          humidityPct: Number.isNaN(humidity) ? 78 : humidity,
          windKmh: Number.isNaN(wind) ? 14 : wind,
          isLive: true,
          weatherCode: wCode,
          hourly: hourlyItems.length > 0 ? hourlyItems : weatherBaseline.hourly,
        })
      }
    } catch {
      // Keep baseline on error
    } finally {
      setRefreshingWeather(false)
    }
  }, [geo.latitude, geo.longitude, weatherBaseline.hourly])

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchLiveWeather()
    }, 1500)
    return () => window.clearTimeout(timer)
  }, [fetchLiveWeather])

  return (
    <div className="space-y-16">
      {/* 1. Weather Today & Interactive Map of Iriga City (Full-Width Atmospheric Live Video Section) */}
      <Reveal>
        <section
          id="weather-map"
          className="relative scroll-mt-24 overflow-hidden rounded-3xl border border-blue-900/30 bg-slate-950 p-4 sm:p-6 lg:p-8 shadow-2xl text-white"
        >
          {/* Maxxed Out Background Live Weather Video covering the entire section */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <video
              ref={videoRef}
              key={weatherTheme}
              autoPlay
              loop
              muted
              playsInline
              poster={currentVideo.poster}
              className="h-full w-full object-cover object-center scale-105 transition-opacity duration-700 motion-reduce:hidden"
            >
              <source src={currentVideo.mp4} type="video/mp4" />
              <source src={currentVideo.webm} type="video/webm" />
            </video>
            {/* Fallback image for prefers-reduced-motion */}
            <div
              className="hidden h-full w-full bg-cover bg-center opacity-70 motion-reduce:block"
              style={{ backgroundImage: `url(${currentVideo.poster})` }}
            />
            {/* Ambient Dark Scrim so live weather video is VIVIDLY VISIBLE while keeping text contrast high */}
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[0.5px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-slate-950/60" />
          </div>

          {/* Foreground Section Content (z-10 relative) */}
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col justify-between gap-2 border-b border-white/15 pb-4 sm:flex-row sm:items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 backdrop-blur-md">
                  <span className="size-2 rounded-full bg-blue-400 animate-pulse" />
                  Real-Time Rinconada Weather & Geography
                </span>
                <h2 className="mt-2 flex items-center gap-2 text-2xl font-extrabold text-white sm:text-3xl">
                  <Compass className="size-6 text-blue-400" />
                  Weather Today & Interactive Map of Iriga City
                </h2>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-md">
                <a
                  href={geo.osmLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-1.5"
                >
                  Open Full Map on OpenStreetMap
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Column: Weather Today Card (Translucent Glassmorphism) */}
              <Card className="flex flex-col justify-between border-white/15 bg-slate-900/80 backdrop-blur-md p-6 text-white shadow-xl lg:col-span-5 min-h-[460px] rounded-2xl">
                <div className="flex flex-col justify-between h-full space-y-5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                        <MapPin className="size-3.5 text-amber-300" />
                        Iriga City, Camarines Sur
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {currentVideo.label}
                        </span>
                        <button
                          type="button"
                          onClick={fetchLiveWeather}
                          aria-label="Refresh Iriga weather"
                          className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-white/25 backdrop-blur-xs"
                        >
                          <RefreshCw
                            className={`size-3 ${refreshingWeather ? "animate-spin" : ""}`}
                          />
                          {weather.isLive ? "Updated Today" : "Rinconada Weather"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                      <div className="flex size-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md shadow-xs">
                        {weatherTheme === "rainy" ? (
                          <CloudRain className="size-10 text-sky-300" />
                        ) : weatherTheme === "cloudy" ? (
                          <CloudSun className="size-10 text-amber-300" />
                        ) : (
                          <Sun className="size-10 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                          {weather.temperatureC}°C
                        </div>
                        <p className="mt-0.5 text-sm font-medium text-blue-100 flex items-center gap-1.5">
                          {weather.conditionLabel}
                          <span className="text-[11px] text-blue-200/80">• Live Video</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-white/10 p-3.5 text-xs backdrop-blur-xs border border-white/10">
                      <div className="flex items-center gap-2">
                        <Droplets className="size-4 text-sky-300" />
                        <div>
                          <p className="text-blue-200">Humidity</p>
                          <p className="font-mono text-sm font-bold">
                            {weather.humidityPct}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="size-4 text-emerald-300" />
                        <div>
                          <p className="text-blue-200">Wind Speed</p>
                          <p className="font-mono text-sm font-bold">
                            {weather.windKmh} km/h
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hourly Forecast Strip */}
                    <div className="mt-5">
                      <p className="mb-2 text-[11px] font-semibold tracking-wider text-blue-200 uppercase">
                        Today&apos;s Iriga Forecast (PHT)
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {weather.hourly.map((slot) => (
                          <div
                            key={slot.timeLabel}
                            className="flex flex-col items-center rounded-xl bg-white/10 px-2 py-2.5 text-center border border-white/5"
                          >
                            <span className="text-[11px] text-blue-100">
                              {slot.timeLabel}
                            </span>
                            {slot.isRainy ? (
                              <CloudRain className="my-1.5 size-4 text-sky-300" />
                            ) : (
                              <Sun className="my-1.5 size-4 text-amber-300" />
                            )}
                            <span className="font-mono text-xs font-bold">
                              {slot.tempC}°C
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-white/15 pt-3 text-[11px] text-blue-100">
                    <p>
                      <strong>CDRRMO 24/7 Weather & Flood Hotline:</strong>{" "}
                      <a
                        href="tel:+63542999918"
                        className="font-mono font-bold text-amber-300 underline"
                      >
                        (054) 299 9918
                      </a>{" "}
                      •{" "}
                      <a
                        href="tel:+639216364018"
                        className="font-mono font-bold text-amber-300 underline"
                      >
                        0921 636 4018
                      </a>
                    </p>
                  </div>
                </div>
              </Card>

              {/* Right Column: Interactive OpenStreetMap of Iriga City (Translucent Glassmorphism) */}
              <Card className="flex flex-col justify-between border-white/15 bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 text-white shadow-xl lg:col-span-7 rounded-2xl">
                <div className="overflow-hidden rounded-xl border border-white/15 bg-slate-950/60 shadow-inner">
                  <iframe
                    src={geo.osmEmbedUrl}
                    title="Interactive Map of Iriga City, Camarines Sur"
                    loading="lazy"
                    className="h-72 w-full border-0 sm:h-80"
                    aria-label="OpenStreetMap showing Iriga City Hall and Mt. Iriga in Camarines Sur"
                  />
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-100">
                      <MapPin className="size-4 text-blue-400" />
                      {profile.cityHallAddress}
                    </span>
                    <Badge variant="outline" className="border-white/20 bg-white/10 text-slate-200 font-mono text-[11px]">
                      {geo.latitude}°N, {geo.longitude}°E • ZIP {geo.postalCode}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {geo.landmarks.map((landmark) => (
                      <Badge
                        key={landmark}
                        variant="secondary"
                        className="gap-1 font-medium text-[11px] border-white/10 bg-white/10 text-slate-200 hover:bg-white/20"
                      >
                        <Mountain className="size-3 text-emerald-400" />
                        {landmark}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </Reveal>

      {/* 2. Brief History of Iriga City Timeline (Natural Standalone Cards) */}
      <Reveal delayMs={60}>
        <section id="history" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col justify-between gap-2 border-b border-border/80 pb-4 sm:flex-row sm:items-center">
            <div>
              <Badge variant="secondary" className="font-semibold text-amber-800 dark:text-amber-400">
                From &ldquo;I-raga&rdquo; (1578) to the City of Crystal Clear Springs
              </Badge>
              <h2 className="mt-1.5 flex items-center gap-2 text-2xl font-extrabold text-foreground sm:text-3xl">
                <BookOpen className="size-6 text-amber-600 dark:text-amber-400" />
                Brief History of Iriga City
              </h2>
            </div>
            <CitationBadge citation={profile.citation} compact />
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Timeline Column */}
            <div className="relative space-y-4 border-l-2 border-blue-600/30 pl-6 lg:col-span-8">
              {profile.historyTimeline.map((item) => (
                <Card
                  key={item.year}
                  className="civic-card-hover group relative border-border bg-card p-4 shadow-2xs transition-all hover:border-blue-500"
                >
                  <span className="absolute top-5 -left-[31px] size-3.5 rounded-full border-2 border-blue-600 bg-background transition group-hover:scale-125 group-hover:bg-blue-600" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default" className="bg-blue-600 text-white font-mono text-xs font-bold">
                      {item.year}
                    </Badge>
                    <h3 className="text-sm font-bold text-foreground sm:text-base">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {item.description}
                  </p>
                </Card>
              ))}
            </div>

            {/* Cultural & Geographic Highlights Column */}
            <div className="space-y-4 lg:col-span-4">
              {profile.historyHighlights.map((card) => (
                <Card
                  key={card.title}
                  className="civic-card-hover border-border bg-card p-5 shadow-2xs"
                >
                  <h3 className="text-sm font-bold text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                </Card>
              ))}

              <Card className="border-blue-200/80 bg-blue-50/60 p-5 text-xs text-blue-950 shadow-xs dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
                <p className="font-bold text-sm">
                  Patron Saint & Annual Festivities
                </p>
                <p className="mt-2 text-blue-900/90 dark:text-blue-200">
                  • <strong>Fiesta:</strong> {profile.patronSaintFiesta}
                </p>
                <p className="mt-1 text-blue-900/90 dark:text-blue-200">
                  • <strong>Cultural Festival:</strong> {profile.majorFestival}
                </p>
                <Button asChild variant="link" size="sm" className="mt-2 p-0 h-auto font-bold text-blue-700 dark:text-blue-300">
                  <Link href="/about" className="gap-1">
                    Read Full City Profile & Sources
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </Card>
            </div>
          </div>
        </section>
      </Reveal>

      {/* 3. Live Official LGU Iriga Facebook Page Embed Section */}
      <Reveal delayMs={90}>
        <section id="facebook-updates" className="scroll-mt-24 space-y-6">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            {/* Left Intro */}
            <div className="space-y-4 lg:col-span-6">
              <Badge variant="default" className="bg-blue-600 text-white gap-1.5">
                <FacebookLogo className="size-3.5" />
                Official Facebook Page • {fbChannel.handleOrDomain}
              </Badge>

              <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Real-Time Advisories, Straight from Lungsod ng Iriga
              </h2>

              <p className="text-sm leading-relaxed text-muted-foreground">
                Follow the official{" "}
                <strong>{fbChannel.name}</strong> operated by the Iriga City
                Public Information Office (PIO) for real-time weather/suspension
                advisories, executive orders, medical missions, and public
                service announcements as they happen.
              </p>

              <ul className="space-y-2.5 text-xs font-medium text-foreground/90 sm:text-sm">
                <li className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300">
                    <Megaphone className="size-4" />
                  </span>
                  Official City Hall advisories, class/work suspensions & executive orders
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300">
                    <Calendar className="size-4" />
                  </span>
                  Tinagba Festival, PESO job fairs, CSWDO payouts & barangay caravans
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-amber-600/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300">
                    <Radio className="size-4" />
                  </span>
                  Posted in real time by the Iriga City Public Information Office ((054) 299 9903)
                </li>
              </ul>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs">
                  <a
                    href={fbChannel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <FacebookLogo className="size-4" />
                    Visit facebook.com/irigacitygovt
                    <ExternalLink className="size-3.5" />
                  </a>
                </Button>

                <Button asChild variant="outline" className="rounded-xl">
                  <Link href="/freedom-wall" className="gap-1.5">
                    Post on Irigueño Freedom Wall
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>

              <CitationBadge citation={fbChannel.citation} compact />
            </div>

            {/* Right Live Facebook Page Hub (Without Preview Timeline, with Official Profile Avatar) */}
            <div className="flex w-full max-w-full flex-col items-center lg:col-span-6">
              <Card className="w-full max-w-full border-blue-200/90 bg-card p-5 shadow-xs sm:max-w-[500px] dark:border-blue-900/60">
                {/* Page Header */}
                <div className="flex items-center gap-3.5 border-b border-border/80 pb-4">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-blue-600/30 bg-muted shadow-xs">
                    <Image
                      src="/iriga-facebook-profile.jpg"
                      alt="Lungsod ng Iriga Official Facebook Profile"
                      width={48}
                      height={48}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate font-bold text-foreground">
                        Lungsod ng Iriga
                      </h3>
                      <FacebookVerifiedBadge className="size-4" title="Verified City Hall Facebook Page" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {fbChannel.handleOrDomain} • Official Government Channel
                    </p>
                  </div>
                </div>

                {/* Highlights */}
                <div className="my-4 space-y-2.5 rounded-xl bg-blue-50/70 p-3.5 text-xs text-blue-950 dark:bg-blue-950/30 dark:text-blue-200">
                  <div className="flex items-start gap-2">
                    <Megaphone className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <p className="leading-relaxed">
                      Official announcements, typhoon bulletins, class suspensions, and community welfare advisories published directly by the City Public Information Office.
                    </p>
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="space-y-2 pt-1">
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs font-semibold">
                    <a
                      href={fbChannel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <FacebookLogo className="size-4" />
                      Open @irigacitygovt on Facebook
                      <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                </div>

                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Fast-loading civic mode active • Direct connection to official Facebook updates
                </p>
              </Card>

              <p className="mt-2 text-center text-xs text-muted-foreground">
                Follow advisories in real time:{" "}
                <a
                  href={fbChannel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 underline dark:text-blue-400"
                >
                  Open @irigacitygovt directly on Facebook →
                </a>
              </p>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  )
}
