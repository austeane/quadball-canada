import { sanityClient } from "sanity:client";
import type { PortableTextBlock } from "@portabletext/types";
import type { ImageAsset } from "@sanity/types";
import groq from "groq";
import { createImageUrlBuilder } from "@sanity/image-url";

export type Locale = "en" | "fr";

// Landing Section Types
export type LandingCard = {
  title: string;
  body: string;
  ctaText: string;
  href: string;
  external: boolean;
};

export type LandingSection = {
  _id: string;
  key: string;
  title: string;
  intro: string;
  showContent: boolean;
  cards: LandingCard[];
  heroImage?: SanityImageWithAlt | null;
};

// Image URL builder
const builder = createImageUrlBuilder(sanityClient);

export function urlForImage(source: SanityImageWithAlt | null | undefined) {
  if (!source?.asset) return null;
  return builder.image(source);
}

export interface SanityImageWithAlt {
  _type: "image";
  asset: ImageAsset;
  alt?: string;
  crop?: Record<string, unknown>;
  hotspot?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CallToAction {
  heading?: string | null;
  body?: string | null;
  buttonLabel?: string | null;
  buttonHref?: string | null;
}

// GROQ projections shared by the queries below; $locale picks the English or French value.
const IMAGE = `{ ..., "alt": coalesce(alt[$locale], alt.en) }`;
const CTA = `{
  "heading": coalesce(heading[$locale], heading.en),
  "body": coalesce(body[$locale], body.en),
  "buttonLabel": coalesce(buttonLabel[$locale], buttonLabel.en),
  "buttonHref": coalesce(buttonLink[$locale], buttonLink.en)
}`;

export interface NewsArticleSummary {
  _id: string;
  slug: string;
  title: string;
  excerpt?: string;
  publishedAt: string;
  featuredImage?: SanityImageWithAlt | null;
}

export interface NewsArticleDetail extends NewsArticleSummary {
  content: PortableTextBlock[];
  author?: {
    _id: string;
    name: string;
    slug?: string;
  } | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImageWithAlt | null;
  } | null;
  slugEn?: string;
  slugFr?: string;
}

export interface EventSummary {
  _id: string;
  slug: string;
  title: string;
  startDateTime: string;
  endDateTime?: string;
  timezone?: string;
}

export interface UpcomingEventSummary extends EventSummary {
  description?: string;
  location?: {
    name?: string;
    address?: string;
    type?: "physical" | "online" | "hybrid";
  };
}

export interface EventDetail extends EventSummary {
  description?: string;
  content?: PortableTextBlock[];
  slugEn?: string;
  slugFr?: string;
  location?: {
    name?: string;
    address?: string;
    type?: "physical" | "online" | "hybrid";
  };
  featuredImage?: SanityImageWithAlt | null;
  registration?: {
    required?: boolean;
    url?: string | null;
    deadline?: string | null;
    price?: number | null;
    capacity?: number | null;
  } | null;
  documents?: { title?: string | null; url: string }[] | null;
  teams?: { name: string; slug?: string | null }[] | null;
  seo?: { metaTitle?: string | null; metaDescription?: string | null } | null;
}

export interface TeamSummary {
  _id: string;
  slug: string;
  name: string;
  city?: string;
  province?: string;
  levelOfPlay?: "youth" | "recreational" | "competitive" | "national-team";
  division?: string;
  email?: string;
  website?: string;
  description?: string | null;
  logo?: SanityImageWithAlt | null;
  socialMedia?: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    tiktok?: string | null;
  } | null;
  active?: boolean;
  isAffiliate?: boolean;
  seasonNote?: string | null;
  founded?: number | null;
  homefield?: string | null;
  primaryColor?: string | null;
}

export interface VolunteerOpportunitySummary {
  _id: string;
  slug: string;
  title: string;
  summary?: PortableTextBlock[] | null;
  roleType?: string;
  timeCommitment?: string;
  location?: string | null;
  province?: string | null;
  isRemote?: boolean;
  deadline?: string | null;
  applicationUrl: string;
  contactEmail?: string | null;
  orderRank?: number | null;
  publishedAt?: string | null;
}

export type TeamLevelIdentifier = "youth" | "recreational" | "competitive" | "national-team";

export interface TeamLevelSection {
  identifier: TeamLevelIdentifier;
  title: string;
  summary?: string | null;
  details?: PortableTextBlock[];
  cta?: {
    label?: string;
    href?: string;
  } | null;
}

export interface TeamsPageData {
  title: string;
  intro: PortableTextBlock[];
  levels: TeamLevelSection[];
  levelsHeading?: string | null;
  levelsIntro?: string | null;
  heroImage?: SanityImageWithAlt | null;
  cta?: CallToAction | null;
  communityCta?: CallToAction | null;
}

export interface InfoArticleSummary {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  slugEn?: string;
  slugFr?: string;
}

export interface InfoArticleDetail extends InfoArticleSummary {
  content: PortableTextBlock[];
  heroImage?: SanityImageWithAlt | null;
  cta?: CallToAction | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImageWithAlt | null;
  } | null;
}

