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
// Required secrets (set once, persist across deploys):
//   npx wrangler secret put GITHUB_TOKEN     # PAT with permission to create repository dispatches
//   npx wrangler secret put WEBHOOK_SECRET   # same value as the secret on the Sanity webhook

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

// Verify Sanity's `sanity-webhook-signature: t=<ms>,v1=<base64url HMAC-SHA256 of "<t>.<body>">`.
async function isValidSignature(header, body, secret) {
  const match = /^t=(\d+)[, ]+v1=([^, ]+)$/.exec(header ?? '');
  if (!match) return false;
  const [, timestamp, signature] = match;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${body}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return expected === signature;
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    // Only Sanity may trigger deploys; anyone else gets a 401 without reaching GitHub.
    const body = await request.text();
    if (!env.WEBHOOK_SECRET || !(await isValidSignature(request.headers.get('sanity-webhook-signature'), body, env.WEBHOOK_SECRET))) {
      return new Response('Invalid signature', { status: 401 });
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
