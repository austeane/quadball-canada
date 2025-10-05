# Quadball Canada Website Migration Plan
## WordPress to Astro + Sanity CMS - Production Ready

> **Primary Goals**
> 1. Preserve SEO + URLs where feasible
> 2. Improve Core Web Vitals & editorial UX
> 3. Deliver bilingual (EN/FR) parity from day one
> 4. Reduce ongoing maintenance (no WordPress plugin drift)

---

## 1. Current Site Analysis

> Status Update (2025-10-05)
> - Applied quick visual wins in Astro app: sticky header with Donate CTA + mobile menu, typography rhythm + corrected IBM Plex Mono, improved link hover affordance, container padding.
> - Upgraded News cards to fixed aspect ratio with srcset/sizes and width/height to reduce CLS.
> - Homepage title updated to “Quadball Canada — Official Site”.
> - Added `preconnect` to `cdn.sanity.io` for image performance.
> - See `CHECKLIST.md` → “Visual polish updates (completed)” for granular items.

### Technology Stack
- **Platform**: WordPress (Elegant Themes/Divi)
- **Features**: Multi-language (EN/FR), Blog, Events, Teams, Media galleries
- **Integrations**: Social media, Newsletter (MailChimp), External store (VC Ultimate)
- **Legacy**: "Quidditch" → "Quadball" rebrand (need synonym redirects)

### URL Patterns & Content
- Posts: `/YYYY/MM/slug/` format
- Pages: Flat URLs (`/about-us/`, `/play/`)
- Media: `/wp-content/uploads/YYYY/MM/`
- 100+ articles since 2016
- Divi shortcodes requiring conversion

### Site Structure
```
├── Homepage
│   ├── Hero Slider (5 slides with CTAs)
│   ├── News Grid (6 latest posts)
│   ├── Sponsor Section (VC Ultimate)
│   └── 3 CTA Blocks (Join Team, Standings, Volunteer)
├── News & Blog
│   ├── Post listings
│   └── Individual articles
├── About
│   ├── About Us (Mission, Values)
│   ├── Our Volunteers
│   ├── Policies
│   └── Anti-Oppression Resources
├── Play
│   ├── How to Play (Rules)
│   ├── Find a Team
│   └── Rankings/Standings
├── Events
│   ├── Event Calendar
│   ├── Event Bidding
│   └── Individual event pages
├── Get Involved
│   ├── Volunteer opportunities
│   ├── Job postings
│   ├── Coach & Officiate
│   └── Host events
├── Media
│   ├── Photos (Flickr integration)
│   ├── Videos (YouTube)
│   └── Press resources
├── Support Us
│   ├── Donate
│   └── Sponsorship info
└── Contact
```

---

## 2. Migration Strategy - 6 Week Timeline

### Phase 1: Foundation & i18n (Week 1)
- [ ] Sanity project with production dataset configured (introduce `staging` once needed)
- [ ] Field-level i18n using custom `locale*` object helpers for EN/FR content
- [ ] Astro base layout + navigation with language routing (`/` EN, `/fr/` FR)
- [ ] Editor RBAC: Contributors, Editors, Publishers with Google SSO
- [ ] Preview mode: Astro preview route with Sanity draft token
- [ ] Git repository structure with CI/CD pipeline

### Phase 2: Data Migration Pipeline (Week 2)
- [ ] WordPress export: XML + DB dump + `/uploads` directory
- [ ] Migration scripts (Node.js):
  - [ ] Posts/pages with internal link rewriting
  - [ ] Media with alt text preservation
  - [ ] People/authors to Sanity
  - [ ] Divi shortcodes → HTML blocks fallback
- [ ] Redirect map builder (old URLs → new)
- [ ] Upload media to Sanity with metadata

### Phase 3: Core Experiences (Week 3)
- [ ] Homepage sections (hero, news grid, sponsor, CTAs)
- [ ] News listing/detail pages with pagination
- [ ] About/Play static pages
- [ ] Team directory with filters (province, level, status)
- [ ] Bilingual navigation + breadcrumbs + 404 page
- [ ] Basic search functionality

### Phase 4: Events, Search & Feeds (Week 4)
- [ ] Events calendar with timezone support & recurrence (RRULE)
- [ ] ICS feed generation + "Add to Calendar" functionality
- [ ] Algolia search with bilingual indices & synonyms
- [ ] Newsletter integration (MailChimp) with Turnstile protection
- [ ] Contact form → Sanity + email notifications (Postmark)
- [ ] Social embeds with privacy-first loading