export interface ResourceArticleSummary {
  _id: string;
  title: string;
  slug: string;
  category: string;
  excerpt?: string;
  externalUrl?: string | null;
  heroImage?: SanityImageWithAlt | null;
  featured?: boolean;
  slugEn?: string;
  slugFr?: string;
}

export interface ResourceArticleDetail extends ResourceArticleSummary {
  content?: PortableTextBlock[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImageWithAlt | null;
  } | null;
}

export interface StaffCoordinator {
  _id: string;
  slug: string;
  name: string;
  role: string;
  headshot?: SanityImageWithAlt | null;
  orderRank?: number | null;
}

export interface StaffDirector {
  _id: string;
  slug: string;
  name: string;
  role: string;
  bio?: string | null;
  headshot?: SanityImageWithAlt | null;
  orderRank?: number | null;
  coordinators: StaffCoordinator[];
}

export interface BoardMember {
  _id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  headshot?: SanityImageWithAlt | null;
  orderRank?: number | null;
}

type StaffDirectorQueryResult = Omit<StaffDirector, "coordinators"> & {
  coordinators?: StaffCoordinator[] | null;
};

export async function getNewsArticles(locale: Locale = "en"): Promise<NewsArticleSummary[]> {
  return await sanityClient.fetch(
    groq`*[_type == "newsArticle" && defined(slug[$locale].current)] | order(publishedAt desc) {
      _id,
      publishedAt,
      "title": coalesce(title[$locale], title.en),
      "slug": slug[$locale].current,
      "excerpt": coalesce(excerpt[$locale], excerpt.en),
      "featuredImage": featuredImage{
        ...,
        "alt": coalesce(alt[$locale], alt.en)
      }
    }`,
    { locale }
  );
}

export async function getNewsArticle(
  slug: string,
  locale: Locale = "en"
): Promise<NewsArticleDetail | null> {
  const article = await sanityClient.fetch(
    groq`*[_type == "newsArticle" && slug[$locale].current == $slug][0] {
      _id,
      publishedAt,
      "title": coalesce(title[$locale], title.en),
      "slug": slug[$locale].current,
      "slugEn": slug.en.current,
      "slugFr": slug.fr.current,
      "excerpt": coalesce(excerpt[$locale], excerpt.en),
      "content": coalesce(content[$locale], content.en),
      "featuredImage": featuredImage{
        ...,
        "alt": coalesce(alt[$locale], alt.en)
      },
      "author": author->{
        _id,
        name,
        "slug": slug.current
      },
      seo {
        "metaTitle": coalesce(metaTitle[$locale], metaTitle.en),
        "metaDescription": coalesce(metaDescription[$locale], metaDescription.en),
        ogImage{
          ...,
          "alt": coalesce(alt[$locale], alt.en)
        }
      }
    }`,
    { slug, locale }
  );

  if (!article) {
    return null;
  }

  return {
    ...article,
    content: article.content ?? [],
  };
}

export async function getRelatedNewsArticles(
  excludeId: string,
  locale: Locale = "en",
  limit: number = 3
): Promise<NewsArticleSummary[]> {
  return await sanityClient.fetch(
    groq`*[_type == "newsArticle" && _id != $excludeId && defined(slug[$locale].current)] | order(publishedAt desc)[0...$limit] {
      _id,
      publishedAt,
      "title": coalesce(title[$locale], title.en),
      "slug": slug[$locale].current,
      "excerpt": coalesce(excerpt[$locale], excerpt.en),
      "featuredImage": featuredImage{
        ...,
        "alt": coalesce(alt[$locale], alt.en)
      }
    }`,
    { excludeId, locale, limit }
  );
}

export interface NationalTeamPage {
  title: string;
  subtitle?: string;
  heroImage?: SanityImageWithAlt | null;
  content: PortableTextBlock[];
  cta?: {
    label?: string;
    href?: string;
  } | null;
  supportCta?: CallToAction | null;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImageWithAlt | null;
  } | null;
}

export async function getEvents(locale: Locale = "en"): Promise<EventSummary[]> {
  return await sanityClient.fetch(
    groq`*[_type == "event" && defined(slug[$locale].current)] | order(startDateTime desc) {
      _id,
      "title": coalesce(title[$locale], title.en),
      "slug": slug[$locale].current,
      startDateTime,
      endDateTime,
      timezone
    }`,
    { locale }
  );
}

export async function getUpcomingEvents(locale: Locale = "en"): Promise<UpcomingEventSummary[]> {
  const now = new Date().toISOString();
  return await sanityClient.fetch(
    groq`*[_type == "event" && defined(slug[$locale].current) && startDateTime >= $now] | order(startDateTime asc) {
      _id,
      "title": coalesce(title[$locale], title.en),
      "slug": slug[$locale].current,
      startDateTime,
      endDateTime,
      timezone,
      "description": coalesce(description[$locale], description.en),
      "location": {
        "name": coalesce(location.name[$locale], location.name.en),
        "address": location.address,
        "type": location.type
      }
    }`,
    { locale, now }
  );
}

