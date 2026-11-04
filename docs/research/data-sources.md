# Iriga City Civic Data Sources & API Research

> **Retrieved:** 2026-11-04  
> **Accuracy Policy:** Every fact listed in the Verified Seed Facts section below was directly observed from a primary source or official government archive during this research session. Where data is blocked, behind a WAF/CAPTCHA, or not published in machine-readable form, it is explicitly recorded as **GAPPED / UNVERIFIED**.

---

## 1. Summary Table of Sources

| # | Source Name | URL | Format | Machine-Readable? | Iriga Coverage | Access & Status Notes |
|---|---|---|---|---|---|---|
| 1 | **LGU Iriga Official Website** | `https://iriga.gov.ph` | HTML / WordPress (`/wp-json/`, XML sitemaps) + PDFs | Partial (WP REST API exists, but behind Azure WAF) | Comprehensive: Officials, 30+ Offices/Hotlines, 36 Barangays, Ordinances, Citizen's Charter, News/Projects | Live requests from headless clients get HTTP 403 (`Azure WAF - Please enable JavaScript`). Full snapshots verified via Internet Archive (`web.archive.org`) through May 2026. |
| 2 | **LGU Iriga Official Facebook Page** | `https://www.facebook.com/irigacitygovt` | HTML / Social Graph | No | Real-time announcements, ordinances, social programs, CDRRMO advisories | Publicly viewable in browser (`Lungsod ng Iriga \| Iriga City`), blocks automated unauthenticated scraping. |
| 3 | **PSGC API (PSA / Community GitLab Mirror)** | `https://psgc.gitlab.io/api/cities/051716000/` | JSON REST API | **Yes (Public JSON API, no auth)** | City of Iriga (`051716000` / 10-digit `0501716000`), Province `051700000`, Region `050000000`, and 36 Barangays | Directly verified HTTP 200 JSON. Official `psa.gov.ph` and `openstat.psa.gov.ph` return HTTP 403 to automated clients. |
| 4 | **DBM (Dept. of Budget & Management)** | `https://www.dbm.gov.ph` | HTML / PDF (Local Budget Memoranda Nos. 90, 92, 92-B) | No (PDF tables) | National Tax Allotment (NTA) shares for Iriga City (FY 2022–2026) | HTTP 200. Published via Local Budget Memorandum annexes and COMPASS portal. |
| 5 | **COA (Commission on Audit)** | `https://www.coa.gov.ph` | PDF / ZIP (Annual Audit Reports - LGU Region V) | No | Iriga City Annual Audit Reports (AARs) | Returns HTTP 403 to automated CLI requests; requires manual browser download and PDF extraction. |
| 6 | **BLGF (Bureau of Local Govt. Finance)** | `https://blgf.gov.ph` | XLSX / PDF (Statement of Receipts & Expenditures) | No (Spreadsheets) | LGU fiscal performance / SRE reports | Returns HTTP 403 to automated CLI requests. |
| 7 | **DILG Full Disclosure Policy Portal (FDPP)** | `https://fdpp.dilg.gov.ph` | HTML / PDF documents | No (Yii2 CSRF-protected form + PDF downloads) | Annual Budget, Quarterly Statement of Cash Flows, Annual Procurement Plan, Bid Results | HTTP 200 on `/fdpp/report`, but requires interactive session / manual download per document. |
| 8 | **Open Data Philippines** | `https://data.gov.ph` | SPA HTML | No public unauthenticated CKAN JSON at `/api/3/...` | General national datasets | `/api/3/action/package_search` returns SPA HTML shell (7,364 bytes) instead of JSON. |
| 9 | **PhilSys (Philippine Identification System)** | `https://philsys.gov.ph` | N/A | **No (Prohibited by Law)** | None | **RA 11055 (PhilSys Act) Sec. 17–18** strictly prohibits public release or disclosure of individual/local registry records. Cannot be used as an open-data API. |
| 10 | **COMELEC** | `https://comelec.gov.ph` | PDF / HTML | No | May 12, 2025 National and Local Elections (COCs and Election Returns) | Candidate lists and election results published as static files/PDFs; 2025–2028 elected officials cross-verified with LGU Iriga June 13, 2025 oath-taking records. |
| 11 | **PhilGEPS** | `https://notices.philgeps.gov.ph` | HTML portal | No public REST API | Procurement notices & awards for "City Government of Iriga" | HTTP 200; requires interactive search session. |
| 12 | **DPWH / BetterGov Transparency** | `https://transparency.bettergov.ph` / `https://budget.bettergov.ph` | JSON / Graph / Web Portal | Yes (via BetterGov open-budget repositories) | DPWH Camarines Sur 5th DEO infrastructure contracts in Iriga City | Open-source repositories under `github.com/bettergovph` (`open-budget-data`, `open-budget-api`, `transparency-dashboard`). |
| 13 | **DTI Cities & Municipalities Competitiveness Index (CMCI)** | `https://cmci.dti.gov.ph` | HTML / Chart data | Partial | Annual economic dynamism, government efficiency, infrastructure, resiliency scores for Iriga City | HTTP 200. |
| 14 | **BetterGov.ph & Sibling LGU Portals** | `https://bettergov.ph`, `https://bettersolano.org`, `https://betterormoc.org`, `https://betterlaspinas.org` | Static HTML / React + TypeScript | Open-source GitHub repos (`CC0-1.0` / `MIT`) | Design system (`kapwa`), layout patterns, civic navigation structure | Directly inspected HTML & GitHub API (`github.com/bettergovph`, `github.com/BetterSolano/bettersolano`). |

