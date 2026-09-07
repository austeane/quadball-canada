// Cloudflare Worker that triggers the "Deploy on Sanity Update" GitHub workflow.
//
// Two entry points, both call the same GitHub repository_dispatch endpoint:
//   fetch()     - Sanity publish webhook POSTs here (webhook "Deploy via Proxy")
//   scheduled() - daily Cron Trigger configured in wrangler.toml
//
// The daily rebuild lives here rather than in a GitHub `schedule:` trigger because
// GitHub auto-disables scheduled workflows after 60 days without a commit, and when
// it does so the webhook trigger in the same workflow file stops working too.
//
// Required secret (set once, persists across deploys):
//   npx wrangler secret put GITHUB_TOKEN   # PAT with permission to create repository dispatches

const REPO = 'austeane/quadball-canada';
const EVENT_TYPE = 'sanity-update';

async function triggerDeploy(env, source) {
  if (!env.GITHUB_TOKEN) {
    return { ok: false, status: 500, message: 'GitHub token not configured' };
  }

  const res = await fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Sanity-Webhook-Proxy',
    },
    body: JSON.stringify({ event_type: EVENT_TYPE, client_payload: { source } }),
  });

  // GitHub returns 204 No Content on success.
  return { ok: res.ok, status: res.status, message: `GitHub API responded with: ${res.status}` };
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    const result = await triggerDeploy(env, 'sanity-webhook');
    return new Response(result.message, { status: result.ok ? 200 : result.status });
  },

  async scheduled(event, env) {
    const result = await triggerDeploy(env, 'cron');
    console.log(`[cron ${event.cron}] ${result.message}`);
    if (!result.ok) {
      // Throwing marks the cron invocation as failed in the Cloudflare dashboard.
      throw new Error(result.message);
    }
  },
};
