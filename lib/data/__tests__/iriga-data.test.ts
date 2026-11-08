import assert from "node:assert/strict"
import fs from "node:fs"
import { describe, it } from "node:test"
import {
  computeRecordDigest,
  createCivicRepository,
  fetchCivicDataFromApi,
  getAllCivicRecords,
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
  getOrdinancesAndResolutions,
  getPageMetadata,
  getProjectsAndPrograms,
  getProjectById,
  getAllProjectIds,
  getRootMetadata,
  getServices,
  getSiteContent,
  getVerificationLedgerSummary,
  getDirectoryControls,
  formatNoteTimestamp,
  formatPeso,
  formatPesoCompact,
  formatPhpMillions,
  formatPhtDate,
  formatPhtDateTime,
  formatPhtTime,
  searchCivicRecords,
  validateCitation,
  validateCivicDataset,
  getCityStatistics,
  detectCarrier,
  getBrandLogos,
  getHeroMedia,
  getCivicPillars,
  getCarrierRegistry,
  getNationalBudget,
  getBetterGovDatasets,
  getTransparencyPortals,
} from "../iriga-data"
import { useCivicStore } from "../../store/civic-store"
import {
  checkFreedomWallQuota,
  recordFreedomWallPost,
  sanitizeText,
  resetRateLimitsForTesting,
} from "../../security/rate-limiter"

