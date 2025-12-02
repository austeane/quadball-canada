# Testing Implementation Plan

> Comprehensive testing strategy for the Quadball Canada Astro + Sanity project

## Executive Summary

This project currently has **zero automated tests**. This document outlines a phased approach to implement a test suite that provides confidence in core functionality while remaining maintainable.

**Goal:** When all tests pass, we can be confident that:
- Localization logic correctly handles EN/FR content
- Sanity data fetches return expected shapes
- Pages render without errors
- Navigation and language switching work
- Critical user journeys complete successfully

---

## Testing Stack

### Chosen Tools

| Tool | Purpose | Why |
|------|---------|-----|
| **Vitest** | Unit & integration tests | Native Vite support, works with `getViteConfig()`, fast |
| **Astro Container API** | Component rendering | Official Astro solution for testing `.astro` components |
| **happy-dom** | DOM environment | Lightweight, fast, recommended by Astro docs |
| **Playwright** | E2E tests | Modern, reliable, already familiar (MCP usage) |
| **@sanity-typed/client-mock** | Sanity mocking | Purpose-built for testing Sanity integrations |
| **@testing-library/dom** | DOM queries | Standard, ergonomic assertions |

### Dependencies to Install

```bash
# Unit testing
npm install -D vitest happy-dom @testing-library/dom @testing-library/jest-dom

# Sanity mocking
npm install -D @sanity-typed/client-mock @sanity-typed/faker

# E2E testing
npm install -D @playwright/test
npx playwright install
```

---

## Architecture Overview

```
astro-app/
├── vitest.config.ts              # Vitest configuration
├── playwright.config.ts          # Playwright configuration
├── src/
│   └── test/
│       ├── helpers.ts            # Shared test utilities
│       ├── fixtures/             # Mock Sanity data
│       │   ├── news-articles.ts
│       │   ├── events.ts
│       │   └── teams.ts
│       └── setup.ts              # Global test setup
├── tests/
│   ├── unit/                     # Pure function tests
│   │   ├── localization.test.ts
│   │   ├── i18n-config.test.ts
│   │   └── utils.test.ts
│   ├── integration/              # Sanity query tests
│   │   ├── sanity-news.test.ts
│   │   ├── sanity-events.test.ts
│   │   └── sanity-teams.test.ts
│   ├── components/               # Astro component tests
│   │   ├── NewsCard.test.ts
│   │   ├── Header.test.ts
│   │   └── LanguageSwitcher.test.ts
│   └── e2e/                      # Playwright tests
│       ├── smoke.spec.ts
│       ├── navigation.spec.ts
│       ├── localization.spec.ts
│       └── news.spec.ts
```

---

## Phase 1: Foundation Setup

**Duration:** Day 1
**Goal:** Get testing infrastructure working with one test per category

### 1.1 Vitest Configuration

```typescript
// astro-app/vitest.config.ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/**', 'src/i18n/**'],
      exclude: ['src/test/**'],
    },
  },
});
```

### 1.2 Test Setup File

```typescript
// astro-app/src/test/setup.ts
import '@testing-library/jest-dom/vitest';

// Mock the sanity:client module
vi.mock('sanity:client', () => ({
  sanityClient: {
    fetch: vi.fn(),
  },
}));
```

### 1.3 Test Helper

```typescript
// astro-app/src/test/helpers.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { ComponentProps } from 'astro/types';

type AstroComponentFactory = Parameters<AstroContainer['renderToString']>[0];

export async function renderComponent<T extends AstroComponentFactory>(
  Component: T,
  options?: {
    props?: ComponentProps<T>;
    slots?: Record<string, string>;
  }
): Promise<DocumentFragment> {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Component, options);

  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content;
}

export function queryByTestId(container: DocumentFragment, testId: string) {
  return container.querySelector(`[data-testid="${testId}"]`);
}
```

### 1.4 Playwright Configuration

```typescript
// astro-app/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### 1.5 Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:run && npm run test:e2e"
  }
}
```

---

## Phase 2: Unit Tests

**Duration:** Day 2
**Goal:** Test all pure utility functions

### 2.1 Localization Tests

