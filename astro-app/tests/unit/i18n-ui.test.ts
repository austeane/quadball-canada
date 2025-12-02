import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { t } from '../../src/i18n/ui';

describe('i18n/ui', () => {
  describe('t (translate)', () => {
    describe('English locale', () => {
      it('returns English translation for key', () => {
        expect(t('en', 'nav.announcements')).toBe('Announcements');
        expect(t('en', 'nav.about')).toBe('About Us');
        expect(t('en', 'cta.contact')).toBe('Contact');
      });

      it('returns English navigation items', () => {
        expect(t('en', 'nav.events')).toBe('Events');
        expect(t('en', 'nav.getInvolved')).toBe('Get Involved');
        expect(t('en', 'nav.resources')).toBe('Resources');
      });

      it('returns English CTA labels', () => {
        expect(t('en', 'cta.store')).toBe('Store');
        expect(t('en', 'cta.donate')).toBe('Donate');
      });

      it('returns English hero content', () => {
        expect(t('en', 'hero.title')).toBe('Quadball Canada');
        expect(t('en', 'hero.cta')).toBe('Get Involved');
      });

      it('returns English news translations', () => {
        expect(t('en', 'news.title')).toBe('News & Announcements');
        expect(t('en', 'news.backToNews')).toBe('Back to News');
        expect(t('en', 'news.share')).toBe('Share');
      });
    });

    describe('French locale', () => {
      it('returns French translation for key', () => {
        expect(t('fr', 'nav.announcements')).toBe('Communiques');
        expect(t('fr', 'nav.about')).toBe('A propos');
        expect(t('fr', 'cta.contact')).toBe('Nous joindre');
      });

      it('returns French navigation items', () => {
        expect(t('fr', 'nav.events')).toBe('Evenements');
        expect(t('fr', 'nav.getInvolved')).toBe("S'impliquer");
        expect(t('fr', 'nav.resources')).toBe('Ressources');
      });

      it('returns French CTA labels', () => {
        expect(t('fr', 'cta.store')).toBe('Boutique');
        expect(t('fr', 'cta.donate')).toBe('Faire un don');
      });

      it('returns French hero content', () => {
        expect(t('fr', 'hero.title')).toBe('Quadball Canada');
        expect(t('fr', 'hero.cta')).toBe("S'impliquer");
      });

      it('returns French news translations', () => {
        expect(t('fr', 'news.title')).toBe('Nouvelles et communiqués');
        expect(t('fr', 'news.backToNews')).toBe('Retour aux nouvelles');
        expect(t('fr', 'news.share')).toBe('Partager');
      });
    });

    describe('nested keys', () => {
      it('handles deeply nested navigation keys', () => {
        expect(t('en', 'nav.about.missionValues')).toBe('Mission & Values');
        expect(t('fr', 'nav.about.missionValues')).toBe('Mission et valeurs');

        expect(t('en', 'nav.about.board')).toBe('Meet the Board');
        expect(t('fr', 'nav.about.board')).toBe("Conseil d'administration");

        expect(t('en', 'nav.getInvolved.volunteer')).toBe(
          'Volunteer Opportunities'
        );
        expect(t('fr', 'nav.getInvolved.volunteer')).toBe('Benevolat');
      });

      it('handles contact section keys', () => {
        expect(t('en', 'contact.title')).toBe('Contact Us');
        expect(t('fr', 'contact.title')).toBe('Nous joindre');

        expect(t('en', 'contact.general.title')).toBe('General Inquiries');
        expect(t('fr', 'contact.general.title')).toBe('Demandes générales');
      });
    });

    describe('footer keys', () => {
      it('returns footer translations', () => {
        expect(t('en', 'footer.getInvolved')).toBe('Get Involved');
        expect(t('fr', 'footer.getInvolved')).toBe("S'impliquer");

        expect(t('en', 'footer.followUs')).toBe('Follow Us');
        expect(t('fr', 'footer.followUs')).toBe('Nous suivre');
      });
    });

    describe('layout and utility keys', () => {
      it('returns layout translations', () => {
        expect(t('en', 'layout.skipLink')).toBe('Skip to content');
        expect(t('fr', 'layout.skipLink')).toBe('Aller au contenu');

        expect(t('en', 'layout.languageLabel')).toBe('Language');
        expect(t('fr', 'layout.languageLabel')).toBe('Langue');
      });

      it('returns utility translations', () => {
        expect(t('en', 'utility.search')).toBe('Search');
        expect(t('fr', 'utility.search')).toBe('Recherche');
      });
    });

    describe('events keys', () => {
      it('returns events translations', () => {
        expect(t('en', 'events.upcomingLink')).toBe('View Upcoming Events');
        expect(t('fr', 'events.upcomingLink')).toBe(
          'Voir les événements à venir'
        );

        expect(t('en', 'events.calendarIcs')).toBe('Add to Calendar (ICS)');
        expect(t('fr', 'events.calendarIcs')).toBe(
          'Ajouter au calendrier (ICS)'
        );
      });
    });
  });
});
