# Quadball Canada - Deployment Documentation

## Overview

This is a fully automated Astro + Sanity CMS website with continuous deployment. Content changes in Sanity automatically trigger rebuilds and deploy to Cloudflare Pages.

## Architecture

- **Frontend**: Static Astro site (SSG)
- **CMS**: Sanity Studio for content management
- **Hosting**: Cloudflare Pages
- **CI/CD**: GitHub Actions
- **Webhook Proxy**: Cloudflare Worker (`webhook-proxy/`)
- **Daily Rebuild**: Cron Trigger on that same Worker (06:00 UTC)

## Live URLs

- **Production Site**: https://www.quadballcanada.ca
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

Independently of publishes, a Cron Trigger on the same Worker fires step 4 once a day at 06:00 UTC so time-sensitive content (upcoming events, etc.) stays fresh even when nobody has published anything.

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
└── webhook-proxy/       # Cloudflare Worker: Sanity webhook proxy + daily cron
    ├── worker.js
    └── wrangler.toml
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

### Webhook Proxy Worker

Source: `webhook-proxy/worker.js`. Config: `webhook-proxy/wrangler.toml`. It has two entry points that both call GitHub's `repository_dispatch` endpoint with event type `sanity-update`:
- `fetch` — the Sanity webhook POSTs here on publish
- `scheduled` — daily Cron Trigger at 06:00 UTC

Deploy it after any change (needs a one-time `npx wrangler login`):
```bash
cd webhook-proxy
npx wrangler deploy
```

`GITHUB_TOKEN` is a Worker secret: a fine-grained GitHub PAT named "sanity-webhook-proxy (Cloudflare Worker)", scoped to this repository only, permission Contents: read and write, no expiry. Secrets persist across deploys. Check the worker after deploying, allowing ~30s for propagation: `curl -X POST https://sanity-webhook-proxy.austeane.workers.dev/` should print `GitHub API responded with: 204`.

To rotate the token: create a new PAT with the same scope and run `npx wrangler secret put GITHUB_TOKEN`. If wrangler refuses because the latest version is not the deployed one (e.g. after a `wrangler rollback`), use `npx wrangler versions secret put GITHUB_TOKEN` followed by `npx wrangler versions deploy <version-id>@100% -y`.

Test the cron handler locally without waiting for 06:00 UTC:
```bash
cd webhook-proxy
echo "GITHUB_TOKEN=$(gh auth token)" > .dev.vars   # gitignored; delete afterwards
npx wrangler dev --test-scheduled
curl 'http://localhost:8787/__scheduled?cron=0+6+*+*+*'
```

**Why the cron lives here and not in GitHub Actions:** GitHub automatically disables any workflow that has a `schedule:` trigger after 60 days without a commit to the repo. When that happens the `repository_dispatch` trigger in the same workflow file stops working too, so Sanity publishes silently stop deploying. Cloudflare Cron Triggers have no inactivity rule. Do not add a `schedule:` back to `deploy-on-sanity-update.yml`.

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
1. **Production URL**: `https://www.quadballcanada.ca` - Always shows latest deployment
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

### Check the Daily Cron
Cloudflare dashboard → Workers & Pages → `sanity-webhook-proxy` → Logs shows each cron invocation and the GitHub response code. On the GitHub side, cron-triggered runs show up as `repository_dispatch` events shortly after 06:00 UTC:
```bash
gh run list --workflow="Deploy on Sanity Update" --limit 10 --json event,createdAt,conclusion
```

### Check Cloudflare Deployments
```bash
npx wrangler pages deployment list --project-name=quadball-canada
```

## Troubleshooting

### Content Not Updating
0. Check the workflow is enabled: `gh workflow list --all`. If it shows `disabled_inactivity`, a `schedule:` trigger was re-added; remove it and run `gh workflow enable deploy-on-sanity-update.yml`
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