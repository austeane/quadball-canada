# Ticket: Consolidate Bilingual Pages & Strengthen i18n Infrastructure

## Summary
Reduce code duplication between English and French routes by centralizing localization logic, sharing page templates, and ensuring UI chrome and metadata are sourced from a single translation layer. Align Astro 5 + Sanity best practices for bilingual sites: typed translation dictionaries, locale-aware data helpers, robust language switching, and localized SEO.

## Background
- `astro-app/src/pages/**` contains paired EN/FR Astro files with duplicate markup (e.g., `get-involved`, `teams`, `news`, `info`).
- Layout/meta copy in `astro-app/src/layouts/Layout.astro` is hard-coded in English.
- Language switcher relies on a static route lookup (`LanguageSwitcher.astro`), risking stale mappings.
- Shared components (`HeroSlider`, `SupportSection`, nav/header/footer) default to English strings that are overridden ad hoc for French.
- Sanity already provides localized fields (`localeString`, `localeText`, `localePortableText`, `localeSlug`), but Astro side doesn’t fully capitalize on them.
- Goal: follow Astro 5 guidance (single template driving multiple localized pages, Route Groups, typed helpers) and Sanity recommendations (one schema with localized fields + validation).

## Scope
- Astro app only (`astro-app/**`), with documentation updates in `AGENTS.md`/`CLAUDE.md`.
- Sanity schema changes limited to validation or helper tweaks if required (no major data model changes).
- No deployment work; focus on code refactor + tests.

## Proposed Implementation

### 1. Core i18n Config
- Create `astro-app/src/i18n/config.ts` exporting `SUPPORTED_LOCALES = ['en','fr']`, `DEFAULT_LOCALE = 'en'`.
- Add `inferLocaleFromPath(path: string): Locale` and `getAlternatePath(path: string, targetLocale: Locale): string | null`.

### 2. UI Translation Dictionary
- Add `astro-app/src/i18n/ui.ts` with typed dictionaries for navigation labels, CTA copy, metadata fallbacks.
  ```ts
  type UiKey = 'nav.announcements' | 'hero.cta' | ...;
  const uiCopy: Record<Locale, Record<UiKey, string>> = { ... };
  export function t(locale: Locale, key: UiKey): string;
  ```
- Document key usage; ensure FR entries exist for every EN key.

### 3. Localization Helpers
- Build `astro-app/src/i18n/index.ts` exposing:
  - `resolveLocale(Astro)`: respects `Astro.props.locale`, otherwise infers from path with fallback to default.
  - `localizedPath(slugMap: LocalizedValue<string>, locale: Locale)`: favors locale-specific slug, falls back to default.
  - Narrow types for Sanity `LocalizedValue<T>` reuse.

### 4. Layout & Meta Updates
- Update `Layout.astro`:
  - Accept `description?: string`, `seo?: { description?: string; title?: string; image?: string }`.
  - Default meta values via `t(locale, 'seo.siteDescription')`.
  - Inject `<html lang>` based on resolved locale.
- Ensure alternate links derive from shared helper.

### 5. Language Switcher Rework
- Refactor `LanguageSwitcher.astro` to:
  - Prefer explicit `alternate` URLs.
  - Otherwise call `getAlternatePath(currentPath, targetLocale)` and gracefully fall back to locale home if unresolved.
  - Remove static `staticMappings`.
  - Add warning (via `console.warn` during build) when fallback triggers to aid maintenance.

### 6. Shared Page Templates
- For each duplicated EN/FR page (Get Involved, Teams, Events, About subpages, Resources, etc.):
  1. Extract page logic into `src/pages/shared/<name>.astro` component receiving `{ locale }`.
  2. Replace existing English + French files with thin wrappers:
     ```astro
     --- // src/pages/get-involved/index.astro
     import Page from '../shared/get-involved.astro';
     import { resolveLocale } from '../../i18n';
     const locale = resolveLocale(Astro); // yields 'en' here
     ---
     <Page locale={locale} />
     ```
     ```astro
     --- // src/pages/fr/simpliquer/index.astro
     import Page from '../../shared/get-involved.astro';
     const locale = 'fr';
     ---
     <Page locale={locale} />
     ```
  3. Within shared template, pull localized copy from `t(locale, key)` or Sanity data; avoid in-file string duplication.