```typescript
// tests/unit/localization.test.ts
import { describe, it, expect } from 'vitest';
import {
  pickLocalizedValue,
  pickLocalizedString,
  pickLocalizedSlug,
} from '../../src/utils/localization';

describe('pickLocalizedValue', () => {
  it('returns value for requested locale', () => {
    const value = { en: 'Hello', fr: 'Bonjour' };
    expect(pickLocalizedValue(value, 'fr')).toBe('Bonjour');
  });

  it('falls back to default locale when requested missing', () => {
    const value = { en: 'Hello' };
    expect(pickLocalizedValue(value, 'fr', 'en')).toBe('Hello');
  });

  it('returns undefined for empty value', () => {
    expect(pickLocalizedValue(undefined, 'en')).toBeUndefined();
  });

  it('returns undefined when both locales missing', () => {
    const value = {};
    expect(pickLocalizedValue(value, 'fr', 'en')).toBeUndefined();
  });
});

describe('pickLocalizedString', () => {
  it('returns empty string instead of undefined', () => {
    expect(pickLocalizedString(undefined, 'en')).toBe('');
  });

  it('returns localized string', () => {
    const value = { en: 'Hello', fr: 'Bonjour' };
    expect(pickLocalizedString(value, 'fr')).toBe('Bonjour');
  });
});

describe('pickLocalizedSlug', () => {
  it('extracts current from slug object', () => {
    const value = {
      en: { current: 'hello-world' },
      fr: { current: 'bonjour-monde' },
    };
    expect(pickLocalizedSlug(value, 'fr')).toBe('bonjour-monde');
  });

  it('returns empty string for missing slug', () => {
    expect(pickLocalizedSlug(undefined, 'en')).toBe('');
  });
});
```

### 2.2 i18n Config Tests

```typescript
// tests/unit/i18n-config.test.ts
import { describe, it, expect } from 'vitest';
import {
  inferLocaleFromPath,
  getAlternatePath,
  ensureLeadingSlash,
  ensureTrailingSlash,
} from '../../src/i18n/config';

describe('inferLocaleFromPath', () => {
  it('returns fr for French paths', () => {
    expect(inferLocaleFromPath('/fr/')).toBe('fr');
    expect(inferLocaleFromPath('/fr/nouvelles/')).toBe('fr');
    expect(inferLocaleFromPath('/fr/a-propos/')).toBe('fr');
  });

  it('returns en for English paths', () => {
    expect(inferLocaleFromPath('/')).toBe('en');
    expect(inferLocaleFromPath('/news/')).toBe('en');
    expect(inferLocaleFromPath('/about/')).toBe('en');
  });

  it('handles paths without trailing slash', () => {
    expect(inferLocaleFromPath('/fr')).toBe('fr');
    expect(inferLocaleFromPath('/news')).toBe('en');
  });
});

describe('getAlternatePath', () => {
  it('converts EN news to FR nouvelles', () => {
    expect(getAlternatePath('/news/', 'fr')).toBe('/fr/nouvelles/');
  });

  it('converts FR nouvelles to EN news', () => {
    expect(getAlternatePath('/fr/nouvelles/', 'en')).toBe('/news/');
  });

  it('handles homepage', () => {
    expect(getAlternatePath('/', 'fr')).toBe('/fr/');
    expect(getAlternatePath('/fr/', 'en')).toBe('/');
  });

  it('handles nested paths', () => {
    expect(getAlternatePath('/about/meet-the-board/', 'fr'))
      .toBe('/fr/a-propos/conseil/');
  });
});

describe('ensureLeadingSlash', () => {
  it('adds leading slash if missing', () => {
    expect(ensureLeadingSlash('news')).toBe('/news');
  });

  it('preserves existing leading slash', () => {
    expect(ensureLeadingSlash('/news')).toBe('/news');
  });
});

describe('ensureTrailingSlash', () => {
  it('adds trailing slash if missing', () => {
    expect(ensureTrailingSlash('/news')).toBe('/news/');
  });

  it('preserves existing trailing slash', () => {
    expect(ensureTrailingSlash('/news/')).toBe('/news/');
  });
});
```

### 2.3 switchLocalePath Tests

