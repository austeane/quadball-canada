// Object types
import blockContent from './objects/blockContent'
import callToAction from './objects/callToAction'
import color from './objects/color'
import {columnsSection, ctaSection, textSection} from './objects/pageSections'
import teamLevelSection from './objects/teamLevelSection'
import {
  localeString,
  localeText,
  localeSlug,
  localePortableText,
  localeUrl,
} from './helpers/localization'

// Document types
import homePage from './documents/homePage'
import page from './documents/page'
import missionValuesPage from './documents/missionValuesPage'
import contactPage from './documents/contactPage'
import newsArticle from './documents/newsArticle'
import event from './documents/event'
import team from './documents/team'
import siteSettings from './documents/siteSettings'
import infoArticle from './documents/infoArticle'
import resourceArticle from './documents/resourceArticle'
import staffMember from './documents/staffMember'
import boardMember from './documents/boardMember'
import volunteerOpportunity from './documents/volunteerOpportunity'
import teamsPage from './documents/teamsPage'
import nationalTeamPage from './documents/nationalTeamPage'
import policy from './documents/policy'
import landingSection from './documents/landingSection'
import eventBidsPage from './documents/eventBidsPage'
import eventHub from './documents/eventHub'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/schema-types

export const schemaTypes = [
  // Documents
  homePage,
  page,
  missionValuesPage,
  contactPage,
  teamsPage,
  nationalTeamPage,
  newsArticle,
  infoArticle,
  resourceArticle,
  volunteerOpportunity,
  staffMember,
  boardMember,
  event,
  team,
  siteSettings,
  policy,
  landingSection,
  eventBidsPage,
  eventHub,

  // Objects
  teamLevelSection,
  callToAction,
  textSection,
  columnsSection,
  ctaSection,
  blockContent,
  color,
  localeString,
  localeText,
  localeSlug,
  localePortableText,
  localeUrl,
]
