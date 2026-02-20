# Event Bids Page — Work Log

**Date:** 2026-02-19
**Branch:** main (uncommitted)

---

## Summary

Implementing a new **Event Bids** page (`/events/bids/` EN, `/fr/evenements/appels-doffres/` FR) explaining Quadball Canada's formal bidding process for hosting Regional/National Championships. Distinct from the existing `/get-involved/host-an-event/` page (grassroots community hosting). The two pages cross-link to each other.

---

## Completed

### 1. Sanity Schema — `eventBidsPage` singleton

**File created:** `studio/src/schemaTypes/documents/eventBidsPage.ts`
**File modified:** `studio/src/schemaTypes/index.ts` (import + registration)

Fields:
- `domesticHosts[]` — array of objects: `eventName` (localeString), `hostCity` (string), `dateLabel` (localeString), `eventUrl` (url, optional)
- `internationalHosts[]` — same shape + optional `description` (localeText)
- `currentBids` — object: `status` (open/closed/coming-soon), `statusMessage` (localeString), `bidManualFile` (file, PDF), `bidManualTitle` (localeString), `submissionUrl` (url), `deadline` (date)
- `seo` — metaTitle (localeString), metaDescription (localeText), ogImage

Hosts are inline objects (not references to `event` docs) because awarded events may not have a corresponding event document yet.

### 2. Sanity Query + TypeScript Types

**File modified:** `astro-app/src/utils/sanity.ts`

Added:
- `HostAward` interface (eventName, hostCity, dateLabel, description?, eventUrl?)
- `CurrentBids` interface (status, statusMessage, bidManualFile, bidManualTitle, submissionUrl, deadline)
- `EventBidsPageData` interface (domesticHosts, internationalHosts, currentBids, seo)
- `getEventBidsPage(locale)` function with GROQ query using `coalesce(field[$locale], field.en)` pattern, including file asset URL dereferencing

### 3. i18n Keys (EN + FR)

**File modified:** `astro-app/src/i18n/ui.ts`

Added ~30 keys per locale covering:
- `nav.events.bids` — nav dropdown label
- `eventBids.title`, `eventBids.subtitle` — page heading
- `eventBids.intro.*` — intro section
- `eventBids.howToBid.*` — 4 numbered steps
- `eventBids.selection.*` — selection criteria
- `eventBids.getInvolved.*` — contact/questions section
- `eventBids.domesticHosts.heading`, `eventBids.internationalHosts.heading` — host section headings
- `eventBids.currentBids.heading` — bid cycle heading
- `eventBids.status.open/closed/comingSoon` — status badge labels
- `eventBids.downloadManual`, `eventBids.submitBid`, `eventBids.deadline` — button/label text
- `eventBids.crossLink.*` — CTA linking to host-an-event page

### 4. Header Nav Update

**File modified:** `astro-app/src/components/layout/Header.astro`

Added "Event Bids" / "Appels d'offres" as a dropdown item under the Events nav entry, alongside "Upcoming Events". Links to `/events/bids/` (EN) and `/fr/evenements/appels-doffres/` (FR).

### 5. Cross-Links on Host-an-Event Pages

**Files modified:**
- `astro-app/src/pages/get-involved/host-an-event.astro`
- `astro-app/src/pages/fr/simpliquer/organiser-un-evenement.astro`

Added a new CTA section at the bottom of each page with a `.cta--alt` style (gray background instead of brand-tint) linking to the event bids page. EN copy: "Want to host a Regional or National Championship?" / FR: "Vous souhaitez accueillir un Championnat régional ou national?"

### 6. Auto-Translation Scripts

**Files modified:**
- `studio/scripts/auto-translate.mjs` — added `'eventBidsPage'` to `LOCALIZED_DOCUMENT_TYPES`
- `studio/scripts/translate-all.mjs` — added `'eventBidsPage'` to `LOCALIZED_DOCUMENT_TYPES`

---

### 7. Chose Option A layout with two elements from Option B

- **Option A** full-width stacked sections with alternating backgrounds
- **From Option B:** vertical timeline for "How to Submit" steps (not 2x2 grid)
- **From Option B:** criteria chips (pill badges with checkmarks) for "Selection Criteria"

