"use client"

import * as React from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import { Bar, Doughnut } from "react-chartjs-2"
import { useTheme } from "next-themes"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import type {
  NationalTaxAllotmentRecord,
  NationalBudgetConfig,
} from "@/lib/data/schemas"
import { formatPesoCompact } from "@/lib/data/iriga-data"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface BudgetChartsProps {
  ntaSeries: NationalTaxAllotmentRecord[]
  nationalBudget: NationalBudgetConfig
}

export function BudgetCharts({ ntaSeries, nationalBudget }: BudgetChartsProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const textColor = isDark ? "#cbd5e1" : "#475569"
  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"
  const tooltipBg = isDark ? "#0f172a" : "#1e293b"

  // 1. NTA Series sorted chronologically (2022 to 2025)
  const sortedNta = [...ntaSeries].sort((a, b) => a.fiscalYear - b.fiscalYear)

  const ntaChartData = {
    labels: sortedNta.map((item) => `FY ${item.fiscalYear}`),
    datasets: [
      {
        label: "NTA Allocation (PHP)",
        data: sortedNta.map((item) => item.amountPhp),
        backgroundColor: sortedNta.map((item) =>
          item.fiscalYear === 2025 ? "rgba(16, 185, 129, 0.85)" : "rgba(59, 130, 246, 0.75)"
        ),
        borderColor: sortedNta.map((item) =>
          item.fiscalYear === 2025 ? "#10b981" : "#3b82f6"
        ),
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  }

  const ntaChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: "#f8fafc",
        bodyColor: "#f8fafc",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${formatPesoCompact(ctx.raw as number)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: textColor, font: { family: "var(--font-sans)", size: 12, weight: "bold" } },
        grid: { display: false },
      },
      y: {
        min: 600000000,
        max: 1000000000,
        ticks: {
          color: textColor,
          font: { family: "var(--font-sans)", size: 11 },
          callback: (val) => `${(Number(val) / 1000000).toFixed(0)}M`,
        },
        grid: { color: gridColor },
      },
    },
  }

  // 2. Statutory Funds Breakdown for FY 2025 (₱913.50M)
  const latestNta =
    sortedNta.find((n) => n.fiscalYear === 2025) ??
    sortedNta[sortedNta.length - 1]
  const totalAmount = latestNta.amountPhp

  const devFund = totalAmount * 0.2
  const calamityFund = totalAmount * 0.05
  const gadFund = totalAmount * 0.05
  const skFund = totalAmount * 0.1
  const generalOps = totalAmount * 0.6

  const breakdownData = {
    labels: [
      "20% Development Fund",
      "5% Calamity / CDRRMO",
      "5% Gender & Development",
      "10% SK / Youth Fund",
      "60% General Operations",
    ],
    datasets: [
      {
        data: [devFund, calamityFund, gadFund, skFund, generalOps],
        backgroundColor: [
          "#059669", // Emerald
          "#d97706", // Amber
          "#7c3aed", // Purple
          "#2563eb", // Blue
          isDark ? "#334155" : "#94a3b8", // Slate
        ],
        borderColor: isDark ? "#0f172a" : "#ffffff",
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  }

  const breakdownOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: textColor,
          font: { family: "var(--font-sans)", size: 11 },
          padding: 14,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: "#f8fafc",
        bodyColor: "#f8fafc",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${formatPesoCompact(ctx.raw as number)} (${ctx.label?.split(" ")[0]})`,
        },
      },
    },
    cutout: "68%",
  }

  // 3. CamSur 5th District Appropriations Series (GAA National Budget)
  const districtYears = nationalBudget.camSur5thDistrictLedger.years
  const districtData = {
    labels: districtYears.map((y) => `FY ${y.fy} (${y.stageLabel})`),
    datasets: [
      {
        label: "National Public Works Allocation",
        data: districtYears.map((y) => y.amountPhp),
        backgroundColor: "rgba(37, 99, 235, 0.75)",
        borderColor: "#2563eb",
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  }

  const districtOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: "#f8fafc",
        bodyColor: "#f8fafc",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${formatPesoCompact(ctx.raw as number)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: textColor, font: { family: "var(--font-sans)", size: 12, weight: "bold" } },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: textColor,
          font: { family: "var(--font-sans)", size: 11 },
          callback: (val) => `${(Number(val) / 1000000000).toFixed(1)}B`,
        },
        grid: { color: gridColor },
      },
    },
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Chart 1: NTA Trend */}
      <Card>
        <CardHeader>
          <CardTitle>National Tax Allotment (NTA) Growth Trend</CardTitle>
          <CardDescription>
            Official DBM allocations received by Iriga City from FY 2022 to FY 2025
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 sm:h-72">
          <Bar data={ntaChartData} options={ntaChartOptions} />
        </CardContent>
      </Card>

      {/* Chart 2: Statutory Funds Doughnut */}
      <Card>
        <CardHeader>
          <CardTitle>FY 2025 Statutory Budget Composition</CardTitle>
          <CardDescription>
            Mandatory community funds allocation prescribed by the Local Government Code (RA 7160)
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 sm:h-72">
          <Doughnut data={breakdownData} options={breakdownOptions} />
        </CardContent>
      </Card>

      {/* Chart 3: CamSur 5th District National Public Works */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Camarines Sur 5th District National Appropriations (GAA Series)</CardTitle>
          <CardDescription>
            Tracked national infrastructure allocations implemented across Iriga City and the Rinconada district
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 sm:h-72">
          <Bar data={districtData} options={districtOptions} />
        </CardContent>
      </Card>
    </div>
  )
}