export async function getEvent(slug: string, locale: Locale = "en"): Promise<EventDetail | null> {
  return await sanityClient.fetch(
    groq`*[_type == "event" && slug[$locale].current == $slug][0] {
      _id,
      "title": coalesce(title[$locale], title.en),
      "slug": slug[$locale].current,
      "slugEn": slug.en.current,
      "slugFr": slug.fr.current,
      startDateTime,
      endDateTime,
      timezone,
      "description": coalesce(description[$locale], description.en),
      "content": coalesce(content[$locale], content.en),
      "location": {
        "name": coalesce(location.name[$locale], location.name.en),
        "address": location.address,
        "type": location.type
      },
      featuredImage${IMAGE},
      registration{ required, url, deadline, price, capacity },
      "documents": documents[defined(asset)]{
        "title": coalesce(title[$locale], title.en, asset->originalFilename),
        "url": asset->url
      },
      "teams": teams[]->{ name, "slug": slug.current },
      seo{
        "metaTitle": coalesce(metaTitle[$locale], metaTitle.en),
        "metaDescription": coalesce(metaDescription[$locale], metaDescription.en)
      }
    }`,
    { slug, locale }
  );
}

export async function getTeams(locale: Locale = "en"): Promise<TeamSummary[]> {
  return await sanityClient.fetch(
    groq`*[_type == "team" && defined(slug.current)] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      city,
      province,
      levelOfPlay,
      division,
      email,
      website,
      active,
      isAffiliate,
      "seasonNote": coalesce(seasonNote[$locale], seasonNote.en),
      "description": coalesce(description[$locale], description.en),
      founded,
      "homefield": homefield.name,
      "primaryColor": primaryColor.hex,
      logo{
        ...,
        "alt": coalesce(alt[$locale], alt.en)
      },
      socialMedia
    }`,
    { locale }
  );
}

export async function getVolunteerOpportunities(
  locale: Locale = "en"
): Promise<VolunteerOpportunitySummary[]> {
  return await sanityClient.fetch(
    groq`*[_type == "volunteerOpportunity" && defined(slug.current)] 
        | order(coalesce(deadline, "9999-12-31") asc, coalesce(orderRank, 9999) asc, coalesce(publishedAt, _createdAt) desc) {
      _id,
      "slug": slug.current,
      "title": coalesce(title[$locale], title.en),
      "summary": coalesce(summary[$locale], summary.en),
      roleType,
      timeCommitment,
      "location": coalesce(location[$locale], location.en, location),
      province,
      isRemote,
      deadline,
      applicationUrl,
      contactEmail,
      orderRank,
      publishedAt
    }`,
    { locale }
  );
}

export async function getTeamsPage(locale: Locale = "en"): Promise<TeamsPageData | null> {
  const page = await sanityClient.fetch(
    groq`*[_id == "teamsPage"][0] {
      "title": coalesce(title[$locale], title.en),
      "intro": coalesce(intro[$locale], intro.en),
      heroImage${IMAGE},
      "levelsHeading": coalesce(levelsHeading[$locale], levelsHeading.en),
      "levelsIntro": coalesce(levelsIntro[$locale], levelsIntro.en),
      levels[]{
        "identifier": identifier,
        "title": coalesce(title[$locale], title.en),
        "summary": coalesce(summary[$locale], summary.en),
        "details": coalesce(details[$locale], details.en),
        cta{
          "label": coalesce(label[$locale], label.en),
          "href": coalesce(link[$locale], link.en)
        }
      },
      cta${CTA},
      communityCta${CTA}
    }`,
    { locale }
  );

  if (!page) {
    return null;
  }

  return {
    ...page,
    intro: page.intro ?? [],
    levels:
      page.levels?.map((level: TeamLevelSection) => ({
        ...level,
        details: level.details ?? [],
      })) ?? [],
  };
}

export async function getInfoArticles(locale: Locale = "en"): Promise<InfoArticleSummary[]> {
  return await sanityClient.fetch(
    groq`*[_type == "infoArticle" && defined(slug[$locale].current)] | order(title[$locale] asc) {
      _id,
      "title": coalesce(title[$locale], title.en),
      "slug": slug[$locale].current,
      "slugEn": slug.en.current,
      "slugFr": slug.fr.current,
      "excerpt": coalesce(excerpt[$locale], excerpt.en)
    }`,
    { locale }
  );
}

export async function getStaff(locale: Locale = "en"): Promise<StaffDirector[]> {
  const directors = await sanityClient.fetch<StaffDirectorQueryResult[]>(
    groq`*[_type == "staffMember" && memberType == "director" && defined(slug.current)] 
        | order(coalesce(orderRank, 9999) asc, name asc) {
      _id,
      name,
      "slug": slug.current,
      "role": coalesce(role[$locale], role.en),
      "bio": coalesce(bio[$locale], bio.en),
      "headshot": headshot{
        ...,
        "alt": coalesce(alt[$locale], alt.en)
      },
      orderRank,
      "coordinators": *[_type == "staffMember" && memberType == "coordinator" && defined(slug.current) && references(^._id)]
        | order(coalesce(orderRank, 9999) asc, name asc) {
          _id,
          name,
          "slug": slug.current,
          "role": coalesce(role[$locale], role.en),
          "headshot": headshot{
            ...,
            "alt": coalesce(alt[$locale], alt.en)
          },
          orderRank
        }
    }`,
    { locale }
  );

  return directors.map((director) => ({
    ...director,
    coordinators: director.coordinators ?? [],
  }));
}

