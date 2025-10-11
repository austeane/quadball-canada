import type { Locale } from "./sanity";

export function formatDate(date: string, locale: Locale = "en") {
  const intlLocale = locale === "fr" ? "fr-CA" : "en-CA";
  return new Date(date).toLocaleDateString(intlLocale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
