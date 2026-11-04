/**
 * BetterIriga.org — Deep Civic Repository, Zod Store Adapter & Verification Engine
 *
 * Implements:
 * - ADR-0001: BetterIriga is independent, not an official LGU channel
 * - ADR-0002: Curated, cited data files in the repo, served as a static site
 * - ADR-0003: Every Record is cited; Gaps are shown, never filled
 * - ADR-0004: Dedicated JSON Civic Data Store (data/*.json), Zod Schema Contract, API Adapter, and Dedicated Verification Ledger
 */

import type { Metadata } from "next"
import siteContentJson from "@/data/site-content.json"
import cityProfileJson from "@/data/city-profile.json"
import servicesJson from "@/data/services.json"
import officialsJson from "@/data/officials.json"
import barangaysJson from "@/data/barangays.json"
import budgetJson from "@/data/budget.json"
import projectsJson from "@/data/projects.json"
import betterGovJson from "@/data/bettergov.json"
import ordinancesJson from "@/data/ordinances.json"
import contactsJson from "@/data/contacts.json"
import freedomWallJson from "@/data/freedom-wall.json"
import sourcesJson from "@/data/sources.json"
import statisticsJson from "@/data/statistics.json"
import betterGovDatasetsJson from "@/data/bettergov-datasets.json"
import nationalBudgetJson from "@/data/national-budget.json"
import {
  CitationSchema,
  CivicDatasetSnapshotSchema,
  CityStatisticsSchema,
  NationalBudgetConfigSchema,
  BetterGovDatasetSchema,
  type AppointedOfficial,
  type BarangayRecord,
  type BetterGovRecord,
  type BetterGovDataset,
  type BrandLogos,
  type BrandLicense,
  type BudgetDisclosureItem,
  type CarrierRegistry,
  type Citation,
  type CityProfile,
  type CityStatistics,
  type CivicDatasetSnapshot,
  type CivicService,
  type DataSourceRecord,
  type DirectoryControls,
  type ElectedOfficial,
  type EmergencyHotline,
  type FreedomWallConfig,
  type HeroMedia,
  type LegislativeMeasure,
  type NationalTaxAllotmentRecord,
  type NationalBudgetConfig,
  type OfficeContact,
  type OfficialChannel,
  type OfficialTerm,
  type ProjectRecord,
  type SiteContent,
  type SiteMetadataConfig,
  type StatutoryAllocationRule,
  type TransparencyPortal,
} from "@/lib/data/schemas"

export * from "@/lib/data/schemas"

export interface SearchableCivicRecord {
  id: string
  title: string
  subtitle: string
  description: string
  section:
    | "services"
    | "officials"
    | "budget"
    | "projects"
    | "bettergov"
    | "ordinances"
    | "contacts"
    | "barangays"
  href: string
  badge: string
  hasGap: boolean
  recordDigest: string
  citation: Citation
}

export interface SectionVerificationStats {
  sectionId:
    | "site-content"
    | "city-profile"
    | "services"
    | "officials"
    | "barangays"
    | "budget"
    | "projects"
    | "bettergov"
    | "ordinances"
    | "contacts"
    | "freedom-wall"
    | "sources"
    | "bettergov-datasets"
    | "national-budget"
  label: string
  jsonFile: string
  apiEndpoint: string
  recordCount: number
  verifiedCount: number
  openGapCount: number
  sectionSha256: string
  primarySources: string[]
  lastRetrievedAt: string
}

export interface VerificationLedgerSummary {
  valid: boolean
  datasetSha256: string
  totalRecords: number
  fullyVerifiedRecords: number
  recordsWithOpenGaps: number
  uncitedRecords: number
  lastRetrievedAt: string
  psgcUpstreamUrl: string
  sections: SectionVerificationStats[]
}

export interface CivicDataStoreAdapter {
  loadSnapshot(): CivicDatasetSnapshot
}

