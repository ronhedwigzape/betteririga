import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SiteHeader } from "@/components/civic/site-header"
import { SiteFooter } from "@/components/civic/site-footer"
import { getRootMetadata, getCivicSnapshot } from "@/lib/data/iriga-data"

const VolunteerModal = dynamic(() =>
  import("@/components/civic/volunteer-modal").then((mod) => mod.VolunteerModal)
)

export const metadata: Metadata = {
  metadataBase: new URL("https://betteririga.org"),
  ...getRootMetadata(),
  icons: {
    icon: "/icon.jpg",
    apple: "/apple-icon.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const snapshot = getCivicSnapshot()
  const headerData = {
    brand: snapshot.siteContent.brand,
    navItems: snapshot.siteContent.navigation,
    transparencyPortals: snapshot.siteContent.transparencyPortals ?? [],
    primaryHotlines: snapshot.emergencyHotlines.slice(0, 6),
    weatherBaseline: snapshot.cityProfile.weatherBaseline,
    geo: snapshot.cityProfile.geo,
    officialWebsite:
      snapshot.officialChannels.find((c) => c.platform === "Official Website")
        ?.url ?? "https://iriga.gov.ph",
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="antialiased font-sans"
    >
      <head>
        <link rel="preconnect" href="https://api.open-meteo.com" />
        <link rel="preconnect" href="https://psgc.gitlab.io" />
      </head>
      <body className="flex min-h-svh flex-col bg-background text-foreground">
        <ThemeProvider>
          <TooltipProvider delayDuration={150}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-white"
            >
              Skip to main content
            </a>
            <SiteHeader initialData={headerData} />
            <VolunteerModal
              brand={snapshot.siteContent.brand}
              modalCopy={snapshot.siteContent.volunteerModal}
            />
            <main id="main-content" className="min-w-0 w-full flex-1 overflow-x-clip">
              {children}
            </main>
            <SiteFooter />
            <Analytics />
            <SpeedInsights />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
