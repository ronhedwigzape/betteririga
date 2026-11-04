/**
 * BetterIriga.org — Central Zod Schema Contract
 *
 * Every civic Record, Citation, BetterGov.ph dataset item, page metadata entry,
 * Freedom Wall sticky note, and local UI configuration is validated through
 * these Zod schemas so malformed or uncited data can never enter the store or UI.
 */

import { z } from "zod"

export const CitationSchema = z.object({
  sourceUrl: z
    .string()
    .min(8, "Citation sourceUrl is required")
    .refine(
      (url) => url.startsWith("https://"),
      "Citation sourceUrl must start with https://"
    ),
  sourceName: z
    .string()
    .min(3, "Citation sourceName must be at least 3 characters"),
  retrievedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Citation retrievedAt must be YYYY-MM-DD"),
  archiveUrl: z.string().url().optional(),
})

export const WeatherHourlySlotSchema = z.object({
  timeLabel: z.string().min(1),
  tempC: z.number(),
  isRainy: z.boolean(),
})

export const WeatherBaselineSchema = z.object({
  temperatureC: z.number(),
  conditionLabel: z.string().min(1),
  humidityPct: z.number(),
  windKmh: z.number(),
  usdPhpFallback: z.string().min(1),
  hourly: z.array(WeatherHourlySlotSchema).min(1),
})

export const CityProfileSchema = z.object({
  officialName: z.string().min(1),
  vernacularName: z.string().min(1),
  monikers: z.array(z.string().min(1)),
  psgcCode: z.string().min(9),
  psgc10DigitCode: z.string().length(10),
  province: z.string().min(1),
  provincePsgc: z.string().min(1),
  region: z.string().min(1),
  regionPsgc: z.string().min(1),
  legislativeDistrict: z.string().min(1),
  incomeClass: z.string().min(1),
  barangayCount: z.number().int().positive(),
  landAreaSqKm: z.number().positive(),
  landUseBreakdown: z.object({
    agriculturalPct: z.number(),
    urbanizedPct: z.number(),
    forestPct: z.number(),
  }),
  population2024: z.number().int().positive(),
  population2020: z.number().int().positive(),
  population2015: z.number().int().positive(),
  households2015: z.number().int().positive(),
  growthRatePct: z.number(),
  urbanPopulationPct: z.number(),
  ruralPopulationPct: z.number(),
  cityHallAddress: z.string().min(1),
  coordinatesHint: z.string().min(1),
  patronSaintFiesta: z.string().min(1),
  majorFestival: z.string().min(1),
  geo: z.object({
    latitude: z.number(),
    longitude: z.number(),
    postalCode: z.string().min(1),
    osmEmbedUrl: z.string().url(),
    osmLinkUrl: z.string().url(),
    landmarks: z.array(z.string().min(1)).min(1),
  }),
  weatherBaseline: WeatherBaselineSchema,
  historyTimeline: z
    .array(
      z.object({
        year: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
      })
    )
    .min(1),
  historyHighlights: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
      })
    )
    .min(1),
  citation: CitationSchema,
})

export const OfficialTermSchema = z.enum(["2025-2028", "2022-2025"])

export const ElectedOfficialSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  position: z.string().min(1),
  roleCategory: z.enum(["Executive", "Legislative", "Ex-Officio"]),
  term: OfficialTermSchema,
  party: z.string().optional(),
  officePhone: z.string().optional(),
  officeEmail: z.string().optional(),
  notes: z.string().optional(),
  gaps: z.array(z.string()).optional(),
  citation: CitationSchema,
})

export const AppointedOfficialSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  title: z.string().min(1),
  office: z.string().min(1),
  officePhone: z.string().optional(),
  officeEmail: z.string().optional(),
  gaps: z.array(z.string()).optional(),
  citation: CitationSchema,
})

export const BarangayRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  punongBarangay: z.string().min(1),
  classification: z.enum([
    "Urban / Poblacion & Environs",
    "Rural / Upland & Agro-Ecological",
  ]),
  gaps: z.array(z.string()).optional(),
  citation: CitationSchema,
})