export interface CivicRepository {
  getSnapshot(): CivicDatasetSnapshot
  validate(): {
    valid: boolean
    totalRecords: number
    datasetSha256: string
    errors: string[]
  }
  getVerificationLedger(): VerificationLedgerSummary
  search(
    query: string,
    sectionFilter?: SearchableCivicRecord["section"] | "all",
    verificationFilter?: "all" | "verified-only" | "open-gaps"
  ): SearchableCivicRecord[]
}

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
])

function rotr(n: number, x: number): number {
  return (x >>> n) | (x << (32 - n))
}

export function sha256Hex(input: string): string {
  const bytes = new TextEncoder().encode(input)
  const bitLen = bytes.length * 8
  const totalLen = (((bytes.length + 8) >> 6) + 1) << 6
  const padded = new Uint8Array(totalLen)
  padded.set(bytes)
  padded[bytes.length] = 0x80
  const view = new DataView(padded.buffer)
  view.setUint32(totalLen - 8, Math.floor(bitLen / 0x100000000), false)
  view.setUint32(totalLen - 4, bitLen >>> 0, false)

  let h0 = 0x6a09e667
  let h1 = 0xbb67ae85
  let h2 = 0x3c6ef372
  let h3 = 0xa54ff53a
  let h4 = 0x510e527f
  let h5 = 0x9b05688c
  let h6 = 0x1f83d9ab
  let h7 = 0x5be0cd19

  const w = new Uint32Array(64)

  for (let offset = 0; offset < totalLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false)
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3)
      const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10)
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0
    }

    let a = h0
    let b = h1
    let c = h2
    let d = h3
    let e = h4
    let f = h5
    let g = h6
    let h = h7

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e)
      const ch = (e & f) ^ (~e & g)
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (S0 + maj) >>> 0

      h = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }

    h0 = (h0 + a) >>> 0
    h1 = (h1 + b) >>> 0
    h2 = (h2 + c) >>> 0
    h3 = (h3 + d) >>> 0
    h4 = (h4 + e) >>> 0
    h5 = (h5 + f) >>> 0
    h6 = (h6 + g) >>> 0
    h7 = (h7 + h) >>> 0
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((n) => n.toString(16).padStart(8, "0"))
    .join("")
}

export function computeRecordDigest(record: unknown): string {
  return sha256Hex(JSON.stringify(record)).slice(0, 16)
}

/**
 * Default Zod-Validated JSON Store Adapter backed by `/data/*.json`.
 */
export const jsonStoreAdapter: CivicDataStoreAdapter = {
  loadSnapshot(): CivicDatasetSnapshot {
    const raw = {
      siteContent: siteContentJson,
      cityProfile: cityProfileJson,
      services: servicesJson,
      electedOfficials: officialsJson.electedOfficials,
      appointedOfficials: officialsJson.appointedOfficials,
      barangays: barangaysJson,
      nationalTaxAllotments: budgetJson.nationalTaxAllotments,
      statutoryAllocationRules: budgetJson.statutoryAllocationRules,
      budgetDisclosures: budgetJson.budgetDisclosures,
      projectsAndPrograms: projectsJson,
      betterGovRecords: betterGovJson,
      betterGovDatasets: betterGovDatasetsJson,
      nationalBudget: nationalBudgetJson,
      ordinancesAndResolutions: ordinancesJson,
      offices: contactsJson.offices,
      emergencyHotlines: contactsJson.emergencyHotlines,
      officialChannels: contactsJson.officialChannels,
      freedomWall: freedomWallJson,
      dataSources: sourcesJson,
      statistics: statisticsJson,
    }
    return CivicDatasetSnapshotSchema.parse(raw)
  },
}

export function validateCitation(
  citation: Citation,
  recordId = "unknown"
): void {
  const result = CitationSchema.safeParse(citation)
  if (!result.success) {
    const issueMessage = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")
    throw new Error(
      `Record "${recordId}" failed Zod Citation validation (${issueMessage}).`
    )
  }
}

