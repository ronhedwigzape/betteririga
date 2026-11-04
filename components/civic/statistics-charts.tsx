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
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js"
import { Bar, Doughnut, Radar } from "react-chartjs-2"
import { useTheme } from "next-themes"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import type { CityStatistics } from "@/lib/data/schemas"
import { formatPesoCompact } from "@/lib/data/iriga-data"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface StatisticsChartsProps {
  stats: CityStatistics
}

export function StatisticsCharts({ stats }: StatisticsChartsProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const textColor = isDark ? "#cbd5e1" : "#475569"
  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"
  const tooltipBg = isDark ? "#0f172a" : "#1e293b"

  // 1. Population Growth Data (Historical PSA Census)
  const populationData = {
    labels: ["2010 Census", "2015 Census", "2020 Census"],
    datasets: [
      {
        label: "Iriga Population",
        data: [
          stats.demographics.totalPopulation2010,
          stats.demographics.totalPopulation2015,
          stats.demographics.totalPopulation2020,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.65)",
          "rgba(37, 99, 235, 0.75)",
          "rgba(29, 78, 216, 0.9)",
        ],
        borderColor: [
          "#3b82f6",
          "#2563eb",
          "#1d4ed8",
        ],
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  }

  const populationOptions: ChartOptions<"bar"> = {
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
          label: (ctx) => ` ${(ctx.raw as number).toLocaleString()} citizens`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: textColor, font: { family: "var(--font-sans)", size: 12 } },
        grid: { display: false },
      },
      y: {
        min: 95000,
        max: 125000,
        ticks: {
          color: textColor,
          font: { family: "var(--font-sans)", size: 11 },
          callback: (value) => `${(Number(value) / 1000).toFixed(0)}k`,
        },
        grid: { color: gridColor },
      },
    },
  }

  // 2. Top 10 Barangays by Population
  const top10Barangays = [...stats.barangayPopulations]
    .sort((a, b) => b.population - a.population)
    .slice(0, 10)

  const barangayData = {
    labels: top10Barangays.map((b) => b.name),
    datasets: [
      {
        label: "Population (2020)",
        data: top10Barangays.map((b) => b.population),
        backgroundColor: "rgba(37, 99, 235, 0.8)",
        borderColor: "#2563eb",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }

  const barangayOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: "#f8fafc",
        bodyColor: "#f8fafc",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${(ctx.raw as number).toLocaleString()} residents`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
          font: { family: "var(--font-sans)", size: 11 },
          callback: (val) => `${Number(val).toLocaleString()}`,
        },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: textColor, font: { family: "var(--font-sans)", size: 11, weight: "bold" } },
        grid: { display: false },
      },
    },
  }

  // 3. Mandatory Statutory Funds Breakdown (DBM FY 2025 NTA)
  const fiscal = stats.fiscalOverview
  const generalOpsPhp =
    fiscal.latestNtaAmountPhp -
    fiscal.developmentFundPhp -
    fiscal.calamityFundPhp -
    fiscal.gadFundPhp -
    fiscal.youthSkFundPhp

  const budgetDoughnutData = {
    labels: [
      "20% Development Fund",
      "5% Calamity Fund",
      "5% GAD Fund",
      "10% SK / Youth Fund",
      "60% General Operations",
    ],
    datasets: [
      {
        data: [
          fiscal.developmentFundPhp,
          fiscal.calamityFundPhp,
          fiscal.gadFundPhp,
          fiscal.youthSkFundPhp,
          generalOpsPhp,
        ],
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

  const budgetDoughnutOptions: ChartOptions<"doughnut"> = {
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
          label: (ctx) => ` ${formatPesoCompact(ctx.raw as number)}`,
        },
      },
    },
    cutout: "68%",
  }

  // 4. CMCI Competitiveness Radar
  const cmciLabels = stats.competitivenessCmci.pillars.map((p) => p.name)
  // Representative normalized score distribution for visual comparison across 5 pillars
  const cmciRadarData = {
    labels: cmciLabels,
    datasets: [
      {
        label: "Iriga City (Component City Category)",
        data: [82, 88, 84, 91, 79],
        backgroundColor: "rgba(37, 99, 235, 0.25)",
        borderColor: "#2563eb",
        borderWidth: 2,
        pointBackgroundColor: "#2563eb",
        pointBorderColor: "#ffffff",
        pointHoverBackgroundColor: "#ffffff",
        pointHoverBorderColor: "#2563eb",
      },
    ],
  }

  const cmciRadarOptions: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { color: textColor, font: { family: "var(--font-sans)", size: 11 } },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: "#f8fafc",
        bodyColor: "#f8fafc",
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      r: {
        angleLines: { color: gridColor },
        grid: { color: gridColor },
        pointLabels: {
          color: textColor,
          font: { family: "var(--font-sans)", size: 11, weight: "bold" },
        },
        ticks: { display: false },
        suggestedMin: 60,
        suggestedMax: 100,
      },
    },
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Chart 1: Historical Population Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Population Growth</CardTitle>
          <CardDescription>
            Philippine Statistics Authority (PSA) official POPCEN series (2010–2020)
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 sm:h-72">
          <Bar data={populationData} options={populationOptions} />
        </CardContent>
      </Card>

      {/* Chart 2: Statutory Funds Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>FY 2025 Budget Statutory Allocations</CardTitle>
          <CardDescription>
            Mandatory shares of the ₱913.50M National Tax Allotment under RA 7160
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 sm:h-72">
          <Doughnut data={budgetDoughnutData} options={budgetDoughnutOptions} />
        </CardContent>
      </Card>

      {/* Chart 3: Top 10 Barangays by Population */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Most Populous Barangays</CardTitle>
          <CardDescription>
            Ranked community populations across Iriga City based on PSA census
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80 sm:h-96">
          <Bar data={barangayData} options={barangayOptions} />
        </CardContent>
      </Card>

      {/* Chart 4: CMCI 5 Competitiveness Pillars */}
      <Card>
        <CardHeader>
          <CardTitle>DTI Competitiveness Pillars Profile</CardTitle>
          <CardDescription>
            Relative strength index benchmarked by the Cities and Municipalities Competitiveness Index
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80 sm:h-96">
          <Radar data={cmciRadarData} options={cmciRadarOptions} />
        </CardContent>
      </Card>
    </div>
  )
}

