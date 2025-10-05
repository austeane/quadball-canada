// Cloudflare Worker to proxy Sanity webhooks to GitHub Actions
// Deploy this as a Cloudflare Worker and use its URL as the Sanity webhook endpoint
//
// Required environment variable:
// GITHUB_TOKEN - GitHub Personal Access Token with repo:dispatch permission

export default {
  async fetch(request, env, ctx) {
    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Check for GitHub token in environment
    if (!env.GITHUB_TOKEN) {
      return new Response('GitHub token not configured', { status: 500 });
    }

    // Trigger GitHub Actions workflow
    const githubResponse = await fetch('https://api.github.com/repos/austeane/quadball-canada/dispatches', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Sanity-Webhook-Proxy'
      },
      body: JSON.stringify({
        event_type: 'sanity-update'
      })
    });

    return new Response(
      `GitHub API responded with: ${githubResponse.status}`,
      { status: githubResponse.ok ? 200 : githubResponse.status }
    );
  },
};