#!/usr/bin/env node
/**
 * One-time script: set the three section images on the eventBidsPage document
 * using existing Sanity image assets.
 *
 * Usage: cd studio && npx sanity exec scripts/set-bids-images.mjs
 */
import { getCliClient } from 'sanity/cli'

const client = getCliClient({ apiVersion: '2024-12-08' })

const DOC_ID = '0b6024b4-9b84-4349-bb82-d38bb868ccda'

// 2RS01173 — players with hoops visible (intro)
const introRef = 'image-b4813562d1529e718a75511ad28f817d8edf6158-2048x1365-jpg'
// website2025-1 — Team Canada celebrating (selection process)
const selectionRef = 'image-1fd47652054b1862da1a35ba376b010a9040ce46-2048x676-jpg'
// website2025-2 — team huddle (get involved)
const getInvolvedRef = 'image-db14dd3606fdc58b9d67443595723a0672d750ff-2048x676-jpg'

async function main() {
  const result = await client
    .patch(DOC_ID)
    .set({
      introImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: introRef },
      },
      selectionImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: selectionRef },
      },
      getInvolvedImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: getInvolvedRef },
      },
    })
    .commit()

  console.log('Patched eventBidsPage with images:', result._id)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