export async function getInfoArticle(
  slug: string,
  locale: Locale = "en"
): Promise<InfoArticleDetail | null> {
  const article = await sanityClient.fetch(
    groq`*[_type == "infoArticle" && slug[$locale].current == $slug][0] {
      _id,
      "title": coalesce(title[$locale], title.en),
      "slug": slug[$locale].current,
      "slugEn": slug.en.current,
      "slugFr": slug.fr.current,
      "excerpt": coalesce(excerpt[$locale], excerpt.en),
      "content": coalesce(content[$locale], content.en),
      heroImage${IMAGE},
      cta${CTA},
      seo {
        "metaTitle": coalesce(metaTitle[$locale], metaTitle.en),
        "metaDescription": coalesce(metaDescription[$locale], metaDescription.en),
        ogImage${IMAGE}
      }
    }`,
    { slug, locale }
  );

  if (!article) {
    return null;
  }

  return {
    ...article,
    content: article.content ?? [],
  };
}

export async function getBoardMembers(locale: Locale = "en"): Promise<BoardMember[]> {
  return await sanityClient.fetch(
    groq`*[_type == "boardMember" && defined(slug.current)]
        | order(coalesce(orderRank, 9999) asc, name asc) {
      _id,
      name,
      "slug": slug.current,
      "role": coalesce(role[$locale], role.en),
      "bio": coalesce(bio[$locale], bio.en),
      "headshot": headshot{
        ...,
        "alt": coalesce(alt[$locale], alt.en)
      },
      orderRank
    }`,
    { locale }
  );
}

export async function getResourceArticles(locale: Locale = "en"): Promise<ResourceArticleSummary[]> {
  return await sanityClient.fetch(
    groq`*[_type == "resourceArticle" && defined(slug[$locale].current)]
        | order(featured desc, title[$locale] asc) {
      _id,
      "title": coalesce(title[$locale], title.en),
      "slug": slug[$locale].current,
      "slugEn": slug.en.current,
      "slugFr": slug.fr.current,
      category,
      "excerpt": coalesce(excerpt[$locale], excerpt.en),
      externalUrl,
      featured,
      "heroImage": heroImage{
        ...,
        "alt": coalesce(alt[$locale], alt.en)
      }
    }`,
    { locale }
  );
}

export async function getResourceArticle(
  slug: string,
  locale: Locale = "en"
): Promise<ResourceArticleDetail | null> {
  const article = await sanityClient.fetch(
    groq`*[_type == "resourceArticle" && slug[$locale].current == $slug][0] {
      _id,
      "title": coalesce(title[$locale], title.en),
      "slug": slug[$locale].current,
      "slugEn": slug.en.current,
      "slugFr": slug.fr.current,
      category,
      "excerpt": coalesce(excerpt[$locale], excerpt.en),
      externalUrl,
      featured,
      "content": coalesce(content[$locale], content.en),
      "heroImage": heroImage{
        ...,
        "alt": coalesce(alt[$locale], alt.en)
      },
      seo {
        "metaTitle": coalesce(metaTitle[$locale], metaTitle.en),
        "metaDescription": coalesce(metaDescription[$locale], metaDescription.en),
        ogImage{
          ...,
          "alt": coalesce(alt[$locale], alt.en)
        }
      }
    }`,
    { slug, locale }
  );

  if (!article) {
    return null;
  }

  return {
    ...article,
    content: article.content ?? [],
  };
}

export async function getNationalTeamPage(locale: Locale = "en"): Promise<NationalTeamPage | null> {
  const page = await sanityClient.fetch(
    groq`*[_id == "nationalTeamPage"][0] {
      "title": coalesce(title[$locale], title.en),
      hero{
        "subtitle": coalesce(subtitle[$locale], subtitle.en),
        image{
          ...,
          "alt": coalesce(alt[$locale], alt.en)
        }
      },
      "content": coalesce(content[$locale], content.en),
      cta{
        "label": coalesce(label[$locale], label.en),
        "href": coalesce(link[$locale], link.en)
      },
      supportCta${CTA},
      seo{
        "metaTitle": coalesce(metaTitle[$locale], metaTitle.en),
        "metaDescription": coalesce(metaDescription[$locale], metaDescription.en),
        ogImage{
          ...,
          "alt": coalesce(alt[$locale], alt.en)
        }
      }
    }`,
    { locale }
  );

  if (!page) {
    return null;
  }

  return {
    title: page.title,
    subtitle: page.hero?.subtitle,
    heroImage: page.hero?.image ?? null,
    content: page.content ?? [],
    cta: page.cta ?? null,
    supportCta: page.supportCta ?? null,
    seo: page.seo ?? null,
  };
}