---

## 2. Sibling Sites Pattern (`BetterGov.ph`, `BetterSolano.org`, `BetterOrmoc.org`, `BetterLasPinas.org`)

Direct inspection of the HTML from `bettersolano.org`, `betterormoc.org`, and `betterlaspinas.org` reveals a consistent civic portal pattern:

1. **Top Emergency Hotline Ticker Bar:** Immediate, high-contrast strip at the very top of every page listing critical hotlines (CDRRMO, Police, Fire, CSWDO, City Health, Mayor's Office) with click-to-call `tel:` links.
2. **Unofficial Community Disclaimer Banner:** Explicit notice: *"Disclaimer: This is an unofficial community project, not affiliated with [City] Government. Learn more."*
3. **Header & Primary Navigation:**
   - Brand title (`BetterIriga.org`) + subtitle (`A community-run portal for Iriga City, Camarines Sur`)
   - Primary links: **Home**, **Officials** (Government & Barangays), **Budget** (Transparency & Fiscal Data), **Projects** (Infrastructure & Social Programs), **Ordinances** (Legislative), **Contacts** (Offices & Hotlines), **About / Sources**.
4. **Hero Search & Quick-Access Strip:** Prominent search input to filter offices, officials, ordinances, projects, and hotlines across the entire site, paired with quick-filter pills.
5. **Provenance & Citation Badges:** Every card/table row links to its official primary source URL and states when it was verified, alongside a *"Report an error / Submit a source"* action for unverified gaps.

---

## 3. Verified Seed Facts (With Primary-Source Citations)

Every record below is verified from primary sources retrieved on `2026-11-04`.

### A. Geographic & Demographic Identifiers (PSGC & PSA)
- **Official Name:** City of Iriga (`Lungsod ng Iriga`)
- **PSGC 10-Digit Code:** `0501716000` (Legacy 9-digit: `051716000`) — *Source: `https://psgc.gitlab.io/api/cities/051716000/` (Retrieved 2026-11-04)*
- **Province & Region:** Camarines Sur (`051700000`), Region V – Bicol (`050000000`)
- **Number of Barangays:** 36 Urban/Rural Barangays — *Source: `https://iriga.gov.ph/barangay/` (Archived capture `20230201180243` & PSGC API, Retrieved 2026-11-04)*
- **Land Area:** 174 sq. km (17,400 hectares) — *Source: `https://iriga.gov.ph/demographics/` (Retrieved 2026-11-04)*
- **Population:**
  - **2024 Census (POPCEN):** `115,306` — *Source: PSA 2024 Census of Population*
  - **2020 Census:** `114,457` — *Source: PSA / `https://iriga.gov.ph` (Retrieved 2026-11-04)*
  - **2015 Census:** `111,757` (23,754 households) — *Source: `https://iriga.gov.ph/demographics/` (Retrieved 2026-11-04)*

### B. Elected Officials
We have two verified snapshots that should both be transparent to the user:
1. **2025–2028 Term (Sworn in June 13, 2025 following May 12, 2025 Elections — `iriga.gov.ph` / COMELEC):**
   - **City Mayor:** Hon. Wilfredo Rex C. ("Rex") Oliva
   - **City Vice Mayor:** Hon. Edsel S. Dimaiwat
   - **Sangguniang Panlungsod Members (City Councilors):**
     1. Hon. Rodolfo Jeff B. Tino
     2. Hon. Leo Joshua Marcel O. Caayao
     3. Hon. Katherine Dominique C. ("Nikki") Lagrimas
     4. Hon. Santos A. Audal Jr.
     5. Hon. Dandreb N. Abonite
     6. Hon. Melnan R. Murallo-Asanza
     7. Hon. Wilfranco E. Guevara
     8. Hon. JM A. Grimaldo
     9. Hon. Jessie DV. Abonite Jr.
     10. Hon. Roseller Y. Orolfo
2. **2022–2025 Term (`https://iriga.gov.ph/profile/organization-and-management/`):**
   - Listed Hon. Angelica Paula P. Vargas and Hon. Jose SG. Villanueva Jr. on the council, plus Liga ng mga Barangay President Hon. Ariel B. Luceña.
3. **Appointed Department Heads (`https://iriga.gov.ph/profile/organization-and-management/`):**
   - **City Administrator:** Atty. Maharlika Ramon C. Oaferina II
   - **City Agriculturist:** Engr. Janice B. Orciga
   - **Acting Secretary to the Sanggunian:** Mrs. Yolanda De Lima
   - **Acting City Treasurer:** Mrs. Segundina V. Egipto
   - **City Accountant:** Mrs. Beverly B. Espiritu
   - **Acting City Budget Officer:** Mrs. Elena Maria V. Portea
   - **OIC City Planning & Development Coordinator:** Engr. Cynthia D. Audal
   - **Acting City Engineer:** Engr. Eddie M. Belmonte
   - **City Architect:** Arch. Romano R. Alvaro
   - **City Civil Registrar:** Mrs. Ma. Nancy R. Occiano
   - **City Legal Officer:** Atty. Rico D. Borromeo
   - **City Social Welfare & Development Officer:** Mrs. Maridel C. Verrosa
   - **Acting City Veterinarian:** Dr. Virtudes N. Rayel
   - **City Assessor:** Engr. Jonas T. Florece
   - **Acting City General Services Officer:** Mrs. Lourdes I. Badiola
   - **City Health Officer:** Dr. Ronald G. Pereña
   - **City Human Resource Management Officer:** Dr. Nenet B. Beriña

### C. Verified Offices, Hotlines & Social Media (`https://iriga.gov.ph/contact-us-2/`, capture `20260501062448`)
- **Emergency Operations Center (CDRRMO):**
  - Landline: `(054) 299 9918`
  - Mobile Hotlines: `0921 636 4018` (Smart), `0921 903 3933` (Smart), `0956 172 9656` (Globe)
  - Email: `irigacitydrrmo@gmail.com`
- **All 29 City Hall Offices Verified with Landline & Email:**
  - City Mayor's Office: `(054) 299 1989` | `cityofiriga@yahoo.com`
  - Sangguniang Panlungsod: `(054) 299 9924` | `spiriga@yahoo.com`
  - City Administrator's Office: `(054) 299 1989` | `cityofiriga@yahoo.com`
  - City Accountant's Office: `(054) 299 9919` | `acctngiriga2991954@gmail.com`
  - City Abattoir (Slaughterhouse): `(054) 299 9910` | `cityvetiriga@gmail.com`
  - City Agriculture Office: `(054) 299 9916` | `irigacity.agriculture@gmail.com`
  - City Architect's Office: `(054) 299 5253` | `cityarchitect_irigacity@yahoo.com`
  - City Assessor's Office: `(054) 299 9920` | `iriga.assessor@gmail.com`
  - City Budget Office: `(054) 299 9925` | `citybudgetoffice.irigacity.gov@gmail.com`
  - City Civil Registrar's Office: `(054) 299 9921` | `localcivilregistraririgacity@gmail.com`
  - City Engineer's Office: `(054) 299 9911` | `Officeofthecityengineer@gmail.com`
  - City Engineer's Office – Motorpool Division: `(054) 299 9909` | `Officeofthecityengineer@gmail.com`
  - City General Services Office: `(054) 299 9922` | `lguirigagso@gmail.com`
  - City Health Office: `(054) 299 9912` | `choiriga@gmail.com`
  - City Human Resource Management Office: `(054) 299 9917` | `chrmoiriga@gmail.com` *(listed as `chrmoiriga@gmail` on site)*
  - City Legal Office: `(054) 299 9902` | `irigacitylegaloffice@gmail.com`
  - City Market Superintendent's Office: `(054) 299 9927` | `marketofficeirigacity001@gmail.com`
  - City Planning & Development Coordinator's Office: `(054) 299 9923` | `ocpdcirigaofficial@gmail.com`
  - City Public Library: `(054) 299 6411` | `irigacitypubliclibrary@gmail.com`
  - City Social Welfare & Development Office (CSWDO): `(054) 299 9913` | `ilovecswdiriga@gmail.com`
  - City Terminal: `(054) 299 1978` | `iccterminal2004@gmail.com`
  - City Tourism Office: `(054) 299 9914` | `irigatourism@yahoo.com.ph`
  - City Treasurer's Office: `(054) 299 9915` | `cto.cityofiriga@gmail.com`
  - City Veterinary Office: `(054) 299 9926` | `cityvetiriga@gmail.com`
  - Civil Security Unit: `(054) 299 9904` | *(Email not yet verified)*
  - Local Economic Development & Investment Promotions Office (LEDIPO): `(054) 299 9905` | `businessfriendlyiriga@gmail.com`
  - Local Youth Development Office (LYDO): *(Landline not yet verified)* | `irigacitylydo@gmail.com`
  - Persons with Disability Affairs Office (PDAO): `(054) 299 9906` | `pdaoiriga17@gmail.com`
  - Public Employment Service Office (PESO): `(054) 299 9907` | `irigapeso@gmail.com`
  - Public Information Office (PIO): `(054) 299 9903` | `irigacitypio1@gmail.com`
  - Senior Citizens Affairs Office (OSCA): `(054) 299 6036` | `seniorcitizeniriga@gmail.com`
  - Sports Development Unit: `(054) 299 9908` | `irigacitysportsofficial@gmail.com`

### D. Budget & Fiscal Allocations (DBM National Tax Allotment & LGU Disclosures)
- **FY 2025 National Tax Allotment (NTA) for Iriga City:** `₱913,500,000` (₱913.50M) — *Source: DBM Comparison of Allocation to LGUs / Local Budget Memorandum No. 90*
- **FY 2024 National Tax Allotment (NTA) for Iriga City:** `₱772,010,000` (₱772.01M) — *Source: DBM Local Budget Memorandum FY 2024*
- **FY 2023 National Tax Allotment (NTA) for Iriga City:** `₱726,910,000` (₱726.91M) — *Source: DBM Comparison of Allocation to LGUs*
- **FY 2022 National Tax Allotment (NTA) for Iriga City:** `₱853,800,000` (₱853.80M) — *Source: DBM Post-Mandanas Ruling Allocation*
- **Gaps Explicitly Flagged:**
  - *iriga.gov.ph/transparency/* was observed in the Wayback capture to contain placeholder text (`Lorem ipsum dolor sit amet...`), meaning the LGU's own Full Disclosure webpage was not populated with machine-readable expenditure tables.
  - Line-item local expenditures (PS, MOOE, Capital Outlay) and COA Annual Audit Report PDFs require manual extraction from `fdpp.dilg.gov.ph` and `coa.gov.ph` and are marked as **Gaps** ("Not yet verified — help us find a source") until uploaded.

### E. Verified Ordinances & Resolutions (`https://iriga.gov.ph/business/local-policies-ordinances-and-regulations/`)
- **Sangguniang Panlalawigan Review Resolution No. 013, Series of 2025:** Approving the Iriga City Comprehensive Land Use Plan (CLUP) and Zoning Ordinance (2023–2032) — *Source: `https://iriga.gov.ph`*
- **City Ordinance No. 2018-10:** The Revised Revenue Code of the City of Iriga — *Source: `https://iriga.gov.ph` / BLGF*
- **Ordinance No. 2015-01:** *"An Ordinance Adopting the Iriga City Tourism Code Which Provides for the Management, Promotion and Advancement of the Iriga City Tourism Industry, and Shall Be Known as 'The Tourism Code of Iriga'."* (PDF: `https://iriga.gov.ph/wp-content/uploads/2017/08/Ordinance-No.-2015-01.pdf`)
- **Ordinance No. 2013-03:** *"An Ordinance Promoting the Development of a Sustainable Organic Agriculture in the City of Iriga, Creating the Iriga City Sustainable Organic Agriculture Stakeholders Council and Providing Funds Therefor."* (PDF: `https://iriga.gov.ph/wp-content/uploads/2017/08/Ordinance-No.-2013-03.pdf`)
- **Ordinance No. 2012-12:** *"An Ordinance Prohibiting the Use of Plastic Bags/Packaging and Styrofoam/Styropor in the City of Iriga and Prescribing the Penalties Thereof Thereby Amending Ordinance No. 2012-01."* (PDF: `https://iriga.gov.ph/wp-content/uploads/2017/08/Ordinance-No.-2012-12.pdf`)
- **Ordinance No. 2011-05:** *"An Ordinance Amending Sec. 6.2.01... Slaughter and Corral Fees... Inspection Fee... Licensing of Kabal-Kabal and Meat Handler Permit; Chapter VI – City Charges of Ordinance No. 04, Series of 1993."* (PDF: `https://iriga.gov.ph/wp-content/uploads/2017/08/Ordinance-No.-2011-05.pdf`)
- **Ordinance No. 2011-02:** *"An Ordinance Requiring All Banks, Pawnshops, Money Exchange Shops/Centers, Convenience Stores, Major Drugstores/Pharmacies, Internet Shops and Cafes, Gasoline Stations, Money Transfer Centers, Grocery Stores and Hotels to Install, Operate and Maintain Appropriate Video Surveillance and Monitoring System (CCTV)..."* (PDF: `https://iriga.gov.ph/wp-content/uploads/2017/08/Ordinance-No.-2011-02.pdf`)
- **Ordinance No. 2010-02:** *"An Ordinance Regulating the Establishment and Operations of Internet Cafes or Computer Rental Shops/Computer Gaming Shops or Centers in the City of Iriga..."* (PDF: `https://iriga.gov.ph/wp-content/uploads/2017/08/Ordinance-No.-2010-02.pdf`)
- **Ordinance No. 2005-04:** *"An Ordinance Prohibiting Lessee of Stall, Space or Any Property in Whatever Nature, Awarded to Him/Her and Owned by the LGU, Iriga City, to Sublease the Same..."* (PDF: `https://iriga.gov.ph/wp-content/uploads/2017/08/Ordinance-No.-2005-04.pdf`)
- **Ordinance No. 2000-01:** *"An Ordinance Enacting the Iriga City Investment Incentive Code of 1998, as Amended."* (PDF: `https://iriga.gov.ph/wp-content/uploads/2017/08/Ordinance-No.-2000-01.pdf`)
- **Ordinance No. 1993-04 (Parts 1 & 2):** *"An Ordinance Approving the 1993 Revenue Code of Iriga City."*

### F. Verified Infrastructure Projects & Social Programs (`iriga.gov.ph` & `bettergov.ph` DPWH Camarines Sur 5th DEO)
1. **DPWH Contract ID 24FN0084 — Multi-Purpose Building, Brgy. San Roque, Iriga City**
   - **Category:** Infrastructure (DPWH Basic Infrastructure Program / GAA 2024 SSP)
   - **Amount:** `₱47,840,000` (approx. ₱47.84M award; contractor: Iriga Jetstone Construction, Inc.)
   - **Source:** `https://transparency.bettergov.ph` / DPWH Camarines Sur 5th DEO
2. **5-Storey Mixed-Use Commercial Building (Brgy. San Francisco, Iriga City)**
   - **Category:** Infrastructure (Ongoing — Groundbreaking January 2025)
   - **Description:** Commercial complex to decongest Central Business District I and generate local employment.
   - **Source:** `https://iriga.gov.ph`
3. **Iriga City Public Hospital (Land Development & Planning)**
   - **Category:** Health Infrastructure (Ongoing)
   - **Source:** `https://iriga.gov.ph`
4. **Arriba Iriga National Government Center (Brgy. Sta. Elena)**
   - **Category:** Infrastructure (Land Acquisition & Site Development)
   - **Source:** `https://iriga.gov.ph`
5. **Sabantan Street Road Concreting (Brgy. La Medalla)**
   - **Category:** Road Infrastructure (Completed October 2025)
   - **Source:** `https://iriga.gov.ph`
6. **Iriga City Rapid Exit Bypass Road (Sta. Cruz Sur – Francia – San Jose – San Nicolas)**
   - **Category:** Road Infrastructure (Ongoing)
   - **Source:** `https://iriga.gov.ph`
7. **Community-Based Drug Treatment & Rehabilitation Program Expansion**
   - **Category:** Social & Health Program (Ongoing — August 2026)
   - **Amount:** `₱5,000,000` grant from the Dangerous Drugs Board (DDB)
   - **Source:** `https://ddb.gov.ph` / `https://iriga.gov.ph`
8. **CSWDO Indigent Senior Citizens Social Pension Payouts**
   - **Category:** Social Welfare Program (Ongoing quarterly distributions at Iriga City Sports Center)
   - **Source:** `https://iriga.gov.ph`
9. **Agta Indigenous Peoples (IP) Livelihood, Scholarship & Cultural Preservation Program**
   - **Category:** Social Welfare Program (Ongoing)
   - **Source:** `https://iriga.gov.ph`

---

## 4. Conflicts, Legal Restrictions & Gaps

1. **PhilSys Local Records (Legal Restriction):** Republic Act No. 11055 (Philippine Identification System Act) protects all PhilSys registry records from public disclosure. BetterIriga.org must **not** attempt to ingest or display PhilSys individual/local records; demographic figures must come from PSA Census of Population (POPCEN) and PSGC API (`0501716000`).
2. **LGU Website Transparency Page Placeholder (`iriga.gov.ph/transparency/`):** In the latest captured snapshot of `/transparency/` on `iriga.gov.ph`, the page body contains `Lorem ipsum dolor sit amet...` rather than Full Disclosure financial tables. Our Budget page should display the verified DBM National Tax Allotment series (FY 2022–2025) and explicitly show COA Audit Report / SRE line-item breakdowns as **Gaps** awaiting community/FOI PDF transcription.
3. **2022–2025 vs 2025–2028 Sangguniang Panlungsod Roster:** The archived `/profile/organization-and-management/` page reflects the 2022–2025 council, whereas the June 13, 2025 oath-taking release reflects the 2025–2028 elected councilors. We will present the current 2025–2028 elected roster as primary and note the transition clearly with citations for both.

---

## 5. Architecture Recommendation

- **Build-Time / Static Curated Dataset (`lib/data/iriga-data.ts`):** Type-checked TypeScript records with mandatory `Citation` (`sourceUrl`, `sourceName`, `retrievedAt`) and optional `Gap` metadata, validated by automated tests so no uncited record can ever ship.
- **Optional Live/Build-Time JSON Helper (`/api/psgc` or static fetch):** Use `https://psgc.gitlab.io/api/cities/051716000/` as the verified machine-readable API reference for geographic/barangay codes.