---

## Source Document

All host data sourced from: `Bid-Cycle-2026-2028-Hosting-Announcement-Article.docx`

### Domestic Hosts (from Calendar of Events table in the article)

| Event | Location | Dates |
|---|---|---|
| 2026 Eastern Regionals | Waterloo, ON | November 7-8 |
| 2026 Western Regionals | Surrey, BC | November 7 |
| 2027 National Championships | Edmonton, AB | March 20-21 |
| 2027 Eastern Regionals | Saint John, NB | November 6-7 |
| 2027 Western Regionals | Surrey, BC | November 6-7 |
| 2028 National Championships | Ottawa, ON | March TBD |

### International Hosts (from the Edmonton section of the article)

- 2028 Quadball PANAMS — Edmonton, AB (awarded to Canada by the IQA)

### Key Facts from the Article

- This is the first time Quadball Canada has engaged in a two-term bidding process.
- Regional events act as the qualifier for National Championships.
- Each event held over a one to two day period.

---

## Placeholders / Items Requiring Sanity Data Entry

The page renders host tables and the current bid cycle dynamically from Sanity CMS.
The following must be entered into Sanity Studio (`eventBidsPage` document) for content to appear:

1. **`domesticHosts` array** — Needs the 6 domestic events from the calendar above
2. **`internationalHosts` array** — Needs the 2028 Quadball PANAMS entry
3. **`currentBids` object** — All fields are PLACEHOLDER until a new bid cycle opens:
   - `status`: should be `"closed"` since the 2026-2028 cycle has already been awarded
   - `statusMessage`: no active bid cycle message in the document
   - `bidManualFile`: no PDF linked in the document
   - `submissionUrl`: no submission URL provided in the document
   - `deadline`: no upcoming deadline in the document
4. **`eventsHeroImage`** in `pageSettings` — Falls back to `defaultHeroImage` if not set

## Static Content NOT from the Article

The following page sections use i18n copy drafted during planning. They describe the
general bid process and are NOT directly quoted from the hosting announcement article:

- **Intro paragraph** (`eventBids.intro.body`) — general bid process description
- **How to Submit steps** (`eventBids.howToBid.step1-4`) — general process description
- **Selection criteria chips** (`eventBids.criteria.*`) — venue quality, budget, etc.
- **Questions section** (`eventBids.getInvolved.*`) — contact CTA
- **Cross-link section** (`eventBids.crossLink.*`) — link to host-an-event guide

---

## Completed (this session)

### 8. Implemented chosen design as Astro component

- Created `astro-app/src/pages/_shared/event-bids.astro`
- Created `astro-app/src/pages/events/bids/index.astro` (EN route)
- Created `astro-app/src/pages/fr/evenements/appels-doffres/index.astro` (FR route)
- Added `eventBids.criteria.*` i18n keys (6 chip labels, EN + FR)

### 9. Cleanup

- Deleted `astro-app/src/pages/_shared/event-bids-option-a.html`
- Deleted `astro-app/src/pages/_shared/event-bids-option-b.html`
- Deleted `astro-app/src/pages/_shared/quadball-canada-logo.svg`
- Deleted test aboutPage document `7cf17e81-dd2c-4289-9783-80dd7347f5b2`

---

## Files Changed (summary)

| File | Action |
|------|--------|
| `studio/src/schemaTypes/documents/eventBidsPage.ts` | Created |
| `studio/src/schemaTypes/index.ts` | Modified (import + register) |
| `astro-app/src/utils/sanity.ts` | Modified (types + query) |
| `astro-app/src/i18n/ui.ts` | Modified (~60 new keys) |
| `astro-app/src/components/layout/Header.astro` | Modified (nav dropdown) |
| `astro-app/src/pages/get-involved/host-an-event.astro` | Modified (cross-link CTA) |
| `astro-app/src/pages/fr/simpliquer/organiser-un-evenement.astro` | Modified (cross-link CTA) |
| `studio/scripts/auto-translate.mjs` | Modified (added type) |
| `studio/scripts/translate-all.mjs` | Modified (added type) |