### Phase 5: Performance, SEO & Accessibility (Week 5)
- [ ] Core Web Vitals optimization (LCP < 2.5s, CLS < 0.10, INP < 200ms)
- [ ] hreflang tags + per-locale sitemaps with alternates
- [ ] Open Graph image generation for posts/events
- [ ] WCAG 2.2 AA compliance audit
- [ ] Security headers (CSP, Referrer-Policy)
- [ ] Cookie consent banner (PIPEDA/Law 25 compliance)

### Phase 6: Launch Readiness (Week 6)
- [ ] E2E testing with Playwright
- [ ] Content freeze + final migration
- [ ] 301 redirects deployment
- [ ] DNS preparation (low TTL)
- [ ] Monitoring setup (Sentry, UptimeRobot)
- [ ] Editor training + documentation
- [ ] Rollback plan tested

---

## 3. Sanity Schema Design

### i18n Strategy
Use **field-level localization** via shared `localeString`, `localeText`, `localeSlug`, and `localePortableText` objects. Each document stores EN/FR variants together so localized slugs, SEO, and content stay in sync while keeping a single document ID. The `supportedLanguages` helper controls defaults and validation.

### Shared Types

```javascript
// /schemas/objects/localeString.js
export default {
  name: 'localeString',
  type: 'object',
  fields: [
    { name: 'en', type: 'string', title: 'English' },
    { name: 'fr', type: 'string', title: 'French' }
  ],
  preview: { select: { title: 'en' } }
}

// /schemas/objects/seo.js
export default {
  name: 'seo',
  type: 'object',
  fields: [
    { name: 'title', type: 'string', validation: Rule => Rule.max(60) },
    { name: 'description', type: 'text', validation: Rule => Rule.max(160) },
    { name: 'canonicalUrl', type: 'url' },
    { name: 'ogImage', type: 'image', options: { hotspot: true } }
  ]
}

// /schemas/objects/imageWithMeta.js
export default {
  name: 'imageWithMeta',
  type: 'image',
  options: { hotspot: true },
  fields: [
    {
      name: 'alt',
      type: 'localeString',
      validation: Rule => Rule.required().error('Alt text is required for accessibility')
    },
    { name: 'credit', type: 'string' },
    { name: 'license', type: 'string', options: {
      list: ['CC0', 'CC-BY', 'CC-BY-SA', 'Copyright', 'Permission']
    }}
  ]
}
```

### Content Models

