# BetterIriga

**Civic Transparency & Open Data Portal for Iriga City, Camarines Sur**

[![Domain: BetterIriga.org](https://img.shields.io/badge/Domain-BetterIriga.org-2563eb?style=flat-square)](https://betteririga.org)
[![PSGC: 0501716000](https://img.shields.io/badge/PSGC-0501716000-059669?style=flat-square)](https://psgc.gitlab.io/api/cities/051716000/)
[![Region: Region V -- Bicol](https://img.shields.io/badge/Region-Region_V_--_Bicol-7c3aed?style=flat-square)](https://betteririga.org)
[![BetterGov.ph Ecosystem](https://img.shields.io/badge/Ecosystem-BetterGov.ph-1d4ed8?style=flat-square)](https://bettergov.ph)
[![Zero Cost: ₱0 Cost to Iriga](https://img.shields.io/badge/Cost_to_People-%E2%82%B10_Zero_Pesos-10b981?style=flat-square)](https://betteririga.org/about)
[![Store: Zod + Zustand](https://img.shields.io/badge/Store-Zod_%2B_Zustand-0284c7?style=flat-square)](#architecture--central-civic-store)
[![License: MIT | CC BY 4.0](https://img.shields.io/badge/License-MIT_%7C_CC_BY_4.0-f59e0b?style=flat-square)](LICENSE)

**BetterIriga.org** is an independent, volunteer-run civic transparency and public information portal for the **City Government of Iriga (Camarines Sur, Region V – Bicol)** under [BetterGov.ph](https://bettergov.ph), alongside sibling local government platforms like [BetterLibmanan.org](https://www.betterlibmanan.org) and [BetterSolano.org](https://bettersolano.org). BetterIriga gives every Irigueño a fast, friendly, and 100% verified place to access public records, local legislation, city budgets, public works, and 24/7 emergency hotlines.

Every single fact published on the site is linked directly to a primary government source with an exact retrieval date. Nothing is ever guessed, and missing items are shown openly as *"Data not yet available"*.

---

## ✨ Features

- **🏛️ Officials & 36 Barangays (`/officials`)**
  - Verified 2025–2028 elected leaders (Mayor, Vice Mayor, and 10 City Councilors) with COMELEC source citations.
  - 17 appointed City Hall department heads with office locations and contact details.
  - Complete directory of all 36 Barangays with Punong Barangays, urban/rural classifications, and 10-digit PSGC codes.

- **💰 Budget & Fiscal Transparency (`/budget`)**
  - Multi-year National Tax Allotment (NTA) series from the Department of Budget and Management (DBM), tracking growth from ₱853.80M (FY 2022) to ₱913.50M (FY 2025).
  - Mandatory statutory allocation floor breakdowns (20% Development Fund, 5% Calamity Fund, 5% Gender & Development, 10% Youth/SK).
  - Honest disclosure tracking for City Hall financial reports, Full Disclosure Policy Portal (FDPP), and Commission on Audit (COA) audit findings.

- **🏗️ Infrastructure Projects & BetterGov.ph Tracker (`/projects`)**
  - City Hall infrastructure, healthcare, and social welfare programs.
  - Automated sync with BetterGov.ph pulling 36 verified DPWH Camarines Sur 5th District contracts, GAA public works, and legislative district representations (₱397.92M+ tracked).

- **📜 City Ordinances & Resolutions (`/ordinances`)**
  - Plain-language summaries of landmark Sangguniang Panlungsod legislation, including the 2023–2032 Comprehensive Land Use Plan, Revenue Code, Tourism Code, Plastic Regulation, and Mandatory CCTV Ordinance.
  - Direct links to official City Hall PDF downloads and preserved archive mirrors.

- **📞 29 City Hall Offices & 24/7 Hotlines (`/contacts`)**
  - Tap-to-call directory for all 29 Iriga City Hall offices ((054) 299-xxxx series).
  - 24/7 emergency rescue numbers for CDRRMO (`(054) 299 9918`, `0921 636 4018`, `911`), PNP, BFP, and utility providers.
  - Official social channels with verified handles.

- **📋 Step-by-Step City Services (`/services`)**
  - Plain-language Citizen's Charter procedures across City Hall: Birth/Marriage/Death Certificates, Business Permits, Real Property Tax (Amilyar), Cedula, Building Permits, Senior Citizen & PWD IDs, Health Certificates, and PESO job referrals.

- **💬 Irigueño Community Freedom Wall (`/freedom-wall`)**
  - Interactive, zoomable, and draggable sticky-note canvas shared with BetterGov.ph sibling platforms.
  - Powered by Supabase with automatic local storage fallback, starting empty by default, and strictly client-isolated (never forwarded to City Hall).

- **🛡️ Verification Ledger & Source Checklist (`/verification`)**
  - Dedicated audit page showing SHA-256 cryptographic dataset digests, primary source URLs, retrieval dates, and open data gaps.
  - Live upstream verification against PSGC and BetterGov.ph APIs.

- **📱 Mobile-First & Persistent Navigation**
  - 3-tier header architecture with a pinned `sticky top-0` navbar that never disappears or jitters when scrolling.
  - Responsive directory toolbars (`relative md:sticky md:top-[4.25rem]`).
  - Strict horizontal overflow containment (`overflow-x: hidden`, zero horizontal drag, zero white gaps).
  - WCAG 2.1 AA accessibility compliance and full light/dark theme hotkey support (`D` key).

---

## 🗂️ Architecture & Central Civic Store

BetterIriga follows Matt Pocock's **deep module** codebase design: a single deep Civic Repository and Zod schema contract back the entire application. Zero civic facts, metadata, or filter lists are hardcoded inside UI components.

```text
betteririga/
├── data/                         # Dedicated JSON Civic Data Store
│   ├── site-content.json         # Navigation, brand labels, controls & page metadata
│   ├── services.json             # 19 Citizen's Charter & City Hall services
│   ├── officials.json            # 2025–2028 Elected Leaders & 17 Department Heads
│   ├── barangays.json            # All 36 Barangays with Captains & PSGC codes
│   ├── budget.json               # DBM NTA series (FY 2022–2025) & statutory allocations
│   ├── projects.json             # LGU Iriga infrastructure & social welfare works
│   ├── bettergov.json            # 36 BetterGov.ph synced DPWH & GAA district records
│   ├── ordinances.json           # Sangguniang Panlungsod ordinances & resolutions
│   ├── contacts.json             # 29 City Hall offices & 24/7 emergency hotlines
│   ├── freedom-wall.json         # Sticky-note canvas configuration & color palettes
│   ├── city-profile.json         # PSGC, geography, landmarks, timeline & weather
│   └── sources.json              # Primary source registry & RA 11055 privacy notices
├── app/                          # Next.js App Router (Static Generation / SSG)
│   ├── page.tsx                  # Home portal with global search & lively sections
│   ├── layout.tsx                # Root layout with responsive viewport & fonts
│   ├── globals.css               # Design tokens, safe scrolling & civic animations
│   ├── services/                 # City Hall services & Citizen's Charter
│   ├── officials/                # Elected leaders, department heads & barangays
│   ├── budget/                   # Budget transparency, NTA series & audit ledger
│   ├── projects/                 # Infrastructure tracker & BetterGov works
│   ├── ordinances/               # Local laws & Sangguniang Panlungsod archive
│   ├── contacts/                 # City Hall phonebook & 24/7 hotlines
│   ├── freedom-wall/             # Community sticky-note board
│   ├── verification/             # Source checklist & SHA-256 accuracy report
│   ├── about/                    # Mission, privacy policy & contribution guide
│   └── api/civic-data/           # Open JSON REST endpoints
├── components/
│   ├── civic/                    # Specialized civic UI modules & directories
│   │   ├── site-header.tsx       # 3-tier persistent sticky header navigation
│   │   ├── site-footer.tsx       # Plain-language footer with ₱0 Cost badge
│   │   ├── global-civic-search.tsx # Multi-collection instant search engine
│   │   ├── services-directory.tsx # Step-by-step services browser
│   │   ├── officials-directory.tsx # Leaders, heads & barangays tabbed views
│   │   ├── projects-explorer.tsx # Multi-source infrastructure explorer
│   │   ├── ordinances-archive.tsx # Legislative measures archive
│   │   ├── contacts-directory.tsx # City Hall phonebook directory
│   │   ├── freedom-wall-board.tsx # Draggable & zoomable sticky-note board
│   │   ├── citation-badge.tsx    # Primary-source provenance badges
│   │   └── reveal.tsx            # Smooth accessible scroll animations
│   └── ui/                       # Accessible primitives
├── lib/
│   ├── data/
│   │   ├── schemas.ts            # Central Zod schemas validating all data & controls
│   │   └── iriga-data.ts         # Deep civic repository, SHA-256 digests & formatters
│   ├── store/
│   │   └── civic-store.ts        # Central Zustand store (`useCivicStore`)
│   └── supabase/
│       └── freedom-wall.ts       # Supabase client supporting publishable & anon keys
├── scripts/
│   ├── sync-bettergov.ts         # Automated sync with live BetterGov.ph APIs
│   └── verify-and-sync.ts        # Zero-hallucination & provenance test runner
└── supabase/
    └── migrations/               # SQL schema for freedom_wall_posts table
```

---

## 🌐 Open Civic Data API

All verified datasets are served through static JSON API endpoints for public research, journalism, and civic tech development:

| Endpoint | Description |
| --- | --- |
| `GET /api/civic-data` | Complete dataset snapshot with SHA-256 checksums |
| `GET /api/civic-data/site-content` | Brand copy, navigation, and centralized directory controls |
| `GET /api/civic-data/city-profile` | Iriga City PSGC, geographic data, and history timeline |
| `GET /api/civic-data/services` | 19 City Hall services and Citizen's Charter procedures |
| `GET /api/civic-data/officials` | 2025–2028 elected officials and 17 appointed department heads |
| `GET /api/civic-data/barangays` | 36 Barangays with captains and classifications |
| `GET /api/civic-data/budget` | DBM National Tax Allotments (2022–2025) and statutory rules |
| `GET /api/civic-data/projects` | LGU Iriga local projects and social welfare programs |
| `GET /api/civic-data/bettergov` | 36 BetterGov.ph DPWH 5th District contracts |
| `GET /api/civic-data/ordinances` | Sangguniang Panlungsod ordinances and resolutions |
| `GET /api/civic-data/contacts` | 29 City Hall offices and 24/7 emergency hotlines |
| `GET /api/civic-data/sources` | Audited primary sources and retrieval dates |

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.2+ (recommended) or Node.js 20+
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ronhedwigzape/betteririga.git
   cd betteririga
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **(Optional) Configure Supabase for Freedom Wall:**
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase project credentials in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_pub_your_publishable_key
   # Alternatively: NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
   Execute [`supabase/migrations/20261104_freedom_wall.sql`](supabase/migrations/20261104_freedom_wall.sql) in your Supabase SQL Editor. If unconfigured, the Freedom Wall operates seamlessly using browser local storage fallback.

4. **Start the local development server:**
   ```bash
   bun run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Available Scripts

| Command | Action |
| --- | --- |
| `bun run dev` | Start Next.js local development server with Turbopack |
| `bun run build` | Build optimized static production bundle (SSG) |
| `bun run start` | Serve production build locally |
| `bun test` | Run automated test suite with Bun's test runner |
| `bun run verify-data` | Audit all JSON files against Zod schemas and live PSGC / BetterGov APIs |
| `bun run sync-bettergov` | Pull latest Iriga & CamSur 5th District contracts from BetterGov.ph |
| `bun run typecheck` | Run TypeScript compiler type checking (`tsc --noEmit`) |
| `bun run lint` | Run ESLint across all TypeScript and React files |

---

## 🛡️ What Makes This Different

1. **₱0 Cost to the People of Iriga:**
   BetterIriga is 100% volunteer-built and community-maintained. It does not use government funds and is independent of City Hall.

2. **Zero Hallucination Guarantee:**
   Every published entry has a primary source URL, name, and retrieval date. If a record cannot be officially verified, it is displayed openly as a Gap (*"Data not yet available"*), never invented.

3. **Plain-Language Experience:**
   Public-facing pages are free of developer jargon (`ADR`, `Zod`, `Zustand`, `JSON API`, `WAF`, etc.). Everything is written in warm, clear, everyday language suitable for all citizens.

4. **Deep Module Design (Matt Pocock Guidelines):**
   Components have clean seams and high locality. UI directory filters, sort options, and universal formatters (`formatNoteTimestamp`, `formatPeso`, `formatPhtDateTime`) are managed centrally in the Zod store rather than duplicated across files.

---

## 🎯 Perfect For

- **The People of Iriga City:** Find phone numbers, service steps, ordinances, and barangay captains quickly on any phone or computer.
- **Civic Researchers & Journalists:** Analyze audited municipal funding, DBM NTA allocations, and DPWH public works contracts.
- **Local Businesses & Investors:** Review the Iriga City Revenue Code, zoning ordinances, and Citizen's Charter permits.
- **Civic Tech Volunteers:** A template for building low-maintenance, verified civic portals across Philippine local government units.

---

## 🤝 Contributing

We welcome contributions from everyone! Whether you are an Irigueño reporting a new hotline, a researcher verifying a city ordinance, or a developer contributing code:

- Read our **[CONTRIBUTING.md](CONTRIBUTING.md)** for golden rules and guidelines.
- Review our consolidated domain glossary and architecture decisions in **[AGENTS.md](AGENTS.md)**.
- Submit updates to `data/*.json` and verify with `bun run verify-data && bun test`.

---

## 📄 License

This repository uses a dual license:
- **Software Code:** Licensed under the [MIT License](LICENSE).
- **Civic Data & Content:** Curated public records in `data/` are licensed under the [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE) license.

---

## 🙏 Acknowledgments

- [BetterGov.ph](https://bettergov.ph) for the open civic ecosystem, shared civic APIs, and budget datasets.
- [BetterLibmanan.org](https://www.betterlibmanan.org) for sticky-note Freedom Wall architecture and community transparency patterns.
- [BetterSolano.org](https://bettersolano.org) for the zero-cost community pledge model.
- The people of **Iriga City, Camarines Sur** for whom this platform was built.
