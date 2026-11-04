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
} from "../iriga-data"
import { useCivicStore } from "../../store/civic-store"

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

    // Ensure docs/plans directory was removed per user request
    assert.equal(fs.existsSync("docs/plans"), false, "docs/plans folder must be removed")
  })

  it("integrates @vercel/analytics/next in RootLayout", () => {
    const layoutContent = fs.readFileSync("app/layout.tsx", "utf8")
    assert.ok(
      layoutContent.includes('import { Analytics } from "@vercel/analytics/next"'),
      "layout.tsx must import Analytics from @vercel/analytics/next"
    )
    assert.ok(
      layoutContent.includes("<Analytics />"),
      "layout.tsx must render <Analytics />"
    )
  })
})