```typescript
// tests/unit/i18n-index.test.ts
import { describe, it, expect } from 'vitest';
import { switchLocalePath, localizedPath } from '../../src/i18n';

describe('switchLocalePath', () => {
  it('uses alternate URL when provided', () => {
    const alternate = {
      en: '/news/my-article/',
      fr: '/fr/nouvelles/mon-article/',
    };
    expect(switchLocalePath('/news/my-article/', 'fr', alternate))
      .toBe('/fr/nouvelles/mon-article/');
  });

  it('falls back to path conversion when no alternate', () => {
    expect(switchLocalePath('/news/', 'fr')).toBe('/fr/nouvelles/');
  });

  it('handles absolute URLs in alternate', () => {
    const alternate = { en: '/', fr: 'https://example.com/fr/' };
    expect(switchLocalePath('/', 'fr', alternate))
      .toBe('https://example.com/fr/');
  });

  it('preserves query strings', () => {
    const alternate = { en: '/search?q=test', fr: '/fr/recherche?q=test' };
    expect(switchLocalePath('/search', 'fr', alternate))
      .toBe('/fr/recherche/?q=test');
  });
});

describe('localizedPath', () => {
  it('returns path for locale', () => {
    const slugs = { en: 'hello', fr: 'bonjour' };
    expect(localizedPath(slugs, 'fr')).toBe('/bonjour/');
  });

  it('returns undefined for missing slugs', () => {
    expect(localizedPath(undefined, 'en')).toBeUndefined();
  });

  it('ensures proper slashes', () => {
    const slugs = { en: 'hello' };
    expect(localizedPath(slugs, 'en')).toBe('/hello/');
  });
});
```

---

## Phase 3: Integration Tests (Sanity Queries)

**Duration:** Day 3
**Goal:** Test Sanity data fetching with mock data

### 3.1 Test Fixtures

```typescript
// astro-app/src/test/fixtures/news-articles.ts
import type { NewsArticleSummary, NewsArticleDetail } from '../../utils/sanity';

export const mockNewsArticles: NewsArticleSummary[] = [
  {
    _id: 'news-1',
    slug: 'test-article',
    title: 'Test Article',
    excerpt: 'This is a test excerpt',
    publishedAt: '2025-01-15T12:00:00Z',
    featuredImage: null,
  },
  {
    _id: 'news-2',
    slug: 'another-article',
    title: 'Another Article',
    excerpt: 'Another excerpt',
    publishedAt: '2025-01-10T12:00:00Z',
    featuredImage: null,
  },
];

export const mockNewsArticleDetail: NewsArticleDetail = {
  _id: 'news-1',
  slug: 'test-article',
  slugEn: 'test-article',
  slugFr: 'article-test',
  title: 'Test Article',
  excerpt: 'This is a test excerpt',
  publishedAt: '2025-01-15T12:00:00Z',
  featuredImage: null,
  content: [
    {
      _type: 'block',
      _key: 'block-1',
      style: 'normal',
      children: [{ _type: 'span', text: 'Article content here.' }],
    },
  ],
  author: null,
  seo: null,
};

export const mockNewsArticlesFr: NewsArticleSummary[] = [
  {
    _id: 'news-1',
    slug: 'article-test',
    title: 'Article de Test',
    excerpt: 'Ceci est un extrait de test',
    publishedAt: '2025-01-15T12:00:00Z',
    featuredImage: null,
  },
];
```

### 3.2 Sanity Query Tests