export function createCivicRepository(
  adapter: CivicDataStoreAdapter = jsonStoreAdapter
): CivicRepository {
  const snapshot = adapter.loadSnapshot()

  function validate() {
    const errors: string[] = []
    let totalRecords = 0

    const schemaCheck = CivicDatasetSnapshotSchema.safeParse(snapshot)
    if (!schemaCheck.success) {
      for (const issue of schemaCheck.error.issues) {
        errors.push(`${issue.path.join(".")}: ${issue.message}`)
      }
    }

    const seenIds = new Set<string>()
    const check = (id: string, citation: Citation) => {
      totalRecords += 1
      if (seenIds.has(id)) {
        errors.push(`Duplicate Record ID "${id}" detected across dataset.`)
      }
      seenIds.add(id)
      try {
        validateCitation(citation, id)
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err))
      }
    }

    check("city-profile", snapshot.cityProfile.citation)
    for (const r of snapshot.services) check(r.id, r.citation)
    for (const r of snapshot.electedOfficials) check(r.id, r.citation)
    for (const r of snapshot.appointedOfficials) check(r.id, r.citation)
    for (const r of snapshot.barangays) check(r.id, r.citation)
    for (const r of snapshot.nationalTaxAllotments) check(r.id, r.citation)
    for (const r of snapshot.statutoryAllocationRules) check(r.id, r.citation)
    for (const r of snapshot.budgetDisclosures) check(r.id, r.citation)
    for (const r of snapshot.projectsAndPrograms) check(r.id, r.citation)
    for (const r of snapshot.betterGovRecords) check(r.id, r.citation)
    for (const r of snapshot.ordinancesAndResolutions) check(r.id, r.citation)
    for (const r of snapshot.offices) check(r.id, r.citation)
    for (const r of snapshot.emergencyHotlines) check(r.id, r.citation)
    for (const r of snapshot.officialChannels) check(r.id, r.citation)
    check("freedom-wall", snapshot.freedomWall.citation)
    for (const r of snapshot.dataSources) check(r.id, r.citation)
    if (snapshot.betterGovDatasets) {
      for (const r of snapshot.betterGovDatasets) {
        check(`bettergov-dataset-${r.id}`, r.citation)
      }
    }
    if (snapshot.nationalBudget) {
      check("national-budget", snapshot.nationalBudget.citation)
    }

    const datasetSha256 = sha256Hex(JSON.stringify(snapshot))

    return {
      valid: errors.length === 0,
      totalRecords,
      datasetSha256,
      errors,
    }
  }

  function getVerificationLedger(): VerificationLedgerSummary {
    const validation = validate()

    const computeSection = <
      T extends { citation: Citation; gaps?: string[]; status?: string }
    >(
      sectionId: SectionVerificationStats["sectionId"],
      label: string,
      jsonFile: string,
      apiEndpoint: string,
      items: T[]
    ): SectionVerificationStats => {
      const openGapCount = items.filter(
        (item) =>
          (Array.isArray(item.gaps) && item.gaps.length > 0) ||
          item.status === "gap"
      ).length

      const uniqueSources = Array.from(
        new Set(items.map((item) => item.citation.sourceUrl))
      )
      const latestDate =
        items
          .map((item) => item.citation.retrievedAt)
          .sort()
          .at(-1) ?? "2026-11-04"

      return {
        sectionId,
        label,
        jsonFile,
        apiEndpoint,
        recordCount: items.length,
        verifiedCount: items.length - openGapCount,
        openGapCount,
        sectionSha256: sha256Hex(JSON.stringify(items)),
        primarySources: uniqueSources,
        lastRetrievedAt: latestDate,
      }
    }

    const sections: SectionVerificationStats[] = [
      computeSection(
        "city-profile",
        "City Profile & Census Facts",
        "data/city-profile.json",
        "/api/civic-data/city-profile",
        [snapshot.cityProfile]
      ),
      computeSection(
        "services",
        "Citizen's Charter & City Hall Services",
        "data/services.json",
        "/api/civic-data/services",
        snapshot.services
      ),
      computeSection(
        "officials",
        "Elected & Appointed Officials",
        "data/officials.json",
        "/api/civic-data/officials",
        [...snapshot.electedOfficials, ...snapshot.appointedOfficials]
      ),
      computeSection(
        "barangays",
        "36 Barangays Directory",
        "data/barangays.json",
        "/api/civic-data/barangays",
        snapshot.barangays
      ),
      computeSection(
        "budget",
        "City Budget & Fund Allocations",
        "data/budget.json",
        "/api/civic-data/budget",
        [
          ...snapshot.nationalTaxAllotments,
          ...snapshot.statutoryAllocationRules,
          ...snapshot.budgetDisclosures,
        ]
      ),
      computeSection(
        "projects",
        "City Projects & Community Programs",
        "data/projects.json",
        "/api/civic-data/projects",
        snapshot.projectsAndPrograms
      ),
      computeSection(
        "bettergov",
        "BetterGov.ph Public Works & District Records",
        "data/bettergov.json",
        "/api/civic-data/bettergov",
        snapshot.betterGovRecords
      ),
      computeSection(
        "ordinances",
        "City Council Ordinances & Resolutions",
        "data/ordinances.json",
        "/api/civic-data/ordinances",
        snapshot.ordinancesAndResolutions
      ),
      computeSection(
        "contacts",
        "29 City Hall Offices, Hotlines & Channels",
        "data/contacts.json",
        "/api/civic-data/contacts",
        [
          ...snapshot.offices,
          ...snapshot.emergencyHotlines,
          ...snapshot.officialChannels,
        ]
      ),
      computeSection(
        "freedom-wall",
        "Community Freedom Wall",
        "data/freedom-wall.json",
        "/api/civic-data/freedom-wall",
        [snapshot.freedomWall]
      ),
      computeSection(
        "sources",
        "Official Public Sources",
        "data/sources.json",
        "/api/civic-data/sources",
        snapshot.dataSources
      ),
      ...(snapshot.betterGovDatasets
        ? [
            computeSection(
              "bettergov-datasets" as const,
              "BetterGov.ph Open Datasets Directory",
              "data/bettergov-datasets.json",
              "https://data.bettergov.ph/api/v1/datasets",
              snapshot.betterGovDatasets
            ),
          ]
        : []),
      ...(snapshot.nationalBudget
        ? [
            computeSection(
              "national-budget" as const,
              "Philippine National Budget API (GAA, NEP & DEO)",
              "data/national-budget.json",
              "https://budget.bettergov.ph/api/v1",
              [snapshot.nationalBudget]
            ),
          ]
        : []),
    ]

    const recordsWithOpenGaps = sections.reduce(
      (acc, s) => acc + s.openGapCount,
      0
    )

    return {
      valid: validation.valid,
      datasetSha256: validation.datasetSha256,
      totalRecords: validation.totalRecords,
      fullyVerifiedRecords: validation.totalRecords - recordsWithOpenGaps,
      recordsWithOpenGaps,
      uncitedRecords: validation.errors.length,
      lastRetrievedAt: "2026-11-04",
      psgcUpstreamUrl: "https://psgc.gitlab.io/api/cities/051716000/",
      sections,
    }
  }

  function buildSearchableRecords(): SearchableCivicRecord[] {
    const records: SearchableCivicRecord[] = []

    for (const service of snapshot.services) {
      records.push({
        id: service.id,
        title: service.title,
        subtitle: `${service.officeName} • ${service.officePhone ?? "Walk-in"}`,
        description: `${service.summary} Who can apply: ${service.whoCanApply}`,
        section: "services",
        href: `/services#${service.id}`,
        badge: service.category,
        hasGap: Boolean(service.gaps && service.gaps.length > 0),
        recordDigest: computeRecordDigest(service),
        citation: service.citation,
      })
    }

    for (const official of snapshot.electedOfficials) {
      records.push({
        id: official.id,
        title: official.name,
        subtitle: `${official.position} (${official.term})`,
        description:
          official.notes ??
          `Elected ${official.roleCategory} official for the ${official.term} term.`,
        section: "officials",
        href: "/officials",
        badge: `Elected (${official.term})`,
        hasGap: Boolean(official.gaps && official.gaps.length > 0),
        recordDigest: computeRecordDigest(official),
        citation: official.citation,
      })
    }

    for (const appt of snapshot.appointedOfficials) {
      records.push({
        id: appt.id,
        title: appt.name,
        subtitle: `${appt.title} — ${appt.office}`,
        description: `Appointed department head. Phone: ${appt.officePhone ?? "N/A"} | Email: ${appt.officeEmail ?? "N/A"}`,
        section: "officials",
        href: "/officials",
        badge: "Department Head",
        hasGap: Boolean(appt.gaps && appt.gaps.length > 0),
        recordDigest: computeRecordDigest(appt),
        citation: appt.citation,
      })
    }

    for (const brgy of snapshot.barangays) {
      records.push({
        id: brgy.id,
        title: `Barangay ${brgy.name}`,
        subtitle: `Punong Barangay: ${brgy.punongBarangay}`,
        description: `${brgy.classification} barangay in Iriga City, Camarines Sur.`,
        section: "barangays",
        href: "/officials#barangays",
        badge: "Barangay",
        hasGap: Boolean(brgy.gaps && brgy.gaps.length > 0),
        recordDigest: computeRecordDigest(brgy),
        citation: brgy.citation,
      })
    }

    for (const nta of snapshot.nationalTaxAllotments) {
      records.push({
        id: nta.id,
        title: `FY ${nta.fiscalYear} National Tax Allotment (NTA)`,
        subtitle: formatPesoCompact(nta.amountPhp),
        description: `${nta.description} (${nta.legalBasis})`,
        section: "budget",
        href: "/budget",
        badge: `FY ${nta.fiscalYear} Budget`,
        hasGap: false,
        recordDigest: computeRecordDigest(nta),
        citation: nta.citation,
      })
    }

    for (const proj of snapshot.projectsAndPrograms) {
      records.push({
        id: proj.id,
        title: proj.title,
        subtitle: `${proj.implementingAgency} • ${proj.location}`,
        description: `${proj.summary} (${proj.amountNote})`,
        section: "projects",
        href: "/projects",
        badge: `${proj.category} • ${proj.status}`,
        hasGap: Boolean(proj.gaps && proj.gaps.length > 0),
        recordDigest: computeRecordDigest(proj),
        citation: proj.citation,
      })
    }

    for (const bg of snapshot.betterGovRecords) {
      records.push({
        id: bg.id,
        title: bg.title,
        subtitle: `${bg.district} • ${bg.location}`,
        description: `${bg.plainSummary} (${bg.amountDisplay})`,
        section: "bettergov",
        href: "/projects#bettergov",
        badge: `BetterGov.ph • ${bg.category}`,
        hasGap: false,
        recordDigest: computeRecordDigest(bg),
        citation: bg.citation,
      })
    }

    for (const ord of snapshot.ordinancesAndResolutions) {
      records.push({
        id: ord.id,
        title: `${ord.number} — ${ord.title}`,
        subtitle: `${ord.kind} • ${ord.topic} (${ord.year})`,
        description: ord.summary,
        section: "ordinances",
        href: "/ordinances",
        badge: ord.kind,
        hasGap: Boolean(ord.gaps && ord.gaps.length > 0),
        recordDigest: computeRecordDigest(ord),
        citation: ord.citation,
      })
    }

    for (const office of snapshot.offices) {
      records.push({
        id: office.id,
        title: office.name,
        subtitle: `Landline: ${office.landline ?? "Not yet verified"} • Email: ${office.email ?? "Not yet verified"}`,
        description: `${office.category} office at ${office.location}.`,
        section: "contacts",
        href: "/contacts",
        badge: "City Office",
        hasGap: Boolean(office.gaps && office.gaps.length > 0),
        recordDigest: computeRecordDigest(office),
        citation: office.citation,
      })
    }

    for (const hotline of snapshot.emergencyHotlines) {
      records.push({
        id: hotline.id,
        title: `${hotline.label}: ${hotline.number}`,
        subtitle: hotline.agency,
        description: `${hotline.networkOrType} emergency contact for Iriga City.`,
        section: "contacts",
        href: "/contacts#hotlines",
        badge: "Emergency Hotline",
        hasGap: false,
        recordDigest: computeRecordDigest(hotline),
        citation: hotline.citation,
      })
    }

    return records
  }

  function search(
    query: string,
    sectionFilter?: SearchableCivicRecord["section"] | "all",
    verificationFilter: "all" | "verified-only" | "open-gaps" = "all"
  ): SearchableCivicRecord[] {
    const all = buildSearchableRecords()
    const bySection =
      !sectionFilter || sectionFilter === "all"
        ? all
        : all.filter((r) => r.section === sectionFilter)

    const byVerification =
      verificationFilter === "all"
        ? bySection
        : verificationFilter === "verified-only"
          ? bySection.filter((r) => !r.hasGap)
          : bySection.filter((r) => r.hasGap)

    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return byVerification

    const terms = trimmed.split(/\s+/)
    return byVerification.filter((record) => {
      const haystack =
        `${record.title} ${record.subtitle} ${record.description} ${record.badge} ${record.section} ${record.recordDigest}`.toLowerCase()
      return terms.every((t) => haystack.includes(t))
    })
  }

  return {
    getSnapshot: () => snapshot,
    validate,
    getVerificationLedger,
    search,
  }
}

