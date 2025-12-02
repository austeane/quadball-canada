import { describe, it, expect } from 'vitest';
import {
  inferLocaleFromPath,
  getAlternatePath,
  ensureLeadingSlash,
  ensureTrailingSlash,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from '../../src/i18n/config';

describe('i18n/config', () => {
  describe('constants', () => {
    it('has correct default locale', () => {
      expect(DEFAULT_LOCALE).toBe('en');
    });

    it('supports en and fr locales', () => {
      expect(SUPPORTED_LOCALES).toContain('en');
      expect(SUPPORTED_LOCALES).toContain('fr');
      expect(SUPPORTED_LOCALES).toHaveLength(2);
    });
  });

  describe('inferLocaleFromPath', () => {
    it('returns fr for French paths', () => {
      expect(inferLocaleFromPath('/fr/')).toBe('fr');
      expect(inferLocaleFromPath('/fr/nouvelles/')).toBe('fr');
      expect(inferLocaleFromPath('/fr/a-propos/')).toBe('fr');
    });

    it('returns en for English paths', () => {
      expect(inferLocaleFromPath('/')).toBe('en');
      expect(inferLocaleFromPath('/news/')).toBe('en');
      expect(inferLocaleFromPath('/about/')).toBe('en');
    });

    it('handles paths without trailing slash', () => {
      expect(inferLocaleFromPath('/fr')).toBe('fr');
      expect(inferLocaleFromPath('/news')).toBe('en');
    });

    it('handles null/undefined paths', () => {
      expect(inferLocaleFromPath(null)).toBe('en');
      expect(inferLocaleFromPath(undefined)).toBe('en');
    });

    it('handles empty string', () => {
      expect(inferLocaleFromPath('')).toBe('en');
    });
  });

  describe('getAlternatePath', () => {
    describe('converting EN to FR', () => {
      it('converts root path', () => {
        expect(getAlternatePath('/', 'fr')).toBe('/fr/');
      });

      it('converts simple paths', () => {
        expect(getAlternatePath('/news/', 'fr')).toBe('/fr/news/');
        expect(getAlternatePath('/about/', 'fr')).toBe('/fr/about/');
      });

      it('converts nested paths', () => {
        expect(getAlternatePath('/about/meet-the-board/', 'fr')).toBe(
          '/fr/about/meet-the-board/'
        );
      });

      it('handles paths without trailing slash', () => {
        expect(getAlternatePath('/news', 'fr')).toBe('/fr/news/');
      });
    });

    describe('converting FR to EN', () => {
      it('converts root French path', () => {
        expect(getAlternatePath('/fr/', 'en')).toBe('/');
      });

      it('converts French paths to English', () => {
        expect(getAlternatePath('/fr/nouvelles/', 'en')).toBe('/nouvelles/');
        expect(getAlternatePath('/fr/a-propos/', 'en')).toBe('/a-propos/');
      });
    });

    describe('same locale', () => {
      it('returns same path when target is current locale', () => {
        expect(getAlternatePath('/news/', 'en')).toBe('/news/');
        expect(getAlternatePath('/fr/nouvelles/', 'fr')).toBe('/fr/nouvelles/');
      });
    });
  });

  describe('ensureLeadingSlash', () => {
    it('adds leading slash if missing', () => {
      expect(ensureLeadingSlash('news')).toBe('/news');
      expect(ensureLeadingSlash('about/team')).toBe('/about/team');
    });

    it('preserves existing leading slash', () => {
      expect(ensureLeadingSlash('/news')).toBe('/news');
      expect(ensureLeadingSlash('/about/team')).toBe('/about/team');
    });
  });

  describe('ensureTrailingSlash', () => {
    it('adds trailing slash if missing', () => {
      expect(ensureTrailingSlash('/news')).toBe('/news/');
      expect(ensureTrailingSlash('/about/team')).toBe('/about/team/');
    });

    it('preserves existing trailing slash', () => {
      expect(ensureTrailingSlash('/news/')).toBe('/news/');
      expect(ensureTrailingSlash('/about/team/')).toBe('/about/team/');
    });

    it('handles empty string', () => {
      expect(ensureTrailingSlash('')).toBe('/');
    });
  });
});
