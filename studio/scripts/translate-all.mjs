#!/usr/bin/env node
/**
 * Bulk Translation Script for Sanity Documents
 *
 * Finds all documents missing French translations and translates them using OpenAI.
 *
 * Usage:
 *   SANITY_AUTH_TOKEN=xxx OPENAI_API_KEY=xxx node scripts/translate-all.mjs
 *
 * Options:
 *   --dry-run    Show what would be translated without making changes
 *   --type=X     Only translate documents of type X (e.g., --type=newsArticle)
 *   --limit=N    Only process N documents
 *
 * Environment variables:
 *   SANITY_AUTH_TOKEN - Sanity write token (required)
 *   OPENAI_API_KEY - OpenAI API key (required)
 *   SANITY_PROJECT_ID - Sanity project ID (optional, defaults to kbufa3g3)
 *   SANITY_DATASET - Sanity dataset (optional, defaults to production)
 */

import {createClient} from '@sanity/client'
import OpenAI from 'openai'

// Parse CLI arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const typeArg = args.find(a => a.startsWith('--type='))
const limitArg = args.find(a => a.startsWith('--limit='))
const specificType = typeArg ? typeArg.split('=')[1] : null
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null

// Configuration
const PROJECT_ID = process.env.SANITY_PROJECT_ID || 'kbufa3g3'
const DATASET = process.env.SANITY_DATASET || 'production'
const SANITY_TOKEN = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_WRITE_TOKEN
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!SANITY_TOKEN) {
  console.error('❌ SANITY_AUTH_TOKEN is required')
  process.exit(1)
}

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is required')
  process.exit(1)
}

// Document types that support localization
const LOCALIZED_DOCUMENT_TYPES = specificType ? [specificType] : [
  'newsArticle',
  'infoArticle',
  'event',
  'resourceArticle',
  'volunteerOpportunity',
  'landingSection',
  'boardMember',
  'staffMember',
  'team',
]

// Initialize clients
const sanityClient = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: SANITY_TOKEN,
})

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
})

/**
 * Convert Portable Text blocks to plain text for translation
 */
function portableTextToPlainText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return ''

  return blocks
    .filter(block => block._type === 'block')
    .map(block => {
      if (!block.children) return ''
      return block.children
        .filter(child => child._type === 'span')
        .map(span => span.text || '')
        .join('')
    })
    .join('\n\n')
}

/**
 * Convert plain text back to Portable Text blocks, preserving structure
 */
function plainTextToPortableText(text, originalBlocks) {
  if (!originalBlocks || !Array.isArray(originalBlocks)) {
    const paragraphs = text.split('\n\n').filter(p => p.trim())
    return paragraphs.map((para, index) => ({
      _type: 'block',
      _key: `block-${index}`,
      style: 'normal',
      markDefs: [],
      children: [{
        _type: 'span',
        _key: `span-${index}`,
        text: para.trim(),
        marks: [],
      }],
    }))
  }

  const translatedParagraphs = text.split('\n\n').filter(p => p.trim())
  let paraIndex = 0

  return originalBlocks.map((block, blockIndex) => {
    if (block._type !== 'block') {
      return {...block, _key: block._key || `block-${blockIndex}`}
    }

    const translatedText = translatedParagraphs[paraIndex] || ''
    paraIndex++

    return {
      ...block,
      _key: block._key || `block-${blockIndex}`,
      children: [{
        _type: 'span',
        _key: `span-${blockIndex}`,
        text: translatedText.trim(),
        marks: [],
      }],
    }
  })
}

/**
 * Translate text using OpenAI
 */
