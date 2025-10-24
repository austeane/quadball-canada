import type { Locale } from "../utils/localization";

export const SUPPORTED_LOCALES = ["en", "fr"] as const;

export const DEFAULT_LOCALE: Locale = "en";

const FR_PREFIX = "/fr";

function normalizePath(path: string): string {
  if (!path) return "/";
  if (!path.startsWith("/")) return `/${path}`;
  return path.endsWith("/") ? path : `${path}/`;
}

export function inferLocaleFromPath(path: string | undefined | null): Locale {
  if (!path) return DEFAULT_LOCALE;
  const normalized = normalizePath(path);
  return normalized === `${FR_PREFIX}/` || normalized.startsWith(`${FR_PREFIX}/`)
    ? "fr"
    : DEFAULT_LOCALE;
}

export function getAlternatePath(
  currentPath: string,
  targetLocale: Locale
): string {
  const normalized = normalizePath(currentPath);
  const isFrench = normalized === `${FR_PREFIX}/` || normalized.startsWith(`${FR_PREFIX}/`);

  if (targetLocale === "fr") {
    if (isFrench) return normalized;
    if (normalized === "/") return `${FR_PREFIX}/`;
    return `${FR_PREFIX}${normalized}`.replace(/\/{2,}/g, "/");
  }

  if (!isFrench) return normalized;

  const remainder = normalized.slice(FR_PREFIX.length);
  return remainder === "" ? "/" : remainder;
}

export function ensureLeadingSlash(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function ensureTrailingSlash(path: string): string {
  if (!path) return "/";
  return path.endsWith("/") ? path : `${path}/`;
}
