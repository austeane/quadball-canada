import type { Locale } from "../utils/localization";
import { DEFAULT_LOCALE } from "./config";

const uiCopy = {
  en: {
    "seo.siteDescription": "Quadball Canada — official site. Building community through sport across Canada.",
    "layout.skipLink": "Skip to content",
    "layout.languageLabel": "Language",
    "nav.announcements": "Announcements",
    "nav.about": "About Us",
    "nav.about.missionValues": "Mission & Values",
    "nav.about.board": "Meet the Board",
    "nav.about.staff": "Meet the Staff",
    "nav.about.teams": "Our Teams",
    "nav.about.whatIsQuadball": "What is Quadball?",
    "nav.resources": "Resources",
    "nav.resources.all": "All Resources",
    "nav.resources.policies": "Policies",
    "nav.events": "Events",
    "nav.events.upcoming": "Upcoming Events",
    "nav.events.host": "Host an Event",
    "nav.getInvolved": "Get Involved",
    "nav.getInvolved.findTeam": "Find a Team",
    "nav.getInvolved.volunteer": "Volunteer Opportunities",
    "nav.getInvolved.host": "Host an Event",
    "nav.getInvolved.teamCanada": "Team Canada",
    "cta.contact": "Contact",
    "cta.store": "Store",
    "cta.donate": "Donate",
    "hero.title": "Quadball Canada",
    "hero.subtitle": "Building community through sport across Canada.",
    "hero.cta": "Get Involved",
    "support.title": "Support Quadball Canada",
    "support.description": "Your donation helps grow quadball nationwide and supports inclusive programs.",
    "support.primaryCta": "Donate",
    "support.secondaryCta": "Sponsorship",
    "footer.getInvolved": "Get Involved",
    "footer.findTeam": "Find a Team",
    "footer.hostEvent": "Host an Event",
    "footer.teamCanada": "Team Canada",
    "footer.volunteer": "Volunteer",
    "footer.explore": "Explore",
    "footer.about": "About",
    "footer.news": "Latest News",
    "footer.events": "Events",
    "footer.rules": "Rules",
    "footer.followUs": "Follow Us",
    "footer.contact": "Contact Us",
    "utility.search": "Search",
    "news.title": "News",
    "news.empty": "No news yet.",
  },
  fr: {
    "seo.siteDescription": "Quadball Canada — site officiel. Construire une communaute sportive partout au Canada.",
    "layout.skipLink": "Aller au contenu",
    "layout.languageLabel": "Langue",
    "nav.announcements": "Communiques",
    "nav.about": "A propos",
    "nav.about.missionValues": "Mission et valeurs",
    "nav.about.board": "Conseil d'administration",
    "nav.about.staff": "Equipe",
    "nav.about.teams": "Nos equipes",
    "nav.about.whatIsQuadball": "Qu'est-ce que le quadball?",
    "nav.resources": "Ressources",
    "nav.resources.all": "Toutes les ressources",
    "nav.resources.policies": "Politiques",
    "nav.events": "Evenements",
    "nav.events.upcoming": "Evenements a venir",
    "nav.events.host": "Organiser un evenement",
    "nav.getInvolved": "S'impliquer",
    "nav.getInvolved.findTeam": "Trouver une equipe",
    "nav.getInvolved.volunteer": "Benevolat",
    "nav.getInvolved.host": "Organiser un evenement",
    "nav.getInvolved.teamCanada": "Equipe Canada",
    "cta.contact": "Nous joindre",
    "cta.store": "Boutique",
    "cta.donate": "Faire un don",
    "hero.title": "Quadball Canada",
    "hero.subtitle": "Une communaute sportive inclusive partout au Canada.",
    "hero.cta": "S'impliquer",
    "support.title": "Soutenir Quadball Canada",
    "support.description": "Vos contributions aident a developper le quadball et a soutenir des programmes inclusifs.",
    "support.primaryCta": "Faire un don",
    "support.secondaryCta": "Commandites",
    "footer.getInvolved": "S'impliquer",
    "footer.findTeam": "Trouver une equipe",
    "footer.hostEvent": "Organiser un evenement",
    "footer.teamCanada": "Equipe Canada",
    "footer.volunteer": "Benevolat",
    "footer.explore": "Explorer",
    "footer.about": "A propos",
    "footer.news": "Nouvelles",
    "footer.events": "Evenements",
    "footer.rules": "Regles",
    "footer.followUs": "Nous suivre",
    "footer.contact": "Nous joindre",
    "utility.search": "Recherche",
    "news.title": "Nouvelles",
    "news.empty": "Aucune nouvelle pour le moment.",
  },
} as const;

type UiLocaleMap = typeof uiCopy;
type UiKey = keyof UiLocaleMap["en"];

export type TranslationKey = UiKey;

export function t(locale: Locale, key: TranslationKey): string {
  const localeMap = uiCopy[locale] ?? uiCopy[DEFAULT_LOCALE];
  if (localeMap && key in localeMap) {
    return localeMap[key as UiKey];
  }

  const fallbackMap = uiCopy[DEFAULT_LOCALE];
  if (fallbackMap && key in fallbackMap) {
    if (import.meta.env.DEV) {
      console.warn(
        `[i18n] Missing translation for key "${key}" in locale "${locale}". Falling back to ${DEFAULT_LOCALE}.`
      );
    }
    return fallbackMap[key as UiKey];
  }

  if (import.meta.env.DEV) {
    console.warn(`[i18n] Missing translation key "${key}".`);
  }
  return key;
}
