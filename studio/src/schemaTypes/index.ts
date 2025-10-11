// Object types
import blockContent from './objects/blockContent'
import color from './objects/color'
import ctaBlock from './objects/ctaBlock'
import formEmbed from './objects/formEmbed'
import {
  localeString,
  localeText,
  localeSlug,
  localePortableText
} from './helpers/localization'

// Document types
import post from './documents/post'
import page from './documents/page'
import newsArticle from './documents/newsArticle'
import event from './documents/event'
import team from './documents/team'
import player from './documents/player'
import author from './documents/author'
import siteSettings from './documents/siteSettings'
import infoArticle from './documents/infoArticle'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/schema-types

export const schemaTypes = [
  // Documents
  post,
  page,
  newsArticle,
  infoArticle,
  event,
  team,
  player,
  author,
  siteSettings,
  ctaBlock,
  formEmbed,

  // Objects
  blockContent,
  color,
  localeString,
  localeText,
  localeSlug,
  localePortableText,
]
