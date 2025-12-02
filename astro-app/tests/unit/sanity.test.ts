import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanityClient } from 'sanity:client';
import {
  getNewsArticles,
  getNewsArticle,
  getRelatedNewsArticles,
  getEvents,
  getUpcomingEvents,
  getEvent,
  getTeams,
  getTeamsPage,
  getVolunteerOpportunities,
  getInfoArticles,
  getInfoArticle,
  getStaff,
  getBoardMembers,
  getResourceArticles,
  getResourceArticle,
  getAboutPage,
  getNationalTeamPage,
  getPageSettings,
  getPolicies,
  getPoliciesByCategory,
  getLandingSection,
  urlForImage,
} from '../../src/utils/sanity';
import {
  mockNewsArticlesList,
  mockNewsArticleDetail,
  mockEventsList,
  mockUpcomingEventsList,
  mockEventDetail,
  mockTeamsList,
  mockTeamsPageData,
  mockVolunteerOpportunitiesList,
  mockInfoArticlesList,
  mockInfoArticleDetail,
  mockStaffList,
  mockBoardMembersList,
  mockResourceArticlesList,
  mockResourceArticleDetail,
  mockAboutPageData,
  mockNationalTeamPage,
  mockPageSettings,
  mockPoliciesList,
  mockLandingSection,
} from '../fixtures/sanity';

// Type the mocked fetch function
const mockFetch = sanityClient.fetch as ReturnType<typeof vi.fn>;