async function translateText(text) {
  if (!text || (typeof text === 'string' && !text.trim())) {
    return text
  }

  const systemPrompt = `You are a professional translator for Quadball Canada, translating from English to French.
Maintain the same tone, style, and formatting as the original.
Keep proper nouns, brand names, and technical terms (like "quadball", "quaffle", "bludger", "snitch") in their original form unless there's a well-established French equivalent.
Translate naturally for a Canadian French audience.
Return ONLY the translation, no explanations or notes.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {role: 'system', content: systemPrompt},
        {role: 'user', content: `Translate the following to French:\n\n${text}`},
      ],
      temperature: 0.3,
    })

    return response.choices[0]?.message?.content?.trim() || text
  } catch (error) {
    console.error('❌ Translation error:', error.message)
    return null
  }
}

/**
 * Translate a document's missing French fields
 */
async function translateDocument(doc) {
  const updates = {}

  // Title (localeString)
  if (doc.title?.en && (!doc.title?.fr || doc.title.fr === '.')) {
    console.log(`    📝 Translating title...`)
    const translated = await translateText(doc.title.en)
    if (translated) {
      updates['title.fr'] = translated
    }
  }

  // Slug (localeSlug) - copy from English
  if (doc.slug?.en?.current && !doc.slug?.fr?.current) {
    console.log(`    🔗 Copying slug...`)
    updates['slug.fr'] = {
      _type: 'slug',
      current: doc.slug.en.current,
    }
  }

  // Excerpt (localeText)
  if (doc.excerpt?.en && (!doc.excerpt?.fr || doc.excerpt.fr === '.')) {
    console.log(`    📝 Translating excerpt...`)
    const translated = await translateText(doc.excerpt.en)
    if (translated) {
      updates['excerpt.fr'] = translated
    }
  }

  // Description (localeText)
  if (doc.description?.en && (!doc.description?.fr || doc.description.fr === '.')) {
    console.log(`    📝 Translating description...`)
    const translated = await translateText(doc.description.en)
    if (translated) {
      updates['description.fr'] = translated
    }
  }

  // Content (localePortableText)
  if (doc.content?.en && (!doc.content?.fr || doc.content.fr.length === 0)) {
    console.log(`    📝 Translating content...`)
    const plainText = portableTextToPlainText(doc.content.en)
    if (plainText) {
      const translated = await translateText(plainText)
      if (translated) {
        updates['content.fr'] = plainTextToPortableText(translated, doc.content.en)
      }
    }
  }

  // SEO fields
  if (doc.seo?.metaTitle?.en && !doc.seo?.metaTitle?.fr) {
    console.log(`    📝 Translating SEO meta title...`)
    const translated = await translateText(doc.seo.metaTitle.en)
    if (translated) {
      updates['seo.metaTitle.fr'] = translated
    }
  }

  if (doc.seo?.metaDescription?.en && !doc.seo?.metaDescription?.fr) {
    console.log(`    📝 Translating SEO meta description...`)
    const translated = await translateText(doc.seo.metaDescription.en)
    if (translated) {
      updates['seo.metaDescription.fr'] = translated
    }
  }

  // Location name (for events)
  if (doc.location?.name?.en && !doc.location?.name?.fr) {
    console.log(`    📝 Translating location name...`)
    const translated = await translateText(doc.location.name.en)
    if (translated) {
      updates['location.name.fr'] = translated
    }
  }

  // Featured image alt text
  if (doc.featuredImage?.alt?.en && !doc.featuredImage?.alt?.fr) {
    console.log(`    📝 Translating featured image alt...`)
    const translated = await translateText(doc.featuredImage.alt.en)
    if (translated) {
      updates['featuredImage.alt.fr'] = translated
    }
  }

  // Hero image alt text
  if (doc.heroImage?.alt?.en && !doc.heroImage?.alt?.fr) {
    console.log(`    📝 Translating hero image alt...`)
    const translated = await translateText(doc.heroImage.alt.en)
    if (translated) {
      updates['heroImage.alt.fr'] = translated
    }
  }

  // Role (localeString - for boardMember)
  if (doc.role?.en && (!doc.role?.fr || doc.role.fr === '.')) {
    console.log(`    📝 Translating role...`)
    const translated = await translateText(doc.role.en)
    if (translated) {
      updates['role.fr'] = translated
    }
  }

  // Bio (localeText - for boardMember)
  if (doc.bio?.en && (!doc.bio?.fr || doc.bio.fr === '.')) {
    console.log(`    📝 Translating bio...`)
    const translated = await translateText(doc.bio.en)
    if (translated) {
      updates['bio.fr'] = translated
    }
  }

  return updates
}

/**
 * Apply updates to a document
 */
async function applyUpdates(docId, updates) {
  if (dryRun) {
    console.log(`    🔍 [DRY RUN] Would update ${Object.keys(updates).length} field(s)`)
    return true
  }

  try {
    await sanityClient
      .patch(docId)
      .set(updates)
      .commit({
        tag: 'bulk-translate',
      })
    return true
  } catch (error) {
    console.error(`❌ Failed to update document ${docId}:`, error.message)
    return false
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Bulk Translation Script')
  console.log(`   Project: ${PROJECT_ID}`)
  console.log(`   Dataset: ${DATASET}`)
  console.log(`   Document types: ${LOCALIZED_DOCUMENT_TYPES.join(', ')}`)
  if (dryRun) console.log(`   ⚠️  DRY RUN MODE - no changes will be made`)
  if (limit) console.log(`   Limit: ${limit} documents`)
  console.log('')

  // Build GROQ query to find documents needing translation
  const typeFilter = LOCALIZED_DOCUMENT_TYPES.map(t => `_type == "${t}"`).join(' || ')

  // Find documents that have English but missing French (or "." placeholder) in key fields
  const query = `*[
    (${typeFilter}) &&
    !(_id in path("drafts.**")) &&
    (
      (defined(title.en) && (!defined(title.fr) || title.fr == ".")) ||
      (defined(slug.en.current) && !defined(slug.fr.current)) ||
      (defined(excerpt.en) && (!defined(excerpt.fr) || excerpt.fr == ".")) ||
      (defined(description.en) && (!defined(description.fr) || description.fr == ".")) ||
      (defined(content.en) && !defined(content.fr)) ||
      (defined(role.en) && (!defined(role.fr) || role.fr == ".")) ||
      (defined(bio.en) && (!defined(bio.fr) || bio.fr == "."))
    )
  ]${limit ? `[0...${limit}]` : ''} {
    _id,
    _type,
    title,
    slug,
    excerpt,
    description,
    content,
    seo,
    location,
    featuredImage,
    heroImage,
    role,
    bio,
    name
  }`

  console.log('🔍 Finding documents needing translation...')

  const documents = await sanityClient.fetch(query)

  if (documents.length === 0) {
    console.log('✅ All documents are fully translated!')
    return
  }

  console.log(`📚 Found ${documents.length} document(s) needing translation\n`)

  let translated = 0
  let failed = 0

  for (const doc of documents) {
    const docName = doc.title?.en || doc.name || doc._id
    console.log(`\n[${translated + failed + 1}/${documents.length}] ${doc._type}: ${docName}`)

    try {
      const updates = await translateDocument(doc)

      if (Object.keys(updates).length > 0) {
        const success = await applyUpdates(doc._id, updates)
        if (success) {
          console.log(`    ✅ Translated ${Object.keys(updates).length} field(s)`)
          translated++
        } else {
          failed++
        }
      } else {
        console.log(`    ⏭️  No translations needed`)
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`    ❌ Error: ${error.message}`)
      failed++
    }
  }

  console.log('\n📊 Summary:')
  console.log(`   ✅ Translated: ${translated}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`   📚 Total: ${documents.length}`)
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
