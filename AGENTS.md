<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Data accuracy (non-negotiable)

BetterIriga publishes civic data as an official initiative under BetterGov.ph. Never invent or "fill in" an official's name, peso amount, ordinance number, date, or contact detail. Every published record must carry a primary-source URL and retrieval date from official bodies:
- Primary LGU data from `iriga.gov.ph` and related city departments (Sangguniang Panlungsod, BPLO, CDRRMO, City Assessor, City Treasurer, etc.).
- Official national statistical & demographic data from Philippine Statistics Authority (PSA POPCEN 2020: 114,457 population across all 36 barangays) and PhilAtlas.
- Official fiscal allocations from Department of Budget and Management (DBM National Tax Allotment series).
- Official municipal competitiveness data from DTI Cities and Municipalities Competitiveness Index (CMCI 5 pillars).
- Primary election data from Commission on Elections (COMELEC).
- National infrastructure and public works tracking from DPWH Camarines Sur 5th District via BetterGov.ph Open Data APIs (`bettergov.ph`).

Anything unverified must never be filled with a guess or estimated placeholder; it is shown openly to the people of Iriga as an explicit Gap ("Data not yet available — help us find an official copy"). Zero hallucinations are permitted across the entire platform.

---

## Agent skills & consolidated documentation

All issue-tracking conventions, triage labels, domain vocabulary (Glossary), architecture decision records (ADRs), and project specifications are consolidated directly in this `AGENTS.md` file (no external `.scratch/` or `docs/agents/` / `docs/adr/` / `GLOSSARY.md` files).

### 1. Issue tracker & Wayfinding conventions

Issues, specs, and implementation milestones for this repository are tracked directly inside this `AGENTS.md` document (and live checklist updates in `docs/plans/task.md`).