export async function fetchCivicDataFromApi(
  baseUrl = "",
  fetcher: (url: string) => Promise<Response> = (url) => fetch(url)
): Promise<CivicDatasetSnapshot> {
  const endpoint = `${baseUrl.replace(/\/$/, "")}/api/civic-data`
  const response = await fetcher(endpoint)
  if (!response.ok) {
    throw new Error(`Civic API request failed with HTTP ${response.status}`)
  }
  const payload = await response.json()
  if (!payload?.validation?.valid) {
    throw new Error(
      "Civic API response failed zero-hallucination citation verification."
    )
  }

  const snapshot = CivicDatasetSnapshotSchema.parse({
    siteContent: payload.siteContent,
    cityProfile: payload.cityProfile,
    services: payload.services,
    electedOfficials: payload.electedOfficials,
    appointedOfficials: payload.appointedOfficials,
    barangays: payload.barangays,
    nationalTaxAllotments: payload.budget.nationalTaxAllotments,
    statutoryAllocationRules: payload.budget.statutoryAllocations,
    budgetDisclosures: payload.budget.disclosures,
    projectsAndPrograms: payload.projects,
    betterGovRecords: payload.betterGovRecords,
    ordinancesAndResolutions: payload.ordinancesAndResolutions,
    offices: payload.contacts.offices,
    emergencyHotlines: payload.contacts.emergencyHotlines,
    officialChannels: payload.contacts.officialChannels,
    freedomWall: payload.freedomWall,
    dataSources: payload.dataSources,
  })

  return snapshot
}

