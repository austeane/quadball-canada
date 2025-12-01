/**
 * Cloudflare Worker: Auto-translate Sanity documents
 *
 * Receives webhooks from Sanity when documents are published,
 * translates missing French content using OpenAI, and updates the document.
 */

// Document types that support localization
const LOCALIZED_DOCUMENT_TYPES = [
  'newsArticle',
  'infoArticle',
  'event',
  'resourceArticle',
  'volunteerOpportunity',
  'landingSection',
];

/**
 * Convert Portable Text blocks to plain text
 */
function portableTextToPlainText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return '';

  return blocks
    .filter(block => block._type === 'block')
    .map(block => {
      if (!block.children) return '';
      return block.children
        .filter(child => child._type === 'span')
        .map(span => span.text || '')
        .join('');
    })
    .join('\n\n');
}

/**
 * Convert plain text back to Portable Text blocks
 */
function plainTextToPortableText(text, originalBlocks) {
  if (!originalBlocks || !Array.isArray(originalBlocks)) {
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    return paragraphs.map((para, index) => ({
      _type: 'block',
      _key: `block-${index}-${Date.now()}`,
      style: 'normal',
      markDefs: [],
      children: [{
        _type: 'span',
        _key: `span-${index}-${Date.now()}`,
        text: para.trim(),
        marks: [],
      }],
    }));
  }

  const translatedParagraphs = text.split('\n\n').filter(p => p.trim());
  let paraIndex = 0;

  return originalBlocks.map((block, blockIndex) => {
    if (block._type !== 'block') {
      return { ...block, _key: block._key || `block-${blockIndex}-${Date.now()}` };
    }

    const translatedText = translatedParagraphs[paraIndex] || '';
    paraIndex++;

    return {
      ...block,
      _key: block._key || `block-${blockIndex}-${Date.now()}`,
      children: [{
        _type: 'span',
        _key: `span-${blockIndex}-${Date.now()}`,
        text: translatedText.trim(),
        marks: [],
      }],
    };
  });
}

/**
 * Translate text using OpenAI
 */
async function translateText(text, openaiApiKey) {
  if (!text || (typeof text === 'string' && !text.trim())) {
    return text;
  }

  const systemPrompt = `You are a professional translator for Quadball Canada, translating from English to French.
Maintain the same tone, style, and formatting as the original.
Keep proper nouns, brand names, and technical terms (like "quadball", "quaffle", "bludger", "snitch") in their original form unless there's a well-established French equivalent.
Translate naturally for a Canadian French audience.
Return ONLY the translation, no explanations or notes.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Translate the following to French:\n\n${text}` },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || text;
}

/**
 * Fetch document from Sanity (no auth needed for public dataset reads)
 */
async function fetchDocument(docId, env) {
  const query = encodeURIComponent(`*[_id == "${docId}"][0]`);
  const url = `https://${env.SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${env.SANITY_DATASET}?query=${query}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Sanity fetch error: ${response.status}`);
  }

  const data = await response.json();
  return data.result;
}

/**
 * Update document in Sanity
 */
async function updateDocument(docId, updates, env) {
  const mutations = [{
    patch: {
      id: docId,
      set: updates,
    },
  }];

  const url = `https://${env.SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${env.SANITY_DATASET}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SANITY_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutations }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Sanity update error: ${response.status} - ${text}`);
  }

  return response.json();
}

/**
 * Check if document needs translation
 */
function needsTranslation(doc) {
  if (!doc || !LOCALIZED_DOCUMENT_TYPES.includes(doc._type)) {
    return false;
  }

  const fieldsToCheck = ['title', 'slug', 'excerpt', 'description', 'content', 'summary', 'body', 'intro'];

  for (const field of fieldsToCheck) {
    const value = doc[field];
    if (value && typeof value === 'object') {
      if (value.en && !value.fr) return true;
      if (value.en?.current && !value.fr?.current) return true;
    }
  }

  return false;
}

/**
 * Translate document fields
 */
