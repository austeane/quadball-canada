# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro + Sanity CMS monorepo with two npm workspaces:
- **astro-app**: Static Astro frontend (SSG) deployed to Cloudflare Pages
- **studio**: Sanity Studio for content management (React-based CMS interface)

## Development Commands

### Running the project
```bash
npm run dev  # Runs both Astro app (localhost:4321) and Studio (localhost:3333) concurrently
```

### Individual workspace commands
```bash
# Astro app (in astro-app/)
npm run dev      # Start dev server on localhost:4321
npm run build    # Type check + build for production
npm run preview  # Preview production build

# Studio (in studio/)
npm run dev      # Start Studio dev server on localhost:3333
npm run build    # Build Studio
npm run deploy   # Deploy Studio to Sanity's hosted platform
```

### Common CLI Commands (Sanity + Cloudflare)

Sanity (Content Lake):

```
# Query a few documents (adjust GROQ as needed)
cd studio && npx sanity documents query '*[_type == "newsArticle"][0..5]'

# Create a document from a JSON file (production dataset)
cd studio && npx sanity documents create /path/to/doc.json --dataset production

# Deploy Studio (must unset SANITY_AUTH_TOKEN so the CLI uses the logged-in user session
# instead of the robot token from studio/.env, which lacks deployStudio permissions)
SANITY_AUTH_TOKEN= sanity deploy
```

Cloudflare (Pages):

```
# Check authentication / account
cd astro-app && npx wrangler whoami

# List Pages projects and deployments
cd astro-app && npx wrangler pages project list
cd astro-app && npx wrangler pages deployment list --project-name=quadball-canada

# Deploy built assets from dist/
cd astro-app && npm run build
cd astro-app && npx wrangler pages deploy dist --project-name=quadball-canada --commit-message "Deploy from CLI" --commit-dirty=true

# Optional flags used previously
#   --branch=<name>           # set branch name for deployment metadata
#   --commit-hash=<sha>       # set commit hash for deployment metadata
#   --commit-message=<string> # human-readable message
#   --commit-dirty=true       # mark workspace as dirty
```

## Architecture

### Monorepo Structure
- Root uses npm workspaces with `concurrently` to run both apps simultaneously
- Both apps are independent but share the same Sanity project configuration

### Astro App (`astro-app/`)
- **Output mode**: Static SSG (no SSR)
- **Hosting**: Cloudflare Pages (see `wrangler.toml` and `DEPLOYMENT.md`)
- **Key integrations**: `@sanity/astro` for the Sanity client, `@astrojs/sitemap`. No React: nothing renders client-side components or embeds the Studio.
- **Content fetching**: GROQ queries via `sanityClient` from `sanity:client` (auto-imported by Astro integration), `perspective: "published"` so drafts never reach a build
- **Data layer**: all queries live in `src/utils/sanity.ts`. Page documents are fetched by fixed `_id` (`getPage("page-board", locale)`, `getSiteSettings`, `getHomePage`, …); repeatable content by type (`getNewsArticles`, `getEvents`, …)
- **Page templates**: route files under `src/pages/` are thin; each renders a `src/pages/_shared/*.astro` template with a `locale` prop, so EN and FR share one template
- **Header, footer, social links**: read from the `siteSettings` document via `getSiteSettings()` (cached once per locale per build)
- **Interface labels** (button text, empty states, filters) stay in `src/i18n/ui.ts`; anything an editor might want to change belongs in Sanity
- **Localization**: Field-level via `locale*` objects. Helpers in `studio/src/schemaTypes/helpers/localization.ts` and `astro-app/src/utils/localization.ts`.
- **Portable Text**: Uses `astro-portabletext` to render Sanity's block content

### Sanity Studio (`studio/`)
- **Schema location**: `src/schemaTypes/` - contains document types (e.g., `newsArticle.ts`, `event.ts`, `team.ts`) and objects (e.g., `blockContent.tsx`)
- **Schema exports**: All types must be added to `src/schemaTypes/index.ts` array
- **Configuration**: `sanity.config.ts` uses environment variables for project ID and dataset
- **Plugins**: Structure tool (content management UI) and Vision tool (GROQ query testing)
- **Sidebar**: `src/structure.ts` mirrors the site menu (Home, About Us, News, Events, Get Involved, Resources, Contact, Site Settings). One-per-page document types (`SINGLETON_TYPES`) are pinned to fixed IDs and can't be created, duplicated or deleted
- **Building blocks**: `localeUrl` (EN/FR link), `callToAction` (heading, text, button), page sections `textSection`/`columnsSection`/`ctaSection`, and `helpers/fields.ts` (`imageWithAlt`, `heroFields`, `seoField`)

