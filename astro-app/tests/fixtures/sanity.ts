/**
 * Mock data fixtures for Sanity integration tests
 */

import type {
  NewsArticleSummary,
  NewsArticleDetail,
  EventSummary,
  EventDetail,
  UpcomingEventSummary,
  TeamSummary,
  TeamsPageData,
  VolunteerOpportunitySummary,
  InfoArticleSummary,
  InfoArticleDetail,
  StaffDirector,
  BoardMember,
  ResourceArticleSummary,
  ResourceArticleDetail,
  AboutPageData,
  NationalTeamPage,
  PageSettings,
  Policy,
  LandingSection,
} from '../../src/utils/sanity';

// News Article Fixtures
export const mockNewsArticleSummary: NewsArticleSummary = {
  _id: 'news-1',
  slug: 'test-article',
  title: 'Test Article Title',
  excerpt: 'This is a test excerpt for the article.',
  publishedAt: '2025-03-15T12:00:00Z',
  featuredImage: null,
};

export const mockNewsArticleSummaryFr: NewsArticleSummary = {
  _id: 'news-1',
  slug: 'article-test',
  title: "Titre de l'article de test",
  excerpt: "Ceci est un extrait de test pour l'article.",
  publishedAt: '2025-03-15T12:00:00Z',
  featuredImage: null,
};

export const mockNewsArticlesList: NewsArticleSummary[] = [
  mockNewsArticleSummary,
  {
    _id: 'news-2',
    slug: 'second-article',
    title: 'Second Article',
    excerpt: 'Another article excerpt.',
    publishedAt: '2025-03-10T12:00:00Z',
    featuredImage: null,
  },
  {
    _id: 'news-3',
    slug: 'third-article',
    title: 'Third Article',
    publishedAt: '2025-03-05T12:00:00Z',
    featuredImage: null,
  },
];

export const mockNewsArticleDetail: NewsArticleDetail = {
  ...mockNewsArticleSummary,
  content: [
    {
      _type: 'block',
      _key: 'block-1',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 'span-1',
          text: 'This is the article content.',
          marks: [],
        },
      ],
      markDefs: [],
    },
  ],
  author: {
    _id: 'author-1',
    name: 'John Doe',
    slug: 'john-doe',
  },
  slugEn: 'test-article',
  slugFr: 'article-test',
  seo: {
    metaTitle: 'Test Article - Quadball Canada',
    metaDescription: 'This is the SEO description.',
  },
};

// Event Fixtures
export const mockEventSummary: EventSummary = {
  _id: 'event-1',
  slug: 'nationals-2025',
  title: 'Canadian Nationals 2025',
  startDateTime: '2025-08-15T09:00:00-04:00',
  endDateTime: '2025-08-17T18:00:00-04:00',
  timezone: 'America/Toronto',
};

export const mockEventsList: EventSummary[] = [
  mockEventSummary,
  {
    _id: 'event-2',
    slug: 'winter-cup',
    title: 'Winter Cup 2025',
    startDateTime: '2025-02-20T10:00:00-05:00',
    endDateTime: '2025-02-21T17:00:00-05:00',
    timezone: 'America/Toronto',
  },
];

export const mockUpcomingEvent: UpcomingEventSummary = {
  ...mockEventSummary,
  description: 'The annual Canadian National Championship.',
  location: {
    name: 'Toronto Sports Complex',
    address: '123 Sports Ave, Toronto, ON',
    type: 'physical',
  },
};

export const mockUpcomingEventsList: UpcomingEventSummary[] = [
  mockUpcomingEvent,
  {
    _id: 'event-3',
    slug: 'regional-qualifier',
    title: 'Eastern Regional Qualifier',
    startDateTime: '2025-06-01T09:00:00-04:00',
    endDateTime: '2025-06-01T18:00:00-04:00',
    timezone: 'America/Toronto',
    description: 'Regional qualifier for Eastern teams.',
    location: {
      name: 'Montreal Park',
      address: '456 Park St, Montreal, QC',
      type: 'physical',
    },
  },
];

export const mockEventDetail: EventDetail = {
  ...mockEventSummary,
  description: 'The annual Canadian National Championship.',
  content: [
    {
      _type: 'block',
      _key: 'block-1',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 'span-1',
          text: 'Event details and schedule.',
          marks: [],
        },
      ],
      markDefs: [],
    },
  ],
  slugEn: 'nationals-2025',
  slugFr: 'championnat-national-2025',
  location: {
    name: 'Toronto Sports Complex',
    address: '123 Sports Ave, Toronto, ON',
    type: 'physical',
  },
};