// Display order on the policies pages
export const POLICY_CATEGORIES = [
  'administrative',
  'communications',
  'membership',
  'gameplay',
  'events',
  'national-team',
  'volunteer',
] as const;

export type PolicyCategory = (typeof POLICY_CATEGORIES)[number];

export interface Policy {
  _id: string;
  title: string;
  category: PolicyCategory;
  url: string;
  description?: string;
  order: number;
}

export async function getPolicies(locale: Locale = "en"): Promise<Policy[]> {
  return await sanityClient.fetch(
    groq`*[_type == "policy" && isActive == true] | order(category asc, order asc, coalesce(title[$locale], title.en) asc) {
      _id,
      "title": coalesce(title[$locale], title.en),
      category,
      url,
      "description": coalesce(description[$locale], description.en),
      order
    }`,
    { locale }
  );
}

export async function getPoliciesByCategory(locale: Locale = "en"): Promise<Record<PolicyCategory, Policy[]>> {
  const policies = await getPolicies(locale);

  const grouped = Object.fromEntries(
    POLICY_CATEGORIES.map((category) => [category, [] as Policy[]])
  ) as Record<PolicyCategory, Policy[]>;

  policies.forEach(policy => {
    if (policy.category in grouped) {
      grouped[policy.category].push(policy);
    }
  });

  return grouped;
}

// Event Bids Page types

export interface HostAward {
  eventName: string;
  hostCity: string;
  dateLabel?: string;
  description?: string;
  eventUrl?: string;
}

export interface CurrentBids {
  status: "open" | "closed" | "coming-soon";
  statusMessage?: string;
  bidManualFile?: { asset: { url: string } } | null;
  bidManualTitle?: string;
  submissionUrl?: string;
  deadline?: string;
}

export interface EventBidsPageData {
  title: string;
  subtitle?: string | null;
  heroImage?: SanityImageWithAlt | null;
  intro?: { heading?: string | null; body?: string | null } | null;
  application?: {
    label?: string | null;
    howToBidHeading?: string | null;
    howToBidBody?: string | null;
    whoCanBidHeading?: string | null;
    whoCanBid?: string[] | null;
  } | null;
  steps?: { heading?: string | null; items?: string[] | null } | null;
  selection?: { label?: string | null; heading?: string | null; body?: string | null } | null;
  getInvolved?: {
    label?: string | null;
    heading?: string | null;
    body?: string | null;
    contactPrompt?: string | null;
    contactEmails?: string[] | null;
  } | null;
  crossLink?: CallToAction | null;
  domesticHosts: HostAward[];
  internationalHosts: HostAward[];
  currentBids?: CurrentBids | null;
  introImage?: SanityImageWithAlt | null;
  selectionImage?: SanityImageWithAlt | null;
  getInvolvedImage?: SanityImageWithAlt | null;
  seo?: { metaTitle?: string | null; metaDescription?: string | null } | null;
}

export async function getEventBidsPage(locale: Locale = "en"): Promise<EventBidsPageData | null> {
  const page = await sanityClient.fetch(
    groq`*[_id == "eventBidsPage"][0] {
      "title": coalesce(title[$locale], title.en),
      "subtitle": coalesce(subtitle[$locale], subtitle.en),
      heroImage${IMAGE},
      intro{
        "heading": coalesce(heading[$locale], heading.en),
        "body": coalesce(body[$locale], body.en)
      },
      application{
        "label": coalesce(label[$locale], label.en),
        "howToBidHeading": coalesce(howToBidHeading[$locale], howToBidHeading.en),
        "howToBidBody": coalesce(howToBidBody[$locale], howToBidBody.en),
        "whoCanBidHeading": coalesce(whoCanBidHeading[$locale], whoCanBidHeading.en),
        "whoCanBid": whoCanBid[]{ "text": coalesce(@[$locale], @.en) }.text
      },
      steps{
        "heading": coalesce(heading[$locale], heading.en),
        "items": items[]{ "text": coalesce(@[$locale], @.en) }.text
      },
      selection{
        "label": coalesce(label[$locale], label.en),
        "heading": coalesce(heading[$locale], heading.en),
        "body": coalesce(body[$locale], body.en)
      },
      getInvolved{
        "label": coalesce(label[$locale], label.en),
        "heading": coalesce(heading[$locale], heading.en),
        "body": coalesce(body[$locale], body.en),
        "contactPrompt": coalesce(contactPrompt[$locale], contactPrompt.en),
        contactEmails
      },
      crossLink${CTA},
      introImage${IMAGE},
      selectionImage${IMAGE},
      getInvolvedImage${IMAGE},
      domesticHosts[] {
        "eventName": coalesce(eventName[$locale], eventName.en),
        hostCity,
        "dateLabel": coalesce(dateLabel[$locale], dateLabel.en),
        eventUrl
      },
      internationalHosts[] {
        "eventName": coalesce(eventName[$locale], eventName.en),
        hostCity,
        "dateLabel": coalesce(dateLabel[$locale], dateLabel.en),
        "description": coalesce(description[$locale], description.en),
        eventUrl
      },
      currentBids {
        status,
        "statusMessage": coalesce(statusMessage[$locale], statusMessage.en),
        bidManualFile { asset-> { url } },
        "bidManualTitle": coalesce(bidManualTitle[$locale], bidManualTitle.en),
        submissionUrl,
        deadline
      },
      seo {
        "metaTitle": coalesce(metaTitle[$locale], metaTitle.en),
        "metaDescription": coalesce(metaDescription[$locale], metaDescription.en)
      }
    }`,
    { locale }
  );

  if (!page) {
    return null;
  }

  return {
    ...page,
    domesticHosts: page.domesticHosts ?? [],
    internationalHosts: page.internationalHosts ?? [],
  };
}