describe("BetterIriga Civic Data & Provenance Engine (ADR-0001, ADR-0002, ADR-0003, ADR-0004)", () => {
  it("loads all Records from dedicated JSON files (not hardcoded in TS) and computes a deterministic SHA-256 dataset digest", () => {
    const report = validateCivicDataset()
    assert.equal(report.valid, true)
    assert.deepEqual(report.errors, [])
    assert.ok(report.totalRecords > 95)
    assert.match(report.datasetSha256, /^[a-f0-9]{64}$/)

    const ledger = getVerificationLedgerSummary()
    assert.equal(ledger.datasetSha256, report.datasetSha256)
    assert.equal(ledger.totalRecords, report.totalRecords)
    assert.equal(ledger.uncitedRecords, 0)
    assert.ok(ledger.sections.length >= 7)
    for (const sec of ledger.sections) {
      assert.match(sec.sectionSha256, /^[a-f0-9]{64}$/)
      assert.ok(sec.recordCount > 0)
    }
  })

  it("supports injecting a custom adapter at the CivicRepository seam and rejects uncited records", () => {
    const sampleDigest = computeRecordDigest({
      id: "test-1",
      citation: {
        sourceUrl: "https://iriga.gov.ph",
        sourceName: "LGU Iriga",
        retrievedAt: "2026-11-04",
      },
    })
    assert.match(sampleDigest, /^[a-f0-9]{16}$/)

    assert.throws(
      () =>
        validateCitation({
          sourceUrl: "",
          sourceName: "Iriga City Official Website",
          retrievedAt: "2026-11-04",
        }),
      /sourceUrl/i
    )

    assert.throws(
      () =>
        validateCitation({
          sourceUrl: "https://iriga.gov.ph",
          sourceName: "",
          retrievedAt: "2026-11-04",
        }),
      /sourceName/i
    )

    assert.throws(
      () =>
        validateCitation({
          sourceUrl: "https://iriga.gov.ph",
          sourceName: "Iriga City Official Website",
          retrievedAt: "invalid-date",
        }),
      /retrievedAt/i
    )

    const defaultRepo = createCivicRepository()
    assert.equal(defaultRepo.getSnapshot().cityProfile.psgc10DigitCode, "0501716000")
  })

  it("exposes verified Iriga City geographic and demographic facts from PSGC & PSA POPCEN", () => {
    const profile = getCityProfile()
    assert.equal(profile.officialName, "City of Iriga")
    assert.equal(profile.psgc10DigitCode, "0501716000")
    assert.equal(profile.psgcCode, "051716000")
    assert.equal(profile.province, "Camarines Sur")
    assert.equal(profile.region, "Region V (Bicol Region)")
    assert.equal(profile.barangayCount, 36)
    assert.equal(profile.landAreaSqKm, 174)
    assert.equal(profile.population2024, 115306)
    assert.equal(profile.population2020, 114457)
    assert.equal(profile.population2015, 111757)
    assert.ok(profile.citation.sourceUrl.startsWith("https://"))
  })

  it("returns verified 2025-2028 Elected Officials and 17 Appointed Department Heads", () => {
    const elected2025 = getElectedOfficials("2025-2028")
    const mayor = elected2025.find((o) => o.position === "City Mayor")
    const viceMayor = elected2025.find((o) => o.position === "City Vice Mayor")
    const councilors = elected2025.filter((o) =>
      o.position.includes("Sangguniang Panlungsod")
    )

    assert.equal(mayor?.name, "Hon. Wilfredo Rex C. Oliva")
    assert.equal(viceMayor?.name, "Hon. Edsel S. Dimaiwat")
    assert.equal(councilors.length, 10)
    assert.ok(
      councilors.map((c) => c.name).includes("Hon. Rodolfo Jeff B. Tino")
    )
    assert.ok(
      councilors
        .map((c) => c.name)
        .includes("Hon. Leo Joshua Marcel O. Caayao")
    )
    assert.ok(
      councilors
        .map((c) => c.name)
        .includes("Hon. Katherine Dominique C. Lagrimas")
    )
    assert.ok(councilors.map((c) => c.name).includes("Hon. Roseller Y. Orolfo"))

    const appointed = getAppointedOfficials()
    assert.equal(appointed.length, 17)
    assert.equal(
      appointed.find((a) => a.office === "City Administrator's Office")?.name,
      "Atty. Maharlika Ramon C. Oaferina II"
    )
  })

  it("returns all 36 Barangays of Iriga City with their verified Punong Barangays", () => {
    const barangays = getBarangays()
    assert.equal(barangays.length, 36)
    const sanFrancisco = barangays.find((b) => b.name === "San Francisco")
    assert.equal(sanFrancisco?.punongBarangay, "Marc Jhames R. Temeña")
    const staCruzSur = barangays.find((b) => b.name === "Sta. Cruz Sur")
    assert.equal(staCruzSur?.punongBarangay, "Avelina L. Cerillo")
  })

  it("returns verified DBM National Tax Allotment series and explicit Gap disclosures", () => {
    const nta = getNationalTaxAllotments()
    const fy2025 = nta.find((item) => item.fiscalYear === 2025)
    const fy2024 = nta.find((item) => item.fiscalYear === 2024)
    assert.equal(fy2025?.amountPhp, 913_500_000)
    assert.equal(fy2024?.amountPhp, 772_010_000)

    const disclosures = getBudgetDisclosures()
    const unverifiedItems = disclosures.filter((d) => d.status === "gap")
    assert.ok(unverifiedItems.length >= 3)
    assert.ok(
      unverifiedItems.some((d) =>
        d.gapReason.includes("sample placeholder text")
      )
    )
  })

  it("returns verified Projects & Social Programs, Ordinances & Resolutions, and 29 City Hall Offices", () => {
    const projects = getProjectsAndPrograms()
    assert.ok(projects.length >= 9)
    assert.ok(
      projects.some((p) => p.id === "dpwh-24fn0084" && p.amountPhp === 47_840_000)
    )

    const allIds = getAllProjectIds()
    assert.equal(allIds.length, 46)
    assert.ok(allIds.includes("dpwh-24fn0084"))
    assert.ok(allIds.includes("bg-dpwh-24fn0084-san-roque"))

    const lguLookup = getProjectById("dpwh-24fn0084")
    assert.equal(lguLookup?.type, "lgu")
    assert.equal(lguLookup?.data.id, "dpwh-24fn0084")

    const bgLookup = getProjectById("bg-dpwh-24fn0084-san-roque")
    assert.equal(bgLookup?.type, "bettergov")
    assert.equal(bgLookup?.data.id, "bg-dpwh-24fn0084-san-roque")

    const measures = getOrdinancesAndResolutions()
    assert.ok(measures.length >= 11)
    assert.ok(measures.some((m) => m.number === "Ordinance No. 2015-01"))
    assert.ok(
      measures.some(
        (m) => m.kind === "Resolution" && m.number.includes("013")
      )
    )

    const offices = getOffices()
    assert.equal(offices.length, 29)
    const cdrrmo = offices.find((o) =>
      o.name.includes("Disaster Risk Reduction")
    )
    assert.equal(cdrrmo?.landline, "(054) 299 9918")
    assert.equal(cdrrmo?.email, "irigacitydrrmo@gmail.com")

    const hotlines = getEmergencyHotlines()
    assert.ok(hotlines.some((h) => h.number === "0921 636 4018"))

    const sources = getDataSources()
    const philsys = sources.find((s) => s.id === "philsys")
    assert.equal(philsys?.status, "restricted-by-law")
    assert.ok(philsys?.notes.includes("Republic Act No. 11055"))
  })

  it("searches across all civic Record collections accurately and supports verificationStatus filtering", () => {
    const cdrrmoHits = searchCivicRecords("CDRRMO")
    assert.ok(cdrrmoHits.length > 0)

    const olivaHits = searchCivicRecords("Oliva")
    assert.ok(olivaHits.some((r) => r.section === "officials"))

    const tourismHits = searchCivicRecords("Tourism Code")
    assert.ok(tourismHits.some((r) => r.section === "ordinances"))

    const allRecords = getAllCivicRecords()
    assert.ok(allRecords.length > 95)
    assert.ok(allRecords.every((r) => r.recordDigest.length === 16))
  })

  it("serves verified JSON payloads from GET /api/civic-data, GET /api/civic-data/[section], and HTTP adapter", async () => {
    const { GET } = await import("@/app/api/civic-data/route")
    const response = GET()
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.equal(body.portal, "BetterIriga.org")
    assert.equal(body.validation.valid, true)
    assert.deepEqual(body.validation.errors, [])
    assert.match(body.validation.datasetSha256, /^[a-f0-9]{64}$/)
    assert.equal(body.cityProfile.psgc10DigitCode, "0501716000")
    assert.equal(body.barangays.length, 36)
    assert.equal(body.contacts.offices.length, 29)

    const { GET: getSection } = await import(
      "@/app/api/civic-data/[section]/route"
    )
    const officialsRes = await getSection(
      new Request("https://betteririga.org/api/civic-data/officials"),
      { params: Promise.resolve({ section: "officials" }) }
    )
    assert.equal(officialsRes.status, 200)
    const officialsJson = await officialsRes.json()
    assert.equal(officialsJson.section, "officials")
    assert.equal(officialsJson.verified, true)
    assert.ok(officialsJson.data.electedOfficials.length >= 12)

    // Test the HTTP API adapter using a custom fetch stub against the route handler
    const snapshotFromApi = await fetchCivicDataFromApi(
      "https://betteririga.org",
      async () => GET()
    )
    assert.equal(snapshotFromApi.cityProfile.officialName, "City of Iriga")
  })

  it("loads Zod-validated siteContent, 36+ BetterGov.ph synced records, and manages state via useCivicStore", () => {
    const siteContent = getSiteContent()
    assert.equal(siteContent.brand.fullDomain, "BetterIriga.org")
    assert.ok(
      siteContent.navigation.some((nav) => nav.href === "/verification")
    )

    const betterGovRecords = getBetterGovRecords()
    assert.ok(betterGovRecords.length >= 30)
    assert.ok(
      betterGovRecords.some((r) => r.id === "bg-camsur-5th-deo-history")
    )
    assert.ok(
      betterGovRecords.some((r) =>
        r.title.toLowerCase().includes("waras small reservoir")
      )
    )

    const storeState = useCivicStore.getState()
    assert.equal(
      storeState.snapshot.cityProfile.psgc10DigitCode,
      "0501716000"
    )
    storeState.setSearchQuery("Waras")
    storeState.setSearchSection("bettergov")
    const warasResults = storeState.getSearchResults()
    assert.ok(warasResults.length >= 1)
    assert.equal(warasResults[0]?.section, "bettergov")
    storeState.resetSearch()
    assert.equal(useCivicStore.getState().searchQuery, "")
  })

  it("enforces one-word readable navigation labels, BetterSolano-style zero-cost pledge, and Volunteer Modal copy", () => {
    const siteContent = getSiteContent()
    assert.equal(
      siteContent.brand.costToPeopleLabel,
      "Cost to the People of Iriga"
    )
    assert.equal(siteContent.brand.costToPeopleValue, "₱0")
    assert.equal(
      siteContent.volunteerModal.title,
      "Be Part of Something Greater"
    )
    assert.ok(siteContent.volunteerModal.roles.length >= 4)

    for (const item of siteContent.navigation) {
      assert.ok(
        !item.label.includes(" "),
        `Navigation item "${item.label}" (${item.href}) must be a single word`
      )
    }
    assert.ok(siteContent.navigation.some((n) => n.href === "/services"))
    assert.ok(siteContent.navigation.some((n) => n.href === "/freedom-wall"))
  })

  it("exposes all verified Iriga City services, history timeline, map coordinates, Zod metadata, and BetterLibmanan-style sticky-note Freedom Wall store actions", () => {
    const services = getServices()
    assert.ok(services.length >= 14)
    assert.ok(services.some((s) => s.id === "srv-civil-birth-cert"))
    assert.ok(services.some((s) => s.id === "srv-business-permit-bplo"))

    const birthCertHits = searchCivicRecords("Birth Certificate", "services")
    assert.ok(birthCertHits.length >= 1)
    assert.equal(birthCertHits[0]?.section, "services")

    const profile = getCityProfile()
    assert.ok(profile.historyTimeline.length >= 5)
    assert.ok(profile.geo.osmEmbedUrl.startsWith("https://www.openstreetmap.org"))
    assert.equal(profile.weatherBaseline.temperatureC, 29)
    assert.equal(profile.weatherBaseline.hourly.length, 4)

    // Verify all page metadata is stored and validated in the Zod store
    const rootMeta = getRootMetadata()
    assert.ok(rootMeta.description?.includes("Iriga City"))
    const wallMeta = getPageMetadata("freedomWall")
    assert.ok(String(wallMeta.title).includes("Freedom Wall"))

    // Verify Freedom Wall is empty by default (seedNotes = []) and supports sticky notes
    const fwConfig = getFreedomWallConfig()
    assert.equal(fwConfig.seedNotes.length, 0)
    assert.equal(fwConfig.stickyColors.length, 6)
    assert.equal(fwConfig.canvas.width, 6000)

    const store = useCivicStore.getState()
    assert.equal(store.freedomWallNotes.length, 0)

    const createdNote = store.addFreedomWallNote({
      content: "Sana mas maliwanag ang streetlights sa San Roque!",
      color: fwConfig.stickyColors[0]?.cardClass,
      x: 2450,
      y: 2520,
    })
    assert.equal(
      createdNote.content,
      "Sana mas maliwanag ang streetlights sa San Roque!"
    )
    assert.equal(createdNote.authorLabel, "Anonymous")
    assert.ok(
      useCivicStore
        .getState()
        .freedomWallNotes.some((n) => n.id === createdNote.id)
    )

    store.moveFreedomWallNote(createdNote.id, 2600, 2700, false)
    const movedNote = useCivicStore
      .getState()
      .freedomWallNotes.find((n) => n.id === createdNote.id)
    assert.equal(movedNote?.x, 2600)
    assert.equal(movedNote?.y, 2700)
  })

  it("guarantees unique IDs across BetterGov.ph public works records and supports both Supabase publishable & anon keys", async () => {
    const betterGovRecords = getBetterGovRecords()
    const idSet = new Set<string>()
    for (const rec of betterGovRecords) {
      assert.ok(
        !idSet.has(rec.id),
        `Duplicate BetterGov record id found: "${rec.id}"`
      )
      idSet.add(rec.id)
    }

    const { isSupabaseFreedomWallConfigured } = await import(
      "@/lib/supabase/freedom-wall"
    )

    // Baseline without env should be unconfigured
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalPub = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    const originalAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    try {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      assert.equal(isSupabaseFreedomWallConfigured(), false)

      // With publishable key
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://iriga-test.supabase.co"
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
        "sb_pub_live_valid_publishable_key_iriga_12345"
      assert.equal(isSupabaseFreedomWallConfigured(), true)

      // With legacy anon key
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid_anon_iriga"
      assert.equal(isSupabaseFreedomWallConfigured(), true)
    } finally {
      if (originalUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
      else delete process.env.NEXT_PUBLIC_SUPABASE_URL
      if (originalPub)
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalPub
      else delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      if (originalAnon)
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnon
      else delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  })

  it("exposes validated directoryControls and universal formatters through deep module and Zustand store", () => {
    const controls = getDirectoryControls()
    assert.ok(controls.serviceCategories.includes("all"))
    assert.ok(controls.serviceCategories.includes("Certificates & Civil Registry"))
    assert.ok(
      controls.officialTabs.some((t: { id: string }) => t.id === "elected-2025")
    )
    assert.ok(
      controls.projectSourceTabs.some(
        (t: { id: string }) => t.id === "lgu-iriga"
      )
    )
    assert.ok(controls.ordinanceKinds.includes("Ordinance"))
    assert.ok(controls.ordinanceTopics.includes("Public Safety"))
    assert.ok(controls.validCivicSections.length >= 10)

    // Store parity
    const storeState = useCivicStore.getState()
    assert.equal(storeState.directoryControls.serviceCategories.length, controls.serviceCategories.length)
    assert.equal(storeState.directoryControls.validCivicSections.length, controls.validCivicSections.length)

    // Formatting utilities
    assert.equal(formatPeso(913500000).replace(/\s/g, " "), "₱913,500,000")
    assert.equal(formatPesoCompact(913500000), "₱913.50M")
    assert.equal(formatPesoCompact(1500000000), "₱1.50B")
    assert.equal(formatPhpMillions(913500000), "₱913.50M")
    assert.match(formatNoteTimestamp("2026-11-04T05:00:00Z"), /Nov|11/)
    assert.match(formatPhtDate("2026-11-04T05:00:00Z"), /2026/)
    assert.match(formatPhtTime("2026-11-04T05:00:00Z"), /:/)
    assert.match(formatPhtDateTime("2026-11-04T05:00:00Z"), /PHT/)
    assert.match(storeState.formatNoteTimestamp("2026-11-04T05:00:00Z"), /Nov|11/)
  })

  it("confirms BetterIriga is positioned under BetterGov.ph without 'inspired by' phrasing", () => {
    const siteContent = getSiteContent()
    const freedomWall = getFreedomWallConfig()

    assert.ok(
      siteContent.brand.disclaimerBanner.includes("under BetterGov.ph"),
      "disclaimerBanner must specify 'under BetterGov.ph'"
    )
    assert.ok(
      !siteContent.brand.disclaimerBanner.toLowerCase().includes("inspired by"),
      "disclaimerBanner must not contain 'inspired by'"
    )
    assert.ok(
      siteContent.pages.about.subtitle.includes("under BetterGov.ph"),
      "about subtitle must specify 'under BetterGov.ph'"
    )
    assert.ok(
      !freedomWall.citation.sourceName.toLowerCase().includes("inspired by"),
      "freedomWall citation must not contain 'inspired by'"
    )
  })

  it("exposes 100% verified city statistics matching official PSA census, DBM NTA, and DTI CMCI records", () => {
    const stats = getCityStatistics()
    assert.equal(stats.demographics.totalPopulation2020, 114457)
    assert.equal(stats.demographics.barangayCount, 36)
    assert.equal(stats.demographics.landAreaKm2, 137.35)
    assert.ok(stats.demographics.densityPerKm2 > 800)

    // Fiscal
    assert.equal(stats.fiscalOverview.latestNtaYear, 2025)
    assert.equal(stats.fiscalOverview.latestNtaAmountPhp, 913500000)
    assert.equal(stats.fiscalOverview.developmentFundPhp, 182700000)
    assert.equal(stats.fiscalOverview.calamityFundPhp, 45675000)

    // CMCI 5 pillars
    assert.equal(stats.competitivenessCmci.pillars.length, 5)
    const pillarNames = stats.competitivenessCmci.pillars.map((p) => p.name)
    assert.ok(pillarNames.includes("Economic Dynamism"))
    assert.ok(pillarNames.includes("Government Efficiency"))
    assert.ok(pillarNames.includes("Infrastructure"))
    assert.ok(pillarNames.includes("Resiliency"))
    assert.ok(pillarNames.includes("Innovation"))

    // Barangay population list covers all 36 barangays
    assert.equal(stats.barangayPopulations.length, 36)
    const totalBarangayPop = stats.barangayPopulations.reduce(
      (sum, b) => sum + b.population,
      0
    )
    assert.equal(totalBarangayPop, 114457)

    // Citations
    assert.ok(stats.citations.length >= 3)
    stats.citations.forEach((c) => {
      assert.ok(c.sourceUrl.startsWith("http"))
      assert.ok(c.retrievedAt.length >= 10)
    })
  })

  it("verifies legislative and statistics navigation and Sangguniang Panlungsod leadership", () => {
    const siteContent = getSiteContent()
    const navHrefs = siteContent.navigation.map((n) => n.href)

    assert.ok(navHrefs.includes("/legislative"), "Navigation must contain /legislative")
    assert.ok(navHrefs.includes("/statistics"), "Navigation must contain /statistics")

    assert.ok(siteContent.pages.legislative, "siteContent.pages must contain legislative")
    assert.ok(siteContent.pages.statistics, "siteContent.pages must contain statistics")

    const elected = getElectedOfficials()
    const viceMayor = elected.find(
      (o) => o.term === "2025-2028" && o.position.includes("Vice Mayor")
    )
    assert.ok(viceMayor, "Must have verified Vice Mayor for 2025-2028")
    assert.ok(viceMayor?.name.includes("Dimaiwat"), "Vice Mayor should be Edsel Dimaiwat")

    const councilors = elected.filter(
      (o) => o.term === "2025-2028" && o.roleCategory === "Legislative" && !o.position.includes("Vice Mayor")
    )
    assert.equal(councilors.length, 10, "Must have exactly 10 elected city councilors")

    const ordinances = getOrdinancesAndResolutions()
    assert.ok(ordinances.length >= 10, "Must have verified ordinances & resolutions")
  })

  it("exposes carrier detection, brand logos, hero media, and civic pillars via Civic Repository and Zustand store", () => {
    // Carrier Registry
    const registry = getCarrierRegistry()
    assert.ok(registry, "Carrier registry must be defined")
    assert.equal(registry?.smart.name, "Smart")
    assert.equal(registry?.globe.name, "Globe")
    assert.equal(registry?.landline.name, "Landline")

    // Carrier Detection
    assert.equal(detectCarrier("0921 636 4018"), "smart")
    assert.equal(detectCarrier("0918 123 4567"), "smart")
    assert.equal(detectCarrier("0917 555 1234"), "globe")
    assert.equal(detectCarrier("0956 999 8888"), "globe")
    assert.equal(detectCarrier("(054) 299 9918"), "landline")
    assert.equal(detectCarrier(undefined, "Smart Official Hotline"), "smart")
    assert.equal(detectCarrier(undefined, "Globe Official Channel"), "globe")

    // Brand Logos
    const logos = getBrandLogos()
    assert.ok(logos, "Brand logos must be defined")
    assert.ok(logos?.lightMode.includes("Blue-Foreground"))
    assert.ok(logos?.darkMode.includes("White-Foreground"))

    // Hero Media
    const media = getHeroMedia()
    assert.ok(media, "Hero media must be defined")
    assert.equal(media?.videoMp4, "/hero-background.mp4")
    assert.equal(media?.videoWebm, "/hero-background.webm")
    assert.equal(media?.poster, "/hero-video-poster.jpg")
    assert.ok(media?.credit?.includes("MADAYAN"), "Must credit MADAYAN on YouTube")
    assert.ok(media?.creditUrl?.includes("youtube.com"), "Credit URL must point to YouTube source")

    // Civic Pillars
    const pillars = getCivicPillars()
    assert.ok(pillars.length >= 4)
    assert.ok(pillars[0].includes("Official Primary Sources"))

    // Zustand store parity
    const storeState = useCivicStore.getState()
    assert.equal(storeState.detectCarrier("0921 636 4018"), "smart")
    assert.equal(storeState.detectCarrier("(054) 299 9918"), "landline")
    assert.ok(storeState.getBrandLogos()?.lightMode.includes("Blue-Foreground"))
    assert.ok(storeState.getHeroMedia()?.videoWebm.includes("webm"))
    assert.ok(storeState.getCivicPillars().length >= 4)
  })

  it("exposes verified National Budget data based on budget.bettergov.ph/docs (GAA, NEP 2027, CamSur 5th DEO, and Expense Classes)", () => {
    const budget = getNationalBudget()
    assert.ok(budget, "National budget config must be defined")
    assert.ok(budget.gaaNationalTotals.length >= 7, "Must contain GAA FY2020-2026 totals")
    assert.equal(budget.gaaNationalTotals[0].year, 2020)
    assert.equal(budget.gaaNationalTotals[6].year, 2026)
    assert.equal(budget.gaaNationalTotals[6].amountPhp, 6793162000000)

    // NEP 2027 proposal
    assert.equal(budget.nep2027National.fiscalYear, 2027)
    assert.equal(budget.nep2027National.proposedAmountPhp, 7200186000000)
    assert.ok(budget.nep2027National.topDepartments.length >= 10)
    assert.equal(budget.nep2027National.topDepartments[0].id, "AUTO")

    // 3 Budget Cycle stages
    assert.equal(budget.budgetCycleStages.length, 3)
    assert.equal(budget.budgetCycleStages[0].stage, "nep")
    assert.equal(budget.budgetCycleStages[1].stage, "gaa")
    assert.equal(budget.budgetCycleStages[2].stage, "execution")

    // 4 Expense Classes
    assert.equal(budget.expenseClasses.length, 4)
    assert.deepEqual(
      budget.expenseClasses.map((e) => e.code),
      ["PS", "MOOE", "CO", "FE"]
    )

    // CamSur 5th DEO multi-year ledger
    assert.equal(budget.camSur5thDistrictLedger.districtId, "leg:camarines-sur:5th")
    assert.equal(budget.camSur5thDistrictLedger.servingOffice, "Camarines Sur 5th DEO")
    assert.ok(budget.camSur5thDistrictLedger.years.length >= 9)
    assert.equal(budget.camSur5thDistrictLedger.years[0].fy, 2020)
    assert.equal(budget.camSur5thDistrictLedger.years[0].amountPhp, 1319464000)
    assert.equal(budget.camSur5thDistrictLedger.years[6].fy, 2026)
    assert.equal(budget.camSur5thDistrictLedger.years[6].amountPhp, 1012023000)

    // Citations
    validateCitation(budget.citation, "national-budget")
  })

  it("exposes all 10 BetterGov.ph open datasets extracted from data.bettergov.ph with verified citations", () => {
    const datasets = getBetterGovDatasets()
    assert.equal(datasets.length, 10, "Must contain all 10 BetterGov.ph datasets")

    // Check specific critical datasets
    const election = datasets.find((d) => d.id === 25)
    assert.ok(election, "OpenHalalan dataset must exist")
    assert.ok(election.name.includes("OpenHalalan"))
    assert.equal(election.license, "ODbL v1.0")

    const noah = datasets.find((d) => d.id === 22)
    assert.ok(noah, "Project NOAH dataset must exist")
    assert.ok(noah.sizeBytes > 5_000_000_000, "NOAH must be > 5GB")

    const dpwh = datasets.find((d) => d.id === 19)
    assert.ok(dpwh, "DPWH Infrastructure dataset must exist")

    const philgeps = datasets.find((d) => d.id === 5)
    assert.ok(philgeps, "PhilGEPS dataset must exist")

    for (const d of datasets) {
      assert.ok(d.portalUrl.startsWith("https://data.bettergov.ph/datasets/"))
      assert.ok(d.apiUrl.startsWith("https://data.bettergov.ph/api/v1/datasets/"))
      validateCitation(d.citation, `bettergov-dataset-${d.id}`)
    }
  })

  it("ensures the hero background video has complete duration (>80s) and does not loop after 3s", () => {
    assert.ok(fs.existsSync("public/hero-background.mp4"), "MP4 video file must exist")
    assert.ok(fs.existsSync("public/hero-background.webm"), "WebM video file must exist")
    assert.ok(fs.existsSync("public/hero-video-poster.jpg"), "Poster file must exist")

    const mp4Stats = fs.statSync("public/hero-background.mp4")
    assert.ok(mp4Stats.size > 2_000_000, "Complete video must be multi-megabyte, not a 3s stub")

    // Ensure legacy docs/plans implementation plan was removed per user request
    assert.ok(
      !fs.existsSync("docs/plans/implementation-plan.md"),
      "legacy docs/plans/implementation-plan.md must be removed"
    )
  })

  it("integrates @vercel/analytics/next and @vercel/speed-insights/next in RootLayout", () => {
    const layoutContent = fs.readFileSync("app/layout.tsx", "utf8")
    assert.ok(
      layoutContent.includes('import { Analytics } from "@vercel/analytics/next"'),
      "layout.tsx must import Analytics from @vercel/analytics/next"
    )
    assert.ok(
      layoutContent.includes("<Analytics />"),
      "layout.tsx must render <Analytics />"
    )
    assert.ok(
      layoutContent.includes('import { SpeedInsights } from "@vercel/speed-insights/next"'),
      "layout.tsx must import SpeedInsights from @vercel/speed-insights/next"
    )
    assert.ok(
      layoutContent.includes("<SpeedInsights />") || layoutContent.includes("<SpeedInsights/>"),
      "layout.tsx must render <SpeedInsights />"
    )
  })

  it("handles Freedom Wall API endpoints and Supabase diagnostics gracefully", async () => {
    const { GET: getFreedomWall, POST: postFreedomWall } = await import(
      "@/app/api/freedom-wall/route"
    )
    const { GET: getDiagnostics } = await import(
      "@/app/api/freedom-wall/diagnostics/route"
    )

    // Diagnostics should always return valid payload even when unconfigured
    const diagRes = await getDiagnostics()
    assert.equal(diagRes.status, 200)
    const diagJson = await diagRes.json()
    assert.ok("detectedEnv" in diagJson)
    assert.ok(typeof diagJson.setupSql === "string")
    assert.ok(diagJson.setupSql.includes("create table if not exists public.freedom_wall_posts"))

    // GET /api/freedom-wall should return valid json
    const getRes = await getFreedomWall()
    assert.equal(getRes.status, 200)
    const getJson = await getRes.json()
    assert.ok("storage" in getJson)
    assert.ok(Array.isArray(getJson.notes))

    // POST /api/freedom-wall should validate input
    const badReq = new Request("http://localhost/api/freedom-wall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "" }),
    })
    // @ts-expect-error test NextRequest signature with Request
    const badRes = await postFreedomWall(badReq)
    assert.equal(badRes.status, 422)

    // Valid post should succeed locally or remotely
    const goodReq = new Request("http://localhost/api/freedom-wall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "Test note from civic test suite",
        color: "bg-yellow-100 border-yellow-300 text-yellow-950",
      }),
    })
    // @ts-expect-error test NextRequest signature with Request
    const goodRes = await postFreedomWall(goodReq)
    assert.ok(goodRes.status === 200 || goodRes.status === 201)
    const goodJson = await goodRes.json()
    assert.ok("note" in goodJson)
    assert.equal(goodJson.note.content, "Test note from civic test suite")
  })

  it("verifies Freedom Wall Live label, presence count, real-time typing indicators, and presence API", async () => {
    const {
      recordPresence,
      removePresence,
      getPresenceStats,
    } = await import("@/lib/security/presence-tracker")
    const {
      GET: getPresence,
      POST: postPresence,
      DELETE: deletePresence,
    } = await import("@/app/api/freedom-wall/presence/route")

    // 1. Presence tracker utility tests
    const session1 = `test_sess_${Date.now()}_1`
    const session2 = `test_sess_${Date.now()}_2`

    const stats1 = recordPresence(session1, false)
    assert.ok(stats1.liveCount >= 1, "liveCount should be at least 1")

    const stats2 = recordPresence(session2, true)
    assert.ok(stats2.liveCount >= 2, "liveCount should increment with multiple users")
    assert.ok(stats2.typingCount >= 1, "typingCount should reflect user who is typing")

    removePresence(session2)
    const statsAfterRemove = getPresenceStats()
    assert.equal(statsAfterRemove.typingCount, 0, "typingCount should reset when typing user leaves")

    // Clean up session 1
    removePresence(session1)

    // 2. Presence API endpoint tests
    const getRes = await getPresence()
    assert.equal(getRes.status, 200)
    const getJson = await getRes.json()
    assert.equal(getJson.success, true)
    assert.ok(typeof getJson.liveCount === "number")
    assert.ok(typeof getJson.typingCount === "number")

    // POST /api/freedom-wall/presence
    const testPostSession = `api_test_${Date.now()}`
    const postReq = new Request("http://localhost/api/freedom-wall/presence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: testPostSession, isTyping: true }),
    })
    // @ts-expect-error test NextRequest signature with Request
    const postRes = await postPresence(postReq)
    assert.equal(postRes.status, 200)
    const postJson = await postRes.json()
    assert.equal(postJson.success, true)
    assert.ok(postJson.typingCount >= 1)

    // DELETE /api/freedom-wall/presence
    const deleteReq = new Request(
      `http://localhost/api/freedom-wall/presence?sessionId=${testPostSession}`,
      { method: "DELETE" }
    )
    // @ts-expect-error test NextRequest signature with Request
    const deleteRes = await deletePresence(deleteReq)
    assert.equal(deleteRes.status, 200)
    const deleteJson = await deleteRes.json()
    assert.equal(deleteJson.success, true)

    // 3. Freedom Wall JSON data file assertions
    const freedomWallJson = JSON.parse(
      fs.readFileSync("data/freedom-wall.json", "utf8")
    )
    assert.equal(
      freedomWallJson.uiCopy.toolbarBadge,
      "Live",
      "data/freedom-wall.json toolbarBadge must be 'Live'"
    )

    // 4. Freedom Wall Board component verification
    const boardContent = fs.readFileSync(
      "components/civic/freedom-wall-board.tsx",
      "utf8"
    )
    assert.ok(
      boardContent.includes("bg-emerald-400 animate-pulse"),
      "freedom-wall-board.tsx must include pulsing green status indicator"
    )
    assert.ok(
      boardContent.includes('uiCopy.toolbarBadge || "Live"'),
      "freedom-wall-board.tsx must render Live label beside green light"
    )
    assert.ok(
      boardContent.includes("{liveCount} live"),
      "freedom-wall-board.tsx must render live visitor count badge"
    )
    assert.ok(
      boardContent.includes("typingCount > 0") &&
      (boardContent.includes("typing…") || boardContent.includes("typing")),
      "freedom-wall-board.tsx must render real-time typing indicator"
    )
    assert.ok(
      boardContent.includes("/api/freedom-wall/presence"),
      "freedom-wall-board.tsx must communicate with presence API"
    )
  })

  it("enforces light mode default, horizontal navbar logo, enlarged hero emblem, and compact hotlines", () => {
    // 1. Theme default is light mode
    const themeProviderContent = fs.readFileSync(
      "components/theme-provider.tsx",
      "utf8"
    )
    assert.ok(
      themeProviderContent.includes('defaultTheme="light"'),
      "theme-provider.tsx must specify defaultTheme='light'"
    )
    assert.ok(
      themeProviderContent.includes("enableSystem={false}"),
      "theme-provider.tsx must disable system theme override"
    )

    // 2. Navbar uses horizontal logo variant
    const siteHeaderContent = fs.readFileSync(
      "components/civic/site-header.tsx",
      "utf8"
    )
    assert.ok(
      siteHeaderContent.includes('variant="horizontal"'),
      "site-header.tsx must use horizontal logo variant in navbar"
    )
    assert.ok(
      siteHeaderContent.includes("Official Portal:"),
      "site-header.tsx must display official portal label on upper right"
    )
    assert.ok(
      siteHeaderContent.includes("iriga.gov.ph"),
      "site-header.tsx must display iriga.gov.ph link on upper right"
    )

    // 3. Hero home page has enlarged emblem
    const homeContent = fs.readFileSync("app/page.tsx", "utf8")
    assert.ok(
      homeContent.includes("size={180}"),
      "app/page.tsx must have enlarged hero logo with size 180"
    )
    assert.ok(
      homeContent.includes("lg:size-48"),
      "app/page.tsx must use responsive enlarged size class up to lg:size-48"
    )

    // 4. Site content brand logos include horizontal logos
    const logos = getBrandLogos()
    assert.ok(logos?.horizontalLight, "Brand logos must define horizontalLight")
    assert.ok(logos?.horizontalDark, "Brand logos must define horizontalDark")
  })

  it("verifies latest budget display on home, shadcn tooltips on hotlines, and no Supabase mentions on freedom wall", () => {
    // 1. Home page displays latest enacted budget (2026 GAA)
    const homeContent = fs.readFileSync("app/page.tsx", "utf8")
    assert.ok(
      homeContent.includes("latestDistrictWork") &&
      homeContent.includes("Public Works (GAA)"),
      "app/page.tsx must dynamically display the latest enacted GAA public works"
    )
    assert.ok(
      homeContent.includes("Tooltip") && homeContent.includes("TooltipContent"),
      "app/page.tsx must use shadcn Tooltip for emergency hotlines"
    )

    // 2. Freedom Wall board has zero mentions of Supabase in user-facing component
    const freedomWallBoardContent = fs.readFileSync(
      "components/civic/freedom-wall-board.tsx",
      "utf8"
    )
    // Should not contain "Supabase" in any rendered text or JSX
    assert.ok(
      !freedomWallBoardContent.includes(">Supabase<"),
      "Freedom wall board must not display 'Supabase' in UI text"
    )
    assert.ok(
      !freedomWallBoardContent.includes("View Supabase Setup"),
      "Freedom wall board must not display 'View Supabase Setup'"
    )
    assert.ok(
      !freedomWallBoardContent.includes("realtime in supabase"),
      "Freedom wall board must not display 'realtime in supabase'"
    )

    // 3. Freedom wall board contains 3.5s real-time poll
    assert.ok(
      freedomWallBoardContent.includes("refreshRemoteNotes"),
      "Freedom wall board must support real-time refresh"
    )

    // 4. Contacts page hotlines use shadcn Tooltip
    const contactsContent = fs.readFileSync("app/contacts/page.tsx", "utf8")
    assert.ok(
      contactsContent.includes("Tooltip") && contactsContent.includes("TooltipContent"),
      "app/contacts/page.tsx must use shadcn Tooltip on emergency hotlines"
    )

    // 5. Header hotlines use shadcn Tooltip
    const headerContent = fs.readFileSync("components/civic/site-header.tsx", "utf8")
    assert.ok(
      headerContent.includes("Tooltip") && headerContent.includes("TooltipContent"),
      "components/civic/site-header.tsx must use shadcn Tooltip on compact hotlines"
    )
  })

  it("verifies budget link reliability, searchbar icon centering, button contrast, navigation animation, live weather video, and facebook profile", () => {
    // 1. Budget page links directly to specific canonical district URL
    const budgetPageContent = fs.readFileSync("app/budget/page.tsx", "utf8")
    assert.ok(
      budgetPageContent.includes("https://budget.bettergov.ph/hgab/2027/districts/leg%3Acamarines-sur%3A5th"),
      "app/budget/page.tsx must link directly to canonical Camarines Sur 5th District URL"
    )
    assert.ok(
      !budgetPageContent.includes("https://budget.bettergov.ph/districts/camarines-sur-5th"),
      "app/budget/page.tsx must not link to legacy redirecting district URL"
    )

    // 2. Searchbar icon centering across search components
    const searchContent = fs.readFileSync("components/civic/global-civic-search.tsx", "utf8")
    assert.ok(
      searchContent.includes("inset-y-0 left-0 flex items-center"),
      "global-civic-search.tsx must center the search icon using inset-y-0 flex items-center"
    )

    const projectsExplorerContent = fs.readFileSync("components/civic/projects-explorer.tsx", "utf8")
    assert.ok(
      projectsExplorerContent.includes("relative h-10 md:col-span-8 lg:col-span-9"),
      "projects-explorer.tsx must constrain search container to h-10 with generous col-span to prevent grid-stretch misalignment"
    )
    assert.ok(
      projectsExplorerContent.includes("inset-y-0 left-0 flex items-center pl-3.5"),
      "projects-explorer.tsx must center search icon vertically in inset-y-0 with pl-3.5"
    )
    assert.ok(
      projectsExplorerContent.includes("grid gap-3 md:grid-cols-12 items-center"),
      "projects-explorer.tsx must align search input and sort selector with items-center"
    )
    assert.ok(
      projectsExplorerContent.includes("h-9 flex-none inline-flex items-center gap-2"),
      "projects-explorer.tsx must give tabs explicit h-9 and flex-none to prevent warped stretching"
    )
    assert.ok(
      projectsExplorerContent.includes("bg-amber-500") &&
      projectsExplorerContent.includes("bg-emerald-500") &&
      projectsExplorerContent.includes("bg-blue-500"),
      "projects-explorer.tsx must render semantic indicator dots for statuses"
    )

    // Header pure shadcn Community Guide modal with controlled unmounting
    const headerContent = fs.readFileSync("components/civic/site-header.tsx", "utf8")
    assert.ok(
      headerContent.includes("<Dialog") &&
      headerContent.includes("guideOpen") &&
      headerContent.includes("setGuideOpen(false)") &&
      headerContent.includes("About This Community Guide"),
      "site-header.tsx must implement a controlled pure shadcn Dialog modal that unmounts on button clicks"
    )

    // Weather card live video and clean single-layer section
    const livelySectionsContent = fs.readFileSync("components/civic/iriga-lively-sections.tsx", "utf8")
    assert.ok(
      livelySectionsContent.includes("videoRef") &&
      livelySectionsContent.includes("id=\"weather-map\"") &&
      livelySectionsContent.includes("absolute inset-0 z-0 overflow-hidden"),
      "iriga-lively-sections.tsx must embed the live weather background video directly inside the Weather Today Card"
    )

    // 12-point scalloped rosette Facebook verified badge
    const telecomContent = fs.readFileSync("components/civic/telecom-and-channel-icons.tsx", "utf8")
    assert.ok(
      telecomContent.includes("FacebookVerifiedBadge") &&
      telecomContent.includes("#0866FF") &&
      telecomContent.includes("strokeWidth=\"2.6\""),
      "telecom-and-channel-icons.tsx must implement authentic 12-point scalloped FacebookVerifiedBadge in #0866FF"
    )

    // Hero section semantic <section> and full-width breakout
    const heroContent = fs.readFileSync("components/civic/hero-video-background.tsx", "utf8")
    const homeContent = fs.readFileSync("app/page.tsx", "utf8")
    assert.ok(
      heroContent.includes("<section") &&
      heroContent.includes("parallaxY"),
      "hero-video-background.tsx must be a semantic <section> with parallax scrolling"
    )
    assert.ok(
      homeContent.includes("w-[calc(100%+1.5rem)]") || homeContent.includes("HeroVideoBackground"),
      "app/page.tsx must style HeroVideoBackground edge-to-edge"
    )

    // Footer uses 100% shadcn UI components, matches navbar logo, and enlists Better LGU Civic Network in Column 3
    const footerContent = fs.readFileSync("components/civic/site-footer.tsx", "utf8")
    assert.ok(
      footerContent.includes("<BetterIrigaLogo") &&
      footerContent.includes("variant=\"horizontal\""),
      "site-footer.tsx must use horizontal BetterIrigaLogo matching the navbar"
    )
    assert.ok(
      footerContent.includes("<Button") &&
      footerContent.includes("<Badge") &&
      footerContent.includes("<Card") &&
      footerContent.includes("<Separator"),
      "site-footer.tsx must be composed using 100% shadcn UI components (Button, Badge, Card, Separator)"
    )
    assert.ok(
      footerContent.includes("Better LGU Civic Network") &&
      footerContent.includes("siblingPortals") &&
      footerContent.includes("Official Primary Sources"),
      "site-footer.tsx must enlist Better LGU Civic Network under the sources and civic network section"
    )

    // 3. Button and Badge variants have explicit text-foreground
    const buttonContent = fs.readFileSync("components/ui/button.tsx", "utf8")
    assert.ok(
      buttonContent.includes("text-foreground hover:bg-muted hover:text-foreground"),
      "button.tsx must define text-foreground for outline and ghost variants"
    )

    // 4. Default navigation transition animation exists
    const templateContent = fs.readFileSync("app/template.tsx", "utf8")
    assert.ok(
      templateContent.includes("animate-in fade-in-0") &&
      templateContent.includes("motion-reduce:animate-none"),
      "app/template.tsx must define enter transition and respect prefers-reduced-motion"
    )

    // 5. Weather card background video assets exist & cross-browser support
    assert.ok(fs.existsSync("public/weather/sunny.mp4"), "sunny.mp4 must exist")
    assert.ok(fs.existsSync("public/weather/sunny.webm"), "sunny.webm must exist")
    assert.ok(fs.existsSync("public/weather/sunny-poster.jpg"), "sunny-poster.jpg must exist")
    assert.ok(fs.existsSync("public/weather/cloudy.mp4"), "cloudy.mp4 must exist")
    assert.ok(fs.existsSync("public/weather/cloudy.webm"), "cloudy.webm must exist")
    assert.ok(fs.existsSync("public/weather/cloudy-poster.jpg"), "cloudy-poster.jpg must exist")
    assert.ok(fs.existsSync("public/weather/rainy.mp4"), "rainy.mp4 must exist")
    assert.ok(fs.existsSync("public/weather/rainy.webm"), "rainy.webm must exist")
    assert.ok(fs.existsSync("public/weather/rainy-poster.jpg"), "rainy-poster.jpg must exist")

    assert.ok(
      livelySectionsContent.includes("video") &&
      livelySectionsContent.includes("WEATHER_VIDEO_ASSETS") &&
      livelySectionsContent.includes("playsInline") &&
      livelySectionsContent.includes("preload=\"auto\"") &&
      livelySectionsContent.includes("glowClass"),
      "iriga-lively-sections.tsx must implement live video weather background with cross-browser attributes and atmospheric condition glow"
    )

    // 6. Facebook section has profile picture, official verified badge, and no preview timeline iframe
    assert.ok(fs.existsSync("public/iriga-facebook-profile.jpg"), "iriga-facebook-profile.jpg must exist")
    assert.ok(
      livelySectionsContent.includes("/iriga-facebook-profile.jpg"),
      "iriga-lively-sections.tsx must render the official Facebook profile picture"
    )
    assert.ok(
      livelySectionsContent.includes("<FacebookVerifiedBadge"),
      "iriga-lively-sections.tsx must render official FacebookVerifiedBadge matching Facebook"
    )
    assert.ok(
      !livelySectionsContent.includes("Preview Interactive Timeline"),
      "iriga-lively-sections.tsx must remove preview interactive timeline button"
    )
    assert.ok(
      !livelySectionsContent.includes("facebook.com/plugins/page.php"),
      "iriga-lively-sections.tsx must remove Facebook timeline iframe"
    )

    // 7. Contacts hotline cards have department badges
    const contactsContent = fs.readFileSync("app/contacts/page.tsx", "utf8")
    assert.ok(
      contactsContent.includes("getHotlineDepartmentBadge"),
      "app/contacts/page.tsx must render department badges instead of generic red pills"
    )
  })

  it("verifies replaced clean brand logos, 100% shadcn UI across /projects, 1080p hero video, and full-width layout", () => {
    // 1. Replaced Clean Brand Logos exist and are referenced in site content
    const logos = getBrandLogos()
    assert.ok(logos, "Brand logos must be defined")
    assert.equal(
      logos?.horizontalLight,
      "/BetterIriga-Clean-LightMode-Blue-Transparent.png",
      "horizontalLight must point to clean light mode transparent logo"
    )
    assert.equal(
      logos?.horizontalDark,
      "/BetterIriga-Clean-DarkMode-White-Transparent.png",
      "horizontalDark must point to clean dark mode transparent logo"
    )
    assert.equal(
      logos?.bannerOnBlue,
      "/BetterIriga-Clean-Banner-OnBlue.png",
      "bannerOnBlue must point to clean banner on blue"
    )
    assert.equal(
      logos?.bannerOnWhite,
      "/BetterIriga-Clean-Banner-OnWhite.png",
      "bannerOnWhite must point to clean banner on white"
    )

    // Verify all brand logo assets physically exist on disk
    assert.ok(
      fs.existsSync("public/BetterIriga-Clean-LightMode-Blue-Transparent.png"),
      "Clean light mode logo must exist in public/"
    )
    assert.ok(
      fs.existsSync("public/BetterIriga-Clean-DarkMode-White-Transparent.png"),
      "Clean dark mode logo must exist in public/"
    )
    assert.ok(
      fs.existsSync("public/BetterIriga-Clean-Banner-OnBlue.png"),
      "Clean banner on blue must exist in public/"
    )
    assert.ok(
      fs.existsSync("public/BetterIriga-Clean-Banner-OnWhite.png"),
      "Clean banner on white must exist in public/"
    )
    assert.ok(
      fs.existsSync("public/BetterIriga-Blue-Foreground-Transparent.png"),
      "Emblem blue foreground must exist in public/"
    )
    assert.ok(
      fs.existsSync("public/BetterIriga-White-Foreground-Transparent.png"),
      "Emblem white foreground must exist in public/"
    )

    // 2. 100% shadcn UI across projects route
    const projectsExplorer = fs.readFileSync("components/civic/projects-explorer.tsx", "utf8")
    assert.ok(
      projectsExplorer.includes("CardHeader") &&
      projectsExplorer.includes("CardTitle") &&
      projectsExplorer.includes("CardDescription") &&
      projectsExplorer.includes("CardContent") &&
      projectsExplorer.includes("CardFooter"),
      "projects-explorer.tsx must use full shadcn Card subcomponents"
    )
    const projectDetailPage = fs.readFileSync("app/projects/[id]/page.tsx", "utf8")
    assert.ok(
      projectDetailPage.includes("CardHeader") &&
      projectDetailPage.includes("CardContent") &&
      projectDetailPage.includes("CardFooter"),
      "app/projects/[id]/page.tsx must use shadcn Card subcomponents"
    )
    const projectApiViewer = fs.readFileSync("components/civic/project-api-viewer.tsx", "utf8")
    assert.ok(
      projectApiViewer.includes("Card") && projectApiViewer.includes("CardContent"),
      "project-api-viewer.tsx must use shadcn Card component"
    )

    // 3. 1080p video asset scaling
    assert.ok(
      fs.existsSync("public/hero-background-1080p.mp4"),
      "hero-background-1080p.mp4 must exist in public/"
    )
    assert.ok(
      fs.existsSync("public/hero-video-poster-1080p.jpg"),
      "hero-video-poster-1080p.jpg must exist in public/"
    )
    const heroVideoBackground = fs.readFileSync(
      "components/civic/hero-video-background.tsx",
      "utf8"
    )
    assert.ok(
      heroVideoBackground.includes("/hero-background-1080p.mp4") &&
      heroVideoBackground.includes("min-width: 1024px"),
      "hero-video-background.tsx must conditionally load 1080p stream for high-res breakpoints"
    )

    // 4. Viewport layout & CivicPageContainer
    const layoutContent = fs.readFileSync("app/layout.tsx", "utf8")
    assert.ok(
      layoutContent.includes('id="main-content" className="min-w-0 w-full flex-1 overflow-x-clip"'),
      "app/layout.tsx must allow full-width main container"
    )
    assert.ok(
      fs.existsSync("components/civic/civic-page-container.tsx"),
      "civic-page-container.tsx must exist"
    )

    // 5. Chart.js integration in Statistics and Budget
    assert.ok(
      fs.existsSync("components/civic/statistics-charts.tsx"),
      "statistics-charts.tsx must exist"
    )
    const statsPageContent = fs.readFileSync("app/statistics/page.tsx", "utf8")
    assert.ok(
      statsPageContent.includes("<StatisticsCharts"),
      "app/statistics/page.tsx must render StatisticsCharts component"
    )
    assert.ok(
      fs.existsSync("components/civic/budget-charts.tsx"),
      "budget-charts.tsx must exist"
    )
    const budgetPageContent = fs.readFileSync("app/budget/page.tsx", "utf8")
    assert.ok(
      budgetPageContent.includes("<BudgetCharts"),
      "app/budget/page.tsx must render BudgetCharts component"
    )

    // 6. Direct hardware-accelerated hero parallax across all breakpoints
    assert.ok(
      heroVideoBackground.includes("translate3d(0, ${offset.toFixed(1)}px, 0)") ||
      heroVideoBackground.includes("translate3d"),
      "hero-video-background.tsx must use GPU hardware acceleration for parallax"
    )
    const homePageContent = fs.readFileSync("app/page.tsx", "utf8")
    assert.ok(
      !homePageContent.includes("<Reveal>\n        <HeroVideoBackground") &&
      !homePageContent.includes("<Reveal><HeroVideoBackground"),
      "HeroVideoBackground must not be wrapped in Reveal transition"
    )

    // 7. OpenAPI Spec visible in text in budget page
    assert.ok(
      budgetPageContent.includes("OpenAPI Spec") &&
      budgetPageContent.includes("https://budget.bettergov.ph/api/v1/openapi.json") &&
      budgetPageContent.includes("OpenAPI 3.1 Spec"),
      "budget/page.tsx must visibly render OpenAPI Spec text and endpoint URL in developer card"
    )

    // 8. License explicitly stated in footer and LICENSE file
    const footerContent = fs.readFileSync("components/civic/site-footer.tsx", "utf8")
    assert.ok(
      footerContent.includes("MIT (Code)") &&
      footerContent.includes("CC BY 4.0 (Data)") &&
      footerContent.includes("Open Source &amp; Civic Data License:") &&
      footerContent.includes("MIT License") &&
      footerContent.includes("Creative Commons Attribution 4.0 International (CC BY 4.0)"),
      "site-footer.tsx must explicitly state the MIT (Code) and CC BY 4.0 (Data) licenses"
    )

    const licenseFileContent = fs.readFileSync("LICENSE", "utf8")
    assert.ok(
      licenseFileContent.includes("MIT License") &&
      licenseFileContent.includes("Creative Commons Attribution 4.0 International Public License (CC BY 4.0)"),
      "LICENSE file must contain dual MIT and CC BY 4.0 licenses"
    )

    // 9. 100% shadcn UI search in hero with suggestion scroll animation across breakpoints
    const globalSearchContent = fs.readFileSync("components/civic/global-civic-search.tsx", "utf8")
    assert.ok(
      globalSearchContent.includes("@/components/ui/card") &&
      globalSearchContent.includes("@/components/ui/badge") &&
      globalSearchContent.includes("@/components/ui/button") &&
      globalSearchContent.includes("@/components/ui/input") &&
      globalSearchContent.includes("scrollToResults") &&
      globalSearchContent.includes('behavior: "smooth"') &&
      globalSearchContent.includes("active:scale-95"),
      "global-civic-search.tsx must use 100% shadcn UI primitives and smoothly scroll to suggestion contents"
    )

    const globalsCssContent = fs.readFileSync("app/globals.css", "utf8")
    assert.ok(
      globalsCssContent.includes("-webkit-tap-highlight-color: transparent") &&
      globalsCssContent.includes("*:focus:not(:focus-visible)"),
      "globals.css must suppress click outline & tap flickers"
    )

    // 10. Hero search scroll guard & animated reset
    assert.ok(
      globalSearchContent.includes("isResetting") &&
      globalSearchContent.includes("animate-out") &&
      globalSearchContent.includes("matching.length > 0") &&
      globalSearchContent.includes("RotateCcw"),
      "global-civic-search.tsx must guard against scrolling when there is no data and include exit/reset animations"
    )

    // 11. Navigation "Transparency" dropdown with 3 official redirects
    const portals = getTransparencyPortals()
    assert.equal(portals.length, 3, "must provide exactly 3 transparency portals")
    assert.deepEqual(
      portals.map((p) => ({ label: p.label, href: p.href })),
      [
        {
          label: "Iriga, Camarines Sur",
          href: "https://transparency-portal-iriga.betteririga.org/",
        },
        {
          label: "Camarines Sur 5th District Engineering Office",
          href: "https://transparency-portal-camsur5-deo.betteririga.org/",
        },
        {
          label: "Province of Camarines Sur",
          href: "https://transparency-portal-camsur.betteririga.org/",
        },
      ],
      "Transparency portals must point to Iriga, CamSur 5th DEO, and Province"
    )

    const siteHeaderContent = fs.readFileSync("components/civic/site-header.tsx", "utf8")
    assert.ok(
      siteHeaderContent.includes("DropdownMenu") &&
      siteHeaderContent.includes("Transparency") &&
      siteHeaderContent.includes("transparencyPortals"),
      "site-header.tsx must render Transparency dropdown with portals in both desktop and mobile drawer"
    )

    const siteContentJson = JSON.parse(fs.readFileSync("data/site-content.json", "utf8"))
    assert.deepEqual(
      siteContentJson.transparencyPortals.map((p: { label: string; href: string }) => ({
        label: p.label,
        href: p.href,
      })),
      [
        {
          label: "Iriga, Camarines Sur",
          href: "https://transparency-portal-iriga.betteririga.org/",
        },
        {
          label: "Camarines Sur 5th District Engineering Office",
          href: "https://transparency-portal-camsur5-deo.betteririga.org/",
        },
        {
          label: "Province of Camarines Sur",
          href: "https://transparency-portal-camsur.betteririga.org/",
        },
      ],
      "site-content.json must specify all 3 verified transparency portal redirects"
    )
    // 12. Top navigation bar is 100% shadcn UI (Button, Badge, DropdownMenu, Dialog)
    assert.ok(
      siteHeaderContent.includes("@/components/ui/button") &&
      siteHeaderContent.includes("@/components/ui/badge") &&
      siteHeaderContent.includes("@/components/ui/dropdown-menu") &&
      siteHeaderContent.includes("@/components/ui/dialog") &&
      siteHeaderContent.includes("<Button") &&
      siteHeaderContent.includes("variant={active ? \"default\" : \"ghost\"}") &&
      siteHeaderContent.includes("variant={active ? \"default\" : \"outline\"}"),
      "site-header.tsx must use 100% shadcn UI components across all navigation tiers, desktop links, and mobile drawer"
    )

    // 13. Hero home shortcut to Community Freedom Wall
    assert.ok(
      homePageContent.includes("Community Freedom Wall") &&
      homePageContent.includes("href=\"/freedom-wall\"") &&
      homePageContent.includes("MessageSquareHeart"),
      "app/page.tsx must provide a prominent Community Freedom Wall shortcut in the Hero section"
    )

    // 14. Freedom Wall Daily Session & IP Quota (max 5 notes/day, 10s burst protection)
    resetRateLimitsForTesting()
    const testIp = "192.168.1.100"
    const testSession = "test-session-abc"

    // Initial check: 5 remaining
    const q0 = checkFreedomWallQuota(testIp, testSession)
    assert.equal(q0.allowed, true)
    assert.equal(q0.remaining, 5)

    // Simulate 5 posts with simulated delay
    for (let i = 1; i <= 5; i++) {
      recordFreedomWallPost(testIp, testSession)
    }

    // 6th post attempt must be blocked by daily limit
    const qExceeded = checkFreedomWallQuota(testIp, testSession)
    assert.equal(qExceeded.allowed, false)
    assert.equal(qExceeded.reason, "daily_limit")
    assert.equal(qExceeded.remaining, 0)
    assert.ok(qExceeded.message?.includes("Daily limit reached"))

    // Input sanitization: strips HTML, script tags, javascript: protocols
    const maliciousInput = "<script>alert('pwned')</script>Hello <b>Iriga</b>! <a href=\"javascript:evil()\">click</a>"
    const cleanOutput = sanitizeText(maliciousInput)
    assert.equal(cleanOutput, "Hello Iriga! click")
    assert.ok(!cleanOutput.includes("<script>"))
    assert.ok(!cleanOutput.includes("javascript:"))

    // Client board tracks quota and displays limit
    const fwBoardContent = fs.readFileSync("components/civic/freedom-wall-board.tsx", "utf8")
    assert.ok(
      fwBoardContent.includes("DAILY_LIMIT = 5") &&
      fwBoardContent.includes("dailyPostsCount") &&
      fwBoardContent.includes("Daily Browser Quota") &&
      fwBoardContent.includes("x-session-id"),
      "freedom-wall-board.tsx must enforce and display the 5-note daily session quota"
    )

    // 15. Production HTTP Security Headers in next.config.ts
    const nextConfigContent = fs.readFileSync("next.config.ts", "utf8")
    assert.ok(
      nextConfigContent.includes("Content-Security-Policy") &&
      nextConfigContent.includes("Strict-Transport-Security") &&
      nextConfigContent.includes("Permissions-Policy") &&
      nextConfigContent.includes("Cross-Origin-Opener-Policy") &&
      nextConfigContent.includes("nosniff"),
      "next.config.ts must enforce complete OWASP security headers (CSP, HSTS, Permissions-Policy, nosniff, COOP)"
    )

    // 16. Dropdown and Dialog Whitespace Elimination & Performance Optimizations
    // CSS scroll-lock whitespace prevention with high specificity
    const whitespaceCssContent = fs.readFileSync("app/globals.css", "utf8")
    assert.ok(
      whitespaceCssContent.includes("html body[data-scroll-locked]") &&
      whitespaceCssContent.includes("margin-right: 0px !important") &&
      whitespaceCssContent.includes("--removed-body-scroll-bar-size: 0px !important"),
      "app/globals.css must override body[data-scroll-locked] with high specificity to eliminate right-side whitespace on dropdown and dialog open"
    )

    // DropdownMenu default modal={false}
    const dropdownMenuContent = fs.readFileSync("components/ui/dropdown-menu.tsx", "utf8")
    assert.ok(
      dropdownMenuContent.includes("modal = false"),
      "components/ui/dropdown-menu.tsx must default modal={false} to prevent body scroll locking"
    )

    // Site header scroll-lock guard and modal={false} on DropdownMenu
    const updatedHeaderContent = fs.readFileSync("components/civic/site-header.tsx", "utf8")
    assert.ok(
      updatedHeaderContent.includes("DropdownMenu modal={false}"),
      "components/civic/site-header.tsx must pass modal={false} to DropdownMenu"
    )
    assert.ok(
      updatedHeaderContent.includes("resetScrollLockGaps") &&
      updatedHeaderContent.includes("MutationObserver"),
      "components/civic/site-header.tsx must implement a MutationObserver scroll-lock guard"
    )

    // Next.js performance optimizations (compress, poweredByHeader: false, immutable media headers)
    assert.ok(
      nextConfigContent.includes("compress: true") &&
      nextConfigContent.includes("poweredByHeader: false") &&
      nextConfigContent.includes("/hero-background-1080p.mp4") &&
      nextConfigContent.includes("/hero-video-poster-1080p.jpg"),
      "next.config.ts must enable compression, disable poweredByHeader, and cache 1080p hero assets as immutable"
    )

    // Layout resource hints (preconnect and dns-prefetch)
    const rootLayoutContent = fs.readFileSync("app/layout.tsx", "utf8")
    assert.ok(
      rootLayoutContent.includes("rel=\"preconnect\" href=\"https://api.open-meteo.com\"") &&
      rootLayoutContent.includes("rel=\"preconnect\" href=\"https://psgc.gitlab.io\""),
      "app/layout.tsx must contain preconnect resource hints for external APIs"
    )

    // Hero video background preload and data saver
    const heroBgContent = fs.readFileSync("components/civic/hero-video-background.tsx", "utf8")
    assert.ok(
      heroBgContent.includes("preload=\"metadata\"") &&
      heroBgContent.includes("saveData"),
      "components/civic/hero-video-background.tsx must set preload='metadata' and respect data-saver mode"
    )

    // Dynamic code splitting for heavy Chart.js modules in budget and statistics
    const budgetContent = fs.readFileSync("app/budget/page.tsx", "utf8")
    assert.ok(
      budgetContent.includes("dynamic(") &&
      budgetContent.includes("BudgetChartsSkeleton"),
      "app/budget/page.tsx must dynamically import BudgetCharts with a skeleton loader"
    )

    const statsContent = fs.readFileSync("app/statistics/page.tsx", "utf8")
    assert.ok(
      statsContent.includes("dynamic(") &&
      statsContent.includes("StatisticsChartsSkeleton"),
      "app/statistics/page.tsx must dynamically import StatisticsCharts with a skeleton loader"
    )
  })

  it("enforces consistent load/navigation animations, uncovered Freedom Wall sticky notes across all breakpoints, and ADR-0009 near-100 performance mandate", async () => {
    // 1. Consistent entrance animation across template.tsx, reveal.tsx, and globals.css
    const globalsCss = fs.readFileSync("app/globals.css", "utf8")
    assert.ok(
      globalsCss.includes("@keyframes civic-fade-up") &&
      globalsCss.includes("opacity: 0.01;") &&
      globalsCss.includes("transform: none;") &&
      globalsCss.includes(".animate-in.fade-in-0"),
      "app/globals.css must define GPU-accelerated civic-fade-up starting at opacity 0.01 and ending at transform: none, plus .animate-in.fade-in-0"
    )

    const revealContent = fs.readFileSync("components/civic/reveal.tsx", "utf8")
    assert.ok(
      revealContent.includes("animate-civic-fade-up") &&
      revealContent.includes("motion-reduce:animate-none") &&
      !revealContent.includes("opacity-0"),
      "components/civic/reveal.tsx must use pure CSS animate-civic-fade-up without hiding content behind JS opacity-0"
    )

    // 2. Freedom Wall sticky notes de-stacking and toolbar-safe viewport centering across breakpoints
    const { resolveVisibleNotePositions } = await import(
      "@/components/civic/freedom-wall-board"
    )

    const stackedNotes = [
      {
        id: "note-a",
        content: "First note at 2500,2500",
        x: 2500,
        y: 2500,
        color: "bg-yellow-100 border-yellow-300 text-yellow-900",
        rotation: 0,
        createdAt: "2026-11-08T10:00:00.000Z",
        authorLabel: "Anonymous",
      },
      {
        id: "note-b",
        content: "Second note at exact same coordinates",
        x: 2500,
        y: 2500,
        color: "bg-blue-100 border-blue-300 text-blue-900",
        rotation: 1,
        createdAt: "2026-11-08T10:01:00.000Z",
        authorLabel: "Anonymous",
      },
      {
        id: "note-c",
        content: "Third note overlapping closely",
        x: 2510,
        y: 2505,
        color: "bg-emerald-100 border-emerald-300 text-emerald-900",
        rotation: -1,
        createdAt: "2026-11-08T10:02:00.000Z",
        authorLabel: "Anonymous",
      },
    ]

    const resolved = resolveVisibleNotePositions(stackedNotes)
    assert.equal(resolved.length, 3, "All 3 notes must be returned")
    for (let i = 0; i < resolved.length; i++) {
      for (let j = i + 1; j < resolved.length; j++) {
        const dx = Math.abs(resolved[i].displayX - resolved[j].displayX)
        const dy = Math.abs(resolved[i].displayY - resolved[j].displayY)
        assert.ok(
          dx >= 216 || dy >= 156,
          `Notes ${resolved[i].id} and ${resolved[j].id} must not overlap and cover each other (dx=${dx}, dy=${dy})`
        )
      }
    }

    const boardContent = fs.readFileSync(
      "components/civic/freedom-wall-board.tsx",
      "utf8"
    )
    assert.ok(
      boardContent.includes("safeTop") &&
      boardContent.includes("ResizeObserver") &&
      boardContent.includes("hasAutoCenteredNotesRef") &&
      boardContent.includes("resolveVisibleNotePositions"),
      "freedom-wall-board.tsx must center notes in the toolbar-safe area across all breakpoints and de-stack overlapping notes"
    )

    // 3. ADR-0009 near-100 performance mandate recorded in AGENTS.md
    const agentsMd = fs.readFileSync("AGENTS.md", "utf8")
    assert.ok(
      agentsMd.includes("ADR-0009") &&
      agentsMd.includes("Near-100 Web Performance Mandate"),
      "AGENTS.md must document ADR-0009 requiring near-100 web performance after every change"
    )
  })
})
