"use client"

import * as React from "react"
import Link from "next/link"
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
  CheckCircle2,
  X,
} from "lucide-react"
import { useCivicStore } from "@/lib/store/civic-store"
import { CitationBadge } from "@/components/civic/citation-badge"
import { FacebookLogo } from "@/components/civic/telecom-and-channel-icons"
import { Reveal } from "@/components/civic/reveal"

interface WeatherSnapshot {
  temperatureC: number
  conditionLabel: string
  humidityPct: number
  windKmh: number
  isLive: boolean
  hourly: Array<{
    timeLabel: string
    tempC: number
    isRainy: boolean
  }>
}

function describeWeatherCode(code: number): string {
  if (code === 0) return "Clear Sky"
  if (code === 1 || code === 2) return "Partly Cloudy"
  if (code === 3) return "Overcast"
  if (code >= 45 && code <= 48) return "Misty / Foggy"
  if (code >= 51 && code <= 67) return "Light to Moderate Rain"
  if (code >= 80 && code <= 82) return "Tropical Rain Showers"
  if (code >= 95) return "Thunderstorm Advisory"
  return "Warm Tropical Breeze"
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
  const [showFbEmbed, setShowFbEmbed] = React.useState(false)

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
        const code = Number(data.current.weather_code ?? 1)

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
          temperatureC: Number.isNaN(tempC)
            ? weatherBaseline.temperatureC
            : tempC,
          conditionLabel: describeWeatherCode(code),
          humidityPct: Number.isNaN(humidity)
            ? weatherBaseline.humidityPct
            : humidity,
          windKmh: Number.isNaN(wind) ? weatherBaseline.windKmh : wind,
          isLive: true,
          hourly:
            hourlyItems.length === 4 ? hourlyItems : weatherBaseline.hourly,
        })
      }
    } catch {
      // Keep clean fallback
    } finally {
      setRefreshingWeather(false)
    }
  }, [geo.latitude, geo.longitude, weatherBaseline])

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchLiveWeather()
    }, 50)
    return () => window.clearTimeout(timer)
  }, [fetchLiveWeather])

  return (
    <div className="space-y-14">
      {/* 1. Weather Today & Interactive Map of Iriga City */}
      <Reveal>
        <section
          id="weather-map"
          className="scroll-mt-24 rounded-3xl border border-border bg-card p-6 shadow-xs sm:p-8"
        >
          <div className="flex flex-col justify-between gap-2 border-b border-border pb-4 sm:flex-row sm:items-center">
            <div>
              <span className="text-xs font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                Real-Time Rinconada Weather & Geography
              </span>
              <h2 className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-foreground">
                <Compass className="size-6 text-blue-600 dark:text-blue-400" />
                Weather Today & Interactive Map of Iriga City
              </h2>
            </div>
            <a
              href={geo.osmLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Open Full Map on OpenStreetMap
              <ExternalLink className="size-3.5" />
            </a>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-12">
            {/* Left Column: Weather Today Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-6 text-white shadow-md lg:col-span-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    <MapPin className="size-3.5 text-amber-300" />
                    Iriga City, Camarines Sur
                  </span>
                  <button
                    type="button"
                    onClick={fetchLiveWeather}
                    aria-label="Refresh Iriga weather"
                    className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium transition hover:bg-white/25"
                  >
                    <RefreshCw
                      className={`size-3 ${refreshingWeather ? "animate-spin" : ""}`}
                    />
                    {weather.isLive ? "Updated Today" : "Rinconada Weather"}
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-xs">
                    <CloudSun className="size-10 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                      {weather.temperatureC}°C
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-blue-100">
                      {weather.conditionLabel}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-white/10 p-3.5 text-xs backdrop-blur-xs">
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
                        className="flex flex-col items-center rounded-xl bg-white/10 px-2 py-2.5 text-center"
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

            {/* Right Column: Interactive OpenStreetMap of Iriga City */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-muted/20 p-4 lg:col-span-7">
              <div className="overflow-hidden rounded-xl border border-border bg-muted">
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
                  <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                    <MapPin className="size-4 text-blue-600 dark:text-blue-400" />
                    {profile.cityHallAddress}
                  </span>
                  <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {geo.latitude}°N, {geo.longitude}°E • ZIP {geo.postalCode}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {geo.landmarks.map((landmark) => (
                    <span
                      key={landmark}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      <Mountain className="size-3 text-emerald-600 dark:text-emerald-400" />
                      {landmark}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* 2. Brief History of Iriga City Timeline (BetterSolano-style) */}
      <Reveal delayMs={60}>
        <section
          id="history"
          className="scroll-mt-24 rounded-3xl border border-border bg-gradient-to-b from-amber-50/50 via-card to-card p-6 shadow-xs sm:p-8 dark:from-amber-950/15"
        >
          <div className="flex flex-col justify-between gap-2 border-b border-border pb-4 sm:flex-row sm:items-center">
            <div>
              <span className="text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-400">
                From &ldquo;I-raga&rdquo; (1578) to the City of Crystal Clear Springs
              </span>
              <h2 className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-foreground">
                <BookOpen className="size-6 text-amber-600 dark:text-amber-400" />
                Brief History of Iriga City
              </h2>
            </div>
            <CitationBadge citation={profile.citation} compact />
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-12">
            {/* Timeline Column */}
            <div className="relative space-y-4 border-l-2 border-blue-600/30 pl-6 lg:col-span-8">
              {profile.historyTimeline.map((item) => (
                <div
                  key={item.year}
                  className="civic-card-hover group relative rounded-2xl border border-border bg-background p-4 shadow-2xs transition hover:border-blue-500"
                >
                  <span className="absolute top-5 -left-[31px] size-3.5 rounded-full border-2 border-blue-600 bg-background transition group-hover:scale-125 group-hover:bg-blue-600" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-600 px-3 py-0.5 font-mono text-xs font-bold text-white">
                      {item.year}
                    </span>
                    <h3 className="text-sm font-bold text-foreground sm:text-base">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Cultural & Geographic Highlights Column */}
            <div className="space-y-4 lg:col-span-4">
              {profile.historyHighlights.map((card) => (
                <div
                  key={card.title}
                  className="civic-card-hover rounded-2xl border border-border bg-background p-5 shadow-2xs"
                >
                  <h3 className="text-sm font-bold text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              ))}

              <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 text-xs text-blue-950 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-100">
                <p className="font-bold">
                  Patron Saint & Annual Festivities
                </p>
                <p className="mt-1 text-blue-900/90 dark:text-blue-200">
                  • <strong>Fiesta:</strong> {profile.patronSaintFiesta}
                </p>
                <p className="mt-1 text-blue-900/90 dark:text-blue-200">
                  • <strong>Cultural Festival:</strong> {profile.majorFestival}
                </p>
                <Link
                  href="/about"
                  className="mt-3 inline-flex items-center gap-1 font-bold text-blue-700 underline dark:text-blue-300"
                >
                  Read Full City Profile & Sources
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* 3. Live Official LGU Iriga Facebook Page Embed Section */}
      <Reveal delayMs={90}>
        <section
          id="facebook-updates"
          className="scroll-mt-24 rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-card to-card p-6 shadow-xs sm:p-8 dark:border-blue-900/50 dark:from-blue-950/25"
        >
          <div className="grid items-center gap-8 lg:grid-cols-12">
            {/* Left Intro */}
            <div className="space-y-4 lg:col-span-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                <FacebookLogo className="size-3.5" />
                Official Facebook Page • {fbChannel.handleOrDomain}
              </span>

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
                <a
                  href={fbChannel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500"
                >
                  <FacebookLogo className="size-4" />
                  Visit facebook.com/irigacitygovt
                  <ExternalLink className="size-3.5" />
                </a>

                <Link
                  href="/freedom-wall"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground transition hover:bg-muted"
                >
                  Post on Irigueño Freedom Wall
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <CitationBadge citation={fbChannel.citation} compact />
            </div>

            {/* Right Live Facebook Page Hub & Opt-in Embed */}
            <div className="flex w-full max-w-full flex-col items-center lg:col-span-6">
              {!showFbEmbed ? (
                <div className="w-full max-w-full rounded-2xl border border-blue-200/90 bg-card p-5 shadow-md sm:max-w-[500px] dark:border-blue-900/60">
                  {/* Page Header */}
                  <div className="flex items-center gap-3.5 border-b border-border pb-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                      <FacebookLogo className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate font-bold text-foreground">
                          Lungsod ng Iriga
                        </h3>
                        <span
                          className="inline-flex size-4 items-center justify-center rounded-full bg-blue-600 text-white"
                          title="Verified City Hall Page"
                        >
                          <CheckCircle2 className="size-3" />
                        </span>
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

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <a
                      href={fbChannel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500"
                    >
                      <FacebookLogo className="size-4" />
                      Open @irigacitygovt on Facebook
                      <ExternalLink className="size-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setShowFbEmbed(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                    >
                      Preview Interactive Timeline
                    </button>
                  </div>

                  <p className="mt-3 text-center text-[11px] text-muted-foreground">
                    Fast-loading civic mode active • Zero third-party tracking scripts until previewed
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-full overflow-hidden rounded-2xl border border-border bg-white p-2 shadow-md sm:max-w-[500px]">
                  <div className="mb-2 flex items-center justify-between border-b border-border/80 px-2 pb-2">
                    <span className="text-xs font-semibold text-slate-800">
                      Live Facebook Timeline Preview
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowFbEmbed(false)}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                    >
                      <X className="size-3" />
                      Close Preview
                    </button>
                  </div>
                  <iframe
                    src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Firigacitygovt&tabs=timeline&width=500&height=520&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true"
                    width="100%"
                    height="520"
                    loading="lazy"
                    style={{ border: "none", overflow: "hidden" }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    title="Lungsod ng Iriga | Iriga City Official Facebook Page — Live Timeline"
                    className="mx-auto h-[480px] w-full max-w-full sm:h-[520px]"
                  />
                </div>
              )}
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Having trouble viewing the Facebook feed in your browser?{" "}
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
