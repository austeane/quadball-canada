import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import cli from 'sanity/cli'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const imagesDir = path.join(repoRoot, 'Website2025')

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

const {getCliClient} = cli

const client = getCliClient({
  apiVersion: '2024-12-08',
  token,
})

const imageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17]

function imageField(assetId) {
  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: assetId,
    },
  }
}

async function ensureAsset(imageNumber) {
  const filename = `website2025-${imageNumber}.jpg`
  const existing = await client.fetch(
    '*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}',
    {filename}
  )

  if (existing?._id) {
    console.log(`Reusing asset ${filename}`)
    return existing._id
  }

  const filePath = path.join(imagesDir, `${imageNumber}.jpg`)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing image file: ${filePath}`)
  }

  console.log(`Uploading ${filename}`)
  const asset = await client.assets.upload('image', fs.createReadStream(filePath), {filename})
  return asset._id
}

async function ensurePageSettings() {
  const existing = await client.fetch('*[_type == "pageSettings"][0]{_id}')
  if (existing?._id) return existing._id
  const created = await client.create({_type: 'pageSettings'})
  console.log(`Created pageSettings document ${created._id}`)
  return created._id
}

async function patchInfoArticle(slug, assetId) {
  const doc = await client.fetch(
    '*[_type == "infoArticle" && slug.en.current == $slug][0]{_id}',
    {slug}
  )
  if (!doc?._id) {
    throw new Error(`infoArticle not found for slug: ${slug}`)
  }
  await client.patch(doc._id).set({heroImage: imageField(assetId)}).commit()
  console.log(`Patched infoArticle ${slug}`)
}

async function patchNationalTeam(assetId) {
  const doc = await client.fetch('*[_type == "nationalTeamPage"][0]{_id}')
  if (!doc?._id) {
    throw new Error('nationalTeamPage document not found')
  }
  await client.patch(doc._id).set({'hero.image': imageField(assetId)}).commit()
  console.log('Patched nationalTeamPage hero image')
}

async function run() {
  console.log('Preparing assets...')
  const assets = {}
  for (const number of imageNumbers) {
    assets[number] = await ensureAsset(number)
  }

  const pageSettingsId = await ensurePageSettings()
  await client
    .patch(pageSettingsId)
    .set({
      aboutHeroImage: imageField(assets[7]),
      resourcesHeroImage: imageField(assets[8]),
      policiesHeroImage: imageField(assets[9]),
      startingTeamHeroImage: imageField(assets[2]),
      planningTournamentHeroImage: imageField(assets[11]),
      eventsHeroImage: imageField(assets[12]),
      getInvolvedHeroImage: imageField(assets[13]),
      teamsHeroImage: imageField(assets[14]),
      volunteerHeroImage: imageField(assets[15]),
      hostEventHeroImage: imageField(assets[16]),
      newsHeroImage: imageField(assets[17]),
      boardHeroImage: imageField(assets[3]),
      staffHeroImage: imageField(assets[4]),
    })
    .commit()
  console.log('Patched pageSettings hero images')

  await patchInfoArticle('what-is-quadball', assets[1])
  await patchInfoArticle('inclusion', assets[5])
  await patchNationalTeam(assets[6])

  console.log('Done.')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