// Team Fixtures
export const mockTeamSummary: TeamSummary = {
  _id: 'team-1',
  slug: 'toronto-titans',
  name: 'Toronto Titans',
  city: 'Toronto',
  province: 'ON',
  levelOfPlay: 'competitive',
  division: 'Division A',
  email: 'titans@example.com',
  website: 'https://torontotitans.example.com',
  description: 'A competitive team from Toronto.',
  active: true,
  logo: null,
  socialMedia: {
    instagram: '@torontotitans',
    twitter: '@torontotitans',
  },
};

export const mockTeamsList: TeamSummary[] = [
  mockTeamSummary,
  {
    _id: 'team-2',
    slug: 'montreal-marauders',
    name: 'Montreal Marauders',
    city: 'Montreal',
    province: 'QC',
    levelOfPlay: 'competitive',
    active: true,
    logo: null,
  },
  {
    _id: 'team-3',
    slug: 'vancouver-vikings',
    name: 'Vancouver Vikings',
    city: 'Vancouver',
    province: 'BC',
    levelOfPlay: 'recreational',
    active: true,
    logo: null,
  },
];

export const mockTeamsPageData: TeamsPageData = {
  title: 'Teams',
  intro: [
    {
      _type: 'block',
      _key: 'intro-1',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 'span-1',
          text: 'Find a team near you.',
          marks: [],
        },
      ],
      markDefs: [],
    },
  ],
  levels: [
    {
      identifier: 'competitive',
      title: 'Competitive',
      summary: 'Full-contact competitive play.',
      details: [],
      cta: {
        label: 'Find Teams',
        href: '/teams/',
      },
    },
    {
      identifier: 'recreational',
      title: 'Recreational',
      summary: 'Casual, limited-contact play.',
      details: [],
      cta: null,
    },
  ],
  cta: {
    heading: 'Start a Team',
    body: 'Want to bring quadball to your area?',
    buttonLabel: 'Contact Us',
    buttonHref: '/contact/',
  },
};

// Volunteer Opportunity Fixtures
export const mockVolunteerOpportunity: VolunteerOpportunitySummary = {
  _id: 'vol-1',
  slug: 'event-coordinator',
  title: 'Event Coordinator',
  summary: 'Help organize national events.',
  roleType: 'Events',
  timeCommitment: '10-15 hours/month',
  location: 'Remote',
  isRemote: true,
  deadline: '2025-04-01',
  applicationUrl: 'https://forms.example.com/apply',
  contactEmail: 'volunteer@quadballcanada.com',
  orderRank: 1,
  publishedAt: '2025-01-15T12:00:00Z',
};

export const mockVolunteerOpportunitiesList: VolunteerOpportunitySummary[] = [
  mockVolunteerOpportunity,
  {
    _id: 'vol-2',
    slug: 'social-media-coordinator',
    title: 'Social Media Coordinator',
    summary: 'Manage our social media presence.',
    roleType: 'Communications',
    timeCommitment: '5-10 hours/week',
    isRemote: true,
    applicationUrl: 'https://forms.example.com/social',
    orderRank: 2,
  },
];

// Info Article Fixtures
export const mockInfoArticleSummary: InfoArticleSummary = {
  _id: 'info-1',
  title: 'What is Quadball?',
  slug: 'what-is-quadball',
  excerpt: 'Learn about the sport of quadball.',
  slugEn: 'what-is-quadball',
  slugFr: 'quest-ce-que-le-quadball',
};

export const mockInfoArticlesList: InfoArticleSummary[] = [
  mockInfoArticleSummary,
  {
    _id: 'info-2',
    title: 'How to Play',
    slug: 'how-to-play',
    excerpt: 'The basics of gameplay.',
    slugEn: 'how-to-play',
    slugFr: 'comment-jouer',
  },
];

export const mockInfoArticleDetail: InfoArticleDetail = {
  ...mockInfoArticleSummary,
  content: [
    {
      _type: 'block',
      _key: 'block-1',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 'span-1',
          text: 'Quadball is a mixed-gender contact sport.',
          marks: [],
        },
      ],
      markDefs: [],
    },
  ],
  heroImage: null,
  seo: {
    metaTitle: 'What is Quadball? - Quadball Canada',
    metaDescription: 'Learn about the sport of quadball.',
  },
};

// Staff & Board Fixtures
export const mockStaffDirector: StaffDirector = {
  _id: 'staff-1',
  slug: 'jane-smith',
  name: 'Jane Smith',
  role: 'Executive Director',
  bio: 'Jane has been involved in quadball since 2015.',
  headshot: null,
  orderRank: 1,
  coordinators: [
    {
      _id: 'staff-2',
      slug: 'bob-jones',
      name: 'Bob Jones',
      role: 'Events Coordinator',
      headshot: null,
      orderRank: 1,
    },
  ],
};

export const mockStaffList: StaffDirector[] = [
  mockStaffDirector,
  {
    _id: 'staff-3',
    slug: 'alice-wilson',
    name: 'Alice Wilson',
    role: 'Communications Director',
    bio: 'Alice manages all external communications.',
    headshot: null,
    orderRank: 2,
    coordinators: [],
  },
];

