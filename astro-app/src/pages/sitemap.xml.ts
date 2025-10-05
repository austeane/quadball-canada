import { sanityClient } from "sanity:client";
import groq from "groq";

const site = 'https://quadball-canada.pages.dev';

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  alternates?: { lang: string; url: string }[];
}

async function getAllUrls(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];

  // Static pages with language alternates
  const staticPages = [
    { en: '/', fr: '/fr/' },
    { en: '/news/', fr: '/fr/nouvelles/' },
    { en: '/events/', fr: '/fr/evenements/' },
    { en: '/teams/', fr: '/fr/equipes/' },
    { en: '/about/', fr: '/fr/a-propos/' },
    { en: '/play/', fr: '/fr/jouer/' }
  ];

  staticPages.forEach(page => {
    // English version
    entries.push({
      loc: page.en,
      changefreq: 'weekly',
      priority: page.en === '/' ? 1.0 : 0.8,
      alternates: [
        { lang: 'en', url: `${site}${page.en}` },
        { lang: 'fr', url: `${site}${page.fr}` }
      ]
    });

    // French version
    entries.push({
      loc: page.fr,
      changefreq: 'weekly',
      priority: page.fr === '/fr/' ? 1.0 : 0.8,
      alternates: [
        { lang: 'en', url: `${site}${page.en}` },
        { lang: 'fr', url: `${site}${page.fr}` }
      ]
    });
  });

  try {
    // Fetch news articles from Sanity
    const newsArticles = await sanityClient.fetch(groq`
      *[_type == "newsArticle"] {
        "slugEn": slug.en.current,
        "slugFr": slug.fr.current,
        _updatedAt,
        publishedAt
      }
    `);

    newsArticles?.forEach((article: any) => {
      const lastmod = article._updatedAt || article.publishedAt;

      // Only add if English slug exists
      if (article.slugEn) {
        const enUrl = `/news/${article.slugEn}/`;
        const frUrl = article.slugFr ? `/fr/nouvelles/${article.slugFr}/` : null;

        entries.push({
          loc: enUrl,
          lastmod: lastmod ? new Date(lastmod).toISOString() : undefined,
          changefreq: 'monthly',
          priority: 0.6,
          alternates: frUrl ? [
            { lang: 'en', url: `${site}${enUrl}` },
            { lang: 'fr', url: `${site}${frUrl}` }
          ] : undefined
        });
      }

      // Only add French version if it exists
      if (article.slugFr) {
        const frUrl = `/fr/nouvelles/${article.slugFr}/`;
        const enUrl = article.slugEn ? `/news/${article.slugEn}/` : null;

        entries.push({
          loc: frUrl,
          lastmod: lastmod ? new Date(lastmod).toISOString() : undefined,
          changefreq: 'monthly',
          priority: 0.6,
          alternates: enUrl ? [
            { lang: 'en', url: `${site}${enUrl}` },
            { lang: 'fr', url: `${site}${frUrl}` }
          ] : undefined
        });
      }
    });

    // Fetch events from Sanity
    const events = await sanityClient.fetch(groq`
      *[_type == "event"] {
        "slugEn": slug.en.current,
        "slugFr": slug.fr.current,
        _updatedAt,
        startDateTime
      }
    `);

    events?.forEach((event: any) => {
      const lastmod = event._updatedAt || event.startDateTime;

      if (event.slugEn) {
        const enUrl = `/events/${event.slugEn}/`;
        const frUrl = event.slugFr ? `/fr/evenements/${event.slugFr}/` : null;

        entries.push({
          loc: enUrl,
          lastmod: lastmod ? new Date(lastmod).toISOString() : undefined,
          changefreq: 'monthly',
          priority: 0.5,
          alternates: frUrl ? [
            { lang: 'en', url: `${site}${enUrl}` },
            { lang: 'fr', url: `${site}${frUrl}` }
          ] : undefined
        });
      }

      if (event.slugFr) {
        const frUrl = `/fr/evenements/${event.slugFr}/`;
        const enUrl = event.slugEn ? `/events/${event.slugEn}/` : null;

        entries.push({
          loc: frUrl,
          lastmod: lastmod ? new Date(lastmod).toISOString() : undefined,
          changefreq: 'monthly',
          priority: 0.5,
          alternates: enUrl ? [
            { lang: 'en', url: `${site}${enUrl}` },
            { lang: 'fr', url: `${site}${frUrl}` }
          ] : undefined
        });
      }
    });

    // Fetch teams from Sanity
    const teams = await sanityClient.fetch(groq`
      *[_type == "team"] {
        "slug": slug.current,
        _updatedAt
      }
    `);

    teams?.forEach((team: any) => {
      if (team.slug) {
        // Teams don't have localized slugs yet, so same URL for both languages
        const url = `/teams/${team.slug}/`;

        entries.push({
          loc: url,
          lastmod: team._updatedAt ? new Date(team._updatedAt).toISOString() : undefined,
          changefreq: 'monthly',
          priority: 0.4
        });

        // Add French version pointing to same team
        entries.push({
          loc: `/fr/equipes/${team.slug}/`,
          lastmod: team._updatedAt ? new Date(team._updatedAt).toISOString() : undefined,
          changefreq: 'monthly',
          priority: 0.4
        });
      }
    });

    // Fetch pages from Sanity
    const pages = await sanityClient.fetch(groq`
      *[_type == "page"] {
        "slugEn": slug.en.current,
        "slugFr": slug.fr.current,
        _updatedAt
      }
    `);

    pages?.forEach((page: any) => {
      if (page.slugEn) {
        const enUrl = `/${page.slugEn}/`;
        const frUrl = page.slugFr ? `/fr/${page.slugFr}/` : null;

        entries.push({
          loc: enUrl,
          lastmod: page._updatedAt ? new Date(page._updatedAt).toISOString() : undefined,
          changefreq: 'monthly',
          priority: 0.7,
          alternates: frUrl ? [
            { lang: 'en', url: `${site}${enUrl}` },
            { lang: 'fr', url: `${site}${frUrl}` }
          ] : undefined
        });
      }

      if (page.slugFr) {
        const frUrl = `/fr/${page.slugFr}/`;
        const enUrl = page.slugEn ? `/${page.slugEn}/` : null;

        entries.push({
          loc: frUrl,
          lastmod: page._updatedAt ? new Date(page._updatedAt).toISOString() : undefined,
          changefreq: 'monthly',
          priority: 0.7,
          alternates: enUrl ? [
            { lang: 'en', url: `${site}${enUrl}` },
            { lang: 'fr', url: `${site}${frUrl}` }
          ] : undefined
        });
      }
    });
  } catch (error) {
    console.error('Error fetching Sanity content for sitemap:', error);
    // Return static entries if Sanity query fails
  }

  return entries;
}

