#!/usr/bin/env node
/**
 * Patch the Nationals 2026 event document with correct venue, registration, and teams.
 *
 * Usage:
 *   cd studio && npx sanity exec scripts/patch-nationals-event.mjs
 */
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'kbufa3g3',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-12-08',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
})

const EVENT_ID = '88Y7jbGjEH6vX81gXW3HcK'

// Teams registered on TopScore (matched to Sanity IDs)
const TEAM_IDS = [
  '3dd9b972-e7a7-45e8-b0b9-810a7df49ca6', // Alberta Clippers
  '32f9a7e2-0844-4a3d-b6de-9ef11f844a5f', // Carleton Ravens
  'd3f5485f-6ef5-4d37-99ce-34c57a80215b', // Mischief Quadball
  '37bcd9f4-aa53-4717-bc9d-9bfaf6ec4f51', // Montréal Flamingos
  '2151d8e0-f73e-453d-a6b2-807dd7434d38', // UBC Thunderbirds
  'f795d6a3-6c0f-466c-b402-91354bd24627', // University of Guelph
  'e9231f91-ac78-440d-ac85-6974382c62e5', // uOttawa Quadball
  'de9dbb92-1825-4bfe-9705-f7fecbdbedcf', // University of Waterloo (TorontoLoo)
  '5defc088-9315-49b1-baf9-7ea71f0d7b72', // University of Toronto (TorontoLoo)
]

const result = await client
  .patch(EVENT_ID)
  .set({
    'location.name': {
      _type: 'localeString',
      en: 'Civic Recreation Complex',
      fr: 'Complexe recreatif civique',
    },
    'location.address': '99 Thornton Rd S, Oshawa, ON L1J 5Y1',
    registration: {
      _type: 'eventRegistration',
      required: true,
      url: 'https://quidditchcanada.usetopscore.com/en_ca/e/2025-2026-championnat-national-championships',
      deadline: '2026-03-01',
      price: 90,
    },
    teams: TEAM_IDS.map((id) => ({
      _type: 'reference',
      _ref: id,
      _key: id.slice(0, 8),
    })),
  })
  .commit()

console.log(`Patched event ${result._id} (rev: ${result._rev})`)