// Event Hub types

export interface ScheduleItem {
  time: string;
  label: string;
  description?: string;
  highlight?: boolean;
}

export interface ScheduleDay {
  dayLabel: string;
  daySubtitle?: string;
  date?: string;
  items: ScheduleItem[];
}

export interface WatchChannel {
  name: string;
  url?: string;
  platform?: string;
}

export interface EventHubSponsor {
  name: string;
  logo?: SanityImageWithAlt | null;
  url?: string;
  message?: string;
  tier?: string;
}

export interface EventHubDetail {
  _id: string;
  slug: string;
  slugEn?: string;
  slugFr?: string;
  title: string;
  heroLabel?: string;
  heroSubtitle?: string;
  heroCtaPrimary?: { label?: string; href?: string };
  heroCtaSecondary?: { label?: string; href?: string };
  aboutContent?: PortableTextBlock[];
  formatBadges?: string[];
  admissionNote?: string;
  registrationNote?: string;
  registrationIncludes?: string[];
  quickLinks?: { label: string; url: string }[];
  schedulePublished?: boolean;
  schedule?: ScheduleDay[];
  venue?: {
    travelInfo?: PortableTextBlock[];
    hotels?: PortableTextBlock[];
    mapUrl?: string;
    directionsUrl?: string;
  };
  howToWatch?: {
    description?: string;
    channels?: WatchChannel[];
  };
  sponsors?: EventHubSponsor[];
  contactEmails?: { label?: string; email?: string }[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImageWithAlt | null;
  };
  // Inherited from event reference
  startDateTime: string;
  endDateTime?: string;
  timezone?: string;
  location?: {
    name?: string;
    address?: string;
    type?: "physical" | "online" | "hybrid";
    mapUrl?: string;
  };
  registration?: {
    required?: boolean;
    url?: string;
    deadline?: string;
    capacity?: number;
    price?: number;
  };
  teams?: TeamSummary[];
  documents?: {
    title?: string;
    category?: string;
    asset?: { url: string; originalFilename?: string; size?: number };
  }[];
  featuredImage?: SanityImageWithAlt | null;
}

export async function getEventHubSlugs(locale: Locale = "en"): Promise<{ slug: string; eventSlug: string }[]> {
  return await sanityClient.fetch(
    groq`*[_type == "eventHub" && defined(slug[$locale].current)] {
      "slug": slug[$locale].current,
      "eventSlug": event->slug[$locale].current
    }`,
    { locale }
  );
}

export async function getEventHub(
  slug: string,
  locale: Locale = "en"
): Promise<EventHubDetail | null> {
  return await sanityClient.fetch(
    groq`*[_type == "eventHub" && slug[$locale].current == $slug][0] {
      _id,
      "slug": slug[$locale].current,
      "slugEn": slug.en.current,
      "slugFr": slug.fr.current,
      "title": coalesce(title[$locale], title.en),
      "heroLabel": coalesce(heroLabel[$locale], heroLabel.en),
      "heroSubtitle": coalesce(heroSubtitle[$locale], heroSubtitle.en),
      heroCtaPrimary {
        "label": coalesce(label[$locale], label.en),
        href
      },
      heroCtaSecondary {
        "label": coalesce(label[$locale], label.en),
        href
      },
      "aboutContent": coalesce(aboutContent[$locale], aboutContent.en),
      "formatBadges": formatBadges[].[$locale],
      "admissionNote": coalesce(admissionNote[$locale], admissionNote.en),
      "registrationNote": coalesce(registrationNote[$locale], registrationNote.en),
      "registrationIncludes": registrationIncludes[].[$locale],
      "quickLinks": quickLinks[] {
        "label": coalesce(label[$locale], label.en),
        url
      },
      schedulePublished,
      schedule[] {
        "dayLabel": coalesce(dayLabel[$locale], dayLabel.en),
        "daySubtitle": coalesce(daySubtitle[$locale], daySubtitle.en),
        date,
        items[] {
          time,
          "label": coalesce(label[$locale], label.en),
          "description": coalesce(description[$locale], description.en),
          highlight
        }
      },
      venue {
        "travelInfo": coalesce(travelInfo[$locale], travelInfo.en),
        "hotels": coalesce(hotels[$locale], hotels.en),
        mapUrl,
        directionsUrl
      },
      howToWatch {
        "description": coalesce(description[$locale], description.en),
        channels[] {
          name,
          url,
          platform
        }
      },
      sponsors[] {
        name,
        logo,
        url,
        "message": coalesce(message[$locale], message.en),
        tier
      },
      contactEmails[] {
        "label": coalesce(label[$locale], label.en),
        email
      },
      seo {
        "metaTitle": coalesce(metaTitle[$locale], metaTitle.en),
        "metaDescription": coalesce(metaDescription[$locale], metaDescription.en),
        ogImage {
          ...,
          "alt": coalesce(alt[$locale], alt.en)
        }
      },
      // Inherited from event
      "startDateTime": event->startDateTime,
      "endDateTime": event->endDateTime,
      "timezone": event->timezone,
      "location": {
        "name": coalesce(event->location.name[$locale], event->location.name.en),
        "address": event->location.address,
        "type": event->location.type,
        "mapUrl": event->location.mapUrl
      },
      "registration": event->registration {
        required,
        url,
        deadline,
        capacity,
        price
      },
      "teams": event->teams[]-> {
        _id,
        name,
        "slug": slug.current,
        city,
        province,
        logo {
          ...,
          "alt": coalesce(alt[$locale], alt.en)
        }
      },
      "documents": event->documents[] {
        "title": coalesce(title[$locale], title.en),
        category,
        "asset": asset-> {
          url,
          originalFilename,
          size
        }
      },
      "featuredImage": event->featuredImage {
        ...,
        "alt": coalesce(alt[$locale], alt.en)
      }
    }`,
    { slug, locale }
  );
}

