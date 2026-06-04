import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {getCliClient} from 'sanity/cli'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

if (!token) {
  throw new Error('SANITY_AUTH_TOKEN not found. Set it in the environment or studio/.env.')
}

const client = getCliClient({ apiVersion: '2024-12-08', token })

const DRAFT_ID = 'drafts.c2002872-18d3-4553-8857-7b00182ea2dc'

const images = [
  { file: '/tmp/bid-cycle-unpacked/word/media/image1.jpg', alt: 'Waterloo Region', insertAfterIndex: 7 },
  { file: '/tmp/bid-cycle-unpacked/word/media/image5.png', alt: 'Saint John, New Brunswick', insertAfterIndex: 12 },
  { file: '/tmp/bid-cycle-unpacked/word/media/image2.png', alt: 'City of Surrey', insertAfterIndex: 19 },
  { file: '/tmp/bid-cycle-unpacked/word/media/image3.png', alt: 'Edmonton, Alberta', insertAfterIndex: 24 },
  { file: '/tmp/bid-cycle-unpacked/word/media/image4.png', alt: 'Ottawa, Ontario', insertAfterIndex: 26 },
]

async function uploadImage(filePath) {
  const buffer = fs.readFileSync(filePath)
  const filename = path.basename(filePath)
  const contentType = filePath.endsWith('.jpg') ? 'image/jpeg' : 'image/png'
  const asset = await client.assets.upload('image', buffer, { filename, contentType })
  console.log(`Uploaded ${filename} -> ${asset._id}`)
  return asset
}

async function main() {
  const uploads = []
  for (const img of images) {
    const asset = await uploadImage(img.file)
    uploads.push({ ...img, assetId: asset._id })
  }

  const doc = await client.getDocument(DRAFT_ID)
  if (!doc) throw new Error(`Document ${DRAFT_ID} not found`)
  const blocks = [...doc.content.en]

  const sorted = [...uploads].sort((a, b) => b.insertAfterIndex - a.insertAfterIndex)
  for (const img of sorted) {
    const imageBlock = {
      _type: 'image',
      _key: crypto.randomUUID().replace(/-/g, '').slice(0, 12),
      alt: img.alt,
      asset: {
        _type: 'reference',
        _ref: img.assetId,
      },
    }
    blocks.splice(img.insertAfterIndex + 1, 0, imageBlock)
    console.log(`Inserted image "${img.alt}" after block ${img.insertAfterIndex}`)
  }

  await client.patch(DRAFT_ID).set({ 'content.en': blocks }).commit()
  console.log(`\nPatched document with ${uploads.length} images`)
  console.log(`Total blocks: ${blocks.length} (was ${doc.content.en.length})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