```javascript
// 1. News Article - Enhanced
{
  title: localeString (required),
  slug: localeSlug (unique per locale),
  publishedAt: datetime (required),
  author: reference(author),
  categories: array(reference(category)),
  tags: array(string),
  excerpt: localeText,
  content: localePortableText (supports image, file, and embed blocks),
  featuredImage: {
    asset: image,
    alt: localeString
  },
  readingTime: number (auto-calculated),
  featured: boolean,
  related: array(reference(newsArticle)),
  seo: {
    metaTitle: localeString,
    metaDescription: localeText,
    ogImage: image
  }
}

// 2. Event - Production Ready
{
  title: string (required),
  slug: slug,
  start: datetime (required),
  end: datetime,
  timezone: string (IANA, e.g., 'America/Toronto'),
  allDay: boolean,
  rrule: string (RFC 5545 for recurring events),
  status: string ['scheduled', 'postponed', 'cancelled', 'completed'],
  location: {
    venue: string,
    address: string,
    city: string,
    province: string,
    lat: number,
    lng: number,
    googleMapsUrl: url
  },
  host: reference(team),
  eventType: string ['tournament', 'workshop', 'meeting', 'tryout'],
  divisions: array(reference(division)),
  price: string,
  registrationLink: url,
  registrationDeadline: datetime,
  capacity: number,
  description: portableText,
  schedule: array(scheduleItem),
  image: imageWithMeta,
  documents: array(file),
  results: array({
    placement: number,
    team: reference(team),
    points: number
  }),
  livestreamUrl: url,
  seo: seo
}

// 3. Team - Enhanced with Season Support
{
  name: string (required),
  slug: slug,
  city: string,
  province: reference(province),
  level: string ['university', 'community', 'youth', 'national'],
  status: string ['active', 'inactive', 'developing'],
  founded: date,
  logo: imageWithMeta,
  teamPhoto: imageWithMeta,
  description: portableText,
  season: reference(season),
  division: reference(division),
  website: url,
  socialMedia: {
    facebook: url,
    instagram: url,
    twitter: url,
    tiktok: url
  },
  contacts: array(reference(person)),
  achievements: array(string),
  homeVenue: reference(venue),
  roster: array(reference(person)),
  standings: reference(standing),
  seo: seo
}

// 4. Person (Players, Volunteers, Board)
{
  name: string (required),
  slug: slug,
  role: string,
  pronouns: string,
  email: email,
  phone: string,
  bio: localeString,
  photo: imageWithMeta,
  positions: array(string), // For players
  jerseyNumber: number,
  socialMedia: object,
  teams: array(reference(team)),
  startDate: date,
  endDate: date,
  isPublic: boolean
}

// 5. Season & Standings (Sports-specific)
{
  // Season
  name: string (e.g., '2024-2025'),
  slug: slug,
  startDate: date,
  endDate: date,
  divisions: array(reference(division)),

  // Standing (per team per season)
  team: reference(team),
  season: reference(season),
  division: reference(division),
  wins: number,
  losses: number,
  ties: number,
  pointDifferential: number,
  gamesPlayed: number,
  rank: number,
  qualified: boolean
}

// 6. Page (Flexible)
{
  title: localeString,
  slug: slug,
  pageType: string ['about', 'play', 'support', 'policy', 'resource'],
  sections: array(
    hero |
    richText |
    ctaBlock |
    imageGallery |
    videoEmbed |
    teamGrid |
    eventList |
    standings |
    contactForm |
    newsletter
  ),
  seo: seo
}

// 7. Navigation
{
  title: string,
  menuItems: array({
    label: localeString,
    link: url or reference,
    submenu: array(menuItem),
    highlight: boolean
  }),
  locale: string
}

// 8. Site Settings
{
  siteTitle: localeString,
  tagline: localeString,
  logo: image,
  favicon: image,
  defaultOgImage: image,
  socialMedia: {
    facebook: url,
    instagram: url,
    twitter: url,
    youtube: url,
    tiktok: url,
    flickr: url
  },
  analytics: {
    gtmId: string,
    ga4Id: string
  },
  newsletterUrl: url,
  donationUrl: url,
  footer: {
    about: localeString,
    copyright: localeString,
    charityNumber: string,
    links: array(linkGroup),
    disclaimers: localeString
  }
}
```

---

## 4. Component Architecture

### Layout Components
```
components/
├── layout/
│   ├── BaseLayout.astro
│   ├── Header.astro
│   ├── Navigation.astro (with mobile menu)
│   ├── Footer.astro
│   ├── LanguageSwitcher.astro
│   └── CookieBanner.astro
├── sections/
│   ├── HeroSlider.astro (CSS scroll-snap)
│   ├── NewsGrid.astro
│   ├── CTABlocks.astro
│   ├── SponsorSection.astro
│   ├── TeamGrid.astro
│   ├── EventCalendar.astro
│   ├── StandingsTable.astro
│   └── ContactForm.astro
├── ui/
│   ├── Button.astro
│   ├── Card.astro
│   ├── Badge.astro
│   ├── Modal.astro
│   ├── Tabs.astro
│   ├── Breadcrumbs.astro
│   └── Pagination.astro
├── content/
│   ├── NewsCard.astro
│   ├── EventCard.astro
│   ├── TeamCard.astro
│   ├── PersonCard.astro
│   ├── PortableText.astro
│   └── TableOfContents.astro
└── media/
    ├── ResponsiveImage.astro
    ├── VideoEmbed.astro (lite-youtube)
    ├── Gallery.astro
    └── OGImage.ts (dynamic generation)
```

### Page Structure
```
pages/
├── index.astro (Homepage)
├── [lang]/
│   ├── index.astro (Localized homepage)
│   ├── news/
│   │   ├── index.astro (News listing)
│   │   └── [slug].astro (Article detail)
│   ├── about/
│   │   ├── index.astro
│   │   ├── volunteers.astro
│   │   ├── policies.astro
│   │   └── [slug].astro
│   ├── play/
│   │   ├── index.astro
│   │   ├── rules.astro
│   │   └── how-to-play.astro
│   ├── teams/
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── events/
│   │   ├── index.astro
│   │   ├── calendar.astro
│   │   └── [slug].astro
│   ├── standings/
│   │   └── index.astro
│   └── contact.astro
├── api/
│   ├── preview.ts
│   ├── revalidate.ts
│   ├── newsletter.ts
│   ├── contact.ts
│   ├── search.ts
│   └── standings.json.ts
├── events.ics.ts (ICS feed)
├── sitemap-[lang].xml.ts
├── robots.txt.ts
└── 404.astro
```

