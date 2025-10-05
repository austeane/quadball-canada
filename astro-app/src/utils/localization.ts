export type Locale = 'en' | 'fr';

export type LocalizedValue<T> = Partial<Record<Locale, T>>;

const DEFAULT_LOCALE: Locale = 'en';

export function pickLocalizedValue<T>(
  value: LocalizedValue<T> | undefined,
  locale: Locale = DEFAULT_LOCALE,
  fallback: Locale = DEFAULT_LOCALE
): T | undefined {
  if (!value) return undefined;
  return value[locale] ?? value[fallback];
}

export function pickLocalizedString(
  value: LocalizedValue<string> | undefined,
  locale: Locale = DEFAULT_LOCALE,
  fallback: Locale = DEFAULT_LOCALE
): string {
  return pickLocalizedValue(value, locale, fallback) ?? '';
}

export interface LocalizedSlugValue {
  current: string;
}

export function pickLocalizedSlug(
  value: LocalizedValue<LocalizedSlugValue> | undefined,
  locale: Locale = DEFAULT_LOCALE,
  fallback: Locale = DEFAULT_LOCALE
): string {
  return pickLocalizedValue(value, locale, fallback)?.current ?? '';
}