const defaultRepository = createCivicRepository()

export function getCivicSnapshot(): CivicDatasetSnapshot {
  return defaultRepository.getSnapshot()
}

export function getSiteContent(): SiteContent {
  return defaultRepository.getSnapshot().siteContent
}

export function getRootMetadata(): Metadata {
  const meta = getSiteContent().metadata
  return {
    title: {
      default: meta.defaultTitle,
      template: meta.titleTemplate,
    },
    description: meta.defaultDescription,
    openGraph: {
      title: meta.openGraphTitle,
      description: meta.openGraphDescription,
      type: "website",
      locale: meta.locale,
      siteName: meta.siteName,
      url: meta.siteUrl,
      images: [
        {
          url: meta.logoPath,
          width: 1024,
          height: 1024,
          alt: meta.logoAlt,
        },
      ],
    },
  }
}

export function getPageMetadata(
  pageKey: keyof SiteMetadataConfig["pages"]
): Metadata {
  const page = getSiteContent().metadata.pages[pageKey]
  return {
    title: page?.title ?? "BetterIriga.org",
    description: page?.description ?? "Civic transparency platform for Iriga City",
  }
}

export function validateCivicDataset() {
  return defaultRepository.validate()
}

export function getVerificationLedgerSummary(): VerificationLedgerSummary {
  return defaultRepository.getVerificationLedger()
}

