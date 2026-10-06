#!/usr/bin/env node
/**
 * Move policy documents (published and drafts) from the old category values to
 * the 2026 category set.
 *
 * Usage:
 *   cd studio && npx sanity exec scripts/migrate-policy-categories.mjs --with-user-token -- --dry-run  # preview
 *   cd studio && npx sanity exec scripts/migrate-policy-categories.mjs --with-user-token             # apply
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-12-08' })
const DRY_RUN = process.argv.includes('--dry-run')

const CATEGORY_MAP = {
  general: 'administrative',
  communication: 'communications',
  'team-canada': 'national-team',
  rules: 'gameplay',
}

const docs = await client.fetch(
  `*[_type == "policy" && category in $old]{_id, category, "title": title.en}`,
  { old: Object.keys(CATEGORY_MAP) },
)

if (docs.length === 0) {
  console.log('No policies need migrating.')
  process.exit(0)
}

const tx = client.transaction()
for (const doc of docs) {
  const next = CATEGORY_MAP[doc.category]
  console.log(`${doc._id}: ${doc.category} -> ${next} (${doc.title})`)
  tx.patch(doc._id, (p) => p.set({ category: next }))
}

if (DRY_RUN) {
  console.log(`\nDry run: ${docs.length} policies would be updated.`)
} else {
  await tx.commit()
  console.log(`\nUpdated ${docs.length} policies.`)
}