- For dynamic routes (`news/[slug]`, `info/[slug]`, `events/[slug]`):
  - Merge EN/FR into single file (e.g., `src/pages/news/[slug].astro`) with `getStaticPaths` returning two entries per slug:
    ```ts
    export async function getStaticPaths() {
      return SUPPORTED_LOCALES.flatMap(locale => articles.map(article => ({
        params: { slug: article.slugMap[locale] },
        props: { locale, slugMap: article.slugMap },
      })));
    }
    ```
  - In `getNewsArticles/getInfoArticles`, return `{ slugByLocale: Record<Locale,string> }` for path generation.

### 7. Sanity Data Helpers
- Extend helpers in `astro-app/src/utils/sanity.ts` to:
  - Return `slugMap`, `seo` localized fields, and typed structures (e.g., `NewsArticleDetail` includes `localizedTitle`, `localizedExcerpt`).
  - Provide `locale` param defaults to `DEFAULT_LOCALE`.
- Validate fallback `coalesce` usage to avoid missing FR content.
- Optional: add Sanity schema validation warnings for missing translations (Rule custom message).

### 8. Component Localization
- Update `Header.astro`, `Footer.astro`, `UtilityBar.astro`, `HeroSlider.astro`, `SupportSection.astro` to use `t(locale, key)` for text.
- Ensure CTA hrefs use `localizedPath` helper when linking to internal pages.

### 9. Testing
- Add Vitest unit tests for:
  - `inferLocaleFromPath`, `getAlternatePath`, `t` fallback behavior.
  - Language switcher mapping logic for known routes.
- Playwright smoke tests (in `tests/i18n.spec.ts`):
  - Visit `/` and `/fr/` ensure nav/hero/metadata localized.
  - Toggle language on sample page verifies corresponding URL and copy.
- Run `npm run build` to verify SSG outputs; optionally inspect generated HTML for hreflang.

### 10. Documentation
- Update `AGENTS.md` & `CLAUDE.md` with:
  - i18n helper usage, translation dictionary workflow.
  - Conventions for adding new localized routes/content.
- Add `docs/i18n-guide.md` covering translation keys, Sanity expectations, testing steps.

## Acceptance Criteria
- No duplicate page markup for any EN/FR pair; shared component per route with locale parameter.
- Layout/meta tags localized via translation helper or Sanity data.
- Language switcher resolves correct counterpart path for all main routes and falls back safely.
- Navigation/header/footer/hero/support sections render localized copy without manual overrides.
- Build + Playwright smoke tests pass for both locales.
- Documentation updated reflecting new workflow.

## Status Notes
- ✅ Core layout, header, footer, hero, support, and language switcher migrated to typed `t(locale, key)` helpers with shared locale detection.
- ✅ EN/FR duplicates for Get Involved, Teams, News detail/index, and Info detail now consume shared templates under `src/pages/_shared/`.
- ✅ Added `@/` import alias and `src/i18n` helpers; `npm run build -w astro-app` passes.
- 🔁 Remaining localized pages (e.g., Events, Resources) still use bespoke templates—candidates for future consolidation.

## Implementation Journey

### Approach A — Duplicate Pages With Manual Sync (legacy)
- **What we had:** full English and French templates living side-by-side (`astro-app/src/pages/...` vs. `.../fr/...`) with nearly identical markup and only strings/hrefs swapped.
- **Why it failed best-practice review:** every change required editing two files, hreflang alternates drifted easily, and localized metadata quietly diverged. This prompted the refactor request.

### Approach B — Shared Components under `components/pages/`
- **Idea:** extract shared markup into Astro components inside `src/components/pages/` and import them from EN/FR routes.
- **What happened:** `astro check` raised `Cannot find module '../components/pages/…'` for every consumer. With the default Astro strict config, `.astro` files under `components/` aren’t type-tracked unless explicitly imported elsewhere, so the generated `env.d.ts` lacked declarations.
- **Attempts to salvage:** updated `tsconfig.json` `include` to cover `src/**/*.astro`, but the resolver still treated `components/pages/*.astro` as isolated islands, and the relative import spaghetti became unreadable.
- **Verdict:** abandoned to avoid fragile module resolution hacks.

