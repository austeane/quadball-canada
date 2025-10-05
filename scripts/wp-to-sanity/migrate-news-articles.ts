#!/usr/bin/env -S node --enable-source-maps
import { createClient } from '@sanity/client';
import { htmlToBlocks } from '@sanity/block-tools';
import { JSDOM } from 'jsdom';
import { config, assertConfig } from './config';
import { parseWpXml, extractPosts, type WpPostLike } from './utils/parse-xml';
import { normalizeSlug, rewriteInternalLinks } from './utils/link-rewriter';
import { stripHtml } from './utils/sanitize-html';
import { convertDiviShortcodesToHtml } from './utils/divi-converter';

assertConfig();

const client = createClient({
  projectId: config.projectId,
  dataset: config.dataset,
  token: config.token,
  apiVersion: '2024-12-01',
  useCdn: false,
});

async function mapFeaturedImage(_wp: WpPostLike) {
  // Placeholder: rely on Sanity to upload images separately in migrate-media.ts
  return null;
}

function toPortableText(html: string) {
  const { window } = new JSDOM('<div></div>');
  return htmlToBlocks(html, {
    parseHtml: (h: string) => {
      const el = window.document.createElement('div');
      el.innerHTML = h;
      return el;
    },
  });
}

function wpToDoc(wp: WpPostLike) {
  const rawHtml = wp['content:encoded']?.[0] || '';
  const converted = convertDiviShortcodesToHtml(rawHtml);
  const rewritten = rewriteInternalLinks(converted);
  const blocks = toPortableText(rewritten);
  const baseSlug = normalizeSlug(wp['wp:post_name'] || '');
  const date = wp['wp:post_date'] || wp.pubDate || new Date().toISOString();

  return {
    _type: 'newsArticle',
    _id: `newsArticle.${baseSlug}`,
    publishedAt: date,
    title: { en: wp.title, fr: '' },
    slug: { en: { current: baseSlug }, fr: { current: `${baseSlug}-fr` } },
    excerpt: { en: stripHtml(wp['excerpt:encoded']?.[0] || ''), fr: '' },
    content: { en: blocks, fr: [] },
    featured: false,
    featuredImage: await mapFeaturedImage(wp),
  } as const;
}

async function run() {
  const xml = await parseWpXml(config.wpXmlPath);
  const posts = extractPosts(xml);
  const results: Array<{ oldUrl: string; newUrl: string }> = [];

  for (const wp of posts) {
    const doc = await wpToDoc(wp);
    await client.createOrReplace(doc as any);
    results.push({ oldUrl: wp.link, newUrl: `/news/${doc.slug.en.current}` });
    process.stdout.write(`Migrated: ${doc.slug.en.current}\n`);
  }

  // Results consumed by build-redirects.ts
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
