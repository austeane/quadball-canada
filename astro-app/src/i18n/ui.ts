import type { Locale } from "../utils/localization";
import { DEFAULT_LOCALE } from "./config";

const uiCopy = {
  en: {
    "seo.siteDescription": "Quadball Canada — official site. Building community through sport across Canada.",
    "layout.skipLink": "Skip to content",
    "layout.languageLabel": "Language",
    "cta.contact": "Contact",
    "cta.store": "Store",
    "cta.donate": "Donate",
    "footer.followUs": "Follow Us",
    "footer.contact": "Contact Us",
    "news.empty": "No news yet.",
    "news.backToNews": "Back to News",
    "news.share": "Share",
    "news.copyLink": "Copy Link",
    "news.linkCopied": "Link copied!",
    "news.relatedArticles": "Related Articles",
    "news.minRead": "min read",
    "events.upcomingLink": "View Upcoming Events",
    "events.calendarIcs": "Add to Calendar (ICS)",
    "eventBids.domesticHosts.heading": "Selected Hosts — Domestic",
    "eventBids.internationalHosts.heading": "Selected Hosts — International",
    "eventBids.currentBids.heading": "Current Bid Cycle",
    "eventBids.status.open": "Open",
    "eventBids.status.closed": "Closed",
    "eventBids.status.comingSoon": "Coming Soon",
    "eventBids.downloadManual": "Download Bid Manual",
    "eventBids.submitBid": "Submit a Bid",
    "eventBids.deadline": "Deadline",
    "eventBids.noCurrentCycle": "No active bid cycle at this time. Check back for future opportunities.",
    "eventBids.hostsTable.event": "Event",
    "eventBids.hostsTable.city": "Host City",
    "eventBids.hostsTable.date": "Date",
    // Event Hub
    "eventHub.beginsIn": "Tournament begins in",
    "eventHub.inProgress": "Tournament in progress!",
    "eventHub.complete": "Tournament complete",
    "eventHub.days": "Days",
    "eventHub.hours": "Hours",
    "eventHub.min": "Min",
    "eventHub.sec": "Sec",
    "eventHub.when": "When",
    "eventHub.where": "Where",
    "eventHub.teams": "Teams",
    "eventHub.admission": "Admission",
    "eventHub.about": "About",
    "eventHub.registration": "Registration",
    "eventHub.schedule": "Schedule",
    "eventHub.venue": "Venue & Travel",
    "eventHub.teamsSection": "Competing Teams",
    "eventHub.downloads": "Downloads",
    "eventHub.watch": "How to Watch",
    "eventHub.sponsors": "Sponsors",
    "eventHub.contact": "Questions?",
    "eventHub.contactSubtitle": "Reach out to our tournament team for any inquiries.",
    "eventHub.regDeadline": "Registration deadline",
    "eventHub.perTeam": "per player",
    "eventHub.registerCta": "Register Now",
    "eventHub.includes": "Registration includes:",
    "eventHub.copyLink": "Copy Link",
    "eventHub.copied": "Copied!",
    "eventHub.shareTwitter": "Share on Twitter",
    "eventHub.shareFacebook": "Share on Facebook",
    "eventHub.gettingThere": "Getting There",
    "eventHub.nearbyHotels": "Nearby Hotels",
    "eventHub.getDirections": "Get Directions",
    "eventHub.backToEvents": "Back to Events",
    "eventHub.teamsCount": "Teams",
    "eventHub.freeAdmission": "Free",
    "eventHub.scheduleTBA": "The schedule will be published closer to the event. Check back here later!",
  },
  fr: {
    "seo.siteDescription": "Quadball Canada — site officiel. Construire une communaute sportive partout au Canada.",
    "layout.skipLink": "Aller au contenu",
    "layout.languageLabel": "Langue",
    "cta.contact": "Nous joindre",
    "cta.store": "Boutique",
    "cta.donate": "Faire un don",
    "footer.followUs": "Nous suivre",
    "footer.contact": "Nous joindre",
    "news.empty": "Aucune nouvelle pour le moment.",
    "news.backToNews": "Retour aux nouvelles",
    "news.share": "Partager",
    "news.copyLink": "Copier le lien",
    "news.linkCopied": "Lien copié!",
    "news.relatedArticles": "Articles connexes",
    "news.minRead": "min de lecture",
    "events.upcomingLink": "Voir les événements à venir",
    "events.calendarIcs": "Ajouter au calendrier (ICS)",
    "eventBids.domesticHosts.heading": "Hôtes sélectionnés — National",
    "eventBids.internationalHosts.heading": "Hôtes sélectionnés — International",
    "eventBids.currentBids.heading": "Cycle d'appel d'offres en cours",
    "eventBids.status.open": "Ouvert",
    "eventBids.status.closed": "Fermé",
    "eventBids.status.comingSoon": "Bientôt",
    "eventBids.downloadManual": "Télécharger le manuel d'appel d'offres",
    "eventBids.submitBid": "Soumettre une candidature",
    "eventBids.deadline": "Date limite",
    "eventBids.noCurrentCycle": "Aucun cycle d'appel d'offres actif pour le moment. Revenez pour les prochaines occasions.",
    "eventBids.hostsTable.event": "Événement",
    "eventBids.hostsTable.city": "Ville hôte",
    "eventBids.hostsTable.date": "Date",
    // Event Hub
    "eventHub.beginsIn": "Le tournoi commence dans",
    "eventHub.inProgress": "Tournoi en cours!",
    "eventHub.complete": "Tournoi termine",
    "eventHub.days": "Jours",
    "eventHub.hours": "Heures",
    "eventHub.min": "Min",
    "eventHub.sec": "Sec",
    "eventHub.when": "Quand",
    "eventHub.where": "Lieu",
    "eventHub.teams": "Equipes",
    "eventHub.admission": "Admission",
    "eventHub.about": "A propos",
    "eventHub.registration": "Inscription",
    "eventHub.schedule": "Horaire",
    "eventHub.venue": "Lieu et transport",
    "eventHub.teamsSection": "Equipes participantes",
    "eventHub.downloads": "Telechargements",
    "eventHub.watch": "Comment regarder",
    "eventHub.sponsors": "Commanditaires",
    "eventHub.contact": "Questions?",
    "eventHub.contactSubtitle": "Contactez notre equipe de tournoi pour toute demande.",
    "eventHub.regDeadline": "Date limite d'inscription",
    "eventHub.perTeam": "par joueur",
    "eventHub.registerCta": "S'inscrire maintenant",
    "eventHub.includes": "L'inscription comprend:",
    "eventHub.copyLink": "Copier le lien",
    "eventHub.copied": "Copie!",
    "eventHub.shareTwitter": "Partager sur Twitter",
    "eventHub.shareFacebook": "Partager sur Facebook",
    "eventHub.gettingThere": "Comment s'y rendre",
    "eventHub.nearbyHotels": "Hotels a proximite",
    "eventHub.getDirections": "Obtenir l'itineraire",
    "eventHub.backToEvents": "Retour aux evenements",
    "eventHub.teamsCount": "Equipes",
    "eventHub.freeAdmission": "Gratuit",
    "eventHub.scheduleTBA": "L'horaire sera publie a l'approche de l'evenement. Revenez ici bientot!",
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