```typescript
// tests/integration/sanity-news.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanityClient } from 'sanity:client';
import { getNewsArticles, getNewsArticle } from '../../src/utils/sanity';
import {
  mockNewsArticles,
  mockNewsArticleDetail,
  mockNewsArticlesFr,
} from '../../src/test/fixtures/news-articles';

vi.mock('sanity:client', () => ({
  sanityClient: {
    fetch: vi.fn(),
  },
}));

describe('getNewsArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches English articles by default', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue(mockNewsArticles);

    const articles = await getNewsArticles();

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('newsArticle'),
      { locale: 'en' }
    );
    expect(articles).toHaveLength(2);
    expect(articles[0].title).toBe('Test Article');
  });

  it('fetches French articles when locale is fr', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue(mockNewsArticlesFr);

    const articles = await getNewsArticles('fr');

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      { locale: 'fr' }
    );
    expect(articles[0].title).toBe('Article de Test');
  });

  it('returns empty array when no articles', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue([]);

    const articles = await getNewsArticles();

    expect(articles).toEqual([]);
  });
});

describe('getNewsArticle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches article by slug', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue(mockNewsArticleDetail);

    const article = await getNewsArticle('test-article');

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('newsArticle'),
      { slug: 'test-article', locale: 'en' }
    );
    expect(article?.title).toBe('Test Article');
    expect(article?.slugFr).toBe('article-test');
  });

  it('returns null for non-existent article', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue(null);

    const article = await getNewsArticle('non-existent');

    expect(article).toBeNull();
  });

  it('ensures content array exists', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue({
      ...mockNewsArticleDetail,
      content: null,
    });

    const article = await getNewsArticle('test-article');

    expect(article?.content).toEqual([]);
  });
});
```

### 3.3 Events Query Tests

```typescript
// tests/integration/sanity-events.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanityClient } from 'sanity:client';
import { getEvents, getUpcomingEvents, getEvent } from '../../src/utils/sanity';

vi.mock('sanity:client', () => ({
  sanityClient: {
    fetch: vi.fn(),
  },
}));

const mockEvents = [
  {
    _id: 'event-1',
    slug: 'nationals-2026',
    title: 'National Championship 2026',
    startDateTime: '2026-03-14T09:00:00Z',
    endDateTime: '2026-03-15T18:00:00Z',
    timezone: 'America/Toronto',
  },
];

describe('getUpcomingEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters events after current date', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue(mockEvents);

    const events = await getUpcomingEvents();

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('startDateTime >= $now'),
      expect.objectContaining({ locale: 'en', now: expect.any(String) })
    );
  });

  it('sorts by startDateTime ascending', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue(mockEvents);

    await getUpcomingEvents();

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('order(startDateTime asc)'),
      expect.any(Object)
    );
  });
});
```

---

## Phase 4: Component Tests

**Duration:** Day 4
**Goal:** Test Astro component rendering

### 4.1 NewsCard Component Test

```typescript
// tests/components/NewsCard.test.ts
// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { renderComponent } from '../../src/test/helpers';
import NewsCard from '../../src/components/content/NewsCard.astro';

const mockArticle = {
  _id: 'news-1',
  slug: 'test-article',
  title: 'Test Article Title',
  excerpt: 'This is the article excerpt',
  publishedAt: '2025-01-15T12:00:00Z',
  featuredImage: null,
};

describe('NewsCard', () => {
  it('renders article title', async () => {
    const result = await renderComponent(NewsCard, {
      props: { article: mockArticle },
    });

    expect(result.textContent).toContain('Test Article Title');
  });

  it('renders article excerpt', async () => {
    const result = await renderComponent(NewsCard, {
      props: { article: mockArticle },
    });

    expect(result.textContent).toContain('This is the article excerpt');
  });

  it('links to correct EN path by default', async () => {
    const result = await renderComponent(NewsCard, {
      props: { article: mockArticle },
    });

    const link = result.querySelector('a[href*="test-article"]');
    expect(link?.getAttribute('href')).toBe('/news/test-article/');
  });

  it('links to correct FR path when locale is fr', async () => {
    const result = await renderComponent(NewsCard, {
      props: { article: mockArticle, locale: 'fr' },
    });

    const link = result.querySelector('a[href*="test-article"]');
    expect(link?.getAttribute('href')).toBe('/fr/nouvelles/test-article/');
  });

  it('applies featured class when featured prop is true', async () => {
    const result = await renderComponent(NewsCard, {
      props: { article: mockArticle, featured: true },
    });

    const card = result.querySelector('.card--featured');
    expect(card).not.toBeNull();
  });
});
```

### 4.2 LanguageSwitcher Component Test

