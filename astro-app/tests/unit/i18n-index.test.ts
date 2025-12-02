import { describe, it, expect } from 'vitest';
import {
  resolveLocale,
  localizedPath,
  switchLocalePath,
} from '../../src/i18n/index';

describe('i18n/index', () => {
  describe('resolveLocale', () => {
    it('returns explicit locale when provided', () => {
      const astro = { props: {}, url: new URL('http://localhost/') };
      expect(resolveLocale(astro, 'fr')).toBe('fr');
      expect(resolveLocale(astro, 'en')).toBe('en');
    });

    it('returns locale from props when available', () => {
      const astro = {
        props: { locale: 'fr' as const },
        url: new URL('http://localhost/news/'),
      };
      expect(resolveLocale(astro)).toBe('fr');
    });

    it('infers locale from URL path when no props', () => {
      const astroEn = {
        props: {},
        url: new URL('http://localhost/news/'),
      };
      const astroFr = {
        props: {},
        url: new URL('http://localhost/fr/nouvelles/'),
      };
      expect(resolveLocale(astroEn)).toBe('en');
      expect(resolveLocale(astroFr)).toBe('fr');
    });

    it('returns en when URL is undefined', () => {
      const astro = { props: {}, url: undefined as unknown as URL };
      expect(resolveLocale(astro)).toBe('en');
    });

    it('ignores invalid locale in props', () => {
      const astro = {
        props: { locale: 'de' as unknown },
        url: new URL('http://localhost/fr/'),
      };
      expect(resolveLocale(astro)).toBe('fr');
    });
  });

  describe('localizedPath', () => {
    it('returns path for requested locale', () => {
      const slugs = { en: 'hello-world', fr: 'bonjour-monde' };
      expect(localizedPath(slugs, 'en')).toBe('/hello-world/');
      expect(localizedPath(slugs, 'fr')).toBe('/bonjour-monde/');
    });

    it('falls back to default locale when requested missing', () => {
      const slugs = { en: 'hello-world' };
      expect(localizedPath(slugs, 'fr')).toBe('/hello-world/');
    });

    it('returns undefined for undefined slugs', () => {
      expect(localizedPath(undefined, 'en')).toBeUndefined();
    });

    it('returns undefined when neither locale has value', () => {
      const slugs = {};
      expect(localizedPath(slugs, 'fr')).toBeUndefined();
    });

    it('ensures leading and trailing slashes', () => {
      const slugs = { en: 'no-slashes' };
      expect(localizedPath(slugs, 'en')).toBe('/no-slashes/');
    });

    it('handles slugs with existing slashes', () => {
      const slugs = { en: '/has-slashes/' };
      expect(localizedPath(slugs, 'en')).toBe('/has-slashes/');
    });
  });

  describe('switchLocalePath', () => {
    describe('with alternate URLs', () => {
      it('uses alternate URL when provided', () => {
        const alternate = {
          en: '/news/my-article/',
          fr: '/fr/nouvelles/mon-article/',
        };
        expect(switchLocalePath('/news/my-article/', 'fr', alternate)).toBe(
          '/fr/nouvelles/mon-article/'
        );
      });

      it('returns absolute URLs as-is', () => {
        const alternate = {
          en: '/',
          fr: 'https://example.com/fr/',
        };
        expect(switchLocalePath('/', 'fr', alternate)).toBe(
          'https://example.com/fr/'
        );
      });

      it('returns protocol-relative URLs as-is', () => {
        const alternate = {
          en: '/',
          fr: '//cdn.example.com/fr/',
        };
        expect(switchLocalePath('/', 'fr', alternate)).toBe(
          '//cdn.example.com/fr/'
        );
      });

      it('preserves query strings from alternate', () => {
        const alternate = {
          en: '/search',
          fr: '/fr/recherche?q=test',
        };
        expect(switchLocalePath('/search', 'fr', alternate)).toBe(
          '/fr/recherche/?q=test'
        );
      });

      it('preserves hash from alternate', () => {
        const alternate = {
          en: '/about',
          fr: '/fr/a-propos#section',
        };
        expect(switchLocalePath('/about', 'fr', alternate)).toBe(
          '/fr/a-propos/#section'
        );
      });

      it('ensures slashes on alternate paths', () => {
        const alternate = {
          en: 'news',
          fr: 'fr/nouvelles',
        };
        expect(switchLocalePath('/news/', 'fr', alternate)).toBe(
          '/fr/nouvelles/'
        );
      });
    });

    describe('without alternate URLs', () => {
      it('falls back to getAlternatePath', () => {
        expect(switchLocalePath('/news/', 'fr')).toBe('/fr/news/');
        expect(switchLocalePath('/fr/nouvelles/', 'en')).toBe('/nouvelles/');
      });

      it('handles root path', () => {
        expect(switchLocalePath('/', 'fr')).toBe('/fr/');
        expect(switchLocalePath('/fr/', 'en')).toBe('/');
      });
    });

    describe('with empty alternate', () => {
      it('falls back when alternate is empty object', () => {
        expect(switchLocalePath('/news/', 'fr', {})).toBe('/fr/news/');
      });

      it('falls back when target locale missing from alternate', () => {
        const alternate = { en: '/news/' };
        expect(switchLocalePath('/news/', 'fr', alternate)).toBe('/fr/news/');
      });
    });
  });
});
