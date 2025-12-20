# Solstice Data Integration

**Created**: December 1, 2025
**Updated**: December 1, 2025
**Status**: 📋 Not Started
**Priority**: 🟠 High
**Companion Ticket**: `solstice/docs/development-backlog.md` → API-1

---

## Overview

Integrate live data from Solstice (member portal) into the quadball-canada marketing site. This replaces manual content duplication in Sanity CMS with real-time data fetched at build time.

### Data to Integrate

| Data Type | Source | Usage in Astro |
|-----------|--------|----------------|
| Upcoming Events | Solstice `events` table | Homepage, Events page, Events calendar, ICS feed |
| Active Teams | Solstice `teams` + `team_members` tables | Teams page, Find a Team |
| Aggregate Stats | Solstice DB aggregates | Homepage hero stats (members, teams, events) |

### What Changes

| Before (Sanity) | After (Solstice) |
|-----------------|------------------|
| Events manually duplicated in CMS | Live event data with registration status |
| No registration info displayed | "12 spots remaining" / "Registration Open" |
| Static team listings | Live member counts per team |
| No aggregate stats | Homepage hero: "150+ members, 12 teams" |

---

## Architecture Decision

**Approach: Direct Database Access**

The Astro site will connect directly to the same Neon PostgreSQL database that Solstice uses, querying it at build time (SSG).

### Why This Approach

| Factor | Assessment |
|--------|------------|
| **Complexity** | Low – just add Drizzle/Neon packages |
| **Latency** | None – direct DB queries |
| **Type Safety** | High – can derive types from schema |
| **Maintenance** | Acceptable – same team manages both |
| **Build Time** | Minimal impact – few simple queries |

### Trade-offs Accepted

- Schema changes in Solstice could break Astro builds (mitigated by typed queries)
- Database URL shared across projects (acceptable for internal use)
- Tight coupling between projects (acceptable – same team)

---

## Current State Analysis

### Sanity Event Schema (`studio/src/schemaTypes/documents/event.ts`)

The current Sanity `event` document type has these fields:
- `title` (localeString) — EN required, FR optional
- `slug` (localeSlug) — EN required, FR optional
- `eventType` — tournament, training, meeting, social, camp, workshop
- `description` (localeText) — short description
- `content` (localePortableText) — rich text body
- `startDateTime` / `endDateTime` (datetime)
- `timezone` (string)
- `location` — type (physical/online/hybrid), name, address, coordinates, mapUrl
- `registration` — required, url, deadline, capacity, price
- `featuredImage` (image with alt)
- `documents` — array of related files

### Current Sanity Functions (`src/utils/sanity.ts`)

| Function | Lines | Purpose |
|----------|-------|---------|
| `getEvents(locale)` | 350-362 | All events, sorted desc by date |
| `getUpcomingEvents(locale)` | 364-383 | Future events only, sorted asc |
| `getEvent(slug, locale)` | 385-406 | Single event by slug |
| `getTeams(locale)` | 408-437 | All teams with Sanity data |

### Current Sanity Types (`src/utils/sanity.ts`)

```typescript
// Lines 69-97
interface EventSummary {
  _id: string;
  slug: string;
  title: string;
  startDateTime: string;
  endDateTime?: string;
  timezone?: string;
}

interface UpcomingEventSummary extends EventSummary {
  description?: string;
  location?: {
    name?: string;
    address?: string;
    type?: "physical" | "virtual" | "hybrid";
  };
}

interface EventDetail extends EventSummary {
  description?: string;
  content?: PortableTextBlock[];
  slugEn?: string;
  slugFr?: string;
  location?: { ... };
}

// Lines 99-118
interface TeamSummary {
  _id: string;
  slug: string;
  name: string;
  city?: string;
  province?: string;
  levelOfPlay?: "youth" | "recreational" | "competitive" | "national-team";
  division?: string;
  email?: string;
  website?: string;
  description?: string | null;
  logo?: SanityImageWithAlt | null;
  socialMedia?: { ... } | null;
  active?: boolean;
}
```