```typescript
// tests/components/LanguageSwitcher.test.ts
// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { renderComponent } from '../../src/test/helpers';
import LanguageSwitcher from '../../src/components/layout/LanguageSwitcher.astro';

describe('LanguageSwitcher', () => {
  it('renders both language links', async () => {
    const result = await renderComponent(LanguageSwitcher, {
      props: { currentPath: '/news/' },
    });

    const enLink = result.querySelector('a[href="/news/"]');
    const frLink = result.querySelector('a[href="/fr/nouvelles/"]');

    expect(enLink).not.toBeNull();
    expect(frLink).not.toBeNull();
  });

  it('uses alternate URLs when provided', async () => {
    const result = await renderComponent(LanguageSwitcher, {
      props: {
        currentPath: '/news/my-article/',
        alternate: {
          en: '/news/my-article/',
          fr: '/fr/nouvelles/mon-article/',
        },
      },
    });

    const frLink = result.querySelector('a[href="/fr/nouvelles/mon-article/"]');
    expect(frLink).not.toBeNull();
  });
});
```

---

## Phase 5: E2E Tests

**Duration:** Day 5
**Goal:** Test critical user journeys

### 5.1 Smoke Tests

```typescript
// tests/e2e/smoke.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Quadball Canada/);
    await expect(page.locator('h1')).toContainText('Quadball Canada');
  });

  test('French homepage loads', async ({ page }) => {
    await page.goto('/fr/');

    await expect(page).toHaveTitle(/Site officiel/);
    await expect(page.locator('h1')).toContainText('Quadball Canada');
  });

  test('404 page renders for invalid route', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist/');

    expect(response?.status()).toBe(404);
  });
});
```

### 5.2 Navigation Tests

```typescript
// tests/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('main navigation links work', async ({ page }) => {
    await page.goto('/');

    // Test news link
    await page.click('a[href="/news/"]');
    await expect(page).toHaveURL('/news/');
    await expect(page.locator('h1')).toContainText('News');

    // Test events link
    await page.click('a[href="/events/"]');
    await expect(page).toHaveURL('/events/');
    await expect(page.locator('h1')).toContainText('Events');

    // Test teams link
    await page.click('a[href="/teams/"]');
    await expect(page).toHaveURL('/teams/');
    await expect(page.locator('h1')).toContainText('Teams');
  });

  test('logo links to homepage', async ({ page }) => {
    await page.goto('/news/');

    await page.click('a[aria-label*="Home"]');
    await expect(page).toHaveURL('/');
  });

  test('dropdown menus open on hover', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1200, height: 800 });

    // Hover over About dropdown trigger
    await page.hover('a[href="/about/"]');

    // Check dropdown is visible
    const dropdown = page.locator('.nav-dropdown__menu').first();
    await expect(dropdown).toBeVisible();
  });

  test('mobile menu works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Open mobile menu
    await page.click('.nav-toggle');

    // Check drawer is open
    const drawer = page.locator('.drawer__panel');
    await expect(drawer).toBeVisible();

    // Navigate via mobile menu
    await drawer.locator('a[href="/news/"]').click();
    await expect(page).toHaveURL('/news/');
  });
});
```

### 5.3 Localization Tests

```typescript
// tests/e2e/localization.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Localization', () => {
  test('language switcher navigates to French', async ({ page }) => {
    await page.goto('/');

    await page.click('a[href="/fr/"]');

    await expect(page).toHaveURL('/fr/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('language switcher navigates back to English', async ({ page }) => {
    await page.goto('/fr/');

    await page.click('a[href="/"]');

    await expect(page).toHaveURL('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('news article has correct alternate language URL', async ({ page }) => {
    // Navigate to an English news article
    await page.goto('/news/');
    await page.click('article a').first();

    // Check French link exists and has correct slug
    const frLink = page.locator('nav[aria-label="Language"] a[href*="/fr/"]');
    await expect(frLink).toBeVisible();

    // Navigate to French version
    await frLink.click();
    await expect(page).toHaveURL(/\/fr\/nouvelles\//);
  });

  test('French pages have translated navigation', async ({ page }) => {
    await page.goto('/fr/');

    // Check navigation is in French
    await expect(page.locator('a[href="/fr/nouvelles/"]')).toContainText('Communiqués');
    await expect(page.locator('a[href="/fr/evenements/"]')).toContainText('Événements');
  });

  test('footer links respect current locale', async ({ page }) => {
    await page.goto('/fr/');

    // Check footer links are French
    const footerContactLink = page.locator('footer a[href="/fr/contact/"]');
    await expect(footerContactLink).toBeVisible();
  });
});
```

