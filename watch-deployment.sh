#!/bin/bash
echo "Watching for new deployments triggered by Sanity..."
echo "Make a change in Sanity Studio and publish to test the webhook."
echo ""
echo "Current runs:"
gh run list --workflow="Deploy on Sanity Update" --limit 3
echo ""
echo "Waiting for new deployment..."

# Get the latest run ID
LATEST_RUN=$(gh run list --workflow="Deploy on Sanity Update" --limit 1 --json databaseId -q '.[0].databaseId')

# Watch for a new run
while true; do
  NEW_RUN=$(gh run list --workflow="Deploy on Sanity Update" --limit 1 --json databaseId -q '.[0].databaseId')
  if [ "$NEW_RUN" != "$LATEST_RUN" ]; then
    echo "🚀 New deployment detected! Run ID: $NEW_RUN"
    echo "Watching progress..."
    gh run watch $NEW_RUN
    break
  fi
  sleep 2
done