---

## Data Structure Mapping

### Events: Sanity → Solstice

| Sanity Field | Solstice Field | Notes |
|--------------|----------------|-------|
| `_id` | `id` | UUID format |
| `slug` | `slug` | Direct mapping |
| `title` | `name` | Rename required |
| `startDateTime` | `start_date` | **DATE vs DATETIME** — Solstice stores date only |
| `endDateTime` | `end_date` | Same |
| `timezone` | — | Not in Solstice |
| `description` | `short_description` | Shorter in Solstice |
| `content` (PortableText) | `description` | Plain text in Solstice, no rich text |
| `eventType` | `type` | Values differ slightly |
| `location.name` | `venue_name` | Direct mapping |
| `location.address` | `venue_address` | Direct mapping |
| `location.type` | — | Not in Solstice |
| — | `city` | **New**: city field |
| — | `province` | **New**: province field |
| — | `status` | **New**: published, registration_open, etc. |
| — | `registration_type` | **New**: team, individual, both |
| — | `is_public` | **New**: visibility flag |
| — | `max_teams` / `max_participants` | **New**: capacity limits |
| — | `team_registration_fee` | **New**: pricing |
| — | `individual_registration_fee` | **New**: pricing |
| — | `contact_email` | **New**: event contact |
| — | `registration_count` (computed) | **New**: live registration count |

### Teams: Sanity → Solstice

| Sanity Field | Solstice Field | Notes |
|--------------|----------------|-------|
| `_id` | `id` | UUID format |
| `slug` | `slug` | Direct mapping |
| `name` | `name` | Direct mapping |
| `city` | `city` | Direct mapping |
| `province` | `province` | Direct mapping |
| `levelOfPlay` | `level_of_play` | snake_case |
| `logo` (Sanity image) | `logo_url` | External URL |
| `email` | `contact_email` | Rename |
| `website` | `website` | Direct mapping |
| `description` | `description` | Direct mapping |
| `socialMedia` | — | Not in Solstice |
| — | `member_count` (computed) | **New**: live count from team_members |
| — | `is_active` | **New**: active status |

---

## Files Requiring Changes

### Phase 1: New Files to Create

| File | Purpose |
|------|---------|
| `src/lib/solstice/db.ts` | Neon database client |
| `src/lib/solstice/types.ts` | TypeScript interfaces for Solstice data |
| `src/lib/solstice/events.ts` | Event queries with registration status |
| `src/lib/solstice/teams.ts` | Team queries with member counts |
| `src/lib/solstice/stats.ts` | Aggregate stats query |
| `src/lib/solstice/index.ts` | Re-exports for clean imports |

### Phase 2: Environment Configuration

| File | Change |
|------|--------|
| `astro-app/.env` | Add `SOLSTICE_DATABASE_URL` |
| `astro-app/.env.example` | Document the variable |
| Cloudflare Pages | Add env var in dashboard |

### Phase 3: Event Pages & Components

| File | Line(s) | Current | Change Required |
|------|---------|---------|-----------------|
| `src/pages/_shared/events.astro` | 4, 19 | `getUpcomingEvents(locale)` from Sanity | Switch to Solstice, adapt field names |
| `src/pages/_shared/upcoming-events.astro` | — | Fetches from Sanity | Switch to Solstice |
| `src/pages/_shared/event-detail.astro` | — | `getEvent(slug, locale)` | Switch to Solstice `getEventBySlug()` |
| `src/pages/events/[slug].astro` | — | `getEvents()` for static paths | Use Solstice for `getStaticPaths()` |
| `src/pages/fr/evenements/[slug].astro` | — | French event detail | Same — use Solstice |
| `src/components/sections/NewsGrid.astro` | 2, 17 | `getEvents(locale)` | Switch to Solstice `getUpcomingEvents()` |
| `src/components/content/EventCard.astro` | 3-6 | Accepts `EventSummary` type | Accept `SolsticeEvent`, update field access |
| `src/pages/events.ics.ts` | 1, 4 | `getEvents('en')` | Switch to Solstice, map fields to ICS |

