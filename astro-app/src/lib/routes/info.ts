import type { Locale } from "../../utils/localization";
import { getInfoArticles } from "../../utils/sanity";

export async function buildInfoStaticPaths(locale: Locale) {
  const articles = await getInfoArticles(locale);
  return articles.map((article) => ({
    params: { slug: article.slug },
    props: { locale, slug: article.slug },
  }));
}
