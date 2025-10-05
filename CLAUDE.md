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
- **Key integrations**: `@sanity/astro` for Sanity integration, `@astrojs/react` for React components
- **Content fetching**: GROQ queries via `sanityClient` from `sanity:client` (auto-imported by Astro integration)
- **Data layer**: `src/utils/sanity.ts` provides `getNewsArticles()` and `getNewsArticle()`
- **Localization**: Field-level via `locale*` objects. Helpers in `studio/src/schemaTypes/helpers/localization.ts` and `astro-app/src/utils/localization.ts`.
- **Portable Text**: Uses `astro-portabletext` to render Sanity's block content

### Sanity Studio (`studio/`)
- **Schema location**: `src/schemaTypes/` - contains document types (e.g., `newsArticle.ts`, `event.ts`, `team.ts`) and objects (e.g., `blockContent.tsx`)
- **Schema exports**: All types must be added to `src/schemaTypes/index.ts` array
- **Configuration**: `sanity.config.ts` uses environment variables for project ID and dataset
- **Plugins**: Structure tool (content management UI) and Vision tool (GROQ query testing)

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

### Important: News vs. Legacy Posts
- Use `newsArticle` instead of legacy `post`.
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

## Deployment (Cloudflare Pages)

- Project: `quadball-canada` → https://quadball-canada.pages.dev
- Config: `astro-app/wrangler.toml` (`pages_build_output_dir = "./dist"`)
- Build and deploy:
  - `cd astro-app && npm run build`
  - `npx wrangler whoami`
  - `npx wrangler pages project list`
  - `npx wrangler pages deployment list --project-name=quadball-canada`
  - `npx wrangler pages deploy dist --project-name=quadball-canada`
- Known issue (2025-10-05): CF API returns 500 code 8000000 creating deployments, despite successful asset upload. If seen, try the Cloudflare Dashboard or contact support.

## Localization Strategy

- Field-level localization using `localeString`, `localeText`, `localeSlug`, and `localePortableText`.
- Helpers:
  - Studio: `studio/src/schemaTypes/helpers/localization.ts`
  - Astro: `astro-app/src/utils/localization.ts`
- EN routes: `/news/...`; FR routes: `/fr/nouvelles/...`.
 - Layout: `Layout.astro` accepts an `alternate` prop `{ en, fr }`, used to render hreflang links and power the header `LanguageSwitcher`.

## Migration Scripts

- Location: `scripts/wp-to-sanity/`
- Scripts:
  - `migrate-news-articles.ts`: Migrates WordPress posts → `newsArticle` (requires `SANITY_TOKEN`).
  - `build-redirects.ts`: Builds redirects JSON from migration output.
- Env vars required:
  - `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_TOKEN`, `WP_XML_PATH`

## Security Notes

- Avoid committing tokens. Move any credentials in source (e.g., webhook proxy) to platform secrets.

## Keep Docs In Sync

- Update `MIGRATION_PLAN.md` and `CHECKLIST.md` when changing structure, naming, or workflows.

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
