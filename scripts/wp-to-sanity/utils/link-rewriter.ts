export function normalizeSlug(slug?: string): string {
  if (!slug) return '';
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function rewriteInternalLinks(html: string): string {
  // Rewrite common WordPress path patterns to new `/news/` structure
  return html.replace(/href=\"https?:\/\/[^\"]+\/(\d{4})\/(\d{2})\/([^\"/]+)\/?\"/g, 'href="/news/$3"');
}