export const NationalTaxAllotmentRecordSchema = z.object({
  id: z.string().min(1),
  fiscalYear: z.number().int(),
  amountPhp: z.number().positive(),
  legalBasis: z.string().min(1),
  description: z.string().min(1),
  yoyChangePct: z.number().optional(),
  citation: CitationSchema,
})

export const StatutoryAllocationRuleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  statutoryShare: z.string().min(1),
  legalBasis: z.string().min(1),
  estimatedFy2025Php: z.number().positive(),
  purpose: z.string().min(1),
  citation: CitationSchema,
})

export const BudgetDisclosureItemSchema = z.object({
  id: z.string().min(1),
  documentTitle: z.string().min(1),
  responsibleAgency: z.string().min(1),
  period: z.string().min(1),
  status: z.enum(["verified", "gap"]),
  summary: z.string().min(1),
  gapReason: z.string().min(1),
  citation: CitationSchema,
})

export const ProjectRecordSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum([
    "Infrastructure",
    "Social Program",
    "Health & Rehabilitation",
  ]),
  status: z.enum(["Ongoing", "Completed", "Planning"]),
  location: z.string().min(1),
  implementingAgency: z.string().min(1),
  contractOrReferenceId: z.string().optional(),
  contractor: z.string().optional(),
  amountPhp: z.number().positive().optional(),
  amountNote: z.string().min(1),
  period: z.string().min(1),
  engineeringMarker: z.string().optional(),
  summary: z.string().min(1),
  gaps: z.array(z.string()).optional(),
  citation: CitationSchema,
})

export const LegislativeMeasureSchema = z.object({
  id: z.string().min(1),
  number: z.string().min(1),
  year: z.number().int(),
  kind: z.enum(["Ordinance", "Resolution"]),
  topic: z.enum([
    "Revenue & Taxation",
    "Tourism & Culture",
    "Environment & Agriculture",
    "Public Safety",
    "Business & Commerce",
    "Land Use & Zoning",
  ]),
  title: z.string().min(1),
  summary: z.string().min(1),
  pdfUrl: z.string().optional(),
  archivePdfUrl: z.string().optional(),
  gaps: z.array(z.string()).optional(),
  citation: CitationSchema,
})

export const OfficeContactSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum([
    "Executive & Legislative",
    "Finance & Administration",
    "Infrastructure & Planning",
    "Health, Social Welfare & Sectors",
    "Public Safety & Operations",
    "Economic, Agriculture & Tourism",
  ]),
  departmentHead: z.string().optional(),
  landline: z.string().optional(),
  email: z.string().optional(),
  location: z.string().min(1),
  gaps: z.array(z.string()).optional(),
  citation: CitationSchema,
})

export const EmergencyHotlineSchema = z.object({
  id: z.string().min(1),
  agency: z.string().min(1),
  label: z.string().min(1),
  number: z.string().min(1),
  telHref: z.string().min(4),
  networkOrType: z.enum([
    "Smart Mobile",
    "Globe Mobile",
    "Landline (054)",
    "National Emergency",
  ]),
  priority: z.enum(["primary", "secondary"]),
  citation: CitationSchema,
})

export const OfficialChannelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  platform: z.enum([
    "Official Website",
    "Facebook Page",
    "National Transparency Portal",
  ]),
  url: z.string().url(),
  handleOrDomain: z.string().min(1),
  verifiedNote: z.string().min(1),
  citation: CitationSchema,
})

export const DataSourceRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ownerAgency: z.string().min(1),
  url: z.string().url(),
  format: z.string().min(1),
  accessType: z.enum([
    "Direct Public Access",
    "Online & Saved Archive",
    "Published Document / PDF",
    "Protected by Privacy Law",
  ]),
  status: z.enum([
    "active",
    "archived-fallback",
    "manual-extraction-needed",
    "restricted-by-law",
  ]),
  irigaCoverage: z.string().min(1),
  notes: z.string().min(1),
  citation: CitationSchema,
})

