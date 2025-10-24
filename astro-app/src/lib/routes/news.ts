import type { Locale } from "../../utils/localization";
import { getNewsArticles } from "../../utils/sanity";

export async function buildNewsStaticPaths(locale: Locale) {
  const articles = await getNewsArticles(locale);
  return articles.map((article) => ({
    params: { slug: article.slug },
    props: { locale, slug: article.slug },
  }));
}