export const mockBoardMember: BoardMember = {
  _id: 'board-1',
  slug: 'mike-johnson',
  name: 'Mike Johnson',
  role: 'President',
  bio: 'Mike has served on the board since 2018.',
  headshot: null,
  orderRank: 1,
};

export const mockBoardMembersList: BoardMember[] = [
  mockBoardMember,
  {
    _id: 'board-2',
    slug: 'sarah-lee',
    name: 'Sarah Lee',
    role: 'Vice President',
    bio: 'Sarah oversees operations and strategy.',
    headshot: null,
    orderRank: 2,
  },
];

// Resource Article Fixtures
export const mockResourceArticleSummary: ResourceArticleSummary = {
  _id: 'resource-1',
  title: 'Official Rulebook',
  slug: 'official-rulebook',
  category: 'rules',
  excerpt: 'The official rules of quadball.',
  externalUrl: 'https://rules.example.com',
  featured: true,
  slugEn: 'official-rulebook',
  slugFr: 'regles-officielles',
  heroImage: null,
};

export const mockResourceArticlesList: ResourceArticleSummary[] = [
  mockResourceArticleSummary,
  {
    _id: 'resource-2',
    title: 'Training Guide',
    slug: 'training-guide',
    category: 'gameplay',
    excerpt: 'Tips and drills for improving your game.',
    featured: false,
    slugEn: 'training-guide',
    slugFr: 'guide-entrainement',
    heroImage: null,
  },
];

export const mockResourceArticleDetail: ResourceArticleDetail = {
  ...mockResourceArticleSummary,
  content: [
    {
      _type: 'block',
      _key: 'block-1',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 'span-1',
          text: 'Complete rulebook content.',
          marks: [],
        },
      ],
      markDefs: [],
    },
  ],
  seo: {
    metaTitle: 'Official Rulebook - Quadball Canada',
    metaDescription: 'Download the official quadball rulebook.',
  },
};

// About Page Fixture
export const mockAboutPageData: AboutPageData = {
  _id: 'about-page',
  title: 'About Quadball Canada',
  subtitle: 'Growing the sport across the nation',
  heroCtaText: 'Get Involved',
  heroCtaHref: '/get-involved/',
  content: [
    {
      _type: 'block',
      _key: 'block-1',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 'span-1',
          text: 'Quadball Canada is the national governing body.',
          marks: [],
        },
      ],
      markDefs: [],
    },
  ],
  seo: {
    metaTitle: 'About Us - Quadball Canada',
    metaDescription: 'Learn about Quadball Canada.',
  },
};

// National Team Page Fixture
export const mockNationalTeamPage: NationalTeamPage = {
  title: 'Team Canada',
  subtitle: 'Representing Canada on the world stage',
  heroImage: null,
  content: [
    {
      _type: 'block',
      _key: 'block-1',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 'span-1',
          text: 'Team Canada competes internationally.',
          marks: [],
        },
      ],
      markDefs: [],
    },
  ],
  cta: {
    label: 'Tryout Information',
    href: '/national-team/tryouts/',
  },
  seo: null,
};

// Page Settings Fixture
export const mockPageSettings: PageSettings = {
  aboutHeroImage: null,
  contactHeroImage: null,
  eventsHeroImage: null,
  getInvolvedHeroImage: null,
  teamsHeroImage: null,
  newsHeroImage: null,
  boardHeroImage: null,
  staffHeroImage: null,
  defaultHeroImage: null,
};

// Policy Fixtures
export const mockPolicy: Policy = {
  _id: 'policy-1',
  title: 'Code of Conduct',
  category: 'general',
  url: 'https://policies.example.com/code-of-conduct.pdf',
  description: 'Expected behavior for all participants.',
  order: 1,
};

export const mockPoliciesList: Policy[] = [
  mockPolicy,
  {
    _id: 'policy-2',
    title: 'Event Safety Guidelines',
    category: 'events',
    url: 'https://policies.example.com/safety.pdf',
    order: 1,
  },
  {
    _id: 'policy-3',
    title: 'Official Rulebook',
    category: 'rules',
    url: 'https://policies.example.com/rules.pdf',
    order: 1,
  },
];

// Landing Section Fixture
export const mockLandingSection: LandingSection = {
  _id: 'landing-1',
  key: 'homepage-hero',
  title: 'Welcome to Quadball Canada',
  intro: 'The official home of quadball in Canada.',
  showContent: true,
  cards: [
    {
      title: 'Find a Team',
      body: 'Connect with teams in your area.',
      ctaText: 'View Teams',
      href: '/teams/',
      external: false,
    },
    {
      title: 'Upcoming Events',
      body: 'See what tournaments are coming up.',
      ctaText: 'View Events',
      href: '/events/',
      external: false,
    },
  ],
};
