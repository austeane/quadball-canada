import {getCliClient} from 'sanity/cli'
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const contents = fs.readFileSync(filePath, 'utf8')
  const env = {}
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Za-z0-9_]+)=(.*)$/)
    if (!match) continue
    let value = match[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    env[match[1]] = value
  }
  return env
}

const env = readEnvFile(path.resolve(__dirname, '..', '.env'))
const token = process.env.SANITY_AUTH_TOKEN || env.SANITY_AUTH_TOKEN
const client = getCliClient({apiVersion: '2024-12-08', token})

const DRAFT_ID = 'drafts.c2002872-18d3-4553-8857-7b00182ea2dc'

await client.patch(DRAFT_ID).set({
  slug: {
    _type: 'localeSlug',
    en: {_type: 'slug', current: 'bid-cycle-2026-2028-hosting-announcement'},
    fr: {_type: 'slug', current: 'annonce-hebergement-cycle-candidature-2026-2028'}
  },
  publishedAt: new Date().toISOString()
}).commit()
console.log('Set slug and publishedAt on draft')

const doc = await client.getDocument(DRAFT_ID)
const publishedDoc = {...doc, _id: doc._id.replace('drafts.', '')}
delete publishedDoc._rev
const tx = client.transaction()
tx.createOrReplace(publishedDoc)
tx.delete(DRAFT_ID)
await tx.commit()
console.log('Published article')
