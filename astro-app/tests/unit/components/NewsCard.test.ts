import { describe, it, expect } from 'vitest';
import { renderToString } from '../../../src/test/helpers';
import NewsCard from '../../../src/components/content/NewsCard.astro';
import type { NewsArticleSummary } from '../../../src/utils/sanity';

const mockArticle: NewsArticleSummary = {
  _id: 'test-1',
  slug: 'test-article',
  title: 'Test Article Title',
  excerpt: 'This is a test excerpt.',
  publishedAt: '2025-03-15T12:00:00Z',
  featuredImage: null,
};

const mockArticleWithImage: NewsArticleSummary = {
  ...mockArticle,
  featuredImage: {
    _type: 'image',
    asset: { _ref: 'image-abc123' } as any,
    alt: 'Test image alt text',
  },
};

describe('NewsCard', () => {
  describe('basic rendering', () => {
    it('renders article title', async () => {
      const html = await renderToString(NewsCard, {
        props: { article: mockArticle },
      });

      expect(html).toContain('Test Article Title');
    });

    it('renders article excerpt when provided', async () => {
      const html = await renderToString(NewsCard, {
        props: { article: mockArticle },
      });

      expect(html).toContain('This is a test excerpt.');
    });

    it('does not render excerpt when not provided', async () => {
      const articleWithoutExcerpt = { ...mockArticle, excerpt: undefined };
      const html = await renderToString(NewsCard, {
        props: { article: articleWithoutExcerpt },
      });

      expect(html).not.toContain('card__excerpt');
    });

    it('renders formatted publish date', async () => {
      const html = await renderToString(NewsCard, {
        props: { article: mockArticle },
      });

      // The date should be formatted - checking for parts
      expect(html).toContain('March');
      expect(html).toContain('15');
      expect(html).toContain('2025');
    });
  });

  describe('links', () => {
    it('links to English news path by default', async () => {
      const html = await renderToString(NewsCard, {
        props: { article: mockArticle },
      });

      expect(html).toContain('href="/news/test-article/"');
    });

    it('links to French news path when locale is fr', async () => {
      const html = await renderToString(NewsCard, {
        props: { article: mockArticle, locale: 'fr' },
      });

      expect(html).toContain('href="/fr/nouvelles/test-article/"');
    });
  });

  describe('images', () => {
    it('renders placeholder when no featured image', async () => {
      const html = await renderToString(NewsCard, {
        props: { article: mockArticle },
      });

      expect(html).toContain('card__cover--none');
    });

    it('renders image when featured image is provided', async () => {
      const html = await renderToString(NewsCard, {
        props: { article: mockArticleWithImage },
      });

      expect(html).toContain('<img');
      expect(html).toContain('class="card__cover"');
    });

    it('includes image alt text', async () => {
      const html = await renderToString(NewsCard, {
        props: { article: mockArticleWithImage },
      });

      expect(html).toContain('alt="Test image alt text"');
    });

    it('uses empty alt when no alt text provided', async () => {
      const articleWithImageNoAlt: NewsArticleSummary = {
        ...mockArticle,
        featuredImage: {
          _type: 'image',
          asset: { _ref: 'image-abc123' } as any,
        },
      };
      const html = await renderToString(NewsCard, {
        props: { article: articleWithImageNoAlt },
      });

      // Astro renders empty string alt as just "alt" without quotes
      // Check that alt attribute exists with empty or no value
      expect(html).toMatch(/alt(?:="")?\s|alt(?:="")?\s*>/);
    });
  });

  describe('featured mode', () => {
    it('does not add featured class by default', async () => {
      const html = await renderToString(NewsCard, {
        props: { article: mockArticle },
      });

      expect(html).not.toContain('card--featured');
    });

    it('adds featured class when featured prop is true', async () => {
      const html = await renderToString(NewsCard, {
        props: { article: mockArticle, featured: true },
      });

      expect(html).toContain('card--featured');
    });
  });

  describe('article element', () => {
    it('renders as article element', async () => {
      const html = await renderToString(NewsCard, {
        props: { article: mockArticle },
      });

      expect(html).toContain('<article');
    });

    it('has card class', async () => {
      const html = await renderToString(NewsCard, {
        props: { article: mockArticle },
      });

      expect(html).toContain('class="card"');
    });
  });
});
