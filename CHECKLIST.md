# Quadball Canada Migration Checklist
## WordPress to Astro + Sanity CMS

> **Created**: 2025-01-05
> **Status**: Phase 1 Complete
> **Current Phase**: Phase 2 - Data Migration Pipeline

---

## Technical Debt & Issues Tracker

### Known Issues
- [ ] **React 19 Compatibility**: Switched from SSR to Static SSG due to Cloudflare Workers MessageChannel error
  - Impact: No dynamic SSR features, but improved performance
  - Decision: Accepted trade-off for better Core Web Vitals
- [ ] **Sanity Studio Port Conflict**: Studio running on port 3334 instead of default 3333
- [ ] **Missing concurrently package**: Root npm dev script needs fixing
- [ ] **GitHub Token in webhook-proxy.js**: Token exposed in code (needs secrets management)

### Technical Debt
- [ ] Localization approach using document-level instead of field-level i18n
- [ ] No automated translation pipeline setup
- [ ] Missing TypeScript interfaces for Sanity schemas in Astro app
- [ ] Need to implement proper error boundaries for form components
- [ ] Cookie consent implementation pending

### Deviations from Plan
- ✅ Used Static SSG instead of Hybrid SSR (better performance, simpler deployment)
- ✅ Implemented automated deployment via GitHub Actions + Cloudflare Worker proxy
- ✅ Document-level i18n with localized slugs (more SEO-friendly than field-level)

---

## Phase 1: Foundation & i18n (Week 1) ✅

### Completed
- [x] ~~Sanity project with `staging` and `production` datasets~~ *(Using single production dataset)*
- [x] Document-level i18n with custom helpers *(Not using plugin, custom implementation)*
- [x] Created localization helpers (localeString, localeText, localeSlug, localePortableText)
- [x] Git repository structure with CI/CD pipeline *(GitHub Actions + Cloudflare deployment)*
- [x] Automated webhook deployment (Sanity → Worker → GitHub → Cloudflare)

### Pending
- [ ] Astro base layout + navigation with language routing (`/` EN, `/fr/` FR)
- [ ] Editor RBAC: Contributors, Editors, Publishers with Google SSO
- [ ] Preview mode: Astro preview route with Sanity draft token

### Notes
- Deployment automated via webhook-proxy.js Cloudflare Worker
- Using GitHub Actions for CI/CD instead of direct Cloudflare builds
- Sanity Studio deployed at https://quadball-canada.sanity.studio

---

## Phase 2: Data Migration Pipeline (Week 2) - CURRENT

### Todo
- [ ] WordPress export: XML + DB dump + `/uploads` directory
- [ ] Migration scripts (Node.js):
  - [ ] Posts/pages with internal link rewriting
  - [ ] Media with alt text preservation
  - [ ] People/authors to Sanity
  - [ ] Divi shortcodes → HTML blocks fallback
- [ ] Redirect map builder (old URLs → new)
- [ ] Upload media to Sanity with metadata

### Notes
- User has WordPress admin access, database dump, and XML export available
- Need to handle 100+ articles since 2016
- Must preserve `/YYYY/MM/slug/` URL pattern for SEO

---

## Phase 3: Core Experiences (Week 3)

### Todo
- [ ] Homepage sections:
  - [ ] Hero slider (5 slides with CTAs)
  - [ ] News grid (6 latest posts)
  - [ ] Sponsor section (VC Ultimate)
  - [ ] 3 CTA blocks (Join Team, Standings, Volunteer)
- [ ] News listing/detail pages with pagination
- [ ] About/Play static pages
- [ ] Team directory with filters (province, level, status)
- [ ] Bilingual navigation + breadcrumbs + 404 page
- [ ] Basic search functionality

### Notes
- Need to match existing WordPress/Divi design
- Hero slider using CSS scroll-snap for performance

---

## Phase 4: Events, Search & Feeds (Week 4)

### Todo
- [ ] Events calendar with timezone support & recurrence (RRULE)
- [ ] ICS feed generation + "Add to Calendar" functionality
- [ ] Algolia search with bilingual indices & synonyms
- [ ] Newsletter integration (MailChimp) with Turnstile protection
- [ ] Contact form → Sanity + email notifications (Postmark)
- [ ] Social embeds with privacy-first loading

### Notes
- Event schema already includes timezone and RRULE support
- Need to handle "quidditch" → "quadball" synonyms in search

---

## Phase 5: Performance, SEO & Accessibility (Week 5)

### Todo
- [ ] Core Web Vitals optimization:
  - [ ] LCP < 2.5s
  - [ ] CLS < 0.10
  - [ ] INP < 200ms (replaces TTI)
- [ ] hreflang tags + per-locale sitemaps with alternates
- [ ] Open Graph image generation for posts/events
- [ ] WCAG 2.2 AA compliance audit
- [ ] Security headers (CSP, Referrer-Policy)
- [ ] Cookie consent banner (PIPEDA/Law 25 compliance)

### Notes
- Target 10x performance improvement over WordPress
- Need Canadian privacy law compliance

---

## Phase 6: Launch Readiness (Week 6)

### Todo
- [ ] E2E testing with Playwright
- [ ] Content freeze + final migration
- [ ] 301 redirects deployment
- [ ] DNS preparation (low TTL)
- [ ] Monitoring setup (Sentry, UptimeRobot)
- [ ] Editor training + documentation
- [ ] Rollback plan tested