### Approach C — Shared Templates under `src/pages/shared/`
- **Idea:** move extracted markup into `src/pages/shared/` to stay within Astro’s page pipeline.
- **Outcome:** Astro treated those `.astro` files as routable, triggering the GROQ build error (`shared/info-detail/index.html` unexpectedly rendered during SSG). Keeping shared code inside the `pages/` tree also invited accidental static-path generation.
- **Verdict:** rejected after seeing spurious HTML output and inconsistent SSG behaviour.

### Final Approach — `_shared` Route Fragments + Path Aliases
- **Structure:** colocated shared templates under `astro-app/src/pages/_shared/` so Astro ignores them as routes (files prefixed with `_`). Each template accepts a `locale` prop; language-specific pages are thin wrappers that import the shared template.
- **i18n helpers:** built `src/i18n/` (config, resolving, and typed dictionary) plus `src/lib/routes/` for locale-aware `getStaticPaths`. Added an `@/` alias in `tsconfig.json` to replace brittle relative paths.
- **Outcome:** `astro check` and full `npm run build -w astro-app` now pass, while shared markup is maintained once.

## Technical Debt / Follow-Up
- **Translation coverage:** the `t()` dictionary currently houses only UI chrome strings (header/footer/hero/support/news). Page-specific French content is still hard-coded in `_shared/*.astro` or fed by Sanity without schema validation for missing locales. Missing copy keys fall back to English but only log in dev; default-locale leaks will go unnoticed in production.
- **Partial consolidation:** events, resources, contact, and other sections remain duplicated. Extending the `_shared` pattern will smooth future updates but needs time.
- **Alias adoption:** new `@/` path alias touches only files changed in this refactor. Older code still uses long relative imports and should eventually be modernized for consistency.
- **Language switcher fallback:** `switchLocalePath` falls back to `/` or `/fr/` when alternates are missing. We log during development, but there’s no telemetry/test protecting against regressions in production builds.

## Next Steps & Pitfalls
1. **Consolidate Remaining Routes**
   - *Action:* move events, resources, contact, support, etc., into `_shared` templates.
   - *Pitfalls:* dynamic routes with nested params (e.g., events) require careful `getStaticPaths` updates. Forgetting to update `alternate` props reintroduces broken hreflang pairs.

2. **Broaden Translation Dictionary**
   - *Action:* audit UI strings and move them into `src/i18n/ui.ts`, or parameterize via Sanity.
   - *Pitfalls:* large dictionaries are harder to diff/manage. A mistyped key silently returns the key name; consider a build-time linter to detect missing translations.

3. **Sanity Schema Validation**
   - *Action:* enforce localized field completeness (`Rule.required()` or custom validation) so fallback logic rarely triggers.
   - *Pitfalls:* content editors may prefer publishing drafts with partial translations. Build in preview warnings rather than hard blocks if editorial workflow demands it.

4. **Testing**
   - *Action:* add Playwright tests that toggle languages, assert localized headings, and check `hreflang` links.
   - *Pitfalls:* Playwright requires a running dev server; include guidance in `CLAUDE.md` to prevent flaky CI runs.

5. **Cleanup Tech Debt**
   - *Action:* remove unused keys, ensure alias adoption is comprehensive, and document the `_shared` convention in onboarding materials.
   - *Pitfalls:* contributors may revert to copy/pasting localized pages if the shared pattern isn’t documented clearly. Update PR templates/checklists to nudge correct usage.

## Risks & Mitigations
- **Path regressions:** Introduce unit tests and manual QA for critical routes before merge.
- **Missing translations:** `t()` helper should log missing keys and default to English; add CI lint to detect incomplete dictionaries.
- **Sanity content gaps:** Maintain `coalesce` fallback to English while encouraging translators via Studio validation messages.

## Follow-Up
- Consider introducing localized sitemap generation once routes consolidated.
- Explore leveraging Astro Content Collections for static copy if Sanity data remains sparse in some locales.