export function getCityProfile(): CityProfile {
  return defaultRepository.getSnapshot().cityProfile
}

export function getServices(): CivicService[] {
  return defaultRepository.getSnapshot().services
}

export function getFreedomWallConfig(): FreedomWallConfig {
  return defaultRepository.getSnapshot().freedomWall
}

export function getElectedOfficials(term?: OfficialTerm): ElectedOfficial[] {
  const all = defaultRepository.getSnapshot().electedOfficials
  if (!term) return all
  return all.filter((o) => o.term === term)
}

export function getAppointedOfficials(): AppointedOfficial[] {
  return defaultRepository.getSnapshot().appointedOfficials
}

export function getBarangays(): BarangayRecord[] {
  return defaultRepository.getSnapshot().barangays
}

export function getNationalTaxAllotments(): NationalTaxAllotmentRecord[] {
  return defaultRepository.getSnapshot().nationalTaxAllotments
}

export function getStatutoryAllocationRules(): StatutoryAllocationRule[] {
  return defaultRepository.getSnapshot().statutoryAllocationRules
}

export function getBudgetDisclosures(): BudgetDisclosureItem[] {
  return defaultRepository.getSnapshot().budgetDisclosures
}

export function getProjectsAndPrograms(): ProjectRecord[] {
  return defaultRepository.getSnapshot().projectsAndPrograms
}

