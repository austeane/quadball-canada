# Sanity Studio Auto-Deployment Setup

This guide explains how to enable automatic Sanity Studio schema deployment when you push changes to the `main` branch.

## Overview

- **Astro app**: Auto-deploys via Cloudflare Pages Git integration (already configured)
- **Studio schema**: Auto-deploys via GitHub Actions (configured in `.github/workflows/deploy-studio.yml`)

## Setup Steps

### 1. Create a Sanity Auth Token

1. Go to https://www.sanity.io/manage
2. Select your organization: **AW** (or your org name)
3. Navigate to **Settings** → **API** → **Tokens**
4. Click **Add API Token**
5. Configure:
   - **Name**: `GitHub Actions Studio Deploy`
   - **Permissions**: `Deploy Studio` (or `Editor` if Deploy Studio isn't available)
   - **Dataset**: Leave as "All datasets" or select `production`
6. Click **Create Token**
7. **Copy the token immediately** (you won't see it again!)

### 2. Add Token to GitHub Secrets

1. Go to your GitHub repository: https://github.com/your-username/quadball-canada
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add:
   - **Name**: `SANITY_AUTH_TOKEN`
   - **Secret**: Paste the token from step 1
5. Click **Add secret**

### 3. Test the Workflow

You can test in two ways:

#### Option A: Manual Trigger (Safe Test)
1. Go to **Actions** tab in GitHub
2. Select **Deploy Sanity Studio** workflow
3. Click **Run workflow** → Select `main` branch → **Run workflow**
4. Watch the deployment run

#### Option B: Push to Main (Real-World Test)
1. Make a small schema change (e.g., add a description to a field)
2. Commit and push to main
3. GitHub Action will automatically deploy Studio
4. Verify at https://quadball-canada.sanity.studio

## How It Works

The workflow triggers when:
- ✅ Any file in `studio/` changes and is pushed to `main`
- ✅ The workflow file itself changes
- ✅ Manual trigger via GitHub Actions UI

The workflow:
1. Checks out your code
2. Installs dependencies
3. Runs `npm run deploy` in the studio directory
4. Sanity CLI deploys schema to production

## Monitoring Deployments

### Check GitHub Actions
```bash
# View recent workflow runs
gh run list --workflow="Deploy Sanity Studio" --limit 5

# Watch a running workflow
gh run watch
```

### Check Deployment Status
After a successful run, visit:
- Production Studio: https://quadball-canada.sanity.studio
- Verify new document types appear in the sidebar

## Troubleshooting

### Workflow Fails with "Authentication Error"
- **Cause**: Missing or invalid `SANITY_AUTH_TOKEN`
- **Fix**: Verify token is added to GitHub Secrets and has correct permissions

### Schema Changes Not Appearing
- **Cause**: Workflow didn't trigger (no changes in `studio/` directory)
- **Fix**: Ensure your changes were in the `studio/` folder, or trigger manually

### "Command not found: sanity"
- **Cause**: Dependencies not installed correctly
- **Fix**: Check the workflow log - `npm ci` should install `sanity` CLI

## Current Deployment Flow

```
┌─────────────────────────────────────────────────────┐
│  Developer pushes to main branch                    │
└─────────────────────────────────────────────────────┘
                       │
                       ├──────────────────┬─────────────────────┐
                       │                  │                     │
                       ▼                  ▼                     ▼
        ┌──────────────────────┐  ┌──────────────┐  ┌─────────────────┐
        │ Changes in studio/   │  │ Changes in   │  │ Changes in      │
        │ trigger GitHub       │  │ astro-app/   │  │ other files     │
        │ Action               │  │ trigger      │  │ (no auto-       │
        │                      │  │ Cloudflare   │  │ deployment)     │
        │ → Deploy Studio      │  │ Pages        │  └─────────────────┘
        │   schema to Sanity   │  │              │
        │   hosted platform    │  │ → Build +    │
        └──────────────────────┘  │   deploy     │
                                  │   Astro app  │
                                  └──────────────┘
```

## Benefits

✅ **Automatic schema deployment** - No more forgetting to run `npm run deploy`
✅ **Schema stays in sync** - Production Studio matches your codebase
✅ **Deployment history** - See all Studio deploys in GitHub Actions
✅ **Safe and controlled** - Only deploys when changes pushed to main
✅ **Path filtering** - Only runs when Studio files actually change

## Manual Deployment (Fallback)

If needed, you can still deploy manually:

```bash
cd studio
npm run deploy
```

## Next Steps

After setup is complete:
1. ✅ Create `SANITY_AUTH_TOKEN` in Sanity dashboard
2. ✅ Add token to GitHub Secrets
3. ✅ Test workflow with manual trigger
4. ✅ Make a schema change and push to verify automatic deployment
5. ✅ Update `DEPLOYMENT.md` to reflect new Studio deployment process
