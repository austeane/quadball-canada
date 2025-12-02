import { describe, it, expect } from 'vitest';
import {
  pickLocalizedValue,
  pickLocalizedString,
  pickLocalizedSlug,
} from '../../src/utils/localization';

describe('utils/localization', () => {
  describe('pickLocalizedValue', () => {
    it('returns value for requested locale', () => {
      const value = { en: 'Hello', fr: 'Bonjour' };
      expect(pickLocalizedValue(value, 'en')).toBe('Hello');
      expect(pickLocalizedValue(value, 'fr')).toBe('Bonjour');
    });

    it('falls back to default locale when requested missing', () => {
      const value = { en: 'Hello' };
      expect(pickLocalizedValue(value, 'fr', 'en')).toBe('Hello');
    });

    it('returns undefined for undefined value', () => {
      expect(pickLocalizedValue(undefined, 'en')).toBeUndefined();
    });

    it('returns undefined when both locales missing', () => {
      const value = {};
      expect(pickLocalizedValue(value, 'fr', 'en')).toBeUndefined();
    });

    it('uses en as default fallback', () => {
      const value = { en: 'English only' };
      expect(pickLocalizedValue(value, 'fr')).toBe('English only');
    });
  });

  describe('pickLocalizedString', () => {
    it('returns empty string instead of undefined', () => {
      expect(pickLocalizedString(undefined, 'en')).toBe('');
    });

    it('returns empty string when locale missing and no fallback', () => {
      const value = {};
      expect(pickLocalizedString(value, 'fr', 'en')).toBe('');
    });

    it('returns localized string', () => {
      const value = { en: 'Hello', fr: 'Bonjour' };
      expect(pickLocalizedString(value, 'en')).toBe('Hello');
      expect(pickLocalizedString(value, 'fr')).toBe('Bonjour');
    });

    it('falls back to default locale', () => {
      const value = { en: 'Hello' };
      expect(pickLocalizedString(value, 'fr')).toBe('Hello');
    });
  });

  describe('pickLocalizedSlug', () => {
    it('extracts current from slug object', () => {
      const value = {
        en: { current: 'hello-world' },
        fr: { current: 'bonjour-monde' },
      };
      expect(pickLocalizedSlug(value, 'en')).toBe('hello-world');
      expect(pickLocalizedSlug(value, 'fr')).toBe('bonjour-monde');
    });

    it('returns empty string for missing slug', () => {
      expect(pickLocalizedSlug(undefined, 'en')).toBe('');
    });

    it('falls back to default locale', () => {
      const value = {
        en: { current: 'hello-world' },
      };
      expect(pickLocalizedSlug(value, 'fr')).toBe('hello-world');
    });

    it('returns empty string when slug object has no current', () => {
      const value = {
        en: {} as { current: string },
      };
      expect(pickLocalizedSlug(value, 'en')).toBe('');
    });
  });
});
