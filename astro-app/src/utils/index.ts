import type { Locale } from "./sanity";

export function formatDate(date: string, locale: Locale = "en") {
  const intlLocale = locale === "fr" ? "fr-CA" : "en-CA";
  return new Date(date).toLocaleDateString(intlLocale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Browser tab title: an editor's custom title, or "<page title> — Quadball Canada". */
export function pageTitle(title: string, customTitle?: string | null): string {
  return customTitle || `${title} — Quadball Canada`;
}
