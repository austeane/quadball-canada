import { JSDOM } from 'jsdom';

export function stripHtml(html?: string): string {
  if (!html) return '';
  const dom = new JSDOM(`<div>${html}</div>`);
  return dom.window.document.body.textContent || '';
}

export function sanitizeDiviContent(html: string): string {
  // Minimal fallback: remove Divi shortcodes and keep inner HTML when possible
  return html
    .replace(/\[(\/)?et_pb_[^\]]*\]/g, '')
    .replace(/\[(\/)?et_[^\]]*\]/g, '');
}

