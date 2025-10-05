import fs from 'node:fs/promises';
import { parseStringPromise } from 'xml2js';

export interface WpPostLike {
  title: string;
  link: string;
  pubDate?: string;
  'wp:post_date'?: string;
  'wp:post_type'?: string;
  'wp:post_name'?: string; // slug
  'content:encoded'?: string[];
  'excerpt:encoded'?: string[];
  category?: Array<{ _: string; $: Record<string, string> }>;
}

export async function parseWpXml(filePath: string) {
  const xml = await fs.readFile(filePath, 'utf8');
  const doc = await parseStringPromise(xml, { explicitArray: true, explicitRoot: true });
  return doc;
}

export function extractPosts(doc: any): WpPostLike[] {
  const channel = doc?.rss?.channel?.[0];
  const items: any[] = channel?.item || [];
  return items.filter((it) => it['wp:post_type']?.[0] === 'post') as unknown as WpPostLike[];
}

