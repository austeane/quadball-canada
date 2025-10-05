# GitHub Secrets Setup for Automated Deployment

You need to add the following secrets to your GitHub repository for the automated deployment to work.

## Step 1: Add Repository Secrets

Go to your GitHub repository: https://github.com/austeane/quadball-canada/settings/secrets/actions

Add these secrets:

### 1. `CLOUDFLARE_ACCOUNT_ID`
Value: `48dba4f30a5b57fb1b2295da5bc8751a`

### 2. `CLOUDFLARE_API_TOKEN`
You need to create a new API token:
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "Custom token" template
4. Set these permissions:
   - **Account** → Cloudflare Pages:Edit
   - **Zone** → Zone:Read (optional, if you have a custom domain)
5. Account resources: Include → Your account
6. Click "Continue to summary" → "Create Token"
7. Copy the token and add it as this secret

### 3. `PUBLIC_SANITY_STUDIO_PROJECT_ID`
Value: `kbufa3g3`

### 4. `PUBLIC_SANITY_STUDIO_DATASET`
Value: `production`

## Step 2: Create Sanity Webhook

After adding GitHub secrets:

1. Go to https://www.sanity.io/manage/project/kbufa3g3/api/webhooks
2. Click "Create Webhook"
3. Configure:
   - **Name**: Deploy to Cloudflare Pages
   - **URL**: `https://api.github.com/repos/austeane/quadball-canada/dispatches`
   - **Trigger on**: Create, Update, Delete
   - **Filter**: Leave empty (or set to `_type == "post"` if you only want post updates to trigger)
   - **Headers**: Add these headers:
     ```
     Accept: application/vnd.github.v3+json
     Authorization: Bearer YOUR_GITHUB_TOKEN
     Content-Type: application/json
     ```
   - **Body**: Set to:
     ```json
     {
       "event_type": "sanity-update"
     }
     ```

### Creating a GitHub Personal Access Token for the webhook:

1. Go to https://github.com/settings/tokens/new
2. Give it a name like "Sanity Webhook"
3. Set expiration (or no expiration)
4. Select scope: `repo` (full control)
5. Generate token and copy it
6. Use this token in the `Authorization: Bearer YOUR_GITHUB_TOKEN` header above

## Step 3: Test

1. Push this workflow to GitHub
2. Go to Actions tab and manually run the workflow to test
3. Once working, test the webhook by publishing a change in Sanity Studio