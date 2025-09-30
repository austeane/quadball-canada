# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro + Sanity CMS monorepo template with two npm workspaces:
- **astro-app**: Frontend Astro application that fetches and displays content from Sanity
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

## Architecture

### Monorepo Structure
- Root uses npm workspaces with `concurrently` to run both apps simultaneously
- Both apps are independent but share the same Sanity project configuration

### Astro App (`astro-app/`)
- **Output mode**: Hybrid SSR with Vercel serverless adapter
- **Key integrations**: `@sanity/astro` for Sanity integration, `@astrojs/react` for React components
- **Content fetching**: GROQ queries via `sanityClient` from `sanity:client` (auto-imported by Astro integration)
- **Data layer**: `src/utils/sanity.ts` contains typed query functions (`getPosts()`, `getPost()`)
- **Portable Text**: Uses `astro-portabletext` to render Sanity's block content

### Sanity Studio (`studio/`)
- **Schema location**: `src/schemaTypes/` - contains document types (e.g., `post.ts`) and objects (e.g., `blockContent.tsx`)
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
3. Create corresponding TypeScript interfaces in `astro-app/src/utils/sanity.ts`
4. Add GROQ query functions in `astro-app/src/utils/sanity.ts` to fetch the new content types
5. Studio will automatically reflect schema changes on refresh

## Key Integration Points

- **Sanity Client**: Auto-imported as `sanityClient` from `sanity:client` in Astro files (provided by `@sanity/astro`)
- **Image URLs**: Use `@sanity/image-url` for optimized image rendering
- **GROQ**: Query language for fetching content - can be tested in Vision tool at Studio's `/vision` route
- **API Version**: Set in `astro.config.mjs` (currently "2024-12-08")