---

## 5. Data Migration Implementation

### WordPress Export Strategy

```bash
# 1. Export WordPress data
- WP Admin > Tools > Export > All content
- Database dump: mysqldump -u [user] -p [database] > quadball_backup.sql
- Media files: tar -czf uploads.tar.gz wp-content/uploads/

# 2. Migration scripts structure
scripts/
├── wp-to-sanity/
│   ├── config.js
│   ├── migrate-news-articles.ts
│   ├── migrate-pages.js
│   ├── migrate-media.js
│   ├── migrate-users.js
│   ├── build-redirects.js
│   └── utils/
│       ├── parse-xml.js
│       ├── sanitize-html.js
│       ├── link-rewriter.js
│       └── divi-converter.js
```

### Migration Scripts

```javascript
// scripts/wp-to-sanity/migrate-news-articles.ts
import { parseStringPromise } from 'xml2js';
import { createClient } from '@sanity/client';
import { htmlToBlocks } from '@sanity/block-tools';
import { JSDOM } from 'jsdom';
// Helpers (normalizeSlug, decodeEntities, stripHtml, resolveAuthorReference, resolveCategoryReferences, mapFeaturedImage)
// live in scripts/wp-to-sanity/utils

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  token: process.env.SANITY_TOKEN,
  apiVersion: '2024-12-01',
  useCdn: false,
});

const migrateNewsArticle = async (wpPost) => {
  const { window } = new JSDOM(wpPost.content);

  // Handle Divi shortcodes
  let content = wpPost.content;
  if (content.includes('[et_pb_')) {
    // Fallback to HTML block for complex Divi layouts
    content = sanitizeDiviContent(content);
  }

  // Convert to Portable Text
  const blocks = htmlToBlocks(content, {
    parseHtml: (html) => (window.document.createElement('div').innerHTML = html),
  });

  const baseSlug = normalizeSlug(wpPost.slug);

  const authorRef = await resolveAuthorReference(wpPost.creator, client);
  const categoryRefs = await resolveCategoryReferences(wpPost.categories, client);
  const featuredImage = await mapFeaturedImage(wpPost.featured_media, client);

  const document = {
    _type: 'newsArticle',
    _id: `newsArticle.${baseSlug}`,
    title: {
      en: decodeEntities(wpPost.title),
      fr: '', // Placeholder until translation ready
    },
    slug: {
      en: { current: baseSlug },
      fr: { current: `${baseSlug}-fr` },
    },
    publishedAt: wpPost.date,
    author: authorRef,
    categories: categoryRefs,
    excerpt: {
      en: stripHtml(wpPost.excerpt),
      fr: '',
    },
    content: {
      en: blocks,
      fr: [],
    },
    featuredImage,
    featured: wpPost.meta?._quadball_featured === '1',
    seo: {
      metaTitle: {
        en: wpPost.yoast?.title || decodeEntities(wpPost.title),
        fr: '',
      },
      metaDescription: {
        en: wpPost.yoast?.description || stripHtml(wpPost.excerpt),
        fr: '',
      },
    },
  };

  await client.createOrReplace(document);

  return { oldUrl: wpPost.link, newUrl: `/news/${baseSlug}` };
};

// Build redirect map
const buildRedirects = async (mappings) => {
  const redirects = mappings.map(({ oldUrl, newUrl }) => ({
    from: new URL(oldUrl).pathname,
    to: newUrl,
    status: 301,
  }));

  // Add legacy brand redirects
  redirects.push(
    { from: '/quidditch/*', to: '/quadball/$1', status: 301 },
    { from: '/category/*', to: '/news/category/$1', status: 301 },
  );

  return redirects;
};
```

---

## 6. Search Implementation (Algolia)

