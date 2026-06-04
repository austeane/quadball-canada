// Shared slug-generation logic used by the auto-slug document action.
//
// Two slug shapes exist in this Studio:
//   - localeSlug (bilingual): slug.en.current / slug.fr.current, sourced from `title`
//   - plain slug:             slug.current, sourced from a per-type field
//
// Keep these maps in sync with the schema. The standalone backfill script
// (studio/scripts/backfill-slugs.mjs) intentionally mirrors this logic.

// localeSlug types -> the localized title field they derive from.
export const LOCALE_SLUG_TYPES: Record<string, string> = {
  event: 'title',
  infoArticle: 'title',
  eventHub: 'title',
  page: 'title',
  newsArticle: 'title',
  resourceArticle: 'title',
}

// plain slug types -> dot-path to the value they derive from.
export const PLAIN_SLUG_TYPES: Record<string, string> = {
  author: 'name',
  boardMember: 'name',
  player: 'name',
  staffMember: 'name',
  team: 'name',
  post: 'title',
  volunteerOpportunity: 'title.en',
}

export function slugify(input: unknown): string {
  return String(input ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric -> dash
    .replace(/^-+|-+$/g, '') // trim leading/trailing dashes
    .slice(0, 96)
    .replace(/-+$/g, '')
}

function getPath(obj: any, path: string): unknown {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj)
}

// Resolve a possibly-localized value to a plain string (prefers English).
function resolveString(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>
    return (v.en as string) || (v.fr as string) || ''
  }
  return ''
}

type Mutation = Record<string, any>

/**
 * Compute the patch mutations needed to fill in any missing slug on a document,
 * or null if the slug is already present / cannot be derived. Never overwrites
 * an existing slug.
 */
export function slugMutations(type: string, doc: any): Mutation[] | null {
  if (!doc) return null

  if (LOCALE_SLUG_TYPES[type]) {
    const title = (doc[LOCALE_SLUG_TYPES[type]] as Record<string, unknown>) || {}
    const set: Record<string, any> = {}
    if (!doc.slug?.en?.current) {
      const en = slugify(title.en)
      if (en) set['slug.en'] = { _type: 'slug', current: en }
    }
    if (!doc.slug?.fr?.current) {
      const fr = slugify(title.fr) || slugify(title.en)
      if (fr) set['slug.fr'] = { _type: 'slug', current: fr }
    }
    if (Object.keys(set).length === 0) return null
    return [{ setIfMissing: { slug: {} } }, { set }]
  }

  if (PLAIN_SLUG_TYPES[type]) {
    if (doc.slug?.current) return null
    const current = slugify(resolveString(getPath(doc, PLAIN_SLUG_TYPES[type])))
    if (!current) return null
    return [{ set: { slug: { _type: 'slug', current } } }]
  }

  return null
}
