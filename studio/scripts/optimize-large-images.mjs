import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createWriteStream} from 'node:fs'
import {pipeline} from 'node:stream/promises'
import {createClient} from '@sanity/client'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const tmpDir = path.join(__dirname, '..', '.tmp-optimize')

// Ensure tmp directory exists
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, {recursive: true})
}

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
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || env.SANITY_STUDIO_DATASET || 'production'

if (!token) {
  throw new Error('SANITY_AUTH_TOKEN not found. Set it in the environment or studio/.env.')
}

if (!projectId) {
  throw new Error('SANITY_STUDIO_PROJECT_ID not found.')
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-12-08',
  token,
  useCdn: false,
})

// Configuration
const MIN_SIZE_BYTES = 500000 // 500KB threshold
const MAX_DIMENSION = 2048 // Max width/height for any image
const HEADSHOT_MAX = 800 // Max dimension for headshots/portraits
const LOGO_MAX = 400 // Max dimension for logos
const JPEG_QUALITY = 85

async function downloadImage(url, destPath) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download: ${response.status}`)
  await pipeline(response.body, createWriteStream(destPath))
}

function getOptimalDimensions(width, height, maxDim) {
  if (width <= maxDim && height <= maxDim) {
    return {width, height}
  }
  const ratio = width / height
  if (width > height) {
    return {width: maxDim, height: Math.round(maxDim / ratio)}
  }
  return {width: Math.round(maxDim * ratio), height: maxDim}
}

function determineMaxDimension(filename, width, height) {
  const lowerName = filename.toLowerCase()
  // Headshots are typically square or portrait
  if (lowerName.includes('headshot') || lowerName.includes('image') && Math.abs(width - height) < 100) {
    return HEADSHOT_MAX
  }
  // Logos
  if (lowerName.includes('logo')) {
    return LOGO_MAX
  }
  return MAX_DIMENSION
}

async function optimizeImage(inputPath, outputPath, maxDim) {
  const metadata = await sharp(inputPath).metadata()
  const {width, height, format} = metadata

  const dims = getOptimalDimensions(width, height, maxDim)

  // Convert PNG to JPEG unless it has transparency
  const hasAlpha = format === 'png' && metadata.channels === 4
  let outputFormat = format

  // Check if PNG actually uses transparency
  let usesTransparency = false
  if (hasAlpha) {
    const {data, info} = await sharp(inputPath)
      .raw()
      .toBuffer({resolveWithObject: true})

    // Check alpha channel (every 4th byte starting at index 3)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        usesTransparency = true
        break
      }
    }
  }

  // Convert to JPEG if no transparency
  if (format === 'png' && !usesTransparency) {
    outputFormat = 'jpeg'
  }

  let pipeline = sharp(inputPath).resize(dims.width, dims.height, {
    fit: 'inside',
    withoutEnlargement: true,
  })

  if (outputFormat === 'jpeg') {
    pipeline = pipeline.jpeg({quality: JPEG_QUALITY, progressive: true})
  } else if (outputFormat === 'png') {
    pipeline = pipeline.png({compressionLevel: 9})
  }

  await pipeline.toFile(outputPath)

  return {
    originalFormat: format,
    outputFormat,
    originalDims: {width, height},
    newDims: dims,
  }
}

async function run() {
  const dryRun = process.argv.includes('--dry-run')
  const skipDelete = process.argv.includes('--keep-originals')

  console.log(`\n🔍 Finding images larger than ${MIN_SIZE_BYTES / 1000}KB...\n`)

  // Query large images
  const largeImages = await client.fetch(
    `*[_type == "sanity.imageAsset" && size > $minSize] | order(size desc) {
      _id,
      originalFilename,
      size,
      url,
      "dimensions": metadata.dimensions
    }`,
    {minSize: MIN_SIZE_BYTES}
  )

  if (largeImages.length === 0) {
    console.log('✅ No large images found!')
    return
  }

  console.log(`Found ${largeImages.length} large images:\n`)

  for (const img of largeImages) {
    const sizeKB = Math.round(img.size / 1024)
    console.log(`  • ${img.originalFilename} (${sizeKB}KB, ${img.dimensions?.width}x${img.dimensions?.height})`)
  }

  if (dryRun) {
    console.log('\n🏃 Dry run - no changes made')
    return
  }

  console.log('\n📦 Processing images...\n')

  for (const img of largeImages) {
    const sizeKB = Math.round(img.size / 1024)
    const {width, height} = img.dimensions || {}

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`Processing: ${img.originalFilename} (${sizeKB}KB)`)

    // Find documents referencing this image
    const refs = await client.fetch(
      `*[references($id)]{_id, _type}`,
      {id: img._id}
    )

    if (refs.length === 0) {
      console.log(`  ⚠️  No documents reference this image - skipping`)
      continue
    }

    console.log(`  📄 Referenced by ${refs.length} document(s)`)

    // Download original
    const ext = img.originalFilename.split('.').pop() || 'jpg'
    const inputPath = path.join(tmpDir, `input-${img._id}.${ext}`)
    const outputPath = path.join(tmpDir, `output-${img._id}.jpg`)

    console.log(`  ⬇️  Downloading...`)
    await downloadImage(img.url, inputPath)

    // Determine optimal dimensions based on image type
    const maxDim = determineMaxDimension(img.originalFilename, width, height)

    console.log(`  🔧 Optimizing (max ${maxDim}px)...`)
    const result = await optimizeImage(inputPath, outputPath, maxDim)

    const newSize = fs.statSync(outputPath).size
    const newSizeKB = Math.round(newSize / 1024)
    const savings = Math.round((1 - newSize / img.size) * 100)

    console.log(`  📊 ${sizeKB}KB → ${newSizeKB}KB (${savings}% smaller)`)
    console.log(`     ${result.originalDims.width}x${result.originalDims.height} → ${result.newDims.width}x${result.newDims.height}`)
    if (result.originalFormat !== result.outputFormat) {
      console.log(`     ${result.originalFormat.toUpperCase()} → ${result.outputFormat.toUpperCase()}`)
    }

    // Upload optimized version
    console.log(`  ⬆️  Uploading optimized version...`)
    const newFilename = img.originalFilename.replace(/\.(png|PNG)$/, '.jpg')
    const newAsset = await client.assets.upload(
      'image',
      fs.createReadStream(outputPath),
      {filename: `optimized-${newFilename}`}
    )

    console.log(`  🔗 Updating ${refs.length} reference(s)...`)

    // Update all references
    for (const ref of refs) {
      // Find which field contains the reference
      const doc = await client.fetch(`*[_id == $id][0]`, {id: ref._id})

      // Recursively find and update the image reference
      const updateOps = findAndReplaceImageRef(doc, img._id, newAsset._id)

      if (updateOps.length > 0) {
        const patch = client.patch(ref._id)
        for (const op of updateOps) {
          patch.set({[op.path]: op.value})
        }
        await patch.commit()
        console.log(`     ✓ Updated ${ref._type} (${ref._id})`)
      }
    }

    // Optionally delete old asset
    if (!skipDelete) {
      console.log(`  🗑️  Deleting original asset...`)
      await client.delete(img._id)
    }

    // Cleanup temp files
    fs.unlinkSync(inputPath)
    fs.unlinkSync(outputPath)

    console.log(`  ✅ Done!`)
  }

  // Cleanup tmp directory
  if (fs.existsSync(tmpDir) && fs.readdirSync(tmpDir).length === 0) {
    fs.rmdirSync(tmpDir)
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ All images optimized!')
}

function findAndReplaceImageRef(obj, oldId, newId, currentPath = '') {
  const updates = []

  if (!obj || typeof obj !== 'object') return updates

  // Check if this is an image reference
  if (obj._type === 'reference' && obj._ref === oldId) {
    updates.push({
      path: currentPath,
      value: {_type: 'reference', _ref: newId}
    })
    return updates
  }

  // Check if this is an image with asset reference
  if (obj._type === 'image' && obj.asset?._ref === oldId) {
    updates.push({
      path: `${currentPath}.asset`,
      value: {_type: 'reference', _ref: newId}
    })
    return updates
  }

  // Recurse into object properties
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('_') && key !== '_type') continue

    const newPath = currentPath ? `${currentPath}.${key}` : key

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        updates.push(...findAndReplaceImageRef(item, oldId, newId, `${newPath}[${index}]`))
      })
    } else if (typeof value === 'object' && value !== null) {
      updates.push(...findAndReplaceImageRef(value, oldId, newId, newPath))
    }
  }

  return updates
}

run().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