export const BetterGovRecordSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum([
    "DPWH 5th DEO Contract",
    "DPWH Education Infrastructure",
    "GAA / House Bill Public Works",
    "Legislative District Representation",
  ]),
  district: z.string().min(1),
  location: z.string().min(1),
  contractorOrProponent: z.string().min(1),
  fundingSource: z.string().min(1),
  amountPhp: z.number().positive().optional(),
  amountDisplay: z.string().min(1),
  status: z.string().min(1),
  duration: z.string().optional(),
  engineeringMarker: z.string().optional(),
  plainSummary: z.string().min(1),
  citation: CitationSchema,
})

export const BetterGovDatasetSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.object({
    id: z.number().int(),
    name: z.string().min(1),
  }),
  publisher: z
    .object({
      id: z.number().int(),
      name: z.string().min(1),
    })
    .nullable()
    .optional(),
  sizeBytes: z.number().nonnegative(),
  license: z.string().min(1),
  licenseUrl: z.string().nullable().optional(),
  latestVersionDate: z.string().min(1),
  resourceCount: z.number().nonnegative(),
  tags: z.array(z.string()),
  portalUrl: z.string().url(),
  apiUrl: z.string().url(),
  citation: CitationSchema,
})

export const NationalBudgetGaaYearSchema = z.object({
  year: z.number().int(),
  amountPhp: z.number().positive(),
  lineItems: z.number().int().positive(),
  displayTotal: z.string().min(1),
  status: z.string().min(1),
})

export const NationalBudgetDepartmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  amountPhp: z.number().positive(),
  baseAmountPhp: z.number().positive(),
  deltaPhp: z.number(),
  pctChange: z.number(),
})

export const NationalBudgetNepSchema = z.object({
  fiscalYear: z.number().int(),
  proposedAmountPhp: z.number().positive(),
  baseAmountPhp: z.number().positive(),
  deltaPhp: z.number(),
  pctChange: z.number(),
  lineItems: z.number().int().positive(),
  topDepartments: z.array(NationalBudgetDepartmentSchema).min(1),
})

export const BudgetCycleStageSchema = z.object({
  stage: z.string().min(1),
  order: z.number().int().positive(),
  title: z.string().min(1),
  badge: z.string().min(1),
  summary: z.string().min(1),
  details: z.string().min(1),
})

export const ExpenseClassItemSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  localImpact: z.string().min(1),
})

export const CamSur5thDistrictLedgerYearSchema = z.object({
  fy: z.number().int(),
  stage: z.string().min(1),
  stageLabel: z.string().min(1),
  scope: z.string().min(1),
  amountPhp: z.number().positive(),
  displayAmount: z.string().min(1),
})

export const CamSur5thDistrictLedgerSchema = z.object({
  districtId: z.string().min(1),
  districtLabel: z.string().min(1),
  representativeName: z.string().min(1),
  representativeCode: z.string().min(1),
  servingOffice: z.string().min(1),
  attributionTier: z.string().min(1),
  attributionMeaning: z.string().min(1),
  years: z.array(CamSur5thDistrictLedgerYearSchema).min(1),
})

export const NationalBudgetConfigSchema = z.object({
  meta: z.object({
    retrievedAt: z.string().min(1),
    docsUrl: z.string().url(),
    apiUrl: z.string().url(),
    mcpUrl: z.string().url(),
    openapiUrl: z.string().url(),
  }),
  gaaNationalTotals: z.array(NationalBudgetGaaYearSchema).min(1),
  nep2027National: NationalBudgetNepSchema,
  budgetCycleStages: z.array(BudgetCycleStageSchema).min(1),
  expenseClasses: z.array(ExpenseClassItemSchema).min(1),
  camSur5thDistrictLedger: CamSur5thDistrictLedgerSchema,
  citation: CitationSchema,
})

export const CivicServiceCategorySchema = z.enum([
  "Certificates & Civil Registry",
  "Business, Trade & Market",
  "Taxes, Assessment & Treasury",
  "Infrastructure, Zoning & Permits",
  "Social Welfare, Senior & PWD",
  "Health, Safety & Emergency",
  "Agriculture, Jobs & Livelihood",
  "Legal, Legislative & Public Records",
  "Youth, Education & Culture",
])