### Phase 4: Team Pages & Components

| File | Line(s) | Current | Change Required |
|------|---------|---------|-----------------|
| `src/pages/_shared/teams.astro` | 4, 14 | `getTeams(locale)` from Sanity | Merge Sanity + Solstice for member counts |
| `src/components/team/TeamSections.astro` | — | Displays team cards | Add `memberCount` display |

### Phase 5: Homepage Stats (New Feature)

| File | Change |
|------|--------|
| `src/pages/index.astro` | Import `getStats()`, add hero stats section |
| `src/pages/fr/index.astro` | Same for French |
| `src/components/sections/HeroStats.astro` | **Create**: New component for stats display |

### Phase 6: Sanity Deprecation (Optional)

| File | Decision |
|------|----------|
| `studio/src/schemaTypes/documents/event.ts` | Keep for rich content or deprecate? |
| `studio/src/schemaTypes/documents/team.ts` | Keep for descriptions/logos or deprecate? |
| `src/utils/sanity.ts` | Remove/deprecate event/team functions |

---

## Decisions Required

### 1. Hybrid vs Full Replacement

**Option A: Hybrid (Recommended)**
- Solstice: Live data (registration, member counts, dates)
- Sanity: Rich content (PortableText descriptions, hero images, localized content)
- Merge at query time by matching slugs

**Option B: Full Replacement**
- Remove all event/team content from Sanity
- Solstice becomes single source of truth
- Lose rich text and localized content

**Recommendation**: Start with **Option A** to preserve existing content, migrate to B later if needed.

### 2. Localization Strategy

Solstice data is English-only. Options:

| Option | Pros | Cons |
|--------|------|------|
| **A: English fallback** | Simple, no extra work | French users see English event names |
| **B: Sanity translations** | Keep using Sanity for FR titles | Duplicate data, sync issues |
| **C: Add FR to Solstice** | Single source of truth | Requires Solstice schema changes |

**Recommendation**: Start with **Option A**, then implement **Option C** in Solstice.

### 3. Event Type Mapping

Sanity event types: `tournament`, `training`, `meeting`, `social`, `camp`, `workshop`
Solstice event types: `tournament`, `league`, `camp`, `clinic`, `social`, `other`

Need to map or normalize these values.

---

## Implementation Plan

### Phase 1: Database Connection Setup

**1. Install dependencies:**

```bash
cd astro-app
npm install @neondatabase/serverless drizzle-orm
```

**2. Add environment variable:**

```env
# astro-app/.env
SOLSTICE_DATABASE_URL=postgresql://neondb_owner:npg_gN8uVLpCRda5@ep-curly-tooth-a56074df-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**3. Create database client:**

```typescript
// src/lib/solstice/db.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(import.meta.env.SOLSTICE_DATABASE_URL);
export const db = drizzle(sql);
```

### Phase 2: Create Query Functions

```typescript
// src/lib/solstice/index.ts
export { getUpcomingEvents, getEventBySlug, getAllEventSlugs } from './events';
export { getActiveTeams, getTeamBySlug } from './teams';
export { getStats } from './stats';
export type { SolsticeEvent, SolsticeTeam, SolsticeStats } from './types';
```

#### Type Definitions

```typescript
// src/lib/solstice/types.ts
export type EventType = 'tournament' | 'league' | 'camp' | 'clinic' | 'social' | 'other';
export type RegistrationType = 'team' | 'individual' | 'both';
export type LevelOfPlay = 'recreational' | 'competitive' | 'youth' | null;

