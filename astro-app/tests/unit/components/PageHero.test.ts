import { describe, it, expect } from 'vitest';
import { renderToString, renderComponent } from '../../../src/test/helpers';
import PageHero from '../../../src/components/sections/PageHero.astro';

describe('PageHero', () => {
  describe('title', () => {
    it('renders title as h1', async () => {
      const html = await renderToString(PageHero, {
        props: { title: 'Test Page Title' },
      });

      expect(html).toContain('<h1');
      expect(html).toContain('Test Page Title');
      expect(html).toContain('</h1>');
    });

    it('has pagehero__title class', async () => {
      const html = await renderToString(PageHero, {
        props: { title: 'Test Title' },
      });

      expect(html).toContain('pagehero__title');
    });
  });

  describe('subtitle', () => {
    it('renders subtitle when provided', async () => {
      const html = await renderToString(PageHero, {
        props: { title: 'Title', subtitle: 'This is a subtitle' },
      });

      expect(html).toContain('This is a subtitle');
    });

    it('does not render subtitle element when not provided', async () => {
      const html = await renderToString(PageHero, {
        props: { title: 'Title' },
      });

      expect(html).not.toContain('pagehero__sub');
    });

    it('has pagehero__sub class', async () => {
      const html = await renderToString(PageHero, {
        props: { title: 'Title', subtitle: 'Subtitle' },
      });

      expect(html).toContain('pagehero__sub');
    });
  });

  describe('CTA button', () => {
    it('renders CTA when both text and href provided', async () => {
      const html = await renderToString(PageHero, {
        props: {
          title: 'Title',
          ctaText: 'Get Started',
          ctaHref: '/start/',
        },
      });

      expect(html).toContain('Get Started');
      expect(html).toContain('href="/start/"');
    });

    it('does not render CTA when text is missing', async () => {
      const html = await renderToString(PageHero, {
        props: {
          title: 'Title',
          ctaHref: '/start/',
        },
      });

      expect(html).not.toContain('btn--hero');
    });

    it('does not render CTA when href is missing', async () => {
      const html = await renderToString(PageHero, {
        props: {
          title: 'Title',
          ctaText: 'Get Started',
        },
      });

      expect(html).not.toContain('btn--hero');
    });

    it('has btn--hero class', async () => {
      const html = await renderToString(PageHero, {
        props: {
          title: 'Title',
          ctaText: 'Click Me',
          ctaHref: '/click/',
        },
      });

      expect(html).toContain('btn btn--hero');
    });
  });

  describe('image', () => {
    it('uses default hero image when no image provided', async () => {
      const html = await renderToString(PageHero, {
        props: { title: 'Title' },
      });

      expect(html).toContain('src="/hero-cover.jpg"');
    });

    it('uses string image URL when provided', async () => {
      const html = await renderToString(PageHero, {
        props: { title: 'Title', image: '/custom-hero.jpg' },
      });

      expect(html).toContain('src="/custom-hero.jpg"');
    });

    it('renders image with proper attributes', async () => {
      const html = await renderToString(PageHero, {
        props: { title: 'Title' },
      });

      expect(html).toContain('width="1920"');
      expect(html).toContain('height="560"');
      expect(html).toContain('loading="eager"');
      expect(html).toContain('decoding="async"');
    });

    it('has pagehero__img class', async () => {
      const html = await renderToString(PageHero, {
        props: { title: 'Title' },
      });

      expect(html).toContain('pagehero__img');
    });

    it('has empty alt for decorative image', async () => {
      const html = await renderToString(PageHero, {
        props: { title: 'Title' },
      });

      expect(html).toContain('alt=""');
    });
  });

  describe('structure', () => {
    it('renders as section element', async () => {
      const html = await renderToString(PageHero, {
        props: { title: 'Title' },
      });

      expect(html).toContain('<section');
    });

    it('has pagehero class', async () => {
      const html = await renderToString(PageHero, {
        props: { title: 'Title' },
      });

      expect(html).toContain('class="pagehero"');
    });

    it('has overlay for text contrast', async () => {
      const html = await renderToString(PageHero, {
        props: { title: 'Title' },
      });

      expect(html).toContain('pagehero__overlay');
    });

    it('has content container', async () => {
      const html = await renderToString(PageHero, {
        props: { title: 'Title' },
      });

      expect(html).toContain('pagehero__content');
    });
  });

  describe('full example', () => {
    it('renders complete hero with all props', async () => {
      const html = await renderToString(PageHero, {
        props: {
          title: 'Welcome to Quadball Canada',
          subtitle: 'Growing the sport across Canada',
          ctaText: 'Join Now',
          ctaHref: '/join/',
          image: '/welcome-hero.jpg',
        },
      });

      expect(html).toContain('Welcome to Quadball Canada');
      expect(html).toContain('Growing the sport across Canada');
      expect(html).toContain('Join Now');
      expect(html).toContain('href="/join/"');
      expect(html).toContain('src="/welcome-hero.jpg"');
    });
  });

  describe('DOM structure', () => {
    it('creates proper hierarchy', async () => {
      const doc = await renderComponent(PageHero, {
        props: { title: 'Test' },
      });

      const section = doc.querySelector('section.pagehero');
      expect(section).not.toBeNull();

      const img = doc.querySelector('.pagehero__img');
      expect(img).not.toBeNull();

      const overlay = doc.querySelector('.pagehero__overlay');
      expect(overlay).not.toBeNull();

      const content = doc.querySelector('.pagehero__content');
      expect(content).not.toBeNull();

      const h1 = doc.querySelector('h1.pagehero__title');
      expect(h1).not.toBeNull();
    });
  });
});