- Triage state is recorded as a `Status:` line (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`, or `resolved`).
- Implementation tickets are numbered from `01` (`01` through `06` below) with explicit blocking relationships and completion checkboxes.

### 2. Triage labels

The skills speak in terms of five canonical triage roles. This table maps those roles to the label strings used in this repository:

| Label in skills   | Label in our tracker | Meaning                                  |
| ----------------- | -------------------- | ---------------------------------------- |
| `needs-triage`    | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`      | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent` | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human` | `ready-for-human`    | Requires human implementation            |
| `wontfix`         | `wontfix`            | Will not be actioned                     |

---

## 3. Domain Glossary (Single-Context Vocabulary)

**BetterIriga**:
An independent, volunteer-run civic transparency site that republishes public information about the City Government of Iriga (Camarines Sur, Region V – Bicol), with every fact traced to an official source and written in plain, everyday language for non-technical citizens.

### Provenance

- **Record**: A single published fact or entry on the site (one official, one budget line, one ordinance, one hotline, one service), always paired with its Citation. *(Avoid: Item, entry, data point)*
- **Citation**: The primary-source URL a Record was taken from, plus its Retrieval date. *(Avoid: Reference, link, credit)*
- **Primary source**: A document or page published by the body that owns the fact (the LGU, COA, DBM, BLGF, PSA, COMELEC, DPWH, BetterGov.ph, etc.), as opposed to news articles or unverified aggregators. *(Avoid: Official source [ambiguous], reference)*
- **Retrieval date**: The date a volunteer last confirmed a Record against its Primary source. *(Avoid: Last updated, as-of date)*
- **Gap**: A Record the site intends to show but cannot yet verify; displayed openly as "Not yet verified" / "Data not yet available" with a prompt to supply a source, never filled with a guess. *(Avoid: Missing data, placeholder, TBD)*
- **Verification Ledger**: The dedicated source checklist and accuracy report page (`/verification`) and slide-over source drawer that displays every Record's Primary source URL, Retrieval date, archived snapshot link, and open Gaps in plain language. *(Avoid: Sidebar, debug panel, status widget)*
- **Civic Data Store**: The dedicated directory of pure JSON data files (`data/*.json`) validated by Zod (`lib/data/schemas.ts`) and served through the Zustand store (`lib/store/civic-store.ts`) and API routes (`/api/civic-data` and `/api/civic-data/[section]`) so nothing is hardcoded in UI components or page metadata. *(Avoid: Hardcoded constants, mock data)*

### Government

- **LGU**: The City Government of Iriga as a local government unit — the subject of the site. *(Avoid: City hall [that is a building], municipality [Iriga is a component city])*
- **Official**: A person holding an elected or appointed post in the LGU, e.g. City Mayor, Vice Mayor, Sangguniang Panlungsod member, Punong Barangay, or department head. *(Avoid: Politician, leader, employee)*
- **Sangguniang Panlungsod**: The city's legislative council, presided over by the Vice Mayor, which enacts Ordinances and adopts Resolutions. *(Avoid: SP in unintroduced UI text)*
- **Ordinance**: A local law enacted by the Sangguniang Panlungsod, identified by its ordinance number and year. *(Avoid: Law, bill)*
- **Resolution**: A formal expression of the Sangguniang Panlungsod's will or opinion on a matter, not having the force of law; distinct from an Ordinance. *(Avoid: Ordinance [they are different instruments])*
- **Office**: A department or unit of the LGU that the public can contact (e.g. City Treasurer's Office, CDRRMO). *(Avoid: Department [unless that is its official name], agency [reserved for national government])*
- **Hotline**: A published phone number for reaching an Office or emergency service. *(Avoid: Contact number, helpline)*
- **Project**: An infrastructure work or social program implemented or funded by, or within, the LGU, with a status of ongoing, completed, or planning. *(Avoid: Program [except in a program's official name], initiative)*

---

## 4. Architecture Decision Records (ADRs)

### ADR-0001: BetterIriga is independent, not an official LGU channel

As an initiative under BetterGov.ph, BetterIriga.org is a volunteer-run site with no affiliation to the City Government of Iriga. It states this clearly in the welcome modal, top banner, footer (`₱0 Cost to the People of Iriga`), and About page, and every Record links back to its Primary source instead of presenting itself as the authority. We must never imply official government status.

### ADR-0002: Curated, cited data files in the repo, served as a fast Next.js site

All civic Records, page SEO metadata, and UI copy live as hand-curated, Zod-validated JSON files in `data/*.json`. Each Record carries a Citation, and every change goes through git review. For the interactive **Freedom Wall** (`/freedom-wall`), anonymous community sticky notes live strictly on BetterIriga.org's own database (`Supabase` `freedom_wall_posts` table with local fallback), starting empty by default and never forwarded to City Hall.

### ADR-0003: Every Record is cited; Gaps are shown, never filled

A Record cannot be published without a Citation (`sourceUrl`, `sourceName`, `retrievedAt`), and the build/verification suite (`bun run verify-data`) fails if one is missing. When a value cannot be verified, the page shows it openly as a Gap (*"Data not yet available — help us find an official copy"*) instead of hiding the row or guessing a value.

### ADR-0004: Dedicated JSON Civic Data Store, Zod Schema Contract, Zustand Store, and Plain-Language UI

To keep BetterIriga.org low-maintenance, always updated, and 100% verifiable without hardcoding civic facts or metadata inside TypeScript implementation files:
1. All **Records**, page **Metadata**, and UI copy live in `data/*.json` and are strictly validated by `lib/data/schemas.ts` (Zod).
2. A single deep **Civic Repository** (`lib/data/iriga-data.ts`) and **Zustand Store** (`lib/store/civic-store.ts`) expose the validated data to all Server and Client Components and HTTP endpoints (`/api/civic-data`, `/api/civic-data/[section]`, `/api/verify`).
3. **Plain Language Rule for Non-Technical Citizens**: Public-facing pages must never display developer or technical jargon (`ADR-0001`, `Zod`, `Zustand`, `Supabase`, `SHA-256`, `JSON API`, `PSGC`, `WAF`, `WordPress`, `CSRF`, `HTTP 403`, etc.). Everything shown to residents must be written in warm, clear, everyday language.

### ADR-0005: Deep Civic Store & Central Directory Controls (Matt Pocock Codebase Design)

To avoid code bloat and eliminate duplicated arrays and local parsers across UI files:
1. All directory filter lists, status arrays, source tabs, section mappings, and sort definitions are defined in `DirectoryControlsSchema` (`lib/data/schemas.ts`) and stored in `data/site-content.json`.
2. Universal formatting helpers (`formatNoteTimestamp`, `formatPeso`, `formatPesoCompact`, `formatPhpMillions`, `formatPhtDateTime`, `formatPhtDate`, `formatPhtTime`) are centralized in the Civic Repository (`lib/data/iriga-data.ts`) and exposed directly on the Zustand store (`useCivicStore`).
3. Components consume these utilities at the store seam rather than declaring ad-hoc helpers or hardcoded constants.

### ADR-0006: 3-Tier Persistent Sticky Header Architecture & Responsive Viewport Containment

To maintain consistent visual stability across all device form factors:
1. `SiteHeader` renders its three tiers (`TopUtilityBar` emergency ticker, `Navbar` with logo/links/controls, and `BottomUtilityBar` live weather/info strip) within a React Fragment (`<>...</>`). This places `<header className="sticky top-0 z-50 ...">` directly inside the document scroll root (`<body>`), guaranteeing that the navbar stays pinned at `top: 0` indefinitely without disappearing or jittering.
2. Directory toolbars across Services, Officials, Projects, Ordinances, and Contacts are positioned as `sticky top-[4.75rem] sm:top-[5rem] lg:top-[5.25rem] z-30` so mobile and desktop users experience persistent filtering with an explicit 16px floating clearance beneath the sticky navbar.
3. Strict viewport containment is enforced globally via `overflow-x: clip; max-width: 100vw;` in `app/globals.css`, `overflow-x-clip` in `app/layout.tsx`, responsive padding (`p-4 sm:p-6 lg:p-8`), and `min-w-0 truncate` on flex items to guarantee zero horizontal drag and zero white gaps on mobile.

### ADR-0007: Performance Architecture & Persistent Header Isolation

To make BetterIriga.org faster, lightweight, and flicker-free on mobile connections:
1. `overflow-x: clip` on `html` and `body` replaces `overflow-x: hidden`, preventing WebKit and Blink from establishing accidental overflow scroll containers that break `position: sticky`.
2. Dynamic state updates (the 1-second Philippine Standard Time ticking clock and live weather update) are isolated inside memoized leaf components (`<LivePhtClock />`, `<LiveWeatherTicker />`). Ticks never re-render the outer navigation bar, links, or logo.
3. Heavy interactive canvas modules (Freedom Wall board) are decoupled from marketing CTA components (`FreedomWallCtaSection`), allowing the homepage to load without bundling the interactive canvas engine or database client.
4. `SiteFooter` is rendered as a pure React Server Component, cutting client-side JavaScript execution for static footer navigation and legal statements.
5. Production HTTP caching (`max-age=3600, stale-while-revalidate=86400`) and modern WebP/AVIF image formats are configured in `next.config.ts`.

### ADR-0008: 100% Verified Legislative (`/legislative`), Statistics (`/statistics`), and Telecom Brand Badging

To ensure Iriga City residents have 100% verifiable access to municipal government facts:
1. **Legislative Transparency Portal (`/legislative`)**: Documents the Sangguniang Panlungsod of Iriga City, led by Presiding Officer Vice Mayor Edsel S. Dimaiwat, 10 elected councilors, ex-officio Liga and SK representatives, Citizen's Charter procedures for certified copies of ordinances, and an integrated, searchable Ordinances & Resolutions archive.
2. **City Statistics Portal (`/statistics`)**: Modeled after BetterSolano.org's statistics experience, republishing official Philippine Statistics Authority (PSA 2020 POPCEN) census demographics (114,457 citizens, 137.35 km² land area, 833.3/km² density, 26,410 households), complete rankings for all 36 barangays, DBM FY 2025 National Tax Allotment figures (₱913.50M with 20% Development, 5% Calamity, 5% GAD, 10% Youth/SK), and DTI CMCI 5 competitiveness pillars.
3. **Official Telecom Carrier & Facebook Brand Logos**: Published emergency hotlines and contact channels display official Smart Communications, Globe Telecom, Landline, and Facebook vector marks, giving citizens immediate clarity on network charges and communication channels.
4. **Primary Sources Only**: Data must originate from official sources (`iriga.gov.ph`, PSA, DBM, DTI, Sangguniang Panlungsod, COMELEC, or BetterGov.ph for DPWH Camarines Sur 5th District works). Any unverified detail remains an explicit Gap.

### ADR-0009: Non-Negotiable Near-100 Web Performance Mandate After Every Change

After **every** code, content, or UI change, all agents must optimize and verify web performance to remain **near 100 (95–100 Lighthouse Performance score)** across all breakpoints (Mobile and Desktop):
1. **Zero LCP/FCP Blocking Animations**: Entrance animations (`app/template.tsx`, `<Reveal>`, `.animate-civic-fade-up`) must use pure CSS GPU-composited keyframes starting from `opacity: 0.01` (never `opacity: 0` waiting on JS `IntersectionObserver` hydration) and ending at `transform: none` so First Contentful Paint (FCP) and Largest Contentful Paint (LCP) are recorded on Frame 0 and `position: sticky` children are never broken.
2. **Strict Bundle & Main-Thread Discipline**: Root layout components (`SiteHeader`, `BetterIrigaLogo`, `CarrierBadge`) must never pull the full 245KB civic snapshot JSON into the shared client bundle. Below-the-fold heavy widgets (`Chart.js`, interactive maps, live streams) must be code-split with `next/dynamic` or `IntersectionObserver` lazy wrappers (`LivelySectionsLazy`, `BudgetChartsLazy`), and non-critical timers must defer past the initial paint window.
3. **Media & Asset Optimization**: Video backgrounds must use `-movflags +faststart` (`moov` atom at byte 0), compressed poster frames, and responsive `<source media="...">` rules; images must specify accurate `sizes` and `quality` attributes.
4. **Post-Change Verification**: Every change must maintain `CLS = 0`, low Total Blocking Time (`TBT < 100ms`), and near-100 performance on both Mobile and Desktop breakpoints before completion is claimed.

---

## 5. Project Specification & Completed Issues (`betteririga-v1`)

- **Status:** `resolved`

### Problem Statement

Residents, researchers, businesses, and civic volunteers in Iriga City (Camarines Sur, Region V – Bicol) need a single, friendly, 100% verifiable place to find City Hall services, elected and appointed officials, legislative leadership and local ordinances, municipal demographics and economic statistics, all 36 barangays, city budget and National Tax Allotment figures, DPWH / BetterGov.ph and local infrastructure projects, 29 City Hall office contacts, 24/7 emergency hotlines with carrier badges, and an interactive sticky-note Freedom Wall (`BetterGov.ph` sibling style).

### Completed Implementation Issues

- [x] **01 — Civic Data Repository, Provenance Validator, Global Search & Site Shell (`resolved`)**:
  - End-to-end verified civic data engine in `data/*.json` + `lib/data/schemas.ts` + `lib/data/iriga-data.ts` + `lib/store/civic-store.ts`.
  - Top Emergency Hotline Ticker (`(054) 299 9918`, `0921 636 4018`, `911`), single-word navigation (`Home`, `Services`, `Officials`, `Budget`, `Projects`, `Laws`, `Contacts`, `Wall`, `About`), BetterSolano-style welcome modal, and `₱0 Cost to the People of Iriga` footer badge.
- [x] **02 — Officials & 36 Barangays Directory (`/officials`, `resolved`)**:
  - Verified 2025–2028 and 2022–2025 elected Officials, 17 appointed department heads, and all 36 Barangays with Punong Barangays and source citations.
- [x] **03 — Budget & Public Funds Guide (`/budget`, `resolved`)**:
  - Verified FY 2022–2025 National Tax Allotment series (`₱853.80M` to `₱913.50M`), mandatory allocation breakdowns (20% Development Fund, 5% Calamity Fund, 5% GAD, 10% Youth/SK), and honest disclosure checklists.
- [x] **04 — Projects, Programs & BetterGov.ph Tracker (`/projects`, `resolved`)**:
  - Local LGU projects and BetterGov.ph DPWH Camarines Sur 5th District flood-control, bypass road, water system, solar streetlight, and multi-purpose building contracts (`₱397.92M+` tracked across 46 total works).
- [x] **05 — City Ordinances & Resolutions Guide (`/ordinances`, `resolved`)**:
  - Sangguniang Panlungsod ordinances and resolutions with plain-language explanations, category filters, and direct PDF/archive links.
- [x] **06 — Services, Contacts, Freedom Wall, Source Checklist & Plain-Language Experience (`/services`, `/contacts`, `/freedom-wall`, `/about`, `/verification`, `resolved`)**:
  - 14 step-by-step City Hall service guides (`/services`), 29 City Hall office directory (`/contacts`), BetterLibmanan-style interactive sticky-note canvas Freedom Wall (`/freedom-wall`) starting empty by default and backed by Supabase, and plain-language Source Checklist (`/verification`).
- [x] **07 — Persistent Sticky Header, Codebase Simplification & Multi-Device Breakpoint Integrity (`resolved`)**:
  - Document-root sticky navbar architecture (`sticky top-0 z-50`) solving scroll disappearance.
  - Elimination of horizontal overflow across all device viewports (`overflow-x: clip`, responsive iframes, flex `min-w-0` truncation).
  - Deep Zod Directory Controls (`DirectoryControlsSchema`) and store formatters (`formatNoteTimestamp`, `formatPeso`, etc.) replacing scattered hardcoded constants across components.
- [x] **08 — Sangguniang Panlungsod Legislative Guide (`/legislative`, `resolved`)**:
  - Sangguniang Panlungsod leadership, presiding officer Vice Mayor Edsel Dimaiwat, 10 city councilors, Citizen's Charter procedures for certified copies of ordinances, and embedded ordinances archive.
- [x] **09 — City Statistics & Demographic Demands Portal (`/statistics`, `resolved`)**:
  - Modeled after BetterSolano.org: PSA 2020 Census demographics (114,457 population across all 36 barangays, 137.35 km² land area, 833.3/km² density), DBM FY 2025 NTA series, DTI CMCI 5 competitiveness pillars, and primary-source citations.
- [x] **10 — Performance Tuning, Projects Explorer Restoration & Carrier Brand Icons (`resolved`)**:
  - Restored `/projects` display across 46 combined public works records (10 LGU + 36 BetterGov DPWH) with persistent filtering and empty reset state.
  - Smart, Globe, Landline, and Facebook vector brand badges in hotlines and channels.
  - Leaf-level time/weather tickers, Server Component footer, and 16px floating clearance for directory search toolbars.