export function getBetterGovRecords(): BetterGovRecord[] {
  return defaultRepository.getSnapshot().betterGovRecords
}

export function getProjectById(
  id: string
):
  | { type: "lgu"; data: ProjectRecord }
  | { type: "bettergov"; data: BetterGovRecord }
  | null {
  const snapshot = defaultRepository.getSnapshot()
  const lgu = snapshot.projectsAndPrograms.find((p) => p.id === id)
  if (lgu) return { type: "lgu", data: lgu }
  const bg = snapshot.betterGovRecords.find((b) => b.id === id)
  if (bg) return { type: "bettergov", data: bg }
  return null
}

export function getAllProjectIds(): string[] {
  const snapshot = defaultRepository.getSnapshot()
  return [
    ...snapshot.projectsAndPrograms.map((p) => p.id),
    ...snapshot.betterGovRecords.map((b) => b.id),
  ]
}

export function getOrdinancesAndResolutions(): LegislativeMeasure[] {
  return defaultRepository.getSnapshot().ordinancesAndResolutions
}

export function getOffices(): OfficeContact[] {
  return defaultRepository.getSnapshot().offices
}

export function getEmergencyHotlines(): EmergencyHotline[] {
  return defaultRepository.getSnapshot().emergencyHotlines
}

export function getOfficialChannels(): OfficialChannel[] {
  return defaultRepository.getSnapshot().officialChannels
}

export function getDataSources(): DataSourceRecord[] {
  return defaultRepository.getSnapshot().dataSources
}

export function getCityStatistics(): CityStatistics {
  const snap = defaultRepository.getSnapshot()
  if (snap.statistics) return snap.statistics
  return CityStatisticsSchema.parse(statisticsJson)
}

export function getNationalBudget(): NationalBudgetConfig {
  const snap = defaultRepository.getSnapshot()
  if (snap.nationalBudget) return snap.nationalBudget
  return NationalBudgetConfigSchema.parse(nationalBudgetJson)
}

export function getBetterGovDatasets(): BetterGovDataset[] {
  const snap = defaultRepository.getSnapshot()
  if (snap.betterGovDatasets) return snap.betterGovDatasets
  return BetterGovDatasetSchema.array().parse(betterGovDatasetsJson)
}

export function getAllCivicRecords(): SearchableCivicRecord[] {
  return defaultRepository.search("")
}

export function searchCivicRecords(
  query: string,
  sectionFilter?: SearchableCivicRecord["section"] | "all",
  verificationFilter: "all" | "verified-only" | "open-gaps" = "all"
): SearchableCivicRecord[] {
  return defaultRepository.search(query, sectionFilter, verificationFilter)
}

export function formatPeso(amountPhp: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amountPhp)
}

