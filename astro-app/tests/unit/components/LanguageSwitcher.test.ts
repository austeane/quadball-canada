import { describe, it, expect } from 'vitest';
import { renderToString, renderComponent } from '../../../src/test/helpers';
import LanguageSwitcher from '../../../src/components/layout/LanguageSwitcher.astro';

describe('LanguageSwitcher', () => {
  describe('basic rendering', () => {
    it('renders EN and FR links', async () => {
      const html = await renderToString(LanguageSwitcher, {
        props: { currentPath: '/' },
      });

      expect(html).toContain('>EN</a>');
      expect(html).toContain('>FR</a>');
    });

    it('renders as nav element', async () => {
      const html = await renderToString(LanguageSwitcher, {
        props: { currentPath: '/' },
      });

      expect(html).toContain('<nav');
    });

    it('has lang-switcher class', async () => {
      const html = await renderToString(LanguageSwitcher, {
        props: { currentPath: '/' },
      });

      expect(html).toContain('lang-switcher');
    });

    it('renders separator between languages', async () => {
      const html = await renderToString(LanguageSwitcher, {
        props: { currentPath: '/' },
      });

      // Astro adds data attributes, so check for sep class and content
      expect(html).toContain('class="sep"');
      expect(html).toMatch(/<span[^>]*class="sep"[^>]*>\/</);
    });
  });

  describe('aria attributes', () => {
    it('has aria-label for accessibility', async () => {
      const html = await renderToString(LanguageSwitcher, {
        props: { currentPath: '/' },
      });

      expect(html).toContain('aria-label=');
    });

    it('marks EN as current on English pages', async () => {
      const html = await renderToString(LanguageSwitcher, {
        props: { currentPath: '/news/' },
      });

      expect(html).toContain('data-language-switch="en"');
      expect(html).toMatch(/data-language-switch="en"[^>]*aria-current="true"/);
    });

    it('marks FR as current on French pages', async () => {
      const html = await renderToString(LanguageSwitcher, {
        props: { currentPath: '/fr/nouvelles/' },
      });

      expect(html).toContain('data-language-switch="fr"');
      expect(html).toMatch(/data-language-switch="fr"[^>]*aria-current="true"/);
    });

    it('does not mark FR as current on English pages', async () => {
      const html = await renderToString(LanguageSwitcher, {
        props: { currentPath: '/news/' },
      });

      // FR link should not have aria-current
      expect(html).not.toMatch(
        /data-language-switch="fr"[^>]*aria-current="true"/
      );
    });
  });

  describe('data attributes', () => {
    it('has data-language-switch attribute on EN link', async () => {
      const html = await renderToString(LanguageSwitcher, {
        props: { currentPath: '/' },
      });

      expect(html).toContain('data-language-switch="en"');
    });

    it('has data-language-switch attribute on FR link', async () => {
      const html = await renderToString(LanguageSwitcher, {
        props: { currentPath: '/' },
      });

      expect(html).toContain('data-language-switch="fr"');
    });
  });

  describe('path switching', () => {
    it('EN link points to English version of page', async () => {
      const html = await renderToString(LanguageSwitcher, {
        props: { currentPath: '/fr/nouvelles/' },
      });

      // Should link to English equivalent
      expect(html).toContain('href="/nouvelles/"');
    });

    it('FR link points to French version of page', async () => {
      const html = await renderToString(LanguageSwitcher, {
        props: { currentPath: '/news/' },
      });

      // Should link to French equivalent with /fr/ prefix
      expect(html).toContain('href="/fr/news/"');
    });

    it('handles root path', async () => {
      const html = await renderToString(LanguageSwitcher, {
        props: { currentPath: '/' },
      });

      expect(html).toContain('href="/"');
      expect(html).toContain('href="/fr/"');
    });
  });

  describe('alternate URLs', () => {
    it('uses alternate URLs when provided', async () => {
      const html = await renderToString(LanguageSwitcher, {
        props: {
          currentPath: '/news/my-article/',
          alternate: {
            en: '/news/my-article/',
            fr: '/fr/nouvelles/mon-article/',
          },
        },
      });

      expect(html).toContain('href="/news/my-article/"');
      expect(html).toContain('href="/fr/nouvelles/mon-article/"');
    });

    it('falls back to path switching when alternate is missing target locale', async () => {
      const html = await renderToString(LanguageSwitcher, {
        props: {
          currentPath: '/news/',
          alternate: { en: '/news/' },
        },
      });

      // Should fall back to computed French path
      expect(html).toContain('href="/fr/news/"');
    });
  });

  describe('DOM structure', () => {
    it('creates proper link elements', async () => {
      const doc = await renderComponent(LanguageSwitcher, {
        props: { currentPath: '/' },
      });

      const links = doc.querySelectorAll('a.lang');
      expect(links.length).toBe(2);
    });
  });
});
