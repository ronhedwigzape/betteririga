import { NextResponse } from "next/server"
import {
  createCivicRepository,
  getDirectoryControls,
  getVerificationLedgerSummary,
} from "@/lib/data/iriga-data"

export const dynamic = "force-static"

const VALID_SECTIONS: string[] =
  getDirectoryControls().validCivicSections.map(
    (s: { id: string }) => s.id
  )

export function generateStaticParams() {
  return VALID_SECTIONS.map((section: string) => ({ section }))
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ section: string }> }
) {
  const { section } = await context.params

  // Guard against path traversal, null bytes or malformed inputs
  if (!section || typeof section !== "string" || section.includes("..") || /[\x00-\x1F]/.test(section)) {
    return NextResponse.json(
      { error: "Invalid section parameter format" },
      { status: 400 }
    )
  }

  const repo = createCivicRepository()
  const snapshot = repo.getSnapshot()
  const ledger = getVerificationLedgerSummary()
  const sectionStats = ledger.sections.find((s) => s.sectionId === section)

  if (!sectionStats && section !== "site-content") {
    return NextResponse.json(
      {
        error: `Unknown civic data section "${section}". Valid sections: ${VALID_SECTIONS.join(", ")}`,
      },
      { status: 404 }
    )
  }

  const sectionDataMap: Record<string, unknown> = {
    "site-content": snapshot.siteContent,
    "city-profile": snapshot.cityProfile,
    services: snapshot.services,
    officials: {
      electedOfficials: snapshot.electedOfficials,
      appointedOfficials: snapshot.appointedOfficials,
    },
    barangays: snapshot.barangays,
    budget: {
      nationalTaxAllotments: snapshot.nationalTaxAllotments,
      statutoryAllocationRules: snapshot.statutoryAllocationRules,
      budgetDisclosures: snapshot.budgetDisclosures,
    },
    projects: snapshot.projectsAndPrograms,
    bettergov: snapshot.betterGovRecords,
    ordinances: snapshot.ordinancesAndResolutions,
    contacts: {
      offices: snapshot.offices,
      emergencyHotlines: snapshot.emergencyHotlines,
      officialChannels: snapshot.officialChannels,
    },
    "freedom-wall": snapshot.freedomWall,
    sources: snapshot.dataSources,
  }

  return NextResponse.json({
    portal: "BetterIriga.org",
    section,
    verified: ledger.valid,
    datasetSha256: ledger.datasetSha256,
    sectionVerification: sectionStats ?? null,
    data: sectionDataMap[section],
  })
}
