# Quadball Canada Website Migration Plan
## WordPress to Astro + Sanity CMS

---

## 1. Current Site Analysis

### Technology Stack
- **Platform**: WordPress (Elegant Themes/Divi)
- **Features**: Multi-language (EN/FR), Blog, Events, Teams, Media galleries
- **Integrations**: Social media, Newsletter (MailChimp), External store (VC Ultimate)

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

### Content Types Identified
1. **Posts/News** (100+ articles since 2016)
2. **Pages** (Static content)
3. **Events** (Tournaments, workshops)
4. **Teams** (Clubs across Canada)
5. **Volunteers/Staff** (Board, committees)
6. **Media** (Photos, videos, documents)
7. **Hero Slides** (Homepage featured content)

---

## 2. Migration Strategy

### Phase 1: Foundation (Week 1)
- [ ] Set up Sanity schemas for all content types
- [ ] Create base layout components (Header, Footer)
- [ ] Implement navigation system with multi-level menus
- [ ] Set up i18n for English/French support

### Phase 2: Content Migration (Week 2)
- [ ] Export WordPress data (XML/Database)
- [ ] Create migration scripts for:
  - [ ] Posts/News articles
  - [ ] Static pages
  - [ ] Media assets
  - [ ] Team data
  - [ ] Events
- [ ] Import content into Sanity

### Phase 3: Core Pages (Week 3)
- [ ] Homepage with all sections
- [ ] News/Blog listing and detail pages
- [ ] About section pages
- [ ] Play/Rules pages
- [ ] Contact page

### Phase 4: Advanced Features (Week 4)
- [ ] Events calendar system
- [ ] Team directory with filters
- [ ] Search functionality
- [ ] Newsletter integration
- [ ] Social media feeds

### Phase 5: Polish & Launch (Week 5)
- [ ] Styling refinements
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Testing & QA
- [ ] DNS migration

---

## 3. Sanity Schema Design

### Content Models

```javascript
// 1. Post/Article
{
  title: string (localized),
  slug: string,
  publishedAt: datetime,
  author: reference(person),
  categories: array(reference(category)),
  excerpt: text (localized),
  body: blockContent (localized),
  featuredImage: image,
  seo: seoFields
}

// 2. Page
{
  title: string (localized),
  slug: string,
  pageType: string, // about, play, support, etc.
  sections: array(
    hero |
    richText |
    ctaBlock |
    imageGallery |
    videoEmbed |
    teamGrid |
    eventList
  ),
  seo: seoFields
}

// 3. Event
{
  title: string (localized),
  slug: string,
  eventDate: datetime,
  endDate: datetime,
  location: {
    venue: string,
    address: string,
    city: string,
    province: string
  },
  eventType: string, // tournament, workshop, meeting
  description: blockContent (localized),
  registrationLink: url,
  image: image,
  documents: array(file)
}

// 4. Team
{
  name: string,
  slug: string,
  city: string,
  province: string,
  level: string, // university, community, youth
  status: string, // active, inactive, developing
  logo: image,
  description: text,
  website: url,
  socialMedia: {
    facebook: url,
    instagram: url,
    twitter: url
  },
  contacts: array(reference(person))
}

// 5. Person (Volunteers, Board, Contacts)
{
  name: string,
  slug: string,
  role: string,
  email: email,
  phone: string,
  bio: text (localized),
  photo: image,
  socialMedia: object
}

// 6. Hero Slide
{
  title: string (localized),
  subtitle: string (localized),
  backgroundImage: image,
  ctaText: string (localized),
  ctaLink: url,
  order: number,
  active: boolean
}

// 7. Navigation
{
  title: string,
  menuItems: array({
    label: string (localized),
    link: url,
    submenu: array(menuItem)
  })
}

// 8. Site Settings
{
  siteTitle: string (localized),
  tagline: string (localized),
  logo: image,
  favicon: image,
  socialMedia: object,
  footer: {
    about: blockContent (localized),
    links: array(linkGroup),
    copyright: string
  },
  gtmId: string,
  newsletterUrl: url
}
```

---

## 4. Component Architecture

### Layout Components
```
components/
├── layout/
│   ├── Header.astro
│   ├── Navigation.astro
│   ├── Footer.astro
│   ├── MobileMenu.astro
│   └── LanguageSwitcher.astro
├── sections/
│   ├── HeroSlider.astro
│   ├── NewsGrid.astro
│   ├── CTABlocks.astro
│   ├── SponsorSection.astro
│   ├── TeamGrid.astro
│   ├── EventCalendar.astro
│   └── ContactForm.astro
├── ui/
│   ├── Button.astro
│   ├── Card.astro
│   ├── Badge.astro
│   ├── Modal.astro
│   └── Tabs.astro
└── content/
    ├── PostCard.astro
    ├── EventCard.astro
    ├── TeamCard.astro
    ├── PersonCard.astro
    └── PortableText.astro
```

### Page Templates
```
pages/
├── index.astro (Homepage)
├── news/
│   ├── index.astro (News listing)
│   └── [slug].astro (Article detail)
├── [lang]/
│   ├── about/
│   │   ├── index.astro
│   │   ├── volunteers.astro
│   │   └── policies.astro
│   ├── play/
│   │   ├── index.astro
│   │   └── rules.astro
│   ├── teams/
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── events/
│   │   ├── index.astro
│   │   └── [slug].astro
│   └── contact.astro
└── api/
    ├── newsletter.ts
    └── search.ts
```

---