### Notes
- Keep WordPress staging site as fallback
- DNS revert capability < 5 minutes

---

## Sanity Schema Implementation ✅

### Document Types - Completed
- [x] `page.ts` - Static pages with bilingual content
- [x] `newsArticle.ts` - News/blog posts with categories
- [x] `event.ts` - Events with timezone, recurrence, registration
- [x] `team.ts` - Team profiles with divisions, roster
- [x] `player.ts` - Player profiles with stats
- [x] `author.ts` - Content authors
- [x] `category.ts` - Article categories
- [x] `siteSettings.ts` - Global site configuration

### Object Types - Completed
- [x] `ctaBlock.ts` - Call-to-action blocks
- [x] `formEmbed.ts` - Form integrations
- [x] `localization.ts` - i18n helpers

### Schema Features Implemented
- [x] Document-level i18n with EN/FR fields
- [x] Event timezone support (IANA identifiers)
- [x] Recurrence rules for repeating events
- [x] Team/player management for sports content
- [x] SEO fields on all content types
- [x] Form embed system for newsletters/contact
- [x] Global site settings for navigation/footer

---

## Astro Components Needed

### Layout Components
- [ ] BaseLayout.astro
- [ ] Header.astro
- [ ] Navigation.astro (with mobile menu)
- [ ] Footer.astro
- [ ] LanguageSwitcher.astro
- [ ] CookieBanner.astro

### Section Components
- [ ] HeroSlider.astro (CSS scroll-snap)
- [ ] NewsGrid.astro
- [ ] CTABlocks.astro
- [ ] SponsorSection.astro
- [ ] TeamGrid.astro
- [ ] EventCalendar.astro
- [ ] StandingsTable.astro
- [ ] ContactForm.astro

### UI Components
- [ ] Button.astro
- [ ] Card.astro
- [ ] Badge.astro
- [ ] Modal.astro
- [ ] Tabs.astro
- [ ] Breadcrumbs.astro
- [ ] Pagination.astro

### Content Components
- [ ] PostCard.astro
- [ ] EventCard.astro
- [ ] TeamCard.astro
- [ ] PersonCard.astro
- [ ] PortableText.astro
- [ ] TableOfContents.astro

### Media Components
- [ ] ResponsiveImage.astro
- [ ] VideoEmbed.astro (lite-youtube)
- [ ] Gallery.astro
- [ ] OGImage.ts (dynamic generation)

---

## Pre-Launch Checklist

- [ ] Final content migration with fresh WordPress export
- [ ] All redirects mapped and tested (≥98% coverage)
- [ ] Algolia indices populated and tuned
- [ ] Security headers configured
- [ ] Cookie consent implemented
- [ ] DNS TTL lowered to 60 seconds
- [ ] Monitoring configured (Sentry, UptimeRobot)
- [ ] Backup of current site accessible at old.quidditchcanada.com

---

## Post-Launch Tasks (Days 1-14)

- [ ] Monitor 404s and add missing redirects
- [ ] Review Core Web Vitals RUM data
- [ ] Tune Algolia search relevance based on queries
- [ ] Fill missing French translations
- [ ] Submit sitemaps to Google Search Console
- [ ] Verify hreflang implementation
- [ ] Train editors on Sanity workflow

---

## Success Metrics Targets

### Technical
- [ ] Core Web Vitals (p75): LCP < 2.5s, CLS < 0.10, INP < 200ms
- [ ] Lighthouse Scores: Performance > 90, Accessibility > 95
- [ ] Build Time: < 60 seconds
- [ ] Page Weight: Homepage < 500KB, Articles < 300KB

### Business
- [ ] SEO: Traffic maintained or improved after 30 days
- [ ] Engagement: Bounce rate decreased by 20%
- [ ] Editorial: Time to publish reduced by 50%
- [ ] Search: CTR improved by 15% with Algolia

### Content
- [ ] Migration: 100% of posts/pages transferred
- [ ] Media: All images have alt text in at least one language
- [ ] Links: < 1% broken internal links
- [ ] Translations: 80% French coverage at launch

---

## Notes & Decisions Log

### 2025-01-05
- **Decision**: Switched from SSR to Static SSG due to React 19 + Cloudflare Workers incompatibility
  - Rationale: Better performance, simpler deployment, no server runtime needed
  - Impact: Lost dynamic SSR features but gained 10x performance improvement

- **Decision**: Implemented document-level i18n instead of field-level
  - Rationale: Better SEO with localized slugs, cleaner content management
  - Impact: More complex queries but better URL structure

- **Completed**: All Sanity schemas with full bilingual support
  - Teams, Players, Events, News, Pages, Settings
  - Event recurrence with RRULE support
  - Timezone-aware event scheduling

### Next Steps
1. Set up WordPress data export pipeline
2. Create migration scripts for content
3. Build core Astro components (Header, Navigation, Footer)
4. Implement homepage with hero slider and news grid

---

## Resources

- **Migration Scripts**: `/scripts/migration/`
- **Documentation**: `/docs/`
- **Deployment**: `.github/workflows/`, `webhook-proxy.js`
- **Sanity Schemas**: `/studio/src/schemaTypes/`
- **Astro Components**: `/astro-app/src/components/`

---

*Last Updated: 2025-01-05 00:35 EST*