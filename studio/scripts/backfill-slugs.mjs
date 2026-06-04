#!/usr/bin/env node
/**
 * Backfill missing slugs across all content types.
 *
 * For documents whose slug is empty, generate one from the title/name source
 * (mirroring the Studio's "Generate" behaviour). Only fills empty slugs — it
 * never overwrites an existing slug.
 *
 * Handles both shapes:
 *  - localeSlug (bilingual): slug.en.current / slug.fr.current
 *  - plain slug:             slug.current
 *
 * Usage:
 *   cd studio && npx sanity exec scripts/backfill-slugs.mjs --with-user-token            # apply
 *   cd studio && npx sanity exec scripts/backfill-slugs.mjs --with-user-token -- --dry-run  # preview
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-12-08' })
const DRY_RUN = process.argv.includes('--dry-run')

// type -> { kind, source } where source is a dot-path into the document.
// localeSlug types always source from the localized `title`.
const LOCALE_SLUG_TYPES = {
  event: 'title',
  infoArticle: 'title',
  eventHub: 'title',
  page: 'title',
  newsArticle: 'title',
  resourceArticle: 'title',
}
// plain slug types and the path to their source value.
const PLAIN_SLUG_TYPES = {
  author: 'name',
  boardMember: 'name',
  player: 'name',
  staffMember: 'name',
  team: 'name',
  post: 'title',
  volunteerOpportunity: 'title.en',
}

function slugify(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric -> dash
    .replace(/^-+|-+$/g, '') // trim dashes
    .slice(0, 96)
    .replace(/-+$/g, '')
}

function getPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj)
}

// Resolve a possibly-localized value to a plain string (prefers .en).
function resolveString(value) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') return value.en || value.fr || ''
  return ''
}

async function main() {
  const localeTypes = Object.keys(LOCALE_SLUG_TYPES)
  const plainTypes = Object.keys(PLAIN_SLUG_TYPES)

  // Drafts included by querying raw ids; missing-slug filters per shape.
  const localeDocs = await client.fetch(
    `*[_type in $types && !defined(slug.en.current)]{_id, _type, title}`,
    { types: localeTypes }
  )
  const plainDocs = await client.fetch(
    `*[_type in $types && !defined(slug.current)]{_id, _type, title, name}`,
    { types: plainTypes }
  )

  const patches = []

  for (const doc of localeDocs) {
    const titleEn = resolveString(getPath(doc, 'title.en') ?? doc.title)
    const titleFr = getPath(doc, 'title.fr')
    const enSlug = slugify(titleEn)
    if (!enSlug) {
      console.warn(`⚠ ${doc._type} ${doc._id}: no title to derive slug from — skipping`)
      continue
    }
    const frSlug = slugify(resolveString(titleFr) || titleEn) || enSlug
    patches.push({
      _id: doc._id,
      label: `${doc._type} "${titleEn}"`,
      set: {
        slug: {
          en: { _type: 'slug', current: enSlug },
          fr: { _type: 'slug', current: frSlug },
        },
      },
      preview: `en=${enSlug} | fr=${frSlug}`,
    })
  }

  for (const doc of plainDocs) {
    const source = PLAIN_SLUG_TYPES[doc._type]
    const value = resolveString(getPath(doc, source))
    const current = slugify(value)
    if (!current) {
      console.warn(`⚠ ${doc._type} ${doc._id}: no source value to derive slug from — skipping`)
      continue
    }
    patches.push({
      _id: doc._id,
      label: `${doc._type} "${value}"`,
      set: { slug: { _type: 'slug', current } },
      preview: current,
    })
  }

  if (patches.length === 0) {
    console.log('✓ No documents missing slugs. Nothing to do.')
    return
  }

  console.log(`${DRY_RUN ? '[dry-run] ' : ''}Backfilling ${patches.length} slug(s):`)
  for (const p of patches) {
    console.log(`  • ${p.label} (${p._id})\n      -> ${p.preview}`)
  }

  if (DRY_RUN) {
    console.log('\n[dry-run] No changes written.')
    return
  }

  let tx = client.transaction()
  for (const p of patches) {
    tx = tx.patch(p._id, (patch) => patch.set(p.set))
  }
  const res = await tx.commit()
  console.log(`\n✓ Committed ${patches.length} patch(es). Transaction ${res.transactionId}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