### Where each page's content is edited

| Page | Studio sidebar → document (`_id`) |
|---|---|
| Home | Home Page (`homePage`) |
| Menu, footer, social links, Store/Donate links, default banner | Site Settings (`siteSettings`) |
| About / Events / Get Involved / Resources landing pages | `landingSection-about`, `-events`, `-getInvolved`, `-resources` |
| Mission & Values | `missionValuesPage` |
| Meet the Board / Staff, News, Upcoming Events, Volunteer, Policies, Host an Event | Page documents `page-board`, `page-staff`, `page-news`, `page-upcomingEvents`, `page-volunteer`, `page-policies`, `page-hostEvent` (banner + sections; lists still come from their own document types) |
| Teams, National Team, Event Bids, Contact | `teamsPage`, `nationalTeamPage`, `eventBidsPage`, `contactPage` |
| Starting a Team, Planning a Tournament | Resource articles at `/resources/<slug>/` |
| What is Quadball, Inclusion | Info articles at `/info/<slug>/`; the home page's featured article is a reference on `homePage` |

New one-per-page documents need: a schema type, an entry in `SINGLETON_TYPES` (unless it's a `page`), a `pageItem` in `src/structure.ts`, and a query by `_id`.

### Environment Configuration
Both apps require Sanity credentials configured via `.env` files:

**Astro app** (`astro-app/.env`):
```
PUBLIC_SANITY_STUDIO_PROJECT_ID="<your-project-id>"
PUBLIC_SANITY_STUDIO_DATASET="production"
```

**Studio** (`studio/.env`):
```
SANITY_STUDIO_PROJECT_ID="<your-project-id>"
SANITY_STUDIO_DATASET="production"
```

Note: Variables must be prefixed with `PUBLIC_` in Astro to be accessible client-side.

## Content Schema Workflow

1. Define schema types in `studio/src/schemaTypes/documents/` or `studio/src/schemaTypes/objects/`
2. Export them in `studio/src/schemaTypes/index.ts`
3. Add/adjust types and GROQ in `astro-app/src/utils/sanity.ts`
4. Use locale helpers for EN/FR fields and localized slugs
5. Studio will automatically reflect schema changes on refresh

### News
- Query helpers:
  - `getNewsArticles(locale: 'en'|'fr')`
  - `getNewsArticle(slug: string, locale: 'en'|'fr')`
- Astro pages:
  - EN list/detail: `src/pages/news/index.astro`, `src/pages/news/[slug].astro`
  - FR list/detail: `src/pages/fr/nouvelles/index.astro`, `src/pages/fr/nouvelles/[slug].astro`

## Key Integration Points

- **Sanity Client**: Auto-imported as `sanityClient` from `sanity:client` in Astro files (provided by `@sanity/astro`)
- **Image URLs**: Use `@sanity/image-url` for optimized image rendering
- **GROQ**: Query language for fetching content - can be tested in Vision tool at Studio's `/vision` route
- **API Version**: Set in `astro.config.mjs` (currently "2024-12-08")

## Playwright MCP Usage

- Prefer the integrated Playwright MCP browser tools for verification (navigate, click, etc.) instead of spawning `npx playwright`.
- Typical flow:
  - Start servers: `npm run dev` (root) or workspace-specific.
  - Navigate to `http://localhost:4321/`, `/news/`, `/fr/nouvelles/` to validate UI.
  - Language switching is in the header via the `LanguageSwitcher` component; verify `data-language-switch="fr|en"` links.
  - Studio login at `http://localhost:3333` requires human login; headless sessions do not inherit credentials.
  - Astro 7's `astro preview` detaches into the background when run by an AI agent (JSON log lines); stop it with `npx astro preview stop`. To run e2e tests locally from an agent, start the preview first so Playwright reuses it (`reuseExistingServer`).

## Deployment (Cloudflare Pages)

- Project: `quadball-canada` → https://www.quadballcanada.ca
- Config: `astro-app/wrangler.toml` (`pages_build_output_dir = "./dist"`)

### Auto-Deploy via GitHub Actions

Pushes to `main` automatically trigger deployment via `.github/workflows/deploy-on-sanity-update.yml`:
- Runs `npm run build` (includes `astro check` for TypeScript validation) on Node 24
- Builds format dates in UTC (`process.env.TZ = "UTC"` in `astro.config.mjs`) so local builds match CI; stored event times are shown as stored
- `compressHTML: true` keeps the pre-Astro-7 whitespace behaviour; Astro 7's default JSX rules drop spaces between inline elements
- Studio deploys automatically on pushes that touch `studio/**` (`.github/workflows/deploy-studio.yml`)
- Deploys to Cloudflare Pages on success
- **Build errors will silently fail** — always check GitHub Actions if deployment seems stuck
- The daily 06:00 UTC rebuild is a Cloudflare Worker Cron Trigger (`webhook-proxy/wrangler.toml`), **not** a GitHub `schedule:`. Never add a `schedule:` to the workflow: GitHub auto-disables scheduled workflows after 60 idle days and that also kills the Sanity webhook trigger in the same file.
- Redeploy the worker after editing it: `cd webhook-proxy && npx wrangler deploy` (needs `npx wrangler login` once). `GITHUB_TOKEN` and `WEBHOOK_SECRET` are Worker secrets and persist across deploys.
- The proxy only accepts requests signed with the Sanity webhook's secret. `curl -X POST https://sanity-webhook-proxy.austeane.workers.dev/` should return `401 Invalid signature`; to test end to end, publish any document and watch `gh run list --workflow=deploy-on-sanity-update.yml`.
- Rotating the webhook secret: generate a new value, set it on both Sanity webhooks (manage → API → Webhooks, or `PATCH https://api.sanity.io/v2021-10-04/hooks/projects/kbufa3g3/<hookId>` with `{"secret": …}`), then `npx wrangler secret put WEBHOOK_SECRET` in `webhook-proxy/` and `workers/auto-translate/`.

**Check deployment status:**
```bash
# View recent GitHub Actions runs
gh run list --workflow=deploy-on-sanity-update.yml --limit=5

# View Cloudflare deployment history
cd astro-app && npx wrangler pages deployment list --project-name=quadball-canada
```

### Manual Deployment

Use when GitHub Actions fails or for immediate deployment:
```bash
cd astro-app
npm run build                    # Must pass astro check + tsc
npx wrangler pages deploy dist --project-name=quadball-canada --commit-dirty=true
```

### Troubleshooting Failed Deploys

1. Check GitHub Actions: `gh run list --workflow=deploy-on-sanity-update.yml`
2. Common cause: TypeScript errors in `.astro` files (especially optional params)
3. Test locally: `npm run build` will show the same errors
4. After fixing, push to trigger auto-deploy or deploy manually

- Known issue (2025-10-05): CF API returns 500 code 8000000 creating deployments, despite successful asset upload. If seen, try the Cloudflare Dashboard or contact support.

## Localization Strategy

- Field-level localization using `localeString`, `localeText`, `localeSlug`, and `localePortableText`.
- **French fields are optional** — only English is required. Missing French content is auto-translated.
- Helpers:
  - Studio: `studio/src/schemaTypes/helpers/localization.ts`
  - Astro: `astro-app/src/utils/localization.ts`
- EN routes: `/news/...`; FR routes: `/fr/nouvelles/...`.
- Layout: `Layout.astro` accepts an `alternate` prop `{ en, fr }`, used to render hreflang links and power the header `LanguageSwitcher`.

### Auto-Translation

When any document is published, the `workers/auto-translate` Cloudflare Worker (Sanity webhook "Auto-translate to French") finds every EN/FR field whose French value is empty, at any depth (page sections, menu labels, cards), translates them in one OpenAI request and patches the French values back. Rich text is translated span by span, so bold, links and lists survive; links (`localeUrl`) are never translated. It only accepts signed webhooks (`WEBHOOK_SECRET`). Redeploy with `cd workers/auto-translate && npx wrangler deploy`.

The scripts below are an older local equivalent that only covers top-level fields of a few types; use them for one-off backfills.

**Setup:**
1. Get a Sanity write token from https://www.sanity.io/manage → API → Tokens
2. Add to `studio/.env`:
   ```
   SANITY_AUTH_TOKEN="your-token"
   OPENAI_API_KEY="your-key"
   ```

**Commands:**
```bash
# Start background listener (translates on publish)
cd studio && npm run translate:listen

# Translate all existing documents missing French
cd studio && npm run translate:all

# Options for translate:all
cd studio && npm run translate:all -- --dry-run        # Preview without changes
cd studio && npm run translate:all -- --type=newsArticle  # Only translate news
cd studio && npm run translate:all -- --limit=5        # Process only 5 docs
```

**Script document types:** newsArticle, infoArticle, event, resourceArticle, volunteerOpportunity, landingSection (the worker covers every type)

## Migration Scripts

- `studio/scripts/migrate-pages-to-sanity.mjs` (October 2026) moved the hardcoded page copy into Sanity. `add` creates missing documents and fills empty fields (re-running never overwrites editors' changes); `cleanup` runs once after the new site code is live and removes the replaced fields and retired documents.

- Location: `scripts/wp-to-sanity/`
- Scripts:
  - `migrate-news-articles.ts`: Migrates WordPress posts → `newsArticle` (requires `SANITY_TOKEN`).
  - `build-redirects.ts`: Builds redirects JSON from migration output.
- Env vars required:
  - `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_TOKEN`, `WP_XML_PATH`

## Security Notes

- Avoid committing tokens. Move any credentials in source (e.g., webhook proxy) to platform secrets.

## Recent Updates (2025-XX-XX)

- Added `@/` path alias via `tsconfig.json` (maps to `astro-app/src`). Prefer this over long relative imports.
- Introduced `src/i18n/` with `resolveLocale`, `switchLocalePath`, and `t(locale, key)` helpers plus a UI copy dictionary.
- Extracted mixed-language page templates into `astro-app/src/pages/_shared/` components; route files now pass a `locale` prop instead of duplicating markup.

## Recent Updates (2025-10-05)

Visual polish applied to Astro app:
- Header: added Donate CTA, sticky header, mobile menu toggle, aria-current on active links
- Layout: corrected `IBM Plex Mono`, improved type scale/line-heights, global container padding, link hover underlines, preconnect to `cdn.sanity.io`
- News cards: fixed aspect ratio, srcset/sizes, width/height to prevent CLS
- Homepage: title set to "Quadball Canada — Official Site"

Verification:
- Confirmed local servers with `lsof -iTCP -sTCP:LISTEN -P`
- Used Playwright MCP to validate UI at `http://localhost:4321/` (mobile menu toggle, language switcher active state, title)
- Added `@astrojs/sitemap` integration and updated `robots.txt` to point to `/sitemap-index.xml` using `site` from config

CLI used:
- `cd astro-app && npm run build`
- `cd astro-app && npx wrangler pages deploy dist --project-name=quadball-canada --commit-message "…" --commit-dirty=true`
- `npm i -w astro-app @astrojs/sitemap`
- `npm i -w astro-app zod` (dev server hot reload needed to clear overlay after install)
- `cd studio && npx sanity documents query '*[_type == "newsArticle" && slug.en.current == "test-article"][0..1]{_id, slug, title}'`
- `npx npm-check-updates -u && npm install` (root)
- `cd astro-app && npx npm-check-updates -u && npm install`
- `cd studio && npx npm-check-updates -u && npm install`
- `npm run build -w astro-app && npx wrangler pages deploy dist --project-name=quadball-canada`
- Switched to Astro 5 ClientRouter and added `transition:animate="slide"` on `<main>`. Updated header script to rebind on `astro:page-load`.
- Studio deploys:
- `cd studio && npm run deploy` (moved CLI `autoUpdates` to `deployment.autoUpdates` and set `deployment.appId`)

## Recent Updates (2025-10-10)

- Fixed dead links to non-existent `/about/what-is-quadball/` by pointing homepage and About page CTAs to `/about/`.
- Sorted homepage "Upcoming Events" chronologically ascending (soonest first) in `astro-app/src/components/sections/NewsGrid.astro` to avoid reverse-chronological display.
- Header navigation now highlights About Us, Contact Us, Events, and Get Involved (with updated dropdown anchors and language toggle on the left). Sanity `siteSettings.navigation` initial value mirrors this structure to avoid dead links.
- Added French routes for home, About, Contact, Events (and detail pages), Get Involved, and Teams with locale-aware header/footer + language toggle that keeps users on the same page.
- Introduced `infoArticle` Sanity document for evergreen content (e.g., “What is Quadball?”) with new `/info/[slug]` and `/fr/info/[slug]` Astro routes feeding homepage content dynamically.
