import { sanitizeDiviContent } from './sanitize-html';

export function convertDiviShortcodesToHtml(input: string): string {
  // For now we strip divi shortcodes; post-launch can add a richer converter
  return sanitizeDiviContent(input);
}