### Index Configuration
```javascript
// scripts/algolia-setup.js
const indices = {
  'quadball_news_en': {
    searchableAttributes: ['title', 'excerpt', 'content', 'categories', 'tags'],
    customRanking: ['desc(publishedAt)'],
    attributesToSnippet: ['content:50'],
    synonyms: [
      { objectID: '1', type: 'synonym', synonyms: ['quadball', 'quidditch'] },
      { objectID: '2', type: 'synonym', synonyms: ['ON', 'Ontario'] },
      { objectID: '3', type: 'synonym', synonyms: ['QC', 'Quebec', 'Québec'] }
    ]
  },
  'quadball_news_fr': {
    searchableAttributes: ['title', 'excerpt', 'content', 'categories', 'tags'],
    customRanking: ['desc(publishedAt)'],
    attributesToSnippet: ['content:50'],
    ignorePlurals: ['fr', 'en'],
    removeStopWords: ['fr', 'en']
  },
  'quadball_teams_en': {
    searchableAttributes: ['name', 'city', 'province', 'description'],
    facets: ['province', 'level', 'status', 'division']
  },
  'quadball_events_en': {
    searchableAttributes: ['title', 'location.venue', 'location.city', 'description'],
    customRanking: ['asc(start)'],
    facets: ['eventType', 'status', 'location.province']
  }
};
```

### Webhook Handler
```typescript
// src/pages/api/algolia-sync.ts
import type { APIRoute } from 'astro';
import algoliasearch from 'algoliasearch';

const client = algoliasearch(
  import.meta.env.ALGOLIA_APP_ID,
  import.meta.env.ALGOLIA_ADMIN_KEY
);

export const post: APIRoute = async ({ request }) => {
  const { _type, action, document, language } = await request.json();

  const indexPrefix = {
    newsArticle: 'quadball_news',
    team: 'quadball_teams',
    event: 'quadball_events',
  }[_type];

  if (!indexPrefix) {
    return new Response('Ignored', { status: 204 });
  }

  const index = client.initIndex(`${indexPrefix}_${language}`);

  if (action === 'delete') {
    await index.deleteObject(document._id);
    return new Response('Deleted', { status: 200 });
  }

  // Transform document to search record
  const record = transformForSearch(document, _type);
  await index.saveObject(record);

  return new Response('Indexed', { status: 200 });
};
```

---

## 7. Performance & Core Web Vitals

### Targets
- **LCP** < 2.5s (75th percentile)
- **CLS** < 0.10
- **INP** < 200ms (replaces FID)
- **FCP** < 1.8s
- **TTFB** < 800ms

### Implementation
```javascript
// astro.config.mjs
export default defineConfig({
  output: 'static',
  integrations: [
    compress({
      CSS: true,
      HTML: { removeAttributeQuotes: false },
      Image: false, // Handle with Sanity
      JavaScript: true,
      SVG: true
    }),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          fr: 'fr'
        }
      }
    })
  ],
  image: {
    domains: ['cdn.sanity.io']
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom'],
            'search': ['algoliasearch']
          }
        }
      }
    }
  }
});
```

### Resource Budgets
```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['/', '/news/', '/events/', '/teams/']
    },
    assert: {
      budgets: [
        {
          path: '/*',
          resourceSizes: [
            { resourceType: 'script', budget: 90 },
            { resourceType: 'stylesheet', budget: 70 },
            { resourceType: 'image', budget: 500 },
            { resourceType: 'total', budget: 1000 }
          ],
          resourceCounts: [
            { resourceType: 'third-party', budget: 5 }
          ]
        }
      ],
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }]
      }
    }
  }
};
```

---

## 8. Security & Compliance

### Security Headers
```javascript
// cloudflare.headers.js
export const headers = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.sanity.io https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://cdn.sanity.io https://i.ytimg.com",
    "font-src 'self' data:",
    "connect-src 'self' https://*.algolia.net https://cdn.sanity.io",
    "frame-src https://www.youtube.com",
    "upgrade-insecure-requests"
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};
```

### Cookie Consent (PIPEDA/Law 25)
```astro
---
// components/CookieBanner.astro
---
<div id="cookie-banner" class="hidden">
  <div class="container">
    <p>{t('cookies.message')}</p>
    <div class="actions">
      <button id="accept-essential">{t('cookies.essential')}</button>
      <button id="accept-all">{t('cookies.acceptAll')}</button>
      <a href="/privacy">{t('cookies.learnMore')}</a>
    </div>
  </div>
</div>

<script>
  // Check consent status
  const consent = localStorage.getItem('cookie-consent');
  if (!consent) {
    document.getElementById('cookie-banner').classList.remove('hidden');
  }

  // Handle consent
  document.getElementById('accept-essential').addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'essential');
    window.gtag('consent', 'update', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied'
    });
  });
</script>
```

