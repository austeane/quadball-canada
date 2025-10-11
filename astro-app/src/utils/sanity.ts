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

export async function getTeams(_locale: Locale = "en"): Promise<TeamSummary[]> {
  return await sanityClient.fetch(
    groq`*[_type == "team" && defined(slug.current)] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      city,
      province
    }`
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