describe('sanity.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('urlForImage', () => {
    it('returns null for null source', () => {
      expect(urlForImage(null)).toBeNull();
    });

    it('returns null for undefined source', () => {
      expect(urlForImage(undefined)).toBeNull();
    });

    it('returns null when asset is missing', () => {
      const source = { _type: 'image' as const } as any;
      expect(urlForImage(source)).toBeNull();
    });
  });

  describe('getNewsArticles', () => {
    it('fetches news articles in English by default', async () => {
      mockFetch.mockResolvedValueOnce(mockNewsArticlesList);

      const result = await getNewsArticles();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('newsArticle'),
        { locale: 'en' }
      );
      expect(result).toEqual(mockNewsArticlesList);
      expect(result).toHaveLength(3);
    });

    it('fetches news articles in French when specified', async () => {
      mockFetch.mockResolvedValueOnce(mockNewsArticlesList);

      await getNewsArticles('fr');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('newsArticle'),
        { locale: 'fr' }
      );
    });

    it('returns empty array when no articles exist', async () => {
      mockFetch.mockResolvedValueOnce([]);

      const result = await getNewsArticles();

      expect(result).toEqual([]);
    });
  });

  describe('getNewsArticle', () => {
    it('fetches single article by slug in English', async () => {
      mockFetch.mockResolvedValueOnce(mockNewsArticleDetail);

      const result = await getNewsArticle('test-article');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('newsArticle'),
        { slug: 'test-article', locale: 'en' }
      );
      expect(result).toEqual(mockNewsArticleDetail);
      expect(result?.slugEn).toBe('test-article');
      expect(result?.slugFr).toBe('article-test');
    });

    it('fetches single article by slug in French', async () => {
      mockFetch.mockResolvedValueOnce(mockNewsArticleDetail);

      await getNewsArticle('article-test', 'fr');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('newsArticle'),
        { slug: 'article-test', locale: 'fr' }
      );
    });

    it('returns null when article not found', async () => {
      mockFetch.mockResolvedValueOnce(null);

      const result = await getNewsArticle('non-existent');

      expect(result).toBeNull();
    });

    it('defaults content to empty array when null', async () => {
      mockFetch.mockResolvedValueOnce({
        ...mockNewsArticleDetail,
        content: null,
      });

      const result = await getNewsArticle('test-article');

      expect(result?.content).toEqual([]);
    });
  });

  describe('getRelatedNewsArticles', () => {
    it('fetches related articles excluding current article', async () => {
      const relatedArticles = mockNewsArticlesList.slice(1);
      mockFetch.mockResolvedValueOnce(relatedArticles);

      const result = await getRelatedNewsArticles('news-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('_id != $excludeId'),
        { excludeId: 'news-1', locale: 'en', limit: 2 }
      );
      expect(result).toHaveLength(2);
    });

    it('respects custom limit', async () => {
      mockFetch.mockResolvedValueOnce([mockNewsArticlesList[1]]);

      await getRelatedNewsArticles('news-1', 'en', 2);

      expect(mockFetch).toHaveBeenCalledWith(expect.any(String), {
        excludeId: 'news-1',
        locale: 'en',
        limit: 1, // limit - 1 due to GROQ slice behavior
      });
    });
  });

  describe('getEvents', () => {
    it('fetches all events in English', async () => {
      mockFetch.mockResolvedValueOnce(mockEventsList);

      const result = await getEvents();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('event'),
        { locale: 'en' }
      );
      expect(result).toEqual(mockEventsList);
    });

    it('fetches events in French', async () => {
      mockFetch.mockResolvedValueOnce(mockEventsList);

      await getEvents('fr');

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('event'), {
        locale: 'fr',
      });
    });
  });

  describe('getUpcomingEvents', () => {
    it('fetches upcoming events with date filter', async () => {
      mockFetch.mockResolvedValueOnce(mockUpcomingEventsList);

      const result = await getUpcomingEvents();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('startDateTime >= $now'),
        expect.objectContaining({
          locale: 'en',
          now: expect.any(String),
        })
      );
      expect(result).toHaveLength(2);
    });

    it('includes location data in results', async () => {
      mockFetch.mockResolvedValueOnce(mockUpcomingEventsList);

      const result = await getUpcomingEvents();

      expect(result[0].location).toBeDefined();
      expect(result[0].location?.name).toBe('Toronto Sports Complex');
    });
  });

  describe('getEvent', () => {
    it('fetches single event by slug', async () => {
      mockFetch.mockResolvedValueOnce(mockEventDetail);

      const result = await getEvent('nationals-2025');

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('event'), {
        slug: 'nationals-2025',
        locale: 'en',
      });
      expect(result?.title).toBe('Canadian Nationals 2025');
    });

    it('returns null for non-existent event', async () => {
      mockFetch.mockResolvedValueOnce(null);

      const result = await getEvent('non-existent');

      expect(result).toBeNull();
    });

    it('includes alternate language slugs', async () => {
      mockFetch.mockResolvedValueOnce(mockEventDetail);

      const result = await getEvent('nationals-2025');

      expect(result?.slugEn).toBe('nationals-2025');
      expect(result?.slugFr).toBe('championnat-national-2025');
    });
  });

  describe('getTeams', () => {
    it('fetches all teams', async () => {
      mockFetch.mockResolvedValueOnce(mockTeamsList);

      const result = await getTeams();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('team'), {
        locale: 'en',
      });
      expect(result).toHaveLength(3);
    });

    it('includes team metadata', async () => {
      mockFetch.mockResolvedValueOnce(mockTeamsList);

      const result = await getTeams();

      expect(result[0].city).toBe('Toronto');
      expect(result[0].levelOfPlay).toBe('competitive');
    });
  });

  describe('getTeamsPage', () => {
    it('fetches teams page content', async () => {
      mockFetch.mockResolvedValueOnce(mockTeamsPageData);

      const result = await getTeamsPage();

      expect(result).toBeDefined();
      expect(result?.title).toBe('Teams');
      expect(result?.levels).toHaveLength(2);
    });

    it('returns null when page does not exist', async () => {
      mockFetch.mockResolvedValueOnce(null);

      const result = await getTeamsPage();

      expect(result).toBeNull();
    });

    it('defaults intro and levels to empty arrays', async () => {
      mockFetch.mockResolvedValueOnce({
        title: 'Teams',
        intro: null,
        levels: null,
      });

      const result = await getTeamsPage();

      expect(result?.intro).toEqual([]);
      expect(result?.levels).toEqual([]);
    });
  });

  describe('getVolunteerOpportunities', () => {
    it('fetches volunteer opportunities', async () => {
      mockFetch.mockResolvedValueOnce(mockVolunteerOpportunitiesList);

      const result = await getVolunteerOpportunities();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('volunteerOpportunity'),
        { locale: 'en' }
      );
      expect(result).toHaveLength(2);
    });

    it('includes application details', async () => {
      mockFetch.mockResolvedValueOnce(mockVolunteerOpportunitiesList);

      const result = await getVolunteerOpportunities();

      expect(result[0].applicationUrl).toBeDefined();
      expect(result[0].deadline).toBe('2025-04-01');
    });
  });

  describe('getInfoArticles', () => {
    it('fetches info articles', async () => {
      mockFetch.mockResolvedValueOnce(mockInfoArticlesList);

      const result = await getInfoArticles();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('infoArticle'),
        { locale: 'en' }
      );
      expect(result).toHaveLength(2);
    });

    it('includes alternate slugs', async () => {
      mockFetch.mockResolvedValueOnce(mockInfoArticlesList);

      const result = await getInfoArticles();

      expect(result[0].slugEn).toBe('what-is-quadball');
      expect(result[0].slugFr).toBe('quest-ce-que-le-quadball');
    });
  });

  describe('getInfoArticle', () => {
    it('fetches single info article', async () => {
      mockFetch.mockResolvedValueOnce(mockInfoArticleDetail);

      const result = await getInfoArticle('what-is-quadball');

      expect(result?.title).toBe('What is Quadball?');
      expect(result?.content).toHaveLength(1);
    });

    it('returns null for non-existent article', async () => {
      mockFetch.mockResolvedValueOnce(null);

      const result = await getInfoArticle('non-existent');

      expect(result).toBeNull();
    });

    it('defaults content to empty array', async () => {
      mockFetch.mockResolvedValueOnce({
        ...mockInfoArticleDetail,
        content: null,
      });

      const result = await getInfoArticle('what-is-quadball');

      expect(result?.content).toEqual([]);
    });
  });

  describe('getStaff', () => {
    it('fetches staff directors with coordinators', async () => {
      mockFetch.mockResolvedValueOnce(mockStaffList);

      const result = await getStaff();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('staffMember'),
        { locale: 'en' }
      );
      expect(result).toHaveLength(2);
      expect(result[0].coordinators).toHaveLength(1);
    });

    it('defaults coordinators to empty array', async () => {
      mockFetch.mockResolvedValueOnce([
        { ...mockStaffList[0], coordinators: null },
      ]);

      const result = await getStaff();

      expect(result[0].coordinators).toEqual([]);
    });
  });

  describe('getBoardMembers', () => {
    it('fetches board members', async () => {
      mockFetch.mockResolvedValueOnce(mockBoardMembersList);

      const result = await getBoardMembers();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('boardMember'),
        { locale: 'en' }
      );
      expect(result).toHaveLength(2);
    });

    it('includes role and bio', async () => {
      mockFetch.mockResolvedValueOnce(mockBoardMembersList);

      const result = await getBoardMembers();

      expect(result[0].role).toBe('President');
      expect(result[0].bio).toContain('served on the board');
    });
  });

  describe('getResourceArticles', () => {
    it('fetches resource articles', async () => {
      mockFetch.mockResolvedValueOnce(mockResourceArticlesList);

      const result = await getResourceArticles();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('resourceArticle'),
        { locale: 'en' }
      );
      expect(result).toHaveLength(2);
    });

    it('includes category and featured flag', async () => {
      mockFetch.mockResolvedValueOnce(mockResourceArticlesList);

      const result = await getResourceArticles();

      expect(result[0].category).toBe('rules');
      expect(result[0].featured).toBe(true);
    });
  });

  describe('getResourceArticle', () => {
    it('fetches single resource article', async () => {
      mockFetch.mockResolvedValueOnce(mockResourceArticleDetail);

      const result = await getResourceArticle('official-rulebook');

      expect(result?.title).toBe('Official Rulebook');
      expect(result?.externalUrl).toBeDefined();
    });

    it('returns null for non-existent article', async () => {
      mockFetch.mockResolvedValueOnce(null);

      const result = await getResourceArticle('non-existent');

      expect(result).toBeNull();
    });

    it('defaults content to empty array', async () => {
      mockFetch.mockResolvedValueOnce({
        ...mockResourceArticleDetail,
        content: null,
      });

      const result = await getResourceArticle('official-rulebook');

      expect(result?.content).toEqual([]);
    });
  });

  describe('getAboutPage', () => {
    it('fetches about page content', async () => {
      mockFetch.mockResolvedValueOnce(mockAboutPageData);

      const result = await getAboutPage();

      expect(result?.title).toBe('About Quadball Canada');
      expect(result?.subtitle).toBeDefined();
    });

    it('returns null when page does not exist', async () => {
      mockFetch.mockResolvedValueOnce(null);

      const result = await getAboutPage();

      expect(result).toBeNull();
    });

    it('defaults content to empty array', async () => {
      mockFetch.mockResolvedValueOnce({
        ...mockAboutPageData,
        content: null,
      });

      const result = await getAboutPage();

      expect(result?.content).toEqual([]);
    });
  });

  describe('getNationalTeamPage', () => {
    it('fetches national team page content', async () => {
      // Mock the raw query result format (with hero object)
      mockFetch.mockResolvedValueOnce({
        title: 'Team Canada',
        hero: {
          subtitle: 'Representing Canada on the world stage',
          image: null,
        },
        content: mockNationalTeamPage.content,
        cta: mockNationalTeamPage.cta,
        seo: null,
      });

      const result = await getNationalTeamPage();

      expect(result?.title).toBe('Team Canada');
      expect(result?.subtitle).toBe('Representing Canada on the world stage');
    });

    it('returns null when page does not exist', async () => {
      mockFetch.mockResolvedValueOnce(null);

      const result = await getNationalTeamPage();

      expect(result).toBeNull();
    });

    it('defaults content to empty array', async () => {
      mockFetch.mockResolvedValueOnce({
        title: 'Team Canada',
        hero: null,
        content: null,
        cta: null,
        seo: null,
      });

      const result = await getNationalTeamPage();

      expect(result?.content).toEqual([]);
    });
  });

  describe('getPageSettings', () => {
    it('fetches page settings', async () => {
      mockFetch.mockResolvedValueOnce(mockPageSettings);

      const result = await getPageSettings();

      expect(result).toEqual(mockPageSettings);
    });

    it('returns null when settings do not exist', async () => {
      mockFetch.mockResolvedValueOnce(null);

      const result = await getPageSettings();

      expect(result).toBeNull();
    });
  });

  describe('getPolicies', () => {
    it('fetches active policies', async () => {
      mockFetch.mockResolvedValueOnce(mockPoliciesList);

      const result = await getPolicies();

      expect(result).toHaveLength(3);
      expect(result[0].category).toBe('general');
    });

    it('includes policy URL and description', async () => {
      mockFetch.mockResolvedValueOnce(mockPoliciesList);

      const result = await getPolicies();

      expect(result[0].url).toContain('code-of-conduct');
      expect(result[0].description).toBeDefined();
    });
  });

  describe('getPoliciesByCategory', () => {
    it('groups policies by category', async () => {
      mockFetch.mockResolvedValueOnce(mockPoliciesList);

      const result = await getPoliciesByCategory();

      expect(result.general).toHaveLength(1);
      expect(result.events).toHaveLength(1);
      expect(result.rules).toHaveLength(1);
      expect(result.gameplay).toHaveLength(0);
      expect(result['team-canada']).toHaveLength(0);
    });
  });

  describe('getLandingSection', () => {
    it('fetches landing section by key', async () => {
      mockFetch.mockResolvedValueOnce(mockLandingSection);

      const result = await getLandingSection('homepage-hero', 'en');

      expect(mockFetch).toHaveBeenCalledWith(expect.any(String), {
        key: 'homepage-hero',
        locale: 'en',
      });
      expect(result?.title).toBe('Welcome to Quadball Canada');
      expect(result?.cards).toHaveLength(2);
    });

    it('returns null for non-existent section', async () => {
      mockFetch.mockResolvedValueOnce(null);

      const result = await getLandingSection('non-existent', 'en');

      expect(result).toBeNull();
    });

    it('fetches in French locale', async () => {
      mockFetch.mockResolvedValueOnce(mockLandingSection);

      await getLandingSection('homepage-hero', 'fr');

      expect(mockFetch).toHaveBeenCalledWith(expect.any(String), {
        key: 'homepage-hero',
        locale: 'fr',
      });
    });
  });

  describe('locale fallback behavior', () => {
    it('GROQ queries use coalesce for locale fallback', async () => {
      mockFetch.mockResolvedValueOnce(mockNewsArticlesList);

      await getNewsArticles('fr');

      // Verify the query contains coalesce pattern for locale fallback
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('coalesce'),
        expect.any(Object)
      );
    });
  });
});
