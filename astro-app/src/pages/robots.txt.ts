import type { APIContext } from "astro";

export const GET = async ({ site }: APIContext) => {
  const sitemapUrl = new URL('/sitemap-index.xml', site ?? 'https://quadball-canada.pages.dev').toString();
  const body = `User-agent: *\nAllow: /\nSitemap: ${sitemapUrl}`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