export interface SolsticeEvent {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  type: EventType;
  startDate: string;  // ISO date string
  endDate: string;
  city: string | null;
  province: string | null;
  venueName: string | null;
  venueAddress: string | null;
  isRegistrationOpen: boolean;
  spotsRemaining: number | null;
  registrationType: RegistrationType;
  teamFee: number | null;
  individualFee: number | null;
  contactEmail: string | null;
}

export interface SolsticeTeam {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  province: string | null;
  memberCount: number;
  levelOfPlay: LevelOfPlay;
  logoUrl: string | null;
  website: string | null;
  contactEmail: string | null;
  description: string | null;
}

export interface SolsticeStats {
  totalMembers: number;
  totalActiveTeams: number;
  upcomingEventsCount: number;
}
```

#### Events Queries

```typescript
// src/lib/solstice/events.ts
import { db } from './db';
import { sql } from 'drizzle-orm';
import type { SolsticeEvent } from './types';

export async function getUpcomingEvents(limit = 10): Promise<SolsticeEvent[]> {
  const result = await db.execute(sql`
    SELECT
      e.id,
      e.slug,
      e.name,
      e.short_description,
      e.type,
      e.start_date,
      e.end_date,
      e.city,
      e.province,
      e.venue_name,
      e.status,
      e.registration_type,
      e.team_registration_fee,
      e.individual_registration_fee,
      e.max_teams,
      e.max_participants,
      (
        SELECT COUNT(*)::int
        FROM event_registrations er
        WHERE er.event_id = e.id AND er.status != 'cancelled'
      ) as registration_count
    FROM events e
    WHERE e.is_public = true
      AND e.status IN ('published', 'registration_open')
      AND e.start_date >= CURRENT_DATE
    ORDER BY e.start_date ASC
    LIMIT ${limit}
  `);

  return result.rows.map(row => transformEvent(row));
}

export async function getEventBySlug(slug: string): Promise<SolsticeEvent | null> {
  const result = await db.execute(sql`
    SELECT
      e.id,
      e.slug,
      e.name,
      e.description,
      e.short_description,
      e.type,
      e.start_date,
      e.end_date,
      e.city,
      e.province,
      e.venue_name,
      e.venue_address,
      e.status,
      e.registration_type,
      e.team_registration_fee,
      e.individual_registration_fee,
      e.max_teams,
      e.max_participants,
      e.contact_email,
      (
        SELECT COUNT(*)::int
        FROM event_registrations er
        WHERE er.event_id = e.id AND er.status != 'cancelled'
      ) as registration_count
    FROM events e
    WHERE e.slug = ${slug}
      AND e.is_public = true
    LIMIT 1
  `);

  return result.rows[0] ? transformEvent(result.rows[0]) : null;
}

export async function getAllEventSlugs(): Promise<string[]> {
  const result = await db.execute(sql`
    SELECT slug FROM events
    WHERE is_public = true
      AND status IN ('published', 'registration_open', 'completed')
    ORDER BY start_date DESC
  `);

  return result.rows.map(row => row.slug as string);
}

function transformEvent(row: any): SolsticeEvent {
  const registrationCount = row.registration_count ?? 0;
  const maxSpots = row.registration_type === 'team'
    ? row.max_teams
    : row.max_participants;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? null,
    shortDescription: row.short_description ?? null,
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    city: row.city ?? null,
    province: row.province ?? null,
    venueName: row.venue_name ?? null,
    venueAddress: row.venue_address ?? null,
    isRegistrationOpen: row.status === 'registration_open',
    spotsRemaining: maxSpots ? Math.max(0, maxSpots - registrationCount) : null,
    registrationType: row.registration_type,
    teamFee: row.team_registration_fee ?? null,
    individualFee: row.individual_registration_fee ?? null,
    contactEmail: row.contact_email ?? null,
  };
}
```

#### Teams Queries

```typescript
// src/lib/solstice/teams.ts
import { db } from './db';
import { sql } from 'drizzle-orm';
import type { SolsticeTeam } from './types';