export const CivicServiceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: CivicServiceCategorySchema,
  officeId: z.string().min(1),
  officeName: z.string().min(1),
  officeHead: z.string().optional(),
  officePhone: z.string().optional(),
  officeEmail: z.string().optional(),
  officeLocation: z.string().min(1),
  whoCanApply: z.string().min(1),
  summary: z.string().min(1),
  steps: z.array(z.string().min(1)).min(1),
  requirements: z.array(z.string().min(1)).min(1),
  feeNote: z.string().min(1),
  processingTimeNote: z.string().min(1),
  charterPdfUrl: z.string().url().optional(),
  archiveCharterPdfUrl: z.string().url().optional(),
  gaps: z.array(z.string()).optional(),
  citation: CitationSchema,
})

export const StickyNoteColorOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  cardClass: z.string().min(1),
  dotClass: z.string().min(1),
})

export const FreedomWallStickyNoteSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1).max(500),
  x: z.number(),
  y: z.number(),
  color: z.string().min(1),
  rotation: z.number(),
  createdAt: z.string().min(1),
  authorLabel: z.string().min(1),
})

export const FreedomWallCanvasConfigSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  minScale: z.number().positive(),
  maxScale: z.number().positive(),
  defaultCenterX: z.number(),
  defaultCenterY: z.number(),
  maxMessageLength: z.number().int().positive(),
})

export const FreedomWallUiCopySchema = z.object({
  toolbarBadge: z.string().min(1),
  toolbarHint: z.string().min(1),
  resetViewLabel: z.string().min(1),
  addNoteButtonLabel: z.string().min(1),
  emptyStateTitle: z.string().min(1),
  emptyStateSubtitle: z.string().min(1),
  anonymousFooterLabel: z.string().min(1),
  modalTitle: z.string().min(1),
  modalSubtitle: z.string().min(1),
  messagePlaceholder: z.string().min(1),
  colorPickerLabel: z.string().min(1),
  previewLabel: z.string().min(1),
  cancelButtonLabel: z.string().min(1),
  submitButtonLabel: z.string().min(1),
  submittingButtonLabel: z.string().min(1),
  ctaSectionEyebrow: z.string().min(1),
  ctaSectionTitle: z.string().min(1),
  ctaSectionSubtitle: z.string().min(1),
  ctaPrimaryButtonLabel: z.string().min(1),
  ctaSecondaryButtonLabel: z.string().min(1),
  ctaTrustNote: z.string().min(1),
})

export const FreedomWallConfigSchema = z.object({
  guidelines: z.array(z.string().min(1)).min(1),
  canvas: FreedomWallCanvasConfigSchema,
  stickyColors: z.array(StickyNoteColorOptionSchema).min(6),
  uiCopy: FreedomWallUiCopySchema,
  seedNotes: z.array(FreedomWallStickyNoteSchema).max(0),
  citation: CitationSchema,
})

export const PageSeoMetadataSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
})

export const SiteMetadataConfigSchema = z.object({
  siteUrl: z.string().url(),
  siteName: z.string().min(1),
  defaultTitle: z.string().min(1),
  titleTemplate: z.string().min(1),
  defaultDescription: z.string().min(1),
  openGraphTitle: z.string().min(1),
  openGraphDescription: z.string().min(1),
  logoPath: z.string().min(1),
  logoAlt: z.string().min(1),
  locale: z.string().min(1),
  pages: z.object({
    home: PageSeoMetadataSchema,
    services: PageSeoMetadataSchema,
    officials: PageSeoMetadataSchema,
    budget: PageSeoMetadataSchema,
    projects: PageSeoMetadataSchema,
    ordinances: PageSeoMetadataSchema,
    legislative: PageSeoMetadataSchema.optional(),
    statistics: PageSeoMetadataSchema.optional(),
    contacts: PageSeoMetadataSchema,
    freedomWall: PageSeoMetadataSchema,
    about: PageSeoMetadataSchema,
    verification: PageSeoMetadataSchema,
    openData: PageSeoMetadataSchema.optional(),
  }),
})

