import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'

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

const client = createClient({
  projectId: env.SANITY_STUDIO_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-12-08',
  token: env.SANITY_AUTH_TOKEN,
  useCdn: false,
})

// Old image IDs that were replaced
const oldIds = [
  'image-0ed78a09a41ee284a6a5bfcafa12873c8845209e-1444x1802-png',
  'image-854662f6971bd4062bf4fbecba49436fb000a325-1564x1560-png',
  'image-fed376ea293a48b310356a2f750b145192a72b4c-782x782-png',
  'image-52665e877bbc4e6d3952c4b37c06064c4c051f61-2500x1545-jpg',
  'image-31df170d89a47044f0226bab263f3af5e432e52a-796x798-png',
  'image-19752815f1575608049d5b84d5a29ae6f070027e-762x788-png',
  'image-9d0d6be6c0ee7c31988091c7ee79678d0b9962a6-2048x1365-jpg',
  'image-c7f84163062c1559fc894ca8b08e582ffc317bcf-1536x2048-jpg',
  'image-f3ba8524f824514992a33e3ebac6ce3ff2659dd0-1536x2048-jpg',
]

async function run() {
  console.log('Checking and deleting unreferenced old images...\n')

  for (const id of oldIds) {
    const refs = await client.fetch('count(*[references($id)])', {id})
    const shortId = id.slice(6, 26) + '...'

    if (refs === 0) {
      await client.delete(id)
      console.log(`✓ Deleted ${shortId} (0 refs)`)
    } else {
      console.log(`⚠ Kept ${shortId} (${refs} refs)`)
    }
  }

  console.log('\n✅ Cleanup complete!')
}

run().catch(console.error)
