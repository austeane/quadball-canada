import { describe, it, expect } from 'vitest';
import { t } from '../../src/i18n/ui';

// Page copy lives in Sanity; ui.ts only holds interface labels shared across pages.
describe('i18n/ui', () => {
  describe('t (translate)', () => {
    describe('English locale', () => {
      it('returns header button labels', () => {
        expect(t('en', 'cta.contact')).toBe('Contact');
        expect(t('en', 'cta.store')).toBe('Store');
        expect(t('en', 'cta.donate')).toBe('Donate');
      });

      it('returns news labels', () => {
        expect(t('en', 'news.backToNews')).toBe('Back to News');
        expect(t('en', 'news.share')).toBe('Share');
      });
    });

    describe('French locale', () => {
      it('returns header button labels', () => {
        expect(t('fr', 'cta.contact')).toBe('Nous joindre');
        expect(t('fr', 'cta.store')).toBe('Boutique');
        expect(t('fr', 'cta.donate')).toBe('Faire un don');
      });

      it('returns news labels', () => {
        expect(t('fr', 'news.backToNews')).toBe('Retour aux nouvelles');
        expect(t('fr', 'news.share')).toBe('Partager');
      });
    });

    describe('footer keys', () => {
      it('returns footer translations', () => {
        expect(t('en', 'footer.followUs')).toBe('Follow Us');
        expect(t('fr', 'footer.followUs')).toBe('Nous suivre');

        expect(t('en', 'footer.contact')).toBe('Contact Us');
        expect(t('fr', 'footer.contact')).toBe('Nous joindre');
      });
    });

    describe('layout keys', () => {
      it('returns layout translations', () => {
        expect(t('en', 'layout.skipLink')).toBe('Skip to content');
        expect(t('fr', 'layout.skipLink')).toBe('Aller au contenu');

        expect(t('en', 'layout.languageLabel')).toBe('Language');
        expect(t('fr', 'layout.languageLabel')).toBe('Langue');
      });
    });

    describe('events keys', () => {
      it('returns events translations', () => {
        expect(t('en', 'events.upcomingLink')).toBe('View Upcoming Events');
        expect(t('fr', 'events.upcomingLink')).toBe('Voir les événements à venir');

        expect(t('en', 'events.calendarIcs')).toBe('Add to Calendar (ICS)');
        expect(t('fr', 'events.calendarIcs')).toBe('Ajouter au calendrier (ICS)');
      });

      it('returns event bid status labels', () => {
        expect(t('en', 'eventBids.status.open')).toBe('Open');
        expect(t('fr', 'eventBids.status.open')).toBe('Ouvert');
      });
    });
  });
});