export const PageHeaderContentSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
})

export const TabOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  countHint: z.string().optional(),
})

export const SortOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
})

export const ValidCivicSectionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  path: z.string().min(1),
})

export const BrandLogosSchema = z.object({
  lightMode: z.string().min(1),
  darkMode: z.string().min(1),
  badge: z.string().min(1),
  alt: z.string().min(1),
})

export const CarrierItemSchema = z.object({
  name: z.string().min(1),
  fullName: z.string().min(1),
  prefixes: z.array(z.string().min(1)),
  logo: z.string().optional(),
  icon: z.string().optional(),
})

export const CarrierRegistrySchema = z.object({
  smart: CarrierItemSchema,
  globe: CarrierItemSchema,
  landline: CarrierItemSchema,
})

export const HeroMediaSchema = z.object({
  videoMp4: z.string().min(1),
  videoWebm: z.string().min(1),
  poster: z.string().min(1),
  alt: z.string().min(1),
  credit: z.string().optional(),
  creditUrl: z.string().url().optional(),
})

export const NavigationItemSchema = z.object({
  href: z.string().min(1),
  label: z.string().min(1),
  iconKey: z.string().optional(),
})

export const DirectoryControlsSchema = z.object({
  serviceCategories: z.array(z.string().min(1)).min(1),
  officialTabs: z.array(TabOptionSchema).min(1),
  barangayClassifications: z.array(z.string().min(1)).min(1),
  projectSourceTabs: z.array(TabOptionSchema).min(1),
  projectStatuses: z.array(z.string().min(1)).min(1),
  projectCategories: z.array(z.string().min(1)).min(1),
  ordinanceKinds: z.array(z.string().min(1)).min(1),
  ordinanceTopics: z.array(z.string().min(1)).min(1),
  contactCategories: z.array(z.string().min(1)).min(1),
  validCivicSections: z.array(ValidCivicSectionSchema).min(1),
  carriers: CarrierRegistrySchema.optional(),
  sortOptions: z.object({
    projects: z.array(SortOptionSchema).min(1),
    ordinances: z.array(SortOptionSchema).min(1),
    services: z.array(SortOptionSchema).min(1),
    contacts: z.array(SortOptionSchema).min(1),
  }),
})

export const SiteContentSchema = z.object({
  metadata: SiteMetadataConfigSchema,
  brand: z.object({
    name: z.string().min(1),
    domainSuffix: z.string().min(1),
    fullDomain: z.string().min(1),
    regionBadge: z.string().min(1),
    tagline: z.string().min(1),
    hotlineBarLabel: z.string().min(1),
    cityQuickBadge: z.string().min(1),
    disclaimerBanner: z.string().min(1),
    verifiedPillText: z.string().min(1),
    verifyLinkLabel: z.string().min(1),
    costToPeopleLabel: z.string().min(1),
    costToPeopleValue: z.string().min(1),
    volunteerEmail: z.string().min(1),
    communityUrl: z.string().url(),
    logos: BrandLogosSchema.optional(),
  }),
  volunteerModal: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    lead: z.string().min(1),
    roles: z.array(z.string().min(1)).min(1),
    primaryCtaLabel: z.string().min(1),
    secondaryCtaLabel: z.string().min(1),
    skipLabel: z.string().min(1),
  }),
  navigation: z.array(NavigationItemSchema),
  directoryControls: DirectoryControlsSchema,
  searchFilters: z
    .array(
      z.object({
        label: z.string().min(1),
        section: z.enum([
          "all",
          "services",
          "officials",
          "budget",
          "projects",
          "bettergov",
          "ordinances",
          "contacts",
          "barangays",
        ]),
      })
    )
    .min(1),
  home: z.object({
    heroBadgePrefix: z.string().min(1),
    heroTitleHighlight: z.string().min(1),
    heroTitleMain: z.string().min(1),
    heroSubtitle: z.string().min(1),
    heroMedia: HeroMediaSchema.optional(),
    civicPillars: z.array(z.string().min(1)).optional(),
    searchPlaceholder: z.string().min(1),
    popularSearches: z.array(z.string().min(1)),
    pillarsHeading: z.string().min(1),
    pillarsSubheading: z.string().min(1),
    pillars: z.array(
      z.object({
        id: z.string().min(1),
        href: z.string().min(1),
        badge: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
        cta: z.string().min(1),
      })
    ),
    betterGovHighlightTitle: z.string().min(1),
    betterGovHighlightSubtitle: z.string().min(1),
  }),
  pages: z.object({
    services: PageHeaderContentSchema,
    officials: PageHeaderContentSchema,
    budget: PageHeaderContentSchema,
    projects: PageHeaderContentSchema,
    ordinances: PageHeaderContentSchema,
    legislative: PageHeaderContentSchema.optional(),
    statistics: PageHeaderContentSchema.optional(),
    contacts: PageHeaderContentSchema,
    freedomWall: PageHeaderContentSchema,
    about: PageHeaderContentSchema,
    verification: PageHeaderContentSchema,
    openData: PageHeaderContentSchema.optional(),
  }),
  siblingPortals: z.array(
    z.object({
      name: z.string().min(1),
      url: z.string().url(),
    })
  ),
})