## 5. Styling Strategy

### Design System
```scss
// Colors (from current brand)
$primary-red: #C8102E;      // Canadian red
$primary-yellow: #FFD700;   // Gold
$dark-gray: #2B2B2B;
$light-gray: #F5F5F5;

// Typography
$font-heading: 'Montserrat', sans-serif;
$font-body: 'Open Sans', sans-serif;

// Breakpoints
$mobile: 576px;
$tablet: 768px;
$desktop: 1024px;
$wide: 1440px;

// Components
- Consistent card designs
- Hover effects matching current site
- Maintain current spacing/rhythm
- Keep familiar navigation patterns
```

### CSS Architecture
- **Approach**: CSS Modules + Tailwind CSS
- **Global styles**: Reset, typography, utilities
- **Component styles**: Scoped to components
- **Responsive**: Mobile-first approach

---

## 6. Data Migration Tools

### WordPress Export Strategy

```bash
# 1. Export WordPress XML
- WP Admin > Tools > Export > All content

# 2. Database dump (for complete data)
mysqldump -u [user] -p [database] > quadball_backup.sql

# 3. Media files
- Download wp-content/uploads/ directory
- Organize by year/month structure
```

### Migration Scripts Needed

```javascript
// scripts/migrate-posts.js
// - Parse WordPress XML
// - Extract posts with metadata
// - Transform to Sanity format
// - Handle image references
// - Preserve slugs/URLs

// scripts/migrate-media.js
// - Process uploaded files
// - Upload to Sanity assets
// - Update references in content

// scripts/migrate-users.js
// - Extract author/volunteer data
// - Create Person documents

// scripts/migrate-pages.js
// - Convert page content
// - Map to new page structure
// - Handle shortcodes/blocks
```

---

## 7. Third-Party Integrations

### Required Services
1. **Newsletter**: MailChimp (existing eepurl.com/cmLf9D)
2. **Analytics**: Google Analytics/GTM
3. **Social Media**: Facebook, Twitter, Instagram, YouTube, Flickr
4. **External Store**: VC Ultimate (keep external links)
5. **Forms**: Contact form with email notifications
6. **Search**: Algolia or custom search API

### API Integrations
```javascript
// Newsletter signup
POST /api/newsletter
- Validate email
- Add to MailChimp list
- Return success/error

// Contact form
POST /api/contact
- Validate fields
- Send email notification
- Store in Sanity (optional)

// Search
GET /api/search?q={query}
- Query Sanity content
- Return formatted results
```

---

## 8. SEO & Performance

### SEO Requirements
- [ ] Maintain URL structure where possible
- [ ] Set up 301 redirects for changed URLs
- [ ] Generate sitemap.xml
- [ ] Implement schema.org markup
- [ ] Open Graph tags for social sharing
- [ ] Multi-language SEO tags

### Performance Targets
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Image optimization (WebP with fallbacks)
- [ ] Lazy loading for images/components
- [ ] CDN for static assets

---

## 9. Testing Checklist

### Functionality
- [ ] All navigation links work
- [ ] Forms submit correctly
- [ ] Search returns relevant results
- [ ] Language switching works
- [ ] External links open correctly
- [ ] Newsletter signup works
- [ ] Social media links work

### Content
- [ ] All posts migrated
- [ ] All pages migrated
- [ ] Images display correctly
- [ ] Videos embed properly
- [ ] Documents downloadable

### Responsive
- [ ] Mobile menu works
- [ ] Tables responsive
- [ ] Images scale properly
- [ ] Text readable on all devices

### Cross-browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

---

## 10. Launch Plan

### Pre-launch
1. Complete content migration
2. Internal testing & QA
3. Client review & approval
4. Set up production environment
5. Configure DNS (keep TTL low)

### Launch Day
1. Final content sync
2. Update DNS records
3. Monitor for issues
4. Test all critical paths
5. Check analytics tracking

### Post-launch
1. Monitor 404s and fix redirects
2. Submit new sitemap to Google
3. Update external links
4. Announce on social media
5. Train content editors on Sanity

---

## 11. Training & Documentation

### For Content Editors
- How to create/edit posts
- How to add events
- How to update team information
- How to manage hero slides
- How to work with images
- Publishing workflow

### For Developers
- Local development setup
- Deployment process
- Adding new content types
- Extending components
- Performance monitoring

---

## 12. Risk Mitigation

### Potential Issues
1. **Content loss**: Keep WordPress site as backup
2. **SEO impact**: Implement proper redirects
3. **Functionality gaps**: Identify critical features early
4. **Performance issues**: Test on production-like environment
5. **User confusion**: Maintain familiar UI patterns

### Rollback Plan
- Keep WordPress site accessible at old.quidditchcanada.com
- DNS can be reverted quickly
- All content backed up in multiple formats

---

## Next Steps

1. **Review & Approve Plan**: Get stakeholder sign-off
2. **Set up Development Environment**: Clone repo, install dependencies
3. **Begin Phase 1**: Create Sanity schemas
4. **Start Migration Scripts**: Begin with posts/media
5. **Weekly Progress Reviews**: Adjust plan as needed

## Resources Available
- WordPress admin access
- Database dump
- XML export
- Current hosting details
- Brand guidelines
- Analytics data

## Success Metrics
- [ ] All content successfully migrated
- [ ] Page load time improved by 50%
- [ ] Lighthouse score > 90
- [ ] Zero broken links
- [ ] Positive user feedback
- [ ] Easier content management