export async function getActiveTeams(): Promise<SolsticeTeam[]> {
  const result = await db.execute(sql`
    SELECT
      t.id,
      t.slug,
      t.name,
      t.city,
      t.province,
      t.level_of_play,
      t.logo_url,
      t.website,
      t.contact_email,
      t.description,
      (
        SELECT COUNT(DISTINCT tm.user_id)::int
        FROM team_members tm
        WHERE tm.team_id = t.id AND tm.status = 'active'
      ) as member_count
    FROM teams t
    WHERE t.is_active = true
    ORDER BY t.name ASC
  `);

  return result.rows.map(row => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city ?? null,
    province: row.province ?? null,
    memberCount: row.member_count ?? 0,
    levelOfPlay: row.level_of_play ?? null,
    logoUrl: row.logo_url ?? null,
    website: row.website ?? null,
    contactEmail: row.contact_email ?? null,
    description: row.description ?? null,
  }));
}

export async function getTeamBySlug(slug: string): Promise<SolsticeTeam | null> {
  const result = await db.execute(sql`
    SELECT
      t.id,
      t.slug,
      t.name,
      t.city,
      t.province,
      t.level_of_play,
      t.logo_url,
      t.website,
      t.contact_email,
      t.description,
      (
        SELECT COUNT(DISTINCT tm.user_id)::int
        FROM team_members tm
        WHERE tm.team_id = t.id AND tm.status = 'active'
      ) as member_count
    FROM teams t
    WHERE t.slug = ${slug}
      AND t.is_active = true
    LIMIT 1
  `);

  if (!result.rows[0]) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city ?? null,
    province: row.province ?? null,
    memberCount: row.member_count ?? 0,
    levelOfPlay: row.level_of_play ?? null,
    logoUrl: row.logo_url ?? null,
    website: row.website ?? null,
    contactEmail: row.contact_email ?? null,
    description: row.description ?? null,
  };
}
```

#### Stats Query

```typescript
// src/lib/solstice/stats.ts
import { db } from './db';
import { sql } from 'drizzle-orm';
import type { SolsticeStats } from './types';

export async function getStats(): Promise<SolsticeStats> {
  const result = await db.execute(sql`
    SELECT
      (SELECT COUNT(DISTINCT id)::int FROM "user" WHERE email_verified = true) as total_members,
      (SELECT COUNT(*)::int FROM teams WHERE is_active = true) as total_active_teams,
      (
        SELECT COUNT(*)::int
        FROM events
        WHERE is_public = true
          AND status IN ('published', 'registration_open')
          AND start_date >= CURRENT_DATE
      ) as upcoming_events_count
  `);

  const row = result.rows[0];
  return {
    totalMembers: row.total_members ?? 0,
    totalActiveTeams: row.total_active_teams ?? 0,
    upcomingEventsCount: row.upcoming_events_count ?? 0,
  };
}
```

### Phase 3: Update Event Components

#### EventCard Changes

```diff
// src/components/content/EventCard.astro
- import type { EventSummary } from "../../utils/sanity";
+ import type { SolsticeEvent } from "@/lib/solstice";

interface Props {
-   event: EventSummary;
+   event: SolsticeEvent;
    locale?: Locale;
    basePath?: string;
}

// In template:
- <p class="card__date">{formatDate(event.startDateTime, locale)}</p>
+ <p class="card__date">{formatDate(event.startDate, locale)}</p>
+ {event.isRegistrationOpen && event.spotsRemaining !== null && (
+   <p class="card__spots">{event.spotsRemaining} spots left</p>
+ )}
```

#### NewsGrid Changes

```diff
// src/components/sections/NewsGrid.astro
- import { getEvents, type Locale } from "../../utils/sanity";
+ import { getUpcomingEvents } from "@/lib/solstice";
+ import type { Locale } from "@/utils/sanity";

- const events = await getEvents(locale);
- const upcomingEvents = events
-   .filter((e) => new Date(e.startDateTime) >= now)
-   .sort(...)
-   .slice(0, 6);
+ const upcomingEvents = await getUpcomingEvents(6);

