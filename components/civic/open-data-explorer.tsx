"use client"

import * as React from "react"
import {
  ExternalLink,
  Copy,
  Check,
  Globe,
  Database,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ApiEndpointItem {
  id: string
  label: string
  path: string
  description: string
  category: "betteririga" | "bettergov" | "psgc"
  method: "GET"
  primaryUrl: string
}

const ENDPOINTS: ApiEndpointItem[] = [
  // BetterGov.ph Upstream APIs
  {
    id: "bg-camsur-5th",
    label: "CamSur 5th District Budget API",
    path: "https://budget.bettergov.ph/api/v1/hgab/2027/districts/leg:camarines-sur:5th",
    description: "Multi-year funding history (2020–2027), representative records, and DPWH 5th DEO allocations.",
    category: "bettergov",
    method: "GET",
    primaryUrl: "https://budget.bettergov.ph/hgab/2027/districts/leg%3Acamarines-sur%3A5th",
  },
  {
    id: "bg-dpwh-projects",
    label: "House Bill 10858 Public Works API",
    path: "https://budget.bettergov.ph/api/v1/hgab/2027/datasets/dpwh/projects?q=Iriga",
    description: "Search and filter all FY 2027 NEP and House Bill named infrastructure works in Iriga City.",
    category: "bettergov",
    method: "GET",
    primaryUrl: "https://budget.bettergov.ph/hgab/2027/datasets/dpwh/projects?q=Iriga",
  },
  {
    id: "bg-gaa-search",
    label: "Enacted GAA National Budget API",
    path: "https://budget.bettergov.ph/api/v1/gaa/search?q=Iriga",
    description: "Enacted General Appropriations Act (GAA 2024–2026) line items implemented across national agencies.",
    category: "bettergov",
    method: "GET",
    primaryUrl: "https://budget.bettergov.ph/gaa?q=Iriga",
  },
  // PSGC Open API
  {
    id: "psgc-iriga",
    label: "PSA Philippine Standard Geographic Code API",
    path: "https://psgc.gitlab.io/api/cities/051716000/",
    description: "Official Philippine Statistics Authority REST directory for the City of Iriga (code 0501716000) and all 36 barangays.",
    category: "psgc",
    method: "GET",
    primaryUrl: "https://psgc.gitlab.io/api/cities/051716000/barangays/",
  },
  // BetterIriga Civic Data Endpoints
  {
    id: "bi-projects",
    label: "Local Projects & Programs API",
    path: "/api/civic-data/projects",
    description: "All 10 verified City Hall infrastructure projects and social programs with amounts and citations.",
    category: "betteririga",
    method: "GET",
    primaryUrl: "/api/civic-data/projects",
  },
  {
    id: "bi-bettergov",
    label: "BetterGov.ph DPWH 5th District Tracker API",
    path: "/api/civic-data/bettergov",
    description: "36 verified DPWH Camarines Sur 5th DEO contracts and GAA appropriations serving Iriga City.",
    category: "betteririga",
    method: "GET",
    primaryUrl: "/api/civic-data/bettergov",
  },
  {
    id: "bi-officials",
    label: "Elected & Appointed Officials API",
    path: "/api/civic-data/officials",
    description: "Mayor, Vice Mayor, 10 City Councilors, 17 Department Heads, and their official contact channels.",
    category: "betteririga",
    method: "GET",
    primaryUrl: "/api/civic-data/officials",
  },
  {
    id: "bi-barangays",
    label: "36 Barangays & Captains API",
    path: "/api/civic-data/barangays",
    description: "All 36 barangays of Iriga City with Punong Barangays, classifications, and primary citations.",
    category: "betteririga",
    method: "GET",
    primaryUrl: "/api/civic-data/barangays",
  },
  {
    id: "bi-budget",
    label: "National Tax Allotment & Budget Rules API",
    path: "/api/civic-data/budget",
    description: "FY 2022–2025 NTA series (₱913.50M in 2025), statutory funds (20% dev, 5% calamity, 5% GAD, 10% SK).",
    category: "betteririga",
    method: "GET",
    primaryUrl: "/api/civic-data/budget",
  },
  {
    id: "bi-services",
    label: "City Hall Services Directory API",
    path: "/api/civic-data/services",
    description: "14 step-by-step Citizen's Charter guides across civil registry, permits, taxes, and welfare.",
    category: "betteririga",
    method: "GET",
    primaryUrl: "/api/civic-data/services",
  },
  {
    id: "bi-ordinances",
    label: "City Ordinances & Resolutions API",
    path: "/api/civic-data/ordinances",
    description: "Sangguniang Panlungsod enacted laws, revenue codes, zoning plans, and citizen copies guides.",
    category: "betteririga",
    method: "GET",
    primaryUrl: "/api/civic-data/ordinances",
  },
  {
    id: "bi-contacts",
    label: "City Hall Offices & Phonebook API",
    path: "/api/civic-data/contacts",
    description: "29 City Hall department contacts, 24/7 emergency hotlines with telecom brand badges.",
    category: "betteririga",
    method: "GET",
    primaryUrl: "/api/civic-data/contacts",
  },
]

export function OpenDataExplorer() {
  const [selectedCategory, setSelectedCategory] = React.useState<
    "all" | "bettergov" | "psgc" | "betteririga"
  >("all")
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const filtered = ENDPOINTS.filter(
    (e) => selectedCategory === "all" || e.category === selectedCategory
  )

  const handleCopyCurl = (ep: ApiEndpointItem) => {
    const url = ep.path.startsWith("http")
      ? ep.path
      : `${window.location.origin}${ep.path}`
    const curl = `curl -s "${url}" | jq`
    navigator.clipboard.writeText(curl)
    setCopiedId(ep.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "rounded-xl px-4 py-2 text-xs font-bold transition",
            selectedCategory === "all"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          All Open APIs ({ENDPOINTS.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("bettergov")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition",
            selectedCategory === "bettergov"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <Globe className="size-3.5" />
          <span>BetterGov.ph APIs (3)</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("psgc")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition",
            selectedCategory === "psgc"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <Database className="size-3.5" />
          <span>PSA PSGC Geographic API (1)</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory("betteririga")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition",
            selectedCategory === "betteririga"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <Layers className="size-3.5" />
          <span>BetterIriga Civic REST Endpoints (8)</span>
        </button>
      </div>

      {/* Grid of Endpoints */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((ep) => (
          <div
            key={ep.id}
            className="civic-card-hover flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
                    ep.category === "bettergov"
                      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                      : ep.category === "psgc"
                        ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                        : "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200"
                  )}
                >
                  {ep.category === "bettergov"
                    ? "BetterGov.ph API"
                    : ep.category === "psgc"
                      ? "PSA PSGC Directory"
                      : "BetterIriga REST"}
                </span>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  {ep.method}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">
                  {ep.label}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {ep.description}
                </p>
              </div>

              {/* Endpoint Code Box */}
              <div className="flex items-center justify-between gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 py-2 text-xs">
                <code className="font-mono text-[11px] text-foreground truncate max-w-[280px] sm:max-w-md">
                  {ep.path}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopyCurl(ep)}
                  className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  title="Copy cURL command"
                >
                  {copiedId === ep.id ? (
                    <>
                      <Check className="size-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy cURL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Open Link */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <a
                href={ep.primaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
              >
                <span>Open Dedicated API / Portal</span>
                <ExternalLink className="size-3" />
              </a>
              <a
                href={ep.path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Raw JSON ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
