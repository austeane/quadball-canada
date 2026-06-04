#!/usr/bin/env node
/**
 * Replace the City of Oshawa logo with Durham Tourism / Sport Durham logo.
 *
 * Usage:
 *   source studio/.env && node studio/scripts/replace-oshawa-logo.mjs
 */
import { createClient } from '@sanity/client'
import { createReadStream } from 'fs'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'kbufa3g3',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-12-08',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
})

const EVENT_HUB_ID = 'eventHub-nationals-2026'

// 1. Upload the new Durham Tourism logo (PNG with transparency)
console.log('Uploading Durham Tourism / Sport Durham logo...')
const imageAsset = await client.assets.upload(
  'image',
  createReadStream('/Users/austin/Downloads/637854660_1576046420279339_8122866604850712439_n.png'),
  { filename: 'durham-tourism-sport-durham-logo.png' }
)
console.log(`Uploaded image: ${imageAsset._id}`)

// 2. Fetch current document to find the Oshawa sponsor index
const hub = await client.fetch(
  `*[_id == $id][0]{sponsors}`,
  { id: EVENT_HUB_ID }
)

const sponsorIndex = hub.sponsors?.findIndex((s) => s._key === 'oshawa')
if (sponsorIndex === -1 || sponsorIndex === undefined) {
  console.error('Could not find sponsor with _key "oshawa"')
  process.exit(1)
}

// 3. Patch the sponsor logo in place
const result = await client
  .patch(EVENT_HUB_ID)
  .set({
    [`sponsors[_key=="oshawa"].logo`]: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: imageAsset._id,
      },
    },
    [`sponsors[_key=="oshawa"].name`]: 'Durham Tourism',
    [`sponsors[_key=="oshawa"].url`]: 'https://www.durhamtourism.ca/',
  })
  .commit()

console.log(`Updated sponsor logo on ${result._id} (rev: ${result._rev})`)
