# Page Improvements Plan

This document outlines the planned improvements for several pages on the Quadball Canada website, prioritized by impact and user experience.

---

## 1. Contact Page (High Priority)

**Current State:** Minimal content - just a title and one line of text. No actual contact information or ways to reach out.

**File:** `astro-app/src/pages/contact/index.astro` (and French version)

### Proposed Design

```
┌─────────────────────────────────────────────────────────┐
│  Contact Us                                             │
│  Get in touch with Quadball Canada                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ 📧 General      │  │ 📰 Media        │              │
│  │ Inquiries       │  │ Inquiries       │              │
│  │                 │  │                 │              │
│  │ info@quadball.. │  │ media@quadball..│              │
│  └─────────────────┘  └─────────────────┘              │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ 🤝 Sponsorship  │  │ 🏆 Competition  │              │
│  │                 │  │                 │              │
│  │ partnerships@.. │  │ events@quadball │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                         │
│  ───────────────────────────────────────                │
│                                                         │
│  Connect With Us                                        │
│  [Instagram] [TikTok] [YouTube] [Facebook] [Discord]    │
│                                                         │
│  ───────────────────────────────────────                │
│                                                         │
│  Or use our contact form (optional embed/link)          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Implementation Steps

1. **Create shared component:** `astro-app/src/pages/_shared/contact.astro`
2. **Design contact cards** with icons for different inquiry types:
   - General Inquiries
   - Media/Press
   - Sponsorship/Partnerships
   - Events/Competition
   - Volunteer Coordination
3. **Add social media section** with branded icons linking to all platforms
4. **Optional:** Embed a contact form (Google Form, Typeform, or native)
5. **Add FAQ section** with common questions and links to relevant pages
6. **Update both EN and FR routes** to use the shared component

### Data Source

- Contact emails can be hardcoded or pulled from Sanity `siteSettings` if configured
- Social links already exist in the footer component - can be reused

---

## 2. News Article Detail (High Priority)

**Current State:** Basic layout with large black placeholder when no featured image, no navigation back to news list, minimal metadata display.

**File:** `astro-app/src/pages/_shared/news-detail.astro`

### Proposed Design

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to News                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Category Tag]                                         │
│                                                         │
│  Article Title Here That Can                            │
│  Span Multiple Lines                                    │
│                                                         │
│  Published October 5, 2025 · 5 min read                 │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │            Featured Image                       │   │
│  │         (or gradient placeholder)              │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Excerpt/lead paragraph in larger text                  │
│                                                         │
│  ─────────────────────────────────────────              │
│                                                         │
│  Article content here with proper typography...         │
│                                                         │
│  ─────────────────────────────────────────              │
│                                                         │
│  Share: [Twitter] [Facebook] [LinkedIn] [Copy Link]     │
│                                                         │
│  ─────────────────────────────────────────              │
│                                                         │
│  Related Articles                                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│  │ Card 1  │ │ Card 2  │ │ Card 3  │                   │
│  └─────────┘ └─────────┘ └─────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Implementation Steps

1. **Add breadcrumb navigation** - "← Back to News" link at top
2. **Improve empty image handling:**
   - Replace black box with a subtle gradient using brand colors
   - Or hide the image section entirely when no image exists
3. **Enhance metadata display:**
   - Add reading time estimate (calculate from content length)
   - Better date formatting with relative time ("2 days ago")
   - Category/tag display if available
4. **Add share buttons:**
   - Twitter/X, Facebook, LinkedIn, Copy Link
   - Use native share API on mobile
5. **Add related articles section:**
   - Query 3 recent articles excluding current
   - Display as compact cards at bottom
6. **Typography improvements:**
   - Larger excerpt/lead paragraph
   - Better content spacing and line heights

### Data Requirements

- May need to add `category` field to newsArticle schema if not present
- Reading time can be calculated client-side from content length

---

## 3. News List Page (High Priority)

**Current State:** No page header - jumps directly into article cards. Missing context for users.

**File:** `astro-app/src/pages/_shared/news-index.astro`

### Proposed Design

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  News & Announcements                                   │
│  Stay up to date with the latest from Quadball Canada   │
│                                                         │
│  [Filter by: All | Events | Community | ...]            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Featured Article (most recent)                  │   │
│  │ Large card with image, title, excerpt, date     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ Article 2   │ │ Article 3   │ │ Article 4   │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ Article 5   │ │ Article 6   │ │ Article 7   │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                         │
│  [Load More] or Pagination                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Implementation Steps

1. **Add page header section:**
   - Title: "News & Announcements" / "Nouvelles et communiqués"
   - Intro text explaining the page purpose
2. **Feature the latest article:**
   - First article displays larger with more prominence
   - Full-width card with image on left/top
3. **Improve article cards:**
   - Add category tags if available
   - Better image aspect ratios and fallbacks
   - Truncate excerpts consistently
4. **Optional: Add filtering:**
   - Filter by category/tag
   - Could be client-side for simplicity
5. **Add pagination or "Load More":**
   - If article count grows, implement pagination
   - Start with showing all, add later if needed

### Data Requirements

- Consider adding `category` to newsArticle schema
- May want to add `featured` boolean for manual featuring

---

## 4. Events Main Page (Medium Priority)

**Current State:** Has "Host an Event" CTA card plus basic event list. Now potentially redundant with the new dedicated Upcoming Events page.

**File:** `astro-app/src/pages/_shared/events.astro`

### Options to Consider

#### Option A: Redirect to Upcoming Events
Simply redirect `/events/` to `/events/upcoming/` and keep the main events page as a landing that routes to sub-pages.

#### Option B: Make it a Hub Page
Transform into a hub that links to:
- Upcoming Events
- Past Events (archive)
- Host an Event
- Event Calendar (ICS)

#### Option C: Keep as Landing Section Page
Continue using it as a Sanity-driven landing page with CTA cards, but remove the duplicate event listing since that's now on `/events/upcoming/`.

### Recommended Approach: Option C

1. **Remove the "Upcoming Events" list** from this page (it's now at `/events/upcoming/`)
2. **Keep CTA cards** from Sanity landingSection (Host an Event, etc.)
3. **Add a prominent link** to the Upcoming Events page
4. **Consider adding:**
   - Link to past events archive (if implemented)
   - Calendar subscription info
   - Event hosting resources

---

## 5. News Cards Enhancement (Medium Priority)

**Current State:** Functional but basic cards with black placeholder images.

**Files:**
- `astro-app/src/pages/_shared/news-index.astro`
- `astro-app/src/components/content/NewsCard.astro` (if exists)

### Proposed Improvements

1. **Better image fallbacks:**
   - Gradient placeholder with brand colors instead of black
   - Or a default "Quadball Canada" branded placeholder image
2. **Add category badges:**
   - Small colored tag showing article category
3. **Improve card layout:**
   - Consistent image aspect ratios (16:9 or 3:2)
   - Better spacing and typography
4. **Add hover effects:**
   - Subtle shadow/lift on hover
   - Image zoom effect

---

## Implementation Order

Based on user impact and dependencies:

| Order | Page | Effort | Impact |
|-------|------|--------|--------|
| 1 | Contact Page | Medium | High - Primary CTA |
| 2 | News List Header | Low | High - First impression |
| 3 | News Detail | Medium | High - Content consumption |
| 4 | Events Main | Low | Medium - Cleanup |
| 5 | News Cards | Low | Medium - Polish |

---

## Technical Notes

### Shared Components Pattern
All improvements should follow the existing pattern:
- Create/update `_shared/*.astro` component
- Pass `locale` prop for i18n
- EN/FR route files just import and render the shared component

### Translation Keys
New UI strings should be added to:
- `astro-app/src/i18n/ui.ts`

### Sanity Integration
Some improvements may benefit from new Sanity fields:
- `category` on newsArticle
- Contact emails in siteSettings
- Featured article flag

---

## Success Criteria

Each improvement should:
- [ ] Work in both EN and FR
- [ ] Be responsive (mobile-first)
- [ ] Follow existing design patterns (colors, spacing, typography)
- [ ] Maintain accessibility (proper headings, alt text, focus states)
- [ ] Load efficiently (no layout shift, optimized images)
