import type { AstroGlobal } from "astro";
import type { Locale, LocalizedValue } from "../utils/localization";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  ensureLeadingSlash,
  ensureTrailingSlash,
  getAlternatePath,
  inferLocaleFromPath,
} from "./config";

export { DEFAULT_LOCALE, SUPPORTED_LOCALES, getAlternatePath, inferLocaleFromPath };

export function resolveLocale(
  astro: Pick<AstroGlobal, "props" | "url">,
  explicit?: Locale
): Locale {
  if (explicit) return explicit;
  const propLocale = (astro.props as { locale?: Locale } | undefined)?.locale;
  if (propLocale && SUPPORTED_LOCALES.includes(propLocale)) {
    return propLocale;
  }
  return inferLocaleFromPath(astro.url?.pathname);
}

export function localizedPath(
  slugs: LocalizedValue<string> | undefined,
  locale: Locale,
  fallback: Locale = DEFAULT_LOCALE
): string | undefined {
  if (!slugs) return undefined;
  const preferred = slugs[locale] ?? slugs[fallback];
  if (!preferred) return undefined;
  return ensureTrailingSlash(ensureLeadingSlash(preferred));
}

export function switchLocalePath(
  currentPath: string,
  targetLocale: Locale,
  alternate?: Partial<Record<Locale, string>>
): string {
  const alt = alternate?.[targetLocale];
  if (alt) {
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(alt) || alt.startsWith("//")) {
      return alt;
    }
    const splitIndex = alt.search(/[?#]/);
    const pathPart = splitIndex === -1 ? alt : alt.slice(0, splitIndex);
    const tail = splitIndex === -1 ? "" : alt.slice(splitIndex);
    return ensureTrailingSlash(ensureLeadingSlash(pathPart)) + tail;
  }
  return getAlternatePath(currentPath, targetLocale);
}
