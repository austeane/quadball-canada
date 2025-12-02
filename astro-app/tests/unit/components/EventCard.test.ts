import { describe, it, expect } from 'vitest';
import { renderToString } from '../../../src/test/helpers';
import EventCard from '../../../src/components/content/EventCard.astro';
import type { EventSummary } from '../../../src/utils/sanity';

const mockEvent: EventSummary = {
  _id: 'event-1',
  slug: 'nationals-2025',
  title: 'Canadian Nationals 2025',
  startDateTime: '2025-08-15T09:00:00-04:00',
  endDateTime: '2025-08-17T18:00:00-04:00',
  timezone: 'America/Toronto',
};

describe('EventCard', () => {
  describe('basic rendering', () => {
    it('renders event title', async () => {
      const html = await renderToString(EventCard, {
        props: { event: mockEvent },
      });

      expect(html).toContain('Canadian Nationals 2025');
    });

    it('renders formatted start date', async () => {
      const html = await renderToString(EventCard, {
        props: { event: mockEvent },
      });

      // The date should be formatted
      expect(html).toContain('August');
      expect(html).toContain('15');
      expect(html).toContain('2025');
    });

    it('renders as article element', async () => {
      const html = await renderToString(EventCard, {
        props: { event: mockEvent },
      });

      expect(html).toContain('<article');
    });
  });

  describe('links', () => {
    it('links to English events path by default', async () => {
      const html = await renderToString(EventCard, {
        props: { event: mockEvent },
      });

      expect(html).toContain('href="/events/nationals-2025"');
    });

    it('links to French events path when locale is fr', async () => {
      const html = await renderToString(EventCard, {
        props: { event: mockEvent, locale: 'fr' },
      });

      expect(html).toContain('href="/fr/evenements/nationals-2025"');
    });

    it('uses custom basePath when provided', async () => {
      const html = await renderToString(EventCard, {
        props: { event: mockEvent, basePath: '/custom/path/' },
      });

      expect(html).toContain('href="/custom/path/nationals-2025"');
    });

    it('normalizes basePath with trailing slash', async () => {
      const html = await renderToString(EventCard, {
        props: { event: mockEvent, basePath: '/custom/path' },
      });

      expect(html).toContain('href="/custom/path/nationals-2025"');
    });
  });

  describe('localization', () => {
    it('formats date in English for en locale', async () => {
      const html = await renderToString(EventCard, {
        props: { event: mockEvent, locale: 'en' },
      });

      expect(html).toContain('August');
    });

    it('formats date in French for fr locale', async () => {
      const html = await renderToString(EventCard, {
        props: { event: mockEvent, locale: 'fr' },
      });

      // French month name
      expect(html).toContain('août');
    });
  });

  describe('CSS classes', () => {
    it('has card class', async () => {
      const html = await renderToString(EventCard, {
        props: { event: mockEvent },
      });

      expect(html).toContain('class="card"');
    });

    it('has card__title class on title', async () => {
      const html = await renderToString(EventCard, {
        props: { event: mockEvent },
      });

      expect(html).toContain('card__title');
    });

    it('has card__link class on link', async () => {
      const html = await renderToString(EventCard, {
        props: { event: mockEvent },
      });

      expect(html).toContain('card__link');
    });

    it('has card__date class on date', async () => {
      const html = await renderToString(EventCard, {
        props: { event: mockEvent },
      });

      expect(html).toContain('card__date');
    });
  });
});
