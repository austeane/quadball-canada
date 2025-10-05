# Quadball Canada - Deployment Documentation

## Summary

Astro + Sanity CMS is set up and builds locally. Deployment to Cloudflare Pages with the Cloudflare adapter and React 19 fails at runtime due to a Workers limitation (MessageChannel not available). This document captures verified behavior, how to reproduce, and practical paths to fix it.

## What Was Accomplished

- Configured Cloudflare adapter (`@astrojs/cloudflare`) and build pipeline.
- Created Sanity project (ID `kbufa3g3`) and published initial content.
- Local build renders homepage and post at `/post/welcome-to-quadball-canada`.

## Files Created/Modified

- `astro-app/wrangler.toml`
  ```toml
  name = "quadball-canada"
  compatibility_date = "2024-09-30"
  pages_build_output_dir = "./dist"
  compatibility_flags = ["nodejs_compat"]
  ```
- `astro-app/package.json`: uses `@astrojs/cloudflare@^11.1.0` and React 19.
- `astro-app/astro.config.mjs`: Cloudflare adapter enabled, `output: "hybrid"`.
- Root `package.json`: `build` script delegates to the Astro workspace.
- `.env` files (untracked): `astro-app/.env`, `studio/.env`.

## Environment Variables

- Astro app (`astro-app/.env`):
  ```
  PUBLIC_SANITY_STUDIO_PROJECT_ID="kbufa3g3"
  PUBLIC_SANITY_STUDIO_DATASET="production"
  ```
- Studio (`studio/.env`):
  ```
  SANITY_STUDIO_PROJECT_ID="kbufa3g3"
  SANITY_STUDIO_DATASET="production"
  ```
- Cloudflare Pages: set the Astro app variables exactly as above (the `PUBLIC_...` names) in Settings → Variables for both Production and Preview.

## Git Commits

1. `d09c21e` — Configure Cloudflare Pages deployment
2. `e192f11` — Add build script to root package.json
3. `a171629` — Add Node.js compatibility for React 19

## Verified Issues

### 1) React 19 breaks in Cloudflare Workers

- Error: `Uncaught ReferenceError: MessageChannel is not defined` during Workers startup.
- Reproduced locally with Cloudflare Pages dev runtime:
  ```bash
  cd astro-app
  npm run build
  npx wrangler pages dev dist --port 8788 --local
  ```
  Expected: Workers fails to start with the MessageChannel error.
- Cause: React 19’s scheduler initializes `MessageChannel` at module load; Cloudflare Workers runtime does not provide it.
- Status: `compatibility_flags = ["nodejs_compat"]` and adapter runtime options do not resolve this.

### 2) Pages build configuration alignment

- The repo uses npm workspaces; ensure Cloudflare Pages builds the Astro app and publishes the right directory.
- Two valid configurations:
  - Use root as the project root:
    - Build command: `npm run build --workspace=astro-app`
    - Build output directory: `astro-app/dist`
  - Or set Project Root Directory to `astro-app` in Pages:
    - Build command: `npm run build`
    - Build output directory: `dist`
- If the `PUBLIC_SANITY_STUDIO_*` variables aren’t present at build time, prerender may produce the Welcome fallback instead of posts.

## Deployment URLs

- Cloudflare Pages (Production): https://quadball-canada.pages.dev
- Sanity Studio (Local): http://localhost:3333
- Astro Dev (Local): http://localhost:4321

## Recommendations

### Option 1 (Recommended): Static SSG

If SSR isn’t required, switch to static output to avoid the Workers runtime entirely.

1) Edit `astro-app/astro.config.mjs` and change to static output (remove the adapter):
```js
import {defineConfig} from 'astro/config'
import sanity from '@sanity/astro'
import react from '@astrojs/react'

export default defineConfig({
  output: 'static',
  integrations: [
    sanity({
      projectId: process.env.PUBLIC_SANITY_STUDIO_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.PUBLIC_SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_DATASET,
      useCdn: false,
      apiVersion: '2024-12-08',
    }),
    react(),
  ],
})
```
2) In Cloudflare Pages, use one of the build configurations from “Pages build configuration alignment”.

Result: No Workers runtime; deploys as static assets; React 19 is fine client-side.

### Option 2: Keep SSR, downgrade to React 18

If you need SSR or an embedded Studio route under the Astro app, use React 18 which works in Workers today.

```bash
cd astro-app
npm install react@^18.3.0 react-dom@^18.3.0 @types/react@^18.3.0 @types/react-dom@^18.3.0
```

### Option 3: Wait for React 19 support in Workers

Track updates from Cloudflare Workers, `@astrojs/cloudflare`, and the Astro React integration.

### Option 4: Use another platform for SSR with React 19

If SSR with React 19 is required now, deploy to Vercel, Netlify, or Render.

## Current Configuration

**✅ Implemented: Static SSG (Option 1)**

The project now uses static output instead of SSR with Cloudflare adapter:
- `astro-app/astro.config.mjs`: Changed to `output: "static"`
- Removed `@astrojs/cloudflare` dependency
- React 19 works fine in static mode (no Workers runtime)
- Build tested successfully: generates 2 static pages

**✅ Deployed:**
- **Frontend**: https://quadball-canada.pages.dev (or https://60bc0fa0.quadball-canada.pages.dev)
- **Sanity Studio**: https://quadball-canada.sanity.studio

## Content Management

To edit content:
1. Visit https://quadball-canada.sanity.studio
2. Log in with your Sanity account
3. Create/edit posts in the CMS
4. Changes are saved immediately to Sanity

**Important**: The static site won't update automatically after content changes. You need to manually rebuild:

```bash
# Build the site
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy astro-app/dist --project-name=quadball-canada
```

For automatic rebuilds when content changes, set up a Sanity webhook (see "Automatic Deployments" section below).

## Automatic Deployments (Optional)

To automatically rebuild the site when content changes in Sanity:

1. Set up a GitHub Action or Cloudflare Pages webhook
2. In Sanity Studio dashboard, go to **API → Webhooks**
3. Create webhook pointing to your build trigger URL
4. Now content updates will automatically trigger rebuilds

## Local Development

```bash
# Start both Astro and Studio
npm run dev

# Start just Astro (localhost:4321)
npm run dev --workspace=astro-app

# Start just Studio (localhost:3333)
npm run dev --workspace=studio

# Build for production (Astro)
npm run build
```

## Sanity Project Details

- Project ID: `kbufa3g3`
- Dataset: `production`
- Studio URL (after deploy): https://quadball-canada.sanity.studio

## Troubleshooting

- Welcome screen instead of posts: confirm Pages build settings, env vars, and that at least one post is published in the dataset.
- Workers crash with MessageChannel error: use Option 1 (static) or Option 2 (React 18).