export const CityStatisticsSchema = z.object({
  demographics: z.object({
    totalPopulation2020: z.number().positive(),
    totalPopulation2015: z.number().positive(),
    totalPopulation2010: z.number().positive(),
    annualGrowthRatePct: z.number(),
    landAreaKm2: z.number().positive(),
    densityPerKm2: z.number().positive(),
    totalHouseholds: z.number().positive(),
    barangayCount: z.number().positive(),
    urbanBarangayCount: z.number().positive(),
    ruralBarangayCount: z.number().positive(),
  }),
  fiscalOverview: z.object({
    latestNtaYear: z.number(),
    latestNtaAmountPhp: z.number().positive(),
    developmentFundPhp: z.number().positive(),
    calamityFundPhp: z.number().positive(),
    gadFundPhp: z.number().positive(),
    youthSkFundPhp: z.number().positive(),
  }),
  competitivenessCmci: z.object({
    category: z.string().min(1),
    pillars: z.array(
      z.object({
        name: z.string().min(1),
        scoreOrRank: z.string().min(1),
        description: z.string().min(1),
        highlights: z.array(z.string().min(1)),
      })
    ),
  }),
  economicAndSocial: z.object({
    povertyIncidencePct: z.number(),
    registeredBusinesses: z.number().positive(),
    seniorPensionBeneficiaries: z.number().positive(),
    publicMarketsAndHubs: z.number().positive(),
  }),
  barangayPopulations: z.array(
    z.object({
      name: z.string().min(1),
      population: z.number().positive(),
      classification: z.string().min(1),
      pctOfCity: z.number(),
    })
  ),
  citations: z.array(CitationSchema),
})

export const CivicDatasetSnapshotSchema = z.object({
  siteContent: SiteContentSchema,
  cityProfile: CityProfileSchema,
  services: z.array(CivicServiceSchema),
  electedOfficials: z.array(ElectedOfficialSchema),
  appointedOfficials: z.array(AppointedOfficialSchema),
  barangays: z.array(BarangayRecordSchema),
  nationalTaxAllotments: z.array(NationalTaxAllotmentRecordSchema),
  statutoryAllocationRules: z.array(StatutoryAllocationRuleSchema),
  budgetDisclosures: z.array(BudgetDisclosureItemSchema),
  projectsAndPrograms: z.array(ProjectRecordSchema),
  betterGovRecords: z.array(BetterGovRecordSchema),
  betterGovDatasets: z.array(BetterGovDatasetSchema).optional(),
  nationalBudget: NationalBudgetConfigSchema.optional(),
  ordinancesAndResolutions: z.array(LegislativeMeasureSchema),
  offices: z.array(OfficeContactSchema),
  emergencyHotlines: z.array(EmergencyHotlineSchema),
  officialChannels: z.array(OfficialChannelSchema),
  freedomWall: FreedomWallConfigSchema,
  dataSources: z.array(DataSourceRecordSchema),
  statistics: CityStatisticsSchema.optional(),
})

