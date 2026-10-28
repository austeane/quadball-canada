import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import type {ComponentType} from 'react'
import {
  FiAward,
  FiBook,
  FiBookOpen,
  FiCalendar,
  FiFile,
  FiFileText,
  FiFlag,
  FiFolder,
  FiHeart,
  FiHome,
  FiLayout,
  FiMail,
  FiSettings,
  FiShield,
  FiStar,
  FiUser,
  FiUsers,
} from 'react-icons/fi'

// Document types that exist exactly once per page. Editors edit them from the
// sidebar but can't create, duplicate or delete them.
export const SINGLETON_TYPES = new Set([
  'homePage',
  'siteSettings',
  'missionValuesPage',
  'contactPage',
  'teamsPage',
  'nationalTeamPage',
  'eventBidsPage',
  'landingSection',
  'page',
])

// One document for one fixed page on the site
function pageItem(
  S: StructureBuilder,
  title: string,
  schemaType: string,
  documentId: string,
  icon: ComponentType = FiFile,
) {
  return S.listItem()
    .title(title)
    .id(documentId)
    .icon(icon)
    .child(S.document().schemaType(schemaType).documentId(documentId).title(title))
}

// Every document of a repeatable type, e.g. all news articles
function listItem(S: StructureBuilder, title: string, schemaType: string, icon: ComponentType) {
  return S.listItem()
    .title(title)
    .id(schemaType)
    .icon(icon)
    .child(S.documentTypeList(schemaType).title(title))
}

function folder(S: StructureBuilder, title: string, icon: ComponentType, items: ReturnType<StructureBuilder['listItem']>[]) {
  return S.listItem()
    .title(title)
    .id(title.toLowerCase().replace(/\W+/g, '-'))
    .icon(icon)
    .child(S.list().title(title).items(items))
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Quadball Canada')
    .items([
      pageItem(S, 'Home Page', 'homePage', 'homePage', FiHome),
      S.divider(),
      folder(S, 'About Us', FiHeart, [
        pageItem(S, 'About Us page', 'landingSection', 'landingSection-about', FiLayout),
        pageItem(S, 'Mission & Values', 'missionValuesPage', 'missionValuesPage', FiHeart),
        pageItem(S, 'Meet the Board page', 'page', 'page-board', FiLayout),
        listItem(S, 'Board members', 'boardMember', FiUser),
        pageItem(S, 'Meet the Staff page', 'page', 'page-staff', FiLayout),
        listItem(S, 'Staff members', 'staffMember', FiUser),
        listItem(S, 'Info articles (What is Quadball, Inclusion…)', 'infoArticle', FiBookOpen),
        pageItem(S, 'National Team page', 'nationalTeamPage', 'nationalTeamPage', FiFlag),
      ]),
      folder(S, 'News', FiFileText, [
        pageItem(S, 'News page', 'page', 'page-news', FiLayout),
        listItem(S, 'News articles', 'newsArticle', FiFileText),
      ]),
      folder(S, 'Events', FiCalendar, [
        pageItem(S, 'Events page', 'landingSection', 'landingSection-events', FiLayout),
        pageItem(S, 'Upcoming Events page', 'page', 'page-upcomingEvents', FiLayout),
        listItem(S, 'Events', 'event', FiCalendar),
        listItem(S, 'Event hubs (Nationals)', 'eventHub', FiStar),
        pageItem(S, 'Event Bids page', 'eventBidsPage', 'eventBidsPage', FiAward),
      ]),
      folder(S, 'Get Involved', FiUsers, [
        pageItem(S, 'Get Involved page', 'landingSection', 'landingSection-getInvolved', FiLayout),
        pageItem(S, 'Teams page', 'teamsPage', 'teamsPage', FiLayout),
        listItem(S, 'Teams', 'team', FiUsers),
        pageItem(S, 'Volunteer page', 'page', 'page-volunteer', FiLayout),
        listItem(S, 'Volunteer opportunities', 'volunteerOpportunity', FiHeart),
        pageItem(S, 'Host an Event page', 'page', 'page-hostEvent', FiLayout),
      ]),
      folder(S, 'Resources', FiFolder, [
        pageItem(S, 'Resources page', 'landingSection', 'landingSection-resources', FiLayout),
        pageItem(S, 'Policies page', 'page', 'page-policies', FiLayout),
        listItem(S, 'Policies', 'policy', FiShield),
        listItem(S, 'Resource articles (guides)', 'resourceArticle', FiBook),
      ]),
      pageItem(S, 'Contact page', 'contactPage', 'contactPage', FiMail),
      S.divider(),
      pageItem(S, 'Site Settings (menu, footer, social links)', 'siteSettings', 'siteSettings', FiSettings),
    ])