### 5.4 News Flow Tests

```typescript
// tests/e2e/news.spec.ts
import { test, expect } from '@playwright/test';

test.describe('News', () => {
  test('news listing shows articles', async ({ page }) => {
    await page.goto('/news/');

    const articles = page.locator('article');
    await expect(articles.first()).toBeVisible();
  });

  test('clicking article navigates to detail', async ({ page }) => {
    await page.goto('/news/');

    const firstArticleLink = page.locator('article a').first();
    const articleTitle = await firstArticleLink.textContent();

    await firstArticleLink.click();

    await expect(page.locator('h1')).toContainText(articleTitle || '');
    await expect(page).toHaveURL(/\/news\/.+\//);
  });

  test('back to news link works', async ({ page }) => {
    await page.goto('/news/');
    await page.click('article a').first();

    await page.click('a:has-text("Back to News")');

    await expect(page).toHaveURL('/news/');
  });

  test('share buttons are present on article', async ({ page }) => {
    await page.goto('/news/');
    await page.click('article a').first();

    await expect(page.locator('a[href*="twitter.com"]')).toBeVisible();
    await expect(page.locator('a[href*="facebook.com"]')).toBeVisible();
    await expect(page.locator('a[href*="linkedin.com"]')).toBeVisible();
  });
});
```

---

## Phase 6: CI Integration

**Duration:** Day 6
**Goal:** Run tests automatically on PR/push

### 6.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:run -w astro-app

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./astro-app/coverage/lcov.info
          fail_ci_if_error: false

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
        working-directory: astro-app

      - name: Build site
        run: npm run build -w astro-app
        env:
          PUBLIC_SANITY_STUDIO_PROJECT_ID: ${{ secrets.SANITY_PROJECT_ID }}
          PUBLIC_SANITY_STUDIO_DATASET: production

      - name: Run E2E tests
        run: npm run test:e2e -w astro-app

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: astro-app/playwright-report/
          retention-days: 7
```

---

## Test Coverage Goals

| Category | Target | Priority |
|----------|--------|----------|
| Localization utils | 100% | High |
| i18n path helpers | 100% | High |
| Sanity query functions | 80% | Medium |
| Core components | 60% | Medium |
| E2E critical paths | 100% | High |

### Critical Paths (Must Pass)

1. Homepage loads (EN & FR)
2. Language switching works
3. News list → detail navigation
4. Events display correctly
5. Navigation works (desktop & mobile)
6. Build completes without errors

---

## Estimated Implementation Timeline

| Phase | Duration | Tests Added |
|-------|----------|-------------|
| 1. Foundation | 4 hours | 1 per category |
| 2. Unit Tests | 4 hours | ~25 tests |
| 3. Integration Tests | 4 hours | ~15 tests |
| 4. Component Tests | 4 hours | ~10 tests |
| 5. E2E Tests | 4 hours | ~20 tests |
| 6. CI Integration | 2 hours | - |

**Total:** ~22 hours / ~70 tests

---

## Success Criteria

When this plan is complete:

- [ ] `npm run test:run` passes with >80% coverage on utils
- [ ] `npm run test:e2e` passes all critical path tests
- [ ] CI runs tests on every PR
- [ ] Developers can run tests locally in <30 seconds (unit)
- [ ] E2E tests complete in <2 minutes
- [ ] No flaky tests

---

## Maintenance Guidelines

1. **New features:** Add unit tests for utilities, E2E test for user flows
2. **Bug fixes:** Add regression test before fixing
3. **Sanity schema changes:** Update fixtures and integration tests
4. **New pages:** Add smoke test and navigation test
5. **Localization additions:** Add to localization E2E tests

---

## References

- [Astro Testing Docs](https://docs.astro.build/en/guides/testing/)
- [Astro Container API](https://docs.astro.build/en/reference/container-reference/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [@sanity-typed/client-mock](https://www.sanity.io/plugins/sanity-typed-client-mock)
- [Astro Component Unit Tests](https://angelika.me/2025/02/01/astro-component-unit-tests/)
