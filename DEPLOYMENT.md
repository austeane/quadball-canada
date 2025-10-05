# Quadball Canada - Deployment Documentation

## Overview

This is a fully automated Astro + Sanity CMS website with continuous deployment. Content changes in Sanity automatically trigger rebuilds and deploy to Cloudflare Pages.

## Architecture

- **Frontend**: Static Astro site (SSG)
- **CMS**: Sanity Studio for content management
- **Hosting**: Cloudflare Pages
- **CI/CD**: GitHub Actions
- **Webhook Proxy**: Cloudflare Worker

## Live URLs

- **Production Site**: https://quadball-canada.pages.dev
- **Sanity Studio**: https://quadball-canada.sanity.studio
- **Webhook Proxy**: https://sanity-webhook-proxy.austeane.workers.dev

## How It Works

1. **Content Editing**: Editors make changes in Sanity Studio
2. **Publish**: Click publish to save changes to Sanity's cloud
3. **Webhook**: Sanity sends webhook to Cloudflare Worker proxy
4. **Proxy**: Worker transforms request and triggers GitHub Action
5. **Build**: GitHub Action builds static site with latest content
6. **Deploy**: Wrangler deploys to Cloudflare Pages
7. **Live**: New content appears at production URL (~2 minutes total)

## Project Structure

```
quadball-canada/
├── astro-app/           # Frontend Astro application
│   ├── src/
│   ├── public/
│   └── astro.config.mjs # Static output configuration
├── studio/              # Sanity Studio CMS
│   ├── src/schemaTypes/
│   └── sanity.cli.ts
├── .github/workflows/   # GitHub Actions
│   └── deploy-on-sanity-update.yml
└── webhook-proxy.js     # Cloudflare Worker for webhook handling
```

## Configuration Details

### Astro Configuration
- **Output Mode**: `static` (pure SSG, no SSR)
- **Framework**: React 19 (works fine in static mode)
- **Build Output**: `astro-app/dist/`

### Sanity Configuration
- **Project ID**: `kbufa3g3`
- **Dataset**: `production`
- **Studio Host**: `quadball-canada`

### Environment Variables

**Local Development** (`.env` files):
```bash
# astro-app/.env
PUBLIC_SANITY_STUDIO_PROJECT_ID="kbufa3g3"
PUBLIC_SANITY_STUDIO_DATASET="production"

# studio/.env
SANITY_STUDIO_PROJECT_ID="kbufa3g3"
SANITY_STUDIO_DATASET="production"
```

**GitHub Secrets** (for CI/CD):
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `PUBLIC_SANITY_STUDIO_PROJECT_ID`
- `PUBLIC_SANITY_STUDIO_DATASET`

### Webhook Configuration

The Sanity webhook triggers the Cloudflare Worker proxy:
- **Name**: Deploy via Proxy
- **URL**: https://sanity-webhook-proxy.austeane.workers.dev
- **Triggers**: Create, Update, Delete
- **Dataset**: production

## Development

### Local Development
```bash
# Install dependencies
npm install

# Run both Astro and Studio
npm run dev

# Astro only (localhost:4321)
npm run dev --workspace=astro-app

# Studio only (localhost:3333)
npm run dev --workspace=studio
```

### Manual Deployment
```bash
# Build the site
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy astro-app/dist --project-name=quadball-canada
```

## Deployment URLs

Each deployment creates two URLs:
1. **Production URL**: `https://quadball-canada.pages.dev` - Always shows latest deployment
2. **Preview URL**: `https://[hash].quadball-canada.pages.dev` - Unique URL for each deployment (useful for rollbacks)

## Monitoring Deployments

### Check GitHub Actions
```bash
# View recent runs
gh run list --workflow="Deploy on Sanity Update" --limit 5

# Watch a specific run
gh run watch [RUN_ID]
```

### Check Sanity Webhooks
```bash
cd studio
# List webhooks
npx sanity hook list

# Check webhook logs
npx sanity hook logs "Deploy via Proxy"
```

### Check Cloudflare Deployments
```bash
npx wrangler pages deployment list --project-name=quadball-canada
```

## Troubleshooting

### Content Not Updating
1. Check webhook fired: `npx sanity hook logs "Deploy via Proxy"`
2. Check GitHub Action ran: `gh run list --workflow="Deploy on Sanity Update"`
3. Verify deployment succeeded: Check GitHub Action logs
4. Clear browser cache and check production URL

### Webhook Not Firing
1. Verify webhook exists in Sanity dashboard
2. Check webhook is enabled
3. Ensure content was actually published (not just saved as draft)

### Build Failures
1. Check GitHub Action logs for errors
2. Verify environment variables are set in GitHub Secrets
3. Test build locally: `npm run build`

## Rollback Procedure

If a bad deployment occurs:
1. Find the last good deployment URL from GitHub Actions logs
2. Access the preview URL (e.g., `https://[hash].quadball-canada.pages.dev`)
3. If needed, manually redeploy a previous commit:
   ```bash
   git checkout [GOOD_COMMIT]
   npm run build
   npx wrangler pages deploy astro-app/dist --project-name=quadball-canada
   ```

## Adding New Content Types

1. Define schema in `studio/src/schemaTypes/`
2. Export in `studio/src/schemaTypes/index.ts`
3. Add TypeScript types in `astro-app/src/utils/sanity.ts`
4. Create GROQ queries to fetch content
5. Build pages/components to display content
6. Publish changes - deployment is automatic!

## Security Notes

- GitHub token in webhook proxy is read-only for repository dispatch
- Cloudflare API token only has Pages edit permissions
- Sanity webhook has no authentication (relies on obscure Worker URL)
- All secrets are stored in GitHub Secrets and Cloudflare Workers

## Performance

- **Build Time**: ~1 minute
- **Deploy Time**: ~30 seconds
- **Total Update Time**: ~2 minutes from publish to live
- **CDN**: Cloudflare global network
- **Static Files**: No server runtime, instant response