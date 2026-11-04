import { NextResponse } from "next/server"
import {
  getAppointedOfficials,
  getBarangays,
  getBetterGovRecords,
  getBudgetDisclosures,
  getCityProfile,
  getDataSources,
  getElectedOfficials,
  getEmergencyHotlines,
  getFreedomWallConfig,
  getNationalTaxAllotments,
  getOffices,
  getOfficialChannels,
  getOrdinancesAndResolutions,
  getProjectsAndPrograms,
  getServices,
  getSiteContent,
  getStatutoryAllocationRules,
  getVerificationLedgerSummary,
  validateCivicDataset,
} from "@/lib/data/iriga-data"

export const dynamic = "force-static"

export function GET() {
  const validation = validateCivicDataset()
  const verificationLedger = getVerificationLedgerSummary()

  return NextResponse.json({
    portal: "BetterIriga.org",
    disclaimer:
      "Independent, volunteer-run civic transparency portal. Not affiliated with the City Government of Iriga.",
    psgcApiReference: "https://psgc.gitlab.io/api/cities/051716000/",
    validation,
    verificationLedger,
    siteContent: getSiteContent(),
    cityProfile: getCityProfile(),
    services: getServices(),
    electedOfficials: getElectedOfficials(),
    appointedOfficials: getAppointedOfficials(),
    barangays: getBarangays(),
    budget: {
      nationalTaxAllotments: getNationalTaxAllotments(),
      statutoryAllocations: getStatutoryAllocationRules(),
      disclosures: getBudgetDisclosures(),
    },
    projects: getProjectsAndPrograms(),
    betterGovRecords: getBetterGovRecords(),
    ordinancesAndResolutions: getOrdinancesAndResolutions(),
    contacts: {
      emergencyHotlines: getEmergencyHotlines(),
      offices: getOffices(),
      officialChannels: getOfficialChannels(),
    },
    freedomWall: getFreedomWallConfig(),
    dataSources: getDataSources(),
  })
}