// Fetch landing section data
export async function getLandingSection(key: string, locale: Locale): Promise<LandingSection | null> {
  const query = groq`
    *[_id == "landingSection-" + $key][0] {
      _id,
      key,
      "title": coalesce(title[$locale], title.en),
      "intro": coalesce(intro[$locale], intro.en),
      showContent,
      heroImage${IMAGE},
      cards[] {
        "title": coalesce(title[$locale], title.en),
        "body": coalesce(body[$locale], body.en),
        "ctaText": coalesce(ctaText[$locale], ctaText.en),
        "href": coalesce(href[$locale], href.en),
        external
      }
    }
  `;

  const result = await sanityClient.fetch(query, { key, locale });
  return result;
}

// Page documents. Each one has a fixed ID and is listed by name in the Studio sidebar.

export interface PageSection {
  _type: "textSection" | "columnsSection" | "ctaSection";
  _key: string;
  heading?: string | null;
  body?: PortableTextBlock[] | null;
  style?: "plain" | "panel" | "primary" | "light" | null;
  columns?: { _key: string; heading?: string | null; body?: PortableTextBlock[] | null }[] | null;
  cta?: CallToAction | null;
}

export interface PageData {
  title: string;
  subtitle?: string | null;
  heroImage?: SanityImageWithAlt | null;
  sections: PageSection[];
  seo?: { metaTitle?: string | null; metaDescription?: string | null } | null;
}

export type PageId =
  | "page-board"
  | "page-staff"
  | "page-policies"
  | "page-news"
  | "page-upcomingEvents"
  | "page-volunteer"
  | "page-hostEvent";

const SEO = `seo{
  "metaTitle": coalesce(metaTitle[$locale], metaTitle.en),
  "metaDescription": coalesce(metaDescription[$locale], metaDescription.en)
}`;

export async function getPage(id: PageId, locale: Locale): Promise<PageData> {
  const page = await sanityClient.fetch(
    groq`*[_id == $id][0] {
      "title": coalesce(title[$locale], title.en),
      "subtitle": coalesce(subtitle[$locale], subtitle.en),
      heroImage${IMAGE},
      sections[]{
        _type,
        _key,
        style,
        "heading": coalesce(heading[$locale], heading.en),
        "body": coalesce(body[$locale], body.en),
        columns[]{
          _key,
          "heading": coalesce(heading[$locale], heading.en),
          "body": coalesce(body[$locale], body.en)
        },
        cta${CTA}
      },
      ${SEO}
    }`,
    { id, locale }
  );
  if (!page) {
    throw new Error(`Sanity document "${id}" is missing; it should exist for its page to build.`);
  }
  return { ...page, sections: page.sections ?? [] };
}

export interface MenuLink {
  label: string;
  href: string;
}

export interface SiteSettings {
  navigation: (MenuLink & { children: MenuLink[] })[];
  storeUrl?: string | null;
  donateUrl?: string | null;
  footerColumns: { title: string; links: MenuLink[] }[];
  charityNumber?: string | null;
  socialLinks: { platform: string; url: string }[];
  siteDescription?: string | null;
  defaultHeroImage?: SanityImageWithAlt | null;
}

const LINK = `{
  "label": coalesce(label[$locale], label.en),
  "href": coalesce(link[$locale], link.en)
}`;

// Every page renders the header and footer, so fetch the settings once per locale per build
const siteSettingsCache = new Map<Locale, Promise<SiteSettings>>();

