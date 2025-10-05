export const GET = async () => {
  const body = `User-agent: *\nAllow: /\nSitemap: https://quadball-canada.pages.dev/sitemap.xml`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