export type Citation = z.infer<typeof CitationSchema>
export type WeatherHourlySlot = z.infer<typeof WeatherHourlySlotSchema>
export type WeatherBaseline = z.infer<typeof WeatherBaselineSchema>
export type CityProfile = z.infer<typeof CityProfileSchema>
export type CivicServiceCategory = z.infer<typeof CivicServiceCategorySchema>
export type CivicService = z.infer<typeof CivicServiceSchema>
export type StickyNoteColorOption = z.infer<typeof StickyNoteColorOptionSchema>
export type FreedomWallStickyNote = z.infer<typeof FreedomWallStickyNoteSchema>
export type FreedomWallCanvasConfig = z.infer<
  typeof FreedomWallCanvasConfigSchema
>
export type FreedomWallUiCopy = z.infer<typeof FreedomWallUiCopySchema>
export type FreedomWallConfig = z.infer<typeof FreedomWallConfigSchema>
export type PageSeoMetadata = z.infer<typeof PageSeoMetadataSchema>
export type SiteMetadataConfig = z.infer<typeof SiteMetadataConfigSchema>
export type OfficialTerm = z.infer<typeof OfficialTermSchema>
export type ElectedOfficial = z.infer<typeof ElectedOfficialSchema>
export type AppointedOfficial = z.infer<typeof AppointedOfficialSchema>
export type BarangayRecord = z.infer<typeof BarangayRecordSchema>
export type NationalTaxAllotmentRecord = z.infer<
  typeof NationalTaxAllotmentRecordSchema
>
export type StatutoryAllocationRule = z.infer<
  typeof StatutoryAllocationRuleSchema
>
export type BudgetDisclosureItem = z.infer<typeof BudgetDisclosureItemSchema>
export type ProjectRecord = z.infer<typeof ProjectRecordSchema>
export type LegislativeMeasure = z.infer<typeof LegislativeMeasureSchema>
export type OfficeContact = z.infer<typeof OfficeContactSchema>
export type EmergencyHotline = z.infer<typeof EmergencyHotlineSchema>
export type OfficialChannel = z.infer<typeof OfficialChannelSchema>
export type DataSourceRecord = z.infer<typeof DataSourceRecordSchema>
export type BetterGovRecord = z.infer<typeof BetterGovRecordSchema>
export type BetterGovDataset = z.infer<typeof BetterGovDatasetSchema>
export type NationalBudgetGaaYear = z.infer<typeof NationalBudgetGaaYearSchema>
export type NationalBudgetDepartment = z.infer<
  typeof NationalBudgetDepartmentSchema
>
export type NationalBudgetNep = z.infer<typeof NationalBudgetNepSchema>
export type BudgetCycleStage = z.infer<typeof BudgetCycleStageSchema>
export type ExpenseClassItem = z.infer<typeof ExpenseClassItemSchema>
export type CamSur5thDistrictLedgerYear = z.infer<
  typeof CamSur5thDistrictLedgerYearSchema
>
export type CamSur5thDistrictLedger = z.infer<
  typeof CamSur5thDistrictLedgerSchema
>
export type NationalBudgetConfig = z.infer<typeof NationalBudgetConfigSchema>
export type TabOption = z.infer<typeof TabOptionSchema>
export type SortOption = z.infer<typeof SortOptionSchema>
export type ValidCivicSection = z.infer<typeof ValidCivicSectionSchema>
export type BrandLogos = z.infer<typeof BrandLogosSchema>
export type CarrierItem = z.infer<typeof CarrierItemSchema>
export type CarrierRegistry = z.infer<typeof CarrierRegistrySchema>
export type HeroMedia = z.infer<typeof HeroMediaSchema>
export type NavigationItem = z.infer<typeof NavigationItemSchema>
export type DirectoryControls = z.infer<typeof DirectoryControlsSchema>
export type CityStatistics = z.infer<typeof CityStatisticsSchema>
export type SiteContent = z.infer<typeof SiteContentSchema>
export type CivicDatasetSnapshot = z.infer<typeof CivicDatasetSnapshotSchema>