export function getSiteSettings(locale: Locale): Promise<SiteSettings> {
  let settings = siteSettingsCache.get(locale);
  if (!settings) {
    settings = sanityClient
      .fetch(
        groq`*[_id == "siteSettings"][0] {
          "navigation": navigation[]{
            "label": coalesce(label[$locale], label.en),
            "href": coalesce(link[$locale], link.en),
            "children": coalesce(children[]${LINK}, [])
          },
          storeUrl,
          donateUrl,
          "footerColumns": footerColumns[]{
            "title": coalesce(title[$locale], title.en),
            "links": coalesce(links[]${LINK}, [])
          },
          charityNumber,
          "socialLinks": socialLinks[defined(url)]{ platform, url },
          "siteDescription": coalesce(siteDescription[$locale], siteDescription.en),
          defaultHeroImage${IMAGE}
        }`,
        { locale }
      )
      .then((data: Partial<SiteSettings> | null) => ({
        ...data,
        navigation: data?.navigation ?? [],
        footerColumns: data?.footerColumns ?? [],
        socialLinks: data?.socialLinks ?? [],
      }));
    siteSettingsCache.set(locale, settings);
  }
  return settings;
}

export interface HomePageData {
  hero?: {
    title?: string | null;
    subtitle?: string | null;
    buttonLabel?: string | null;
    buttonHref?: string | null;
    image?: SanityImageWithAlt | null;
  } | null;
  featuredArticle?: {
    title: string;
    slug?: string | null;
    excerpt?: string | null;
    heroImage?: SanityImageWithAlt | null;
  } | null;
  support?: {
    heading?: string | null;
    body?: string | null;
    donateLabel?: string | null;
    donateUrl?: string | null;
    sponsorshipLabel?: string | null;
    sponsorshipEmail?: string | null;
  } | null;
}

export async function getHomePage(locale: Locale): Promise<HomePageData> {
  const page = await sanityClient.fetch(
    groq`*[_id == "homePage"][0] {
      hero{
        "title": coalesce(title[$locale], title.en),
        "subtitle": coalesce(subtitle[$locale], subtitle.en),
        "buttonLabel": coalesce(buttonLabel[$locale], buttonLabel.en),
        "buttonHref": coalesce(buttonLink[$locale], buttonLink.en),
        image${IMAGE}
      },
      featuredArticle->{
        "title": coalesce(title[$locale], title.en),
        "slug": slug[$locale].current,
        "excerpt": coalesce(excerpt[$locale], excerpt.en),
        heroImage${IMAGE}
      },
      support{
        "heading": coalesce(heading[$locale], heading.en),
        "body": coalesce(body[$locale], body.en),
        "donateLabel": coalesce(donateLabel[$locale], donateLabel.en),
        donateUrl,
        "sponsorshipLabel": coalesce(sponsorshipLabel[$locale], sponsorshipLabel.en),
        sponsorshipEmail
      }
    }`,
    { locale }
  );
  return page ?? {};
}

export interface MissionValuesPageData {
  title: string;
  mission: string;
  values: { title: string; description?: string | null }[];
  seo?: { metaTitle?: string | null; metaDescription?: string | null } | null;
}

export async function getMissionValuesPage(locale: Locale): Promise<MissionValuesPageData> {
  const page = await sanityClient.fetch(
    groq`*[_id == "missionValuesPage"][0] {
      "title": coalesce(title[$locale], title.en),
      "mission": coalesce(mission[$locale], mission.en),
      "values": coalesce(values[]{
        "title": coalesce(title[$locale], title.en),
        "description": coalesce(description[$locale], description.en)
      }, []),
      ${SEO}
    }`,
    { locale }
  );
  if (!page) {
    throw new Error('Sanity document "missionValuesPage" is missing.');
  }
  return page;
}

export interface ContactPageData {
  title: string;
  subtitle?: string | null;
  cards: { icon?: string | null; title: string; description?: string | null; email: string }[];
  socialHeading?: string | null;
  socialBody?: string | null;
  seo?: { metaTitle?: string | null; metaDescription?: string | null } | null;
}

export async function getContactPage(locale: Locale): Promise<ContactPageData> {
  const page = await sanityClient.fetch(
    groq`*[_id == "contactPage"][0] {
      "title": coalesce(title[$locale], title.en),
      "subtitle": coalesce(subtitle[$locale], subtitle.en),
      "cards": coalesce(cards[defined(email)]{
        icon,
        "title": coalesce(title[$locale], title.en),
        "description": coalesce(description[$locale], description.en),
        email
      }, []),
      "socialHeading": coalesce(socialHeading[$locale], socialHeading.en),
      "socialBody": coalesce(socialBody[$locale], socialBody.en),
      ${SEO}
    }`,
    { locale }
  );
  if (!page) {
    throw new Error('Sanity document "contactPage" is missing.');
  }
  return page;
}

// Splits a plain-text field into paragraphs at blank lines
export function paragraphs(text?: string | null): string[] {
  return (text ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}
