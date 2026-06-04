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

const PUB_ID = 'c2002872-18d3-4553-8857-7b00182ea2dc'
const DRAFT_ID = `drafts.${PUB_ID}`

const doc = await client.getDocument(PUB_ID)
if (!doc) throw new Error('Document not found')

const blocks = [...doc.content.en]

// Section header keys to promote to h3
const sectionKeys = ['99507c7dfbe3', '6861b9915b32', 'ee15f2405f01']

for (const block of blocks) {
  if (block._type === 'block' && sectionKeys.includes(block._key)) {
    block.style = 'h3'
    // Remove bold/italic marks from children
    for (const child of block.children || []) {
      child.marks = []
    }
    console.log(`Promoted "${block.children?.[0]?.text}" to h3`)
  }
}

// Also remove the empty bold/italic block at index 23 (key 8603947c16e8)
const emptyIdx = blocks.findIndex(b => b._key === '8603947c16e8')
if (emptyIdx !== -1) {
  blocks.splice(emptyIdx, 1)
  console.log('Removed empty bold/italic block before National Championships')
}

// Set Ottawa image as featured image
const ottawaAssetRef = 'image-4c6dd75ac4f2b1e5c7a8524332a3b472333c9841-1920x1080-png'

// Create draft with all changes
const draftDoc = {
  ...doc,
  _id: DRAFT_ID,
  'content': { ...doc.content, en: blocks },
  featuredImage: {
    _type: 'image',
    alt: { _type: 'localeString', en: 'Ottawa, Ontario skyline', fr: 'Horizon d\'Ottawa, Ontario' },
    asset: { _type: 'reference', _ref: ottawaAssetRef },
  },
}
delete draftDoc._rev

const tx = client.transaction()
tx.createOrReplace(draftDoc)
tx.delete(PUB_ID)
await tx.commit()

console.log('\nDone:')
console.log('- Set Ottawa image as featured image')
console.log('- Promoted 3 section titles to h3')
console.log('- Reverted article to draft')