export function formatPesoCompact(amountPhp: number): string {
  if (amountPhp >= 1_000_000_000) {
    return `₱${(amountPhp / 1_000_000_000).toFixed(2)}B`
  }
  if (amountPhp >= 1_000_000) {
    return `₱${(amountPhp / 1_000_000).toFixed(2)}M`
  }
  return formatPeso(amountPhp)
}

export function formatPhpMillions(amountPhp: number): string {
  return `₱${(amountPhp / 1_000_000).toFixed(2)}M`
}

export function formatNoteTimestamp(isoDate: string): string {
  try {
    const parsed = new Date(isoDate)
    if (Number.isNaN(parsed.getTime())) return isoDate
    return parsed.toLocaleDateString("en-PH", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  } catch {
    return isoDate
  }
}

export function formatPhtDate(isoDateOrDate: string | Date): string {
  try {
    const d =
      typeof isoDateOrDate === "string"
        ? new Date(isoDateOrDate)
        : isoDateOrDate
    if (Number.isNaN(d.getTime())) return String(isoDateOrDate)
    return new Intl.DateTimeFormat("en-PH", {
      timeZone: "Asia/Manila",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d)
  } catch {
    return String(isoDateOrDate)
  }
}

export function formatPhtTime(isoDateOrDate: string | Date): string {
  try {
    const d =
      typeof isoDateOrDate === "string"
        ? new Date(isoDateOrDate)
        : isoDateOrDate
    if (Number.isNaN(d.getTime())) return String(isoDateOrDate)
    return new Intl.DateTimeFormat("en-PH", {
      timeZone: "Asia/Manila",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(d)
  } catch {
    return String(isoDateOrDate)
  }
}

export function formatPhtDateTime(isoDateOrDate: string | Date): string {
  return `${formatPhtDate(isoDateOrDate)} • ${formatPhtTime(isoDateOrDate)} PHT`
}

export function getDirectoryControls(): DirectoryControls {
  return defaultRepository.getSnapshot().siteContent.directoryControls
}

export type CarrierType = "smart" | "globe" | "landline"

export function getCarrierRegistry(): CarrierRegistry | undefined {
  return defaultRepository.getSnapshot().siteContent.directoryControls.carriers
}

export function detectCarrier(
  number?: string,
  networkOrType?: string
): CarrierType {
  const text = `${networkOrType ?? ""} ${number ?? ""}`.toLowerCase()
  const registry = getCarrierRegistry()

  if (registry) {
    if (
      registry.smart.prefixes.some((p: string) => text.includes(p.toLowerCase()))
    ) {
      return "smart"
    }
    if (
      registry.globe.prefixes.some((p: string) => text.includes(p.toLowerCase()))
    ) {
      return "globe"
    }
  } else {
    if (
      text.includes("smart") ||
      text.includes("0921") ||
      text.includes("0928") ||
      text.includes("0918") ||
      text.includes("0919") ||
      text.includes("0998")
    ) {
      return "smart"
    }
    if (
      text.includes("globe") ||
      text.includes("0956") ||
      text.includes("0917") ||
      text.includes("0927") ||
      text.includes("0915") ||
      text.includes("0916")
    ) {
      return "globe"
    }
  }

  return "landline"
}

export function getBrandLogos(): BrandLogos | undefined {
  return defaultRepository.getSnapshot().siteContent.brand.logos
}

export function getBrandLicense(): BrandLicense | undefined {
  return defaultRepository.getSnapshot().siteContent.brand.license
}

export function getHeroMedia(): HeroMedia | undefined {
  return defaultRepository.getSnapshot().siteContent.home.heroMedia
}

export function getCivicPillars(): string[] {
  return (
    defaultRepository.getSnapshot().siteContent.home.civicPillars ?? [
      "100% Traced to Official Primary Sources",
      "Zero Guesswork & Full Fiscal Transparency",
      "Citizen's Charter & Sangguniang Panlungsod Laws",
      "24/7 Hotlines & Community Freedom Wall",
    ]
  )
}

export function getTransparencyPortals(): TransparencyPortal[] {
  return defaultRepository.getSnapshot().siteContent.transparencyPortals ?? []
}
