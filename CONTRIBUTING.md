# Contributing to BetterIriga.org

Thank you for helping keep **BetterIriga.org** accurate, up to date, and easy to understand for every Irigueño!

Because BetterIriga.org is built to be **low-maintenance**, you never need to edit complex React components just to fix a phone number, update an official's name, or add a project. All text and data live in a single **Zod-validated JSON store** under the `data/` folder.

---

## 🛡️ Golden Rule: Zero Hallucinations (100% Verifiable Data)

1. **Never guess or invent data.** Never make up an official's name, peso amount, ordinance number, date, or phone number.
2. **Every record must have a primary source citation.** Every item in `data/*.json` must include a `citation` object with:
   - `sourceUrl`: An `https://` link to the official government page, PDF, or BetterGov.ph endpoint.
   - `sourceName`: Clear name of the publishing agency or document.
   - `retrievedAt`: Date verified in `YYYY-MM-DD` format.
   - `archiveUrl` *(optional)*: Wayback Machine or official PDF mirror URL.
3. **Show missing info openly as a Gap.** If an official document leaves a field blank (like an unposted barangay phone number or an undisclosed contract price), add a note in the record's `gaps` array so the site honestly displays **"Data not yet available"**.

---

## ⚡ Option 1: Automatic Sync from BetterGov.ph APIs (Zero Manual Editing)

Whenever BetterGov.ph updates its national budget (GAA / NEP / House Bill) or DPWH Camarines Sur 5th District Engineering Office (DEO) datasets, you can pull all new Iriga City records with a single command:

```bash
bun run sync-bettergov
```

This script queries:
- `https://budget.bettergov.ph/api/v1/hgab/2027/districts/leg%3Acamarines-sur%3A5th`
- `https://budget.bettergov.ph/api/v1/hgab/2027/datasets/dpwh/projects?q=Iriga`
- `https://budget.bettergov.ph/api/v1/gaa/search?q=Iriga`

It validates every record with **Zod** (`BetterGovRecordSchema`) and writes the updated list directly to `data/bettergov.json`.

---

## 📝 Option 2: Updating Local Iriga City Data or Page Copy

All local content is stored in `data/*.json`. Pick the file that matches what you want to update:

| What you want to edit | File to edit in `data/` | Zod Schema in `lib/data/schemas.ts` |
| --- | --- | --- |
| Page titles, subtitles, navigation, directory filters, or hero text | `data/site-content.json` | `SiteContentSchema` |
| City Mayor, Vice Mayor, Councilors, or Dept Heads | `data/officials.json` | `ElectedOfficialSchema` / `AppointedOfficialSchema` |
| 36 Barangays & Punong Barangays | `data/barangays.json` | `BarangayRecordSchema` |
| DBM National Tax Allotment or COA/FDPP status | `data/budget.json` | `NationalTaxAllotmentRecordSchema` / `BudgetDisclosureItemSchema` |
| City Hall infrastructure or social programs | `data/projects.json` | `ProjectRecordSchema` |
| BetterGov.ph DPWH & GAA records | `data/bettergov.json` | `BetterGovRecordSchema` |
| City Ordinances & Resolutions | `data/ordinances.json` | `LegislativeMeasureSchema` |
| 29 City Hall office phones, emails & 24/7 hotlines | `data/contacts.json` | `OfficeContactSchema` / `EmergencyHotlineSchema` |
| Official data sources & API notes | `data/sources.json` | `DataSourceRecordSchema` |

### Example: Adding a New City Ordinance to `data/ordinances.json`

```json
{
  "id": "ord-2025-example",
  "number": "Ordinance No. 2025-01",
  "year": 2025,
  "kind": "Ordinance",
  "topic": "Public Safety",
  "title": "Short Plain-Language Title of the Ordinance",
  "summary": "Clear, non-technical explanation of what this ordinance means for residents.",
  "pdfUrl": "https://iriga.gov.ph/wp-content/uploads/example.pdf",
  "citation": {
    "sourceUrl": "https://iriga.gov.ph/downloads/",
    "sourceName": "LGU Iriga Official Website — Sangguniang Panlungsod Downloads",
    "retrievedAt": "2026-11-04"
  }
}
```

---

## ✅ Step-by-Step Verification Before Opening a Pull Request

After editing any file in `data/` or running `bun run sync-bettergov`, run our verification suite:

```bash
# 1. Validate all JSON files against Zod schemas & live upstream APIs
bun run verify-data

# 2. Run automated tests
bun test

# 3. Check TypeScript types & ESLint rules
bun run typecheck
bun run lint

# 4. Verify production build succeeds
bun run build
```

If all commands exit with code `0`, commit your changes and open a Pull Request!

