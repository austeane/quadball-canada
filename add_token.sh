#!/bin/bash
echo "Paste your Cloudflare API token and press Enter:"
read -s CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_API_TOKEN --body "$CLOUDFLARE_API_TOKEN"
echo "✅ Token added to GitHub secrets!"
echo ""
echo "Now testing the workflow..."
gh workflow run "Deploy on Sanity Update" --ref main
echo "✅ Workflow triggered! Check the status at:"
echo "https://github.com/austeane/quadball-canada/actions"