export const GET = async () => {
  try {
    const entries = await getAllUrls();

    // Build XML with xhtml namespace for language alternates
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
      `xmlns:xhtml="http://www.w3.org/1999/xhtml">` +
      entries
        .map((entry) => {
          let urlXml = `<url>`;
          urlXml += `<loc>${site}${entry.loc}</loc>`;

          if (entry.lastmod) {
            urlXml += `<lastmod>${entry.lastmod}</lastmod>`;
          }

          if (entry.changefreq) {
            urlXml += `<changefreq>${entry.changefreq}</changefreq>`;
          }

          if (entry.priority !== undefined) {
            urlXml += `<priority>${entry.priority}</priority>`;
          }

          // Add hreflang alternates
          if (entry.alternates) {
            entry.alternates.forEach(alt => {
              urlXml += `<xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.url}"/>`;
            });
          }

          urlXml += `</url>`;
          return urlXml;
        })
        .join('') +
      `</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Failed to generate sitemap:', error);

    // Fallback to minimal sitemap if something goes wrong
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      `<url><loc>${site}/</loc><priority>1.0</priority></url>` +
      `<url><loc>${site}/news/</loc><priority>0.8</priority></url>` +
      `<url><loc>${site}/fr/</loc><priority>1.0</priority></url>` +
      `<url><loc>${site}/fr/nouvelles/</loc><priority>0.8</priority></url>` +
      `</urlset>`;

    return new Response(fallbackXml, {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
};