// In template:
- <time datetime={event.startDateTime}>
+ <time datetime={event.startDate}>
-   {new Date(event.startDateTime).toLocaleDateString(...)}
+   {new Date(event.startDate).toLocaleDateString(...)}
```

#### ICS Feed Changes

```diff
// src/pages/events.ics.ts
- import { getEvents } from '../utils/sanity';
+ import { getUpcomingEvents } from '@/lib/solstice';

export const GET = async () => {
-   const events = await getEvents('en');
+   const events = await getUpcomingEvents(50);

  // Field mapping:
-   lines.push(`DTSTART:${toIcsDate(e.startDateTime)}`);
+   lines.push(`DTSTART:${toIcsDate(e.startDate)}`);
-   if (e.endDateTime) lines.push(`DTEND:${toIcsDate(e.endDateTime)}`);
+   lines.push(`DTEND:${toIcsDate(e.endDate)}`);
-   lines.push(`SUMMARY:${escapeText(e.title)}`);
+   lines.push(`SUMMARY:${escapeText(e.name)}`);
+   if (e.venueName) lines.push(`LOCATION:${escapeText(e.venueName)}`);
```

### Phase 4: Update Shared Pages

#### Events Page

```diff
// src/pages/_shared/events.astro
- import { getUpcomingEvents, getLandingSection } from "@/utils/sanity";
+ import { getUpcomingEvents } from "@/lib/solstice";
+ import { getLandingSection } from "@/utils/sanity";

- const upcomingEvents = await getUpcomingEvents(locale);
+ const upcomingEvents = await getUpcomingEvents(10);

// Template updates for field names:
- <span class="month">{new Date(event.startDateTime).toLocaleDateString(...)}</span>
+ <span class="month">{new Date(event.startDate).toLocaleDateString(...)}</span>
- {event.location?.name && <p class="location">{event.location.name}</p>}
+ {event.venueName && <p class="location">{event.venueName}</p>}
```

### Phase 5: Add Homepage Stats

```astro
---
// src/components/sections/HeroStats.astro
import { getStats } from "@/lib/solstice";
import type { Locale } from "@/utils/sanity";

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const stats = await getStats();

const labels = {
  en: { members: "Members", teams: "Teams", events: "Upcoming Events" },
  fr: { members: "Membres", teams: "Équipes", events: "Événements à venir" },
};
---

<section class="hero-stats">
  <div class="stat">
    <span class="stat-number">{stats.totalMembers}+</span>
    <span class="stat-label">{labels[locale].members}</span>
  </div>
  <div class="stat">
    <span class="stat-number">{stats.totalActiveTeams}</span>
    <span class="stat-label">{labels[locale].teams}</span>
  </div>
  <div class="stat">
    <span class="stat-number">{stats.upcomingEventsCount}</span>
    <span class="stat-label">{labels[locale].events}</span>
  </div>
</section>

<style>
  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 3rem;
    padding: 2rem 0;
  }
  .stat {
    text-align: center;
  }
  .stat-number {
    display: block;
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--brand-primary);
  }
  .stat-label {
    font-size: 0.875rem;
    color: var(--gray-600);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
```

---

## Environment Setup

### Local Development

```bash
# astro-app/.env
SOLSTICE_DATABASE_URL=postgresql://neondb_owner:npg_gN8uVLpCRda5@ep-curly-tooth-a56074df-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Production (Cloudflare Pages)

Add `SOLSTICE_DATABASE_URL` to Cloudflare Pages environment variables:
1. Go to Cloudflare Dashboard → Pages → quadball-canada → Settings → Environment variables
2. Add `SOLSTICE_DATABASE_URL` with the Neon pooled connection URL
3. Encrypt the variable (it contains credentials)

---

## Acceptance Criteria

### Phase 1: Infrastructure
- [ ] `@neondatabase/serverless` and `drizzle-orm` installed
- [ ] `src/lib/solstice/` module created with all queries
- [ ] Environment variable configured locally
- [ ] Database connection verified

### Phase 2: Events Integration
- [ ] `NewsGrid.astro` fetches from Solstice
- [ ] `EventCard.astro` accepts Solstice event type
- [ ] `events.ics.ts` generates from Solstice data
- [ ] Event detail pages use Solstice data
- [ ] Static paths generated from Solstice slugs

### Phase 3: Teams Integration
- [ ] Teams page shows live member counts
- [ ] Team data merged with Sanity content

### Phase 4: Homepage Stats
- [ ] `HeroStats.astro` component created
- [ ] Homepage displays live counts

### Phase 5: Production
- [ ] Cloudflare environment variable configured
- [ ] Build succeeds with Solstice data
- [ ] No sensitive data exposed (emails, payment info)
- [ ] French pages work with English fallback

---

## Migration Checklist

```
[ ] Install dependencies
[ ] Create src/lib/solstice/ module
[ ] Add .env variable locally
[ ] Test database connection
[ ] Update NewsGrid.astro
[ ] Update EventCard.astro
[ ] Update events.ics.ts
[ ] Update _shared/events.astro
[ ] Update _shared/upcoming-events.astro
[ ] Update _shared/event-detail.astro
[ ] Update events/[slug].astro (getStaticPaths)
[ ] Update fr/evenements/[slug].astro
[ ] Update _shared/teams.astro
[ ] Update TeamSections.astro
[ ] Create HeroStats.astro
[ ] Add to homepage
[ ] Add Cloudflare env var
[ ] Deploy and verify
[ ] Deprecate Sanity event functions (optional)
```

---

## Future Enhancements

### Build Webhook

Trigger Cloudflare Pages rebuild when Solstice data changes:

1. Create Cloudflare Pages deploy hook
2. Add to Solstice environment as `QUADBALL_CANADA_BUILD_HOOK`
3. Call after event/team CRUD operations

```typescript
// In Solstice: after event create/update/delete
if (process.env.QUADBALL_CANADA_BUILD_HOOK) {
  await fetch(process.env.QUADBALL_CANADA_BUILD_HOOK, { method: 'POST' });
}
```

### SSR for Live Data (Optional)

If real-time data becomes critical, switch specific pages to SSR:

```astro
---
// src/pages/events/[slug].astro
export const prerender = false; // Enable SSR for this page
---
```

This requires `output: "hybrid"` in `astro.config.mjs`.

### Localization in Solstice

Add French fields to Solstice schema to eliminate English fallback:

```typescript
// Solstice schema addition
name_fr: text('name_fr'),
short_description_fr: text('short_description_fr'),
```

---

## Troubleshooting

### Build Fails: "Cannot connect to database"

- Verify `SOLSTICE_DATABASE_URL` is set correctly
- Check Neon dashboard for connection issues
- Ensure IP is not blocked (Neon allows all IPs by default)
- Test connection locally: `psql $SOLSTICE_DATABASE_URL`

### Build Fails: "Column not found"

- Schema changed in Solstice – update queries to match
- Check Solstice's `src/db/schema/` for current column names
- Run: `cd /path/to/solstice && grep -r "column_name" src/db/schema/`

### Data Appears Stale

- Cloudflare caches builds; trigger a new deployment
- Consider adding build webhook for automatic updates
- Check if Neon connection pooler is caching

### Type Errors After Changes

- Regenerate types from Solstice schema
- Update `src/lib/solstice/types.ts` to match actual columns
- Check for nullable columns that became required (or vice versa)

---

## Related Documentation

- [Solstice Repository](../../../solstice/) (local)
- [Solstice API-1 Ticket](../../../solstice/docs/development-backlog.md)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
- [Drizzle ORM with Neon](https://orm.drizzle.team/docs/get-started-postgresql#neon)
- [Astro Environment Variables](https://docs.astro.build/en/guides/environment-variables/)
