# Meet the Staff Implementation Plan

## Objectives
- Model staff leadership and coordinator records in Sanity so editors can maintain bios, headshots, and reporting relationships. ✅
- Surface a new "Meet the Staff" page on the Astro site that renders directors with bios and grouped coordinators beneath each director. ✅
- Seed the initial content with Director Alex Downey-Ging and Coordinator Joseph Verschuuren. ✅ *(seed file ready for import)*

## Key Tasks
1. **Sanity Schema** ✅
   - Added `staffMember` document with localized role/bio, optional headshot alt text, director/coordinator toggle, `reportsTo` reference, and ordering (`studio/src/schemaTypes/documents/staffMember.ts`).
   - Registered schema in Sanity exports (`studio/src/schemaTypes/index.ts`) and pointed default navigation to the new page (`studio/src/schemaTypes/documents/siteSettings.ts`).
   - Left localization helpers enforcing EN/FR; duplicated English copy for French placeholders where needed.
2. **Seed Content** ✅
   - Created `studio/seed/staffMembers.ndjson` with Alex Downey-Ging (director) and Joseph Verschuuren (coordinator) linked via `reportsTo`. Import with `cd studio && npx sanity dataset import seed/staffMembers.ndjson production` or add manually via Studio.
3. **Astro Data Layer** ✅
   - Introduced typed staff interfaces and `getStaff` helper that fetches directors plus grouped coordinators (`astro-app/src/utils/sanity.ts`).
4. **Page + Components** ✅
   - Built `DirectorProfile.astro` and `CoordinatorList.astro` to match requested layouts (image left, bio or title right) and handle missing headshots with initials (`astro-app/src/components/staff/`).
   - Added `/about/meet-the-staff/` and `/fr/a-propos/equipe/` pages that render data from Sanity with localized hero copy (`astro-app/src/pages/about/meet-the-staff.astro`, `astro-app/src/pages/fr/a-propos/equipe.astro`).
5. **Navigation & Routing** ✅
   - Header dropdown updated to link to the new routes and About page anchors now reference the standalone staff page (`astro-app/src/components/layout/Header.astro`, `astro-app/src/pages/about/index.astro`, `astro-app/src/pages/fr/a-propos/index.astro`).
6. **Documentation & QA** ✅
   - Ran `npm run build -w astro-app` successfully.
   - Synced project docs: `CHECKLIST.md` (staff schema, components, phase tasks) and `MIGRATION_PLAN.md` (phase progress + staff directory notes).
   - Added this plan doc to capture approach and completion details.

## Open Questions / Assumptions
- Assumes bilingual fields must be populated in both EN/FR; will mirror English content for French until translations provided.
- Assumes new content can live under `/about/meet-the-staff/` and the French equivalent `/fr/a-propos/equipe/`.
- Image hosting: expecting existing Sanity asset pipeline suffices; will verify if additional steps needed.

## Implementation Summary
- **Data model:** `staffMember` schema powers directors/coordinators with validation ensuring coordinators reference a director.
- **Seed data:** NDJSON file ready for import so the page can display Alex Downey-Ging (director) and Joseph Verschuuren (coordinator) immediately after asset upload.
- **Front-end:** New staff components/pages fetch via `getStaff`, rendering directors with bios beside images and coordinators in ordered cards beneath each director.
- **Navigation updates:** Default nav and About page link now route to the dedicated Meet the Staff page in both languages.
- **Image hosting:** No additional setup required—Sanity CDN continues to serve headshots once uploaded through Studio.

## Next Steps
1. Import the seed data (`cd studio && npx sanity dataset import seed/staffMembers.ndjson production`) or recreate the entries manually in Studio.
2. Upload headshots for Alex and Joseph in Studio, adding localized alt text for accessibility.
3. Enter remaining directors and coordinators, ensuring each coordinator references their director and that French fields receive copy when available.
4. Review layout in the Astro app after content updates, adjusting component styling only if new requirements surface.

## Risks & Mitigations
- **Localization burden:** Editors may need FR translations. Mitigation: document the duplication approach and flag for translation follow-up.
- **Layout regressions:** New CSS may affect global styles. Mitigation: scope styles to the new components/page.
- **Missing data (headshot/bio):** Provide graceful fallbacks (e.g., placeholders) and highlight within docs for editors.