---

## 9. Testing Strategy

### Automated Testing
```javascript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
    { name: 'Desktop Firefox', use: { ...devices['Desktop Firefox'] } }
  ],
  use: {
    baseURL: 'http://localhost:4321',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
});

// e2e/critical-paths.spec.ts
test.describe('Critical User Paths', () => {
  test('Homepage loads with hero, news, and CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero-slider')).toBeVisible();
    await expect(page.locator('.news-grid article')).toHaveCount(6);
    await expect(page.locator('.cta-blocks')).toBeVisible();
  });

  test('Language switching preserves context', async ({ page }) => {
    await page.goto('/news/test-article');
    await page.click('[data-language-switch="fr"]');
    await expect(page).toHaveURL('/fr/nouvelles/test-article');
    await expect(page.locator('h1')).toContainText('Article Test');
  });

  test('Event calendar and ICS download', async ({ page }) => {
    await page.goto('/events');
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-download="ics"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('events.ics');
  });
});
```

### Accessibility Testing
```javascript
// a11y.test.js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('Homepage meets WCAG 2.2 AA', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
```

---

## 10. Launch Plan

### Pre-Launch Checklist
- [ ] Final content migration with fresh WordPress export
- [ ] All redirects mapped and tested (≥98% coverage)
- [ ] Algolia indices populated and tuned
- [ ] Security headers configured
- [ ] Cookie consent implemented
- [ ] DNS TTL lowered to 60 seconds
- [ ] Monitoring configured (Sentry, UptimeRobot)
- [ ] Backup of current site accessible at old.quidditchcanada.com

### Launch Day
```bash
# 1. Final sync
npm run migrate:production

# 2. Deploy redirects
wrangler pages deploy redirects.json

# 3. Update DNS
# A Record: quadballcanada.ca → Cloudflare Pages
# CNAME: www → quadballcanada.ca

# 4. Monitor
npm run monitor:launch
```

### Post-Launch (Days 1-14)
- [ ] Monitor 404s and add missing redirects
- [ ] Review Core Web Vitals RUM data
- [ ] Tune Algolia search relevance based on queries
- [ ] Fill missing French translations
- [ ] Submit sitemaps to Google Search Console
- [ ] Verify hreflang implementation
- [ ] Train editors on Sanity workflow

---

## 11. Success Metrics

### Technical Metrics
- ✅ **Core Web Vitals** (p75): LCP < 2.5s, CLS < 0.10, INP < 200ms
- ✅ **Lighthouse Scores**: Performance > 90, Accessibility > 95
- ✅ **Build Time**: < 60 seconds
- ✅ **Page Weight**: Homepage < 500KB, Articles < 300KB

### Business Metrics
- ✅ **SEO**: Traffic maintained or improved after 30 days
- ✅ **Engagement**: Bounce rate decreased by 20%
- ✅ **Editorial**: Time to publish reduced by 50%
- ✅ **Search**: CTR improved by 15% with Algolia

### Content Metrics
- ✅ **Migration**: 100% of news articles/pages transferred
- ✅ **Media**: All images have alt text in at least one language
- ✅ **Links**: < 1% broken internal links
- ✅ **Translations**: 80% French coverage at launch

---

## 12. Risk Mitigation

### Contingency Plans

| Risk | Mitigation | Rollback |
|------|------------|----------|
| Divi content complexity | HTML block fallback, progressive enhancement post-launch | Keep WordPress staging site |
| SEO traffic loss | Preserve URLs, comprehensive redirects, immediate sitemap submission | DNS revert (< 5 min) |
| Translation delays | Launch with EN, hide incomplete FR pages, progressive translation | Feature flags per language |
| Performance regression | Budget enforcement in CI, CDN caching, image optimization | Previous deployment on CDN |
| Editorial confusion | Video training, cheat sheets, office hours first week | Dual publishing for 2 weeks |

---

## Resources & Scripts

All migration scripts, configuration files, and documentation are available in the repository:
- `/scripts/migration/` - WordPress to Sanity tools
- `/docs/editor-guide.md` - Content management documentation
- `/infrastructure/` - Deployment and monitoring configs
- `/.github/workflows/` - CI/CD pipelines

For questions or support during migration, contact the development team.
