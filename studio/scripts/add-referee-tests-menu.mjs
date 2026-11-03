// Run from studio: npx sanity exec scripts/add-referee-tests-menu.mjs --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-12-08'})
// Update an existing editor draft as well, so a later publish preserves the link.
const documents = await client.fetch('*[_id in ["siteSettings", "drafts.siteSettings"]]{_id, _rev, navigation}')
for (const doc of documents) {
  const parent = doc.navigation.find((item) => item.children?.some((child) => child.link?.en === '/volunteer-opportunities/'))
  if (!parent) throw new Error(`Volunteer menu link not found in ${doc._id}`)
  if (parent.children.some((child) => child.link?.en === '/volunteer-opportunities/#referee-tests')) continue
  const volunteer = parent.children.find((child) => child.link?.en === '/volunteer-opportunities/')
  await client.patch(doc._id).ifRevisionId(doc._rev).insert('after', `navigation[_key=="${parent._key}"].children[_key=="${volunteer._key}"]`, [{
    _key: 'referee-tests', _type: 'menuSubItem',
    label: {_type: 'localeString', en: 'Referee Tests', fr: 'Tests d’arbitrage'},
    link: {_type: 'localeUrl', en: '/volunteer-opportunities/#referee-tests', fr: '/fr/benevolat/#referee-tests'},
  }]).commit()
  console.log(`Added Referee Tests menu link to ${doc._id}`)
}
