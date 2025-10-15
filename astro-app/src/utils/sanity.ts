import { sanityClient } from "sanity:client";
import type { PortableTextBlock } from "@portabletext/types";
import type { ImageAsset } from "@sanity/types";
import groq from "groq";

export type Locale = "en" | "fr";

export interface SanityImageWithAlt {
  _type: "image";
  asset: ImageAsset;
  alt?: string;
  crop?: Record<string, unknown>;
  hotspot?: Record<string, unknown>;
  [key: string]: unknown;
}

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

export interface EventDetail extends EventSummary {
  description?: string;
  content?: PortableTextBlock[];
  slugEn?: string;
  slugFr?: string;
}

export interface TeamSummary {
  _id: string;
  slug: string;
  name: string;
  city?: string;
  province?: string;
  contactLevel?: "full-contact" | "recreational";
  division?: string;
  email?: string;
  website?: string;
  description?: string | null;
  logo?: SanityImageWithAlt | null;
  socialMedia?: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
  } | null;
  active?: boolean;
}

export interface VolunteerOpportunitySummary {
  _id: string;
  slug: string;
  title: string;
  summary?: string | null;
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

export interface AboutPageData {
  _id: string;
  title: string;
  subtitle?: string;
  heroCtaText?: string;
  heroCtaHref?: string;
  content: PortableTextBlock[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImageWithAlt | null;
  } | null;
}

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
      "content": coalesce(content[$locale], content.en)
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
      contactLevel,
      division,
      email,
      website,
      active,
      "description": coalesce(description[$locale], description.en),
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
      location,
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
      heroImage{
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

export async function getAboutPage(locale: Locale = "en"): Promise<AboutPageData | null> {
  const page = await sanityClient.fetch(
    groq`*[_type == "aboutPage"][0] {
      _id,
      "title": coalesce(title[$locale], title.en),
      "subtitle": coalesce(subtitle[$locale], subtitle.en),
      "heroCtaText": coalesce(heroCtaText[$locale], heroCtaText.en),
      heroCtaHref,
      "content": coalesce(content[$locale], content.en),
      seo {
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
    ...page,
    content: page.content ?? [],
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
