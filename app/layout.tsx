import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/civic/site-header"
import { SiteFooter } from "@/components/civic/site-footer"
import { getRootMetadata } from "@/lib/data/iriga-data"
import { cn } from "@/lib/utils"

const VolunteerModal = dynamic(() =>
  import("@/components/civic/volunteer-modal").then((mod) => mod.VolunteerModal)
)

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL("https://betteririga.org"),
  ...getRootMetadata(),
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body className="flex min-h-svh flex-col bg-background text-foreground">
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-white"
          >
            Skip to main content
          </a>
          <SiteHeader />
          <VolunteerModal />
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-x-clip px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
            <main id="main-content" className="min-w-0 w-full flex-1">
              {children}
            </main>
          </div>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  )
}
