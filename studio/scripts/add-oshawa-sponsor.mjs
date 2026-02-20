#!/usr/bin/env node
/**
 * Upload the City of Oshawa logo and add it as a sponsor to the eventHub document.
 *
 * Usage:
 *   source studio/.env && node studio/scripts/add-oshawa-sponsor.mjs
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

// 1. Upload the image
console.log('Uploading Oshawa logo...')
const imageAsset = await client.assets.upload(
  'image',
  createReadStream('/Users/austin/Downloads/631376208_933070826043778_5045566527209762932_n.png'),
  { filename: 'city-of-oshawa-logo.png' }
)
console.log(`Uploaded image: ${imageAsset._id}`)

// 2. Patch the eventHub to add sponsor
const result = await client
  .patch(EVENT_HUB_ID)
  .setIfMissing({ sponsors: [] })
  .append('sponsors', [
    {
      _type: 'sponsor',
      _key: 'oshawa',
      name: 'City of Oshawa',
      logo: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id,
        },
      },
      url: 'https://www.oshawa.ca/',
      tier: 'title',
    },
  ])
  .commit()

console.log(`Added Oshawa sponsor to ${result._id} (rev: ${result._rev})`)
