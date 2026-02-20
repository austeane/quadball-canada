#!/usr/bin/env node
/**
 * Auto-Translation Listener for Sanity Documents
 *
 * Watches for document changes and automatically translates English content
 * to French using OpenAI when French translations are missing.
 *
 * Usage:
 *   SANITY_AUTH_TOKEN=xxx OPENAI_API_KEY=xxx node scripts/auto-translate.mjs
 *
 * Environment variables:
 *   SANITY_AUTH_TOKEN - Sanity write token (required)
 *   OPENAI_API_KEY - OpenAI API key (required)
 *   SANITY_PROJECT_ID - Sanity project ID (optional, defaults to kbufa3g3)
 *   SANITY_DATASET - Sanity dataset (optional, defaults to production)
 */

import {createClient} from '@sanity/client'
import OpenAI from 'openai'

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
const LOCALIZED_DOCUMENT_TYPES = [
  'newsArticle',
  'infoArticle',
  'event',
  'resourceArticle',
  'volunteerOpportunity',
  'landingSection',
  'eventBidsPage',
]

// Fields that contain localized content (mapped by field type)
const LOCALE_FIELD_TYPES = ['localeString', 'localeText', 'localeSlug', 'localePortableText']

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
    // Simple conversion if no original structure
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

  // Try to preserve structure from original blocks
  const translatedParagraphs = text.split('\n\n').filter(p => p.trim())
  let paraIndex = 0

  return originalBlocks.map((block, blockIndex) => {
    if (block._type !== 'block') {
      // Keep non-text blocks (images, etc.) as-is
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
async function translateText(text, isPortableText = false) {
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
 * Check if a document needs translation
 */
function needsTranslation(doc) {
  if (!doc || !LOCALIZED_DOCUMENT_TYPES.includes(doc._type)) {
    return false
  }

  // Check common localized fields
  const fieldsToCheck = ['title', 'slug', 'excerpt', 'description', 'content']

  for (const field of fieldsToCheck) {
    const value = doc[field]
    if (value && typeof value === 'object') {
      // Has English but missing French
      if (value.en && !value.fr) {
        return true
      }
      // For slug, check .current
      if (value.en?.current && !value.fr?.current) {
        return true
      }
    }
  }

  return false
}

/**
 * Translate a document's missing French fields
 */
async function translateDocument(doc) {
  const updates = {}

  // Title (localeString)
  if (doc.title?.en && !doc.title?.fr) {
    console.log(`  📝 Translating title...`)
    const translated = await translateText(doc.title.en)
    if (translated) {
      updates['title.fr'] = translated
    }
  }

  // Slug (localeSlug) - copy from English
  if (doc.slug?.en?.current && !doc.slug?.fr?.current) {
    console.log(`  🔗 Copying slug...`)
    updates['slug.fr'] = {
      _type: 'slug',
      current: doc.slug.en.current,
    }
  }

  // Excerpt (localeText)
  if (doc.excerpt?.en && !doc.excerpt?.fr) {
    console.log(`  📝 Translating excerpt...`)
    const translated = await translateText(doc.excerpt.en)
    if (translated) {
      updates['excerpt.fr'] = translated
    }
  }

  // Description (localeText) - used in events
  if (doc.description?.en && !doc.description?.fr) {
    console.log(`  📝 Translating description...`)
    const translated = await translateText(doc.description.en)
    if (translated) {
      updates['description.fr'] = translated
    }
  }

  // Content (localePortableText)
  if (doc.content?.en && (!doc.content?.fr || doc.content.fr.length === 0)) {
    console.log(`  📝 Translating content...`)
    const plainText = portableTextToPlainText(doc.content.en)
    if (plainText) {
      const translated = await translateText(plainText, true)
      if (translated) {
        updates['content.fr'] = plainTextToPortableText(translated, doc.content.en)
      }
    }
  }

  // SEO fields
  if (doc.seo?.metaTitle?.en && !doc.seo?.metaTitle?.fr) {
    console.log(`  📝 Translating SEO meta title...`)
    const translated = await translateText(doc.seo.metaTitle.en)
    if (translated) {
      updates['seo.metaTitle.fr'] = translated
    }
  }

  if (doc.seo?.metaDescription?.en && !doc.seo?.metaDescription?.fr) {
    console.log(`  📝 Translating SEO meta description...`)
    const translated = await translateText(doc.seo.metaDescription.en)
    if (translated) {
      updates['seo.metaDescription.fr'] = translated
    }
  }

  // Location name (for events)
  if (doc.location?.name?.en && !doc.location?.name?.fr) {
    console.log(`  📝 Translating location name...`)
    const translated = await translateText(doc.location.name.en)
    if (translated) {
      updates['location.name.fr'] = translated
    }
  }

  // Featured image alt text
  if (doc.featuredImage?.alt?.en && !doc.featuredImage?.alt?.fr) {
    console.log(`  📝 Translating featured image alt...`)
    const translated = await translateText(doc.featuredImage.alt.en)
    if (translated) {
      updates['featuredImage.alt.fr'] = translated
    }
  }

  // Hero image alt text
  if (doc.heroImage?.alt?.en && !doc.heroImage?.alt?.fr) {
    console.log(`  📝 Translating hero image alt...`)
    const translated = await translateText(doc.heroImage.alt.en)
    if (translated) {
      updates['heroImage.alt.fr'] = translated
    }
  }

  return updates
}

/**
 * Apply updates to a document
 */
async function applyUpdates(docId, updates) {
  if (Object.keys(updates).length === 0) {
    return false
  }

  try {
    await sanityClient
      .patch(docId)
      .set(updates)
      .commit({
        tag: 'auto-translate',
      })
    return true
  } catch (error) {
    console.error(`❌ Failed to update document ${docId}:`, error.message)
    return false
  }
}

/**
 * Process a single document
 */
async function processDocument(docId) {
  try {
    // Fetch the full document
    const doc = await sanityClient.getDocument(docId)

    if (!doc || !needsTranslation(doc)) {
      return
    }

    console.log(`\n🔄 Processing ${doc._type}: ${doc.title?.en || docId}`)

    const updates = await translateDocument(doc)

    if (Object.keys(updates).length > 0) {
      const success = await applyUpdates(docId, updates)
      if (success) {
        console.log(`✅ Translated ${Object.keys(updates).length} field(s)`)
      }
    } else {
      console.log(`⏭️  No translations needed`)
    }
  } catch (error) {
    console.error(`❌ Error processing ${docId}:`, error.message)
  }
}

/**
 * Main listener function
 */
async function startListener() {
  console.log('🚀 Starting auto-translation listener...')
  console.log(`   Project: ${PROJECT_ID}`)
  console.log(`   Dataset: ${DATASET}`)
  console.log(`   Document types: ${LOCALIZED_DOCUMENT_TYPES.join(', ')}`)
  console.log('')

  // Build GROQ filter for localized document types
  const typeFilter = LOCALIZED_DOCUMENT_TYPES.map(t => `_type == "${t}"`).join(' || ')
  const query = `*[${typeFilter}]`

  // Set up listener
  const subscription = sanityClient.listen(query, {}, {
    includeResult: false,
    includePreviousRevision: false,
    visibility: 'query',
    events: ['mutation'],
  })

  subscription.subscribe({
    next: (event) => {
      if (event.type === 'mutation' && event.documentId) {
        // Skip draft documents
        if (event.documentId.startsWith('drafts.')) {
          return
        }

        // Process with a small delay to ensure document is fully committed
        setTimeout(() => {
          processDocument(event.documentId)
        }, 1000)
      }
    },
    error: (error) => {
      console.error('❌ Listener error:', error)
      // Reconnect after a delay
      setTimeout(startListener, 5000)
    },
  })

  console.log('👂 Listening for document changes...')
  console.log('   (Press Ctrl+C to stop)\n')
}

// Run the listener
startListener()
