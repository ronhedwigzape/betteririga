"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import type {
  NationalTaxAllotmentRecord,
  NationalBudgetConfig,
} from "@/lib/data/schemas"
import { Card, CardContent } from "@/components/ui/card"

function BudgetChartsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="animate-pulse border-border/70 bg-card">
        <CardContent className="h-64 sm:h-72 flex flex-col justify-center items-center gap-2 p-6">
          <div className="h-4 w-48 rounded bg-muted/70" />
          <div className="h-3 w-32 rounded bg-muted/50" />
          <div className="mt-4 h-36 w-full rounded-lg bg-muted/30" />
        </CardContent>
      </Card>
      <Card className="animate-pulse border-border/70 bg-card">
        <CardContent className="h-64 sm:h-72 flex flex-col justify-center items-center gap-2 p-6">
          <div className="h-4 w-48 rounded bg-muted/70" />
          <div className="h-3 w-32 rounded bg-muted/50" />
          <div className="mt-4 h-36 w-36 rounded-full bg-muted/30" />
        </CardContent>
      </Card>
      <Card className="md:col-span-2 animate-pulse border-border/70 bg-card">
        <CardContent className="h-64 sm:h-72 flex flex-col justify-center items-center gap-2 p-6">
          <div className="h-4 w-64 rounded bg-muted/70" />
          <div className="h-3 w-40 rounded bg-muted/50" />
          <div className="mt-4 h-36 w-full rounded-lg bg-muted/30" />
        </CardContent>
      </Card>
    </div>
  )
}

const BudgetCharts = dynamic(
  () => import("@/components/civic/budget-charts").then((mod) => mod.BudgetCharts),
  {
    ssr: false,
    loading: () => <BudgetChartsSkeleton />,
  }
)

export function BudgetChartsLazy({
  ntaSeries,
  nationalBudget,
}: {
  ntaSeries: NationalTaxAllotmentRecord[]
  nationalBudget: NationalBudgetConfig
}) {
  const [inView, setInView] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      const timer = setTimeout(() => setInView(true), 0)
      return () => clearTimeout(timer)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "500px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full">
      {inView ? (
        <BudgetCharts ntaSeries={ntaSeries} nationalBudget={nationalBudget} />
      ) : (
        <BudgetChartsSkeleton />
      )}
    </div>
  )
}