async function translateDocument(doc, env) {
  const updates = {};

  // Title
  if (doc.title?.en && !doc.title?.fr) {
    const translated = await translateText(doc.title.en, env.OPENAI_API_KEY);
    if (translated) updates['title.fr'] = translated;
  }

  // Slug - copy from English
  if (doc.slug?.en?.current && !doc.slug?.fr?.current) {
    updates['slug.fr'] = { _type: 'slug', current: doc.slug.en.current };
  }

  // Excerpt
  if (doc.excerpt?.en && !doc.excerpt?.fr) {
    const translated = await translateText(doc.excerpt.en, env.OPENAI_API_KEY);
    if (translated) updates['excerpt.fr'] = translated;
  }

  // Description
  if (doc.description?.en && !doc.description?.fr) {
    const translated = await translateText(doc.description.en, env.OPENAI_API_KEY);
    if (translated) updates['description.fr'] = translated;
  }

  // Summary (localeText - used by volunteerOpportunity)
  if (doc.summary?.en && !doc.summary?.fr) {
    const translated = await translateText(doc.summary.en, env.OPENAI_API_KEY);
    if (translated) updates['summary.fr'] = translated;
  }

  // Body (localeText - used by resourceArticle)
  if (doc.body?.en && !doc.body?.fr) {
    const translated = await translateText(doc.body.en, env.OPENAI_API_KEY);
    if (translated) updates['body.fr'] = translated;
  }

  // Intro (localeText - used by landingSection)
  if (doc.intro?.en && !doc.intro?.fr) {
    const translated = await translateText(doc.intro.en, env.OPENAI_API_KEY);
    if (translated) updates['intro.fr'] = translated;
  }

  // Content (Portable Text)
  if (doc.content?.en && (!doc.content?.fr || doc.content.fr.length === 0)) {
    const plainText = portableTextToPlainText(doc.content.en);
    if (plainText) {
      const translated = await translateText(plainText, env.OPENAI_API_KEY);
      if (translated) {
        updates['content.fr'] = plainTextToPortableText(translated, doc.content.en);
      }
    }
  }

  // SEO fields
  if (doc.seo?.metaTitle?.en && !doc.seo?.metaTitle?.fr) {
    const translated = await translateText(doc.seo.metaTitle.en, env.OPENAI_API_KEY);
    if (translated) updates['seo.metaTitle.fr'] = translated;
  }

  if (doc.seo?.metaDescription?.en && !doc.seo?.metaDescription?.fr) {
    const translated = await translateText(doc.seo.metaDescription.en, env.OPENAI_API_KEY);
    if (translated) updates['seo.metaDescription.fr'] = translated;
  }

  // Location name (events)
  if (doc.location?.name?.en && !doc.location?.name?.fr) {
    const translated = await translateText(doc.location.name.en, env.OPENAI_API_KEY);
    if (translated) updates['location.name.fr'] = translated;
  }

  // Image alt texts
  if (doc.featuredImage?.alt?.en && !doc.featuredImage?.alt?.fr) {
    const translated = await translateText(doc.featuredImage.alt.en, env.OPENAI_API_KEY);
    if (translated) updates['featuredImage.alt.fr'] = translated;
  }

  if (doc.heroImage?.alt?.en && !doc.heroImage?.alt?.fr) {
    const translated = await translateText(doc.heroImage.alt.en, env.OPENAI_API_KEY);
    if (translated) updates['heroImage.alt.fr'] = translated;
  }

  return updates;
}

/**
 * Verify webhook signature (optional but recommended)
 */
async function verifyWebhookSignature(request, secret) {
  if (!secret) return true; // Skip verification if no secret configured

  const signature = request.headers.get('sanity-webhook-signature');
  if (!signature) return false;

  const body = await request.clone().text();
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return signature === expectedSignature;
}

export default {
  async fetch(request, env) {
    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Verify webhook signature if secret is configured
    if (env.WEBHOOK_SECRET) {
      const isValid = await verifyWebhookSignature(request, env.WEBHOOK_SECRET);
      if (!isValid) {
        return new Response('Invalid signature', { status: 401 });
      }
    }

    try {
      const payload = await request.json();

      // Sanity webhooks send an array of document IDs or full documents
      // Handle both formats
      const docId = payload._id || payload.documentId || payload.ids?.[0];

      if (!docId) {
        return new Response('No document ID in payload', { status: 400 });
      }

      // Skip draft documents
      if (docId.startsWith('drafts.')) {
        return new Response('Skipping draft document', { status: 200 });
      }

      console.log(`Processing document: ${docId}`);

      // Fetch the full document
      const doc = await fetchDocument(docId, env);

      if (!doc) {
        return new Response('Document not found', { status: 404 });
      }

      // Check if translation is needed
      if (!needsTranslation(doc)) {
        return new Response('No translation needed', { status: 200 });
      }

      console.log(`Translating ${doc._type}: ${doc.title?.en || docId}`);

      // Translate missing fields
      const updates = await translateDocument(doc, env);

      if (Object.keys(updates).length === 0) {
        return new Response('No fields to translate', { status: 200 });
      }

      // Update the document
      await updateDocument(docId, updates, env);

      console.log(`Translated ${Object.keys(updates).length} field(s)`);

      return new Response(JSON.stringify({
        success: true,
        documentId: docId,
        fieldsTranslated: Object.keys(updates).length,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Translation error:', error);
      return new Response(JSON.stringify({
        error: error.message,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
