# Testing Implementation Notes

> Running log of issues, workarounds, and tech debt discovered during testing implementation

---

## Legend

- 🐛 **Bug** - Issue in existing code discovered during testing
- 🔧 **Workaround** - Temporary fix or non-ideal solution
- 💳 **Tech Debt** - Something to improve later
- 📝 **Note** - General observation
- ✅ **Resolved** - Issue has been fixed

---

## Log

### 2025-12-01 - Initial Setup

#### Phase 1: Foundation

- ✅ Installed testing dependencies (vitest, happy-dom, playwright, testing-library)
- ✅ Created vitest.config.ts with Astro integration
- ✅ Created playwright.config.ts for E2E tests
- ✅ Created test helpers and setup files
- ✅ Added test scripts to package.json
- ✅ Unit tests pass (32 tests for i18n-config and localization)

**Issue Found:** Astro dev toolbar injects extra `<h1>` elements into the page (Audit, Settings, etc.), causing E2E tests with broad `h1` selectors to fail with "strict mode violation: resolved to 5 elements".

**Fix:** Use `main h1` or `getByRole('heading', { name: '...' })` instead of generic `h1` selectors.

#### Phase 1 Complete ✅

- 32 unit tests passing (localization, i18n-config)
- 5 E2E smoke tests passing (homepage EN/FR, news, teams, events)

#### Phase 2: Additional Unit Tests

**Issue Found:** `formatDate` tests fail due to timezone issues. The function uses `new Date().toLocaleDateString()` which is timezone-dependent. A UTC midnight date like `2024-12-25T00:00:00.000Z` becomes Dec 24 in PST/PDT timezones.

**Fix:** Use mid-day UTC times in tests (e.g., `T12:00:00Z`) to avoid day boundary issues across timezones.

💳 **Tech Debt:** Consider making formatDate timezone-explicit or using a library like date-fns for consistent behavior.

#### Phase 2 Complete ✅

- 78 unit tests passing (localization, i18n-config, i18n-index, i18n-ui, utils)

#### Phase 3: Sanity Integration Tests

- ✅ Created test fixtures with mock data for all Sanity document types (`tests/fixtures/sanity.ts`)
- ✅ Created comprehensive tests for all 21 Sanity query functions (`tests/unit/sanity.test.ts`)
- ✅ Tests cover locale fallback behavior, null handling, and empty array defaults
- ✅ Added mock for `@sanity/image-url` in test setup

📝 **Note:** The Sanity mock approach works well for testing query functions in isolation. The mock `sanityClient.fetch` is reset before each test to ensure clean state.

#### Phase 3 Complete ✅

- 133 unit tests passing (includes 55 Sanity integration tests)

#### Phase 4: Astro Component Tests

- ✅ Created component tests using Astro Container API
- ✅ Tested NewsCard, EventCard, LanguageSwitcher, PageHero
- ✅ Tests cover rendering, props, localization, and DOM structure

📝 **Note:** Astro Container API adds `data-astro-cid-*` and `data-astro-source-*` attributes in dev mode. Tests should use regex patterns or partial matches rather than exact HTML strings.

🔧 **Workaround:** Empty string attributes like `alt=""` are rendered as `alt` (without quotes) by Astro. Use regex patterns to handle this variation.

#### Phase 4 Complete ✅

- 196 unit tests passing (includes 63 component tests)

#### Phase 5: E2E Tests

- ✅ Created comprehensive navigation tests (`tests/e2e/navigation.spec.ts`)
- ✅ Created localization tests (`tests/e2e/localization.spec.ts`)
- ✅ Created news flow tests (`tests/e2e/news.spec.ts`)
- ✅ All tests pass against production build via preview server

📝 **Note:** Astro dev toolbar injects extra `<header>` elements (7 total). Use `header.site-header` selector to target the actual site header.

📝 **Note:** Complex dropdown navigation makes click-based E2E tests unreliable. Tests use direct URL navigation and attribute checks instead of clicking hidden dropdown items.

🔧 **Workaround:** Use specific selectors like `header.site-header` and `main h1` to avoid Astro dev toolbar elements that get injected during development builds.

#### Phase 5 Complete ✅

- 41 E2E tests passing (smoke, navigation, localization, news flows)
- Total: 196 unit + 41 E2E = 237 tests

#### Phase 6: GitHub Actions CI Workflow

- ✅ Created `.github/workflows/ci.yml` with:
  - Lint & Type Check job (astro check + tsc --noEmit)
  - Unit Tests job (vitest)
  - E2E Tests job (playwright with Chromium)
  - Build job (depends on lint and unit tests)
- ✅ Workflow runs on PRs to main and pushes to main
- ✅ Playwright report uploaded as artifact on failure
- ✅ Build artifact uploaded for potential deployment

#### Phase 6 Complete ✅

- CI workflow ready for GitHub Actions
- All phases complete!

---

## Issues by Category

### Code Issues (discovered via tests)

_None yet_

### Test Infrastructure

_None yet_

### Sanity/GROQ

_None yet_

### Localization

_None yet_

### Components

_None yet_

---

## Tech Debt Backlog

| Item | Priority | Category | Notes |
|------|----------|----------|-------|
| formatDate timezone handling | Low | Utils | Function is timezone-dependent; consider using date-fns or explicit timezone |

---

## Workarounds in Place

| Location | Workaround | Why | Ideal Fix |
|----------|------------|-----|-----------|
| E2E tests | Use `main h1` instead of `h1` | Astro dev toolbar injects extra h1 elements | Tests run against production build (no toolbar) in CI |

---

## Questions to Resolve

- [ ] _None yet_

---

## Test Flakiness Log

| Test | Flaky? | Cause | Fix |
|------|--------|-------|-----|
| _None yet_ | | | |
