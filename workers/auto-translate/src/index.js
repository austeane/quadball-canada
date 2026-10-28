/**
 * Cloudflare Worker: Auto-translate Sanity documents
 *
 * Receives a webhook from Sanity when a document is published, finds every
 * English/French field whose French value is empty (at any depth, including
 * page sections, menus and cards), translates them with OpenAI in a single
 * request, and patches the French values back onto the document.
 *
 * Rich text is translated span by span, so bold text, links and lists survive.
 * URLs (localeUrl) are never translated; the site falls back to the English link.
 */

import {collectJobs, spanTexts, withSpanTexts} from './jobs.js';

/**
 * Translate a list of strings with one OpenAI request, using Structured Outputs
 * so the response is the same number of strings in the same order.
 */
async function translateStrings(strings, apiKey) {
  const instructions = `You are a professional translator for Quadball Canada, translating website copy from English to Canadian French.
You receive a JSON array of strings. Translate each string and return them in the same order, one output string per input string.
Keep leading and trailing spaces as they are, because some strings are fragments of one sentence split around bold text or links.
Keep proper nouns, brand names, email addresses, URLs and sport terms ("quadball", "quaffle", "bludger", "snitch") unchanged unless there is a well-established French equivalent.
Match the tone and formatting of the original.`;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5.1-2025-11-13',
      instructions,
      input: JSON.stringify(strings),
      text: {
        format: {
          type: 'json_schema',
          name: 'translations',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              translations: {
                type: 'array',
                items: {type: 'string'},
                description: 'The French translations, in the same order as the input strings',
              },
            },
            required: ['translations'],
            additionalProperties: false,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  const outputText = data.output_text || data.output?.find((item) => item.type === 'message')?.content?.[0]?.text;
  const {translations} = JSON.parse(outputText);
  if (!Array.isArray(translations) || translations.length !== strings.length) {
    throw new Error(`Expected ${strings.length} translations, got ${translations?.length}`);
  }
  return translations;
}

async function translateDocument(doc, env) {
  const jobs = collectJobs(doc, '', []);
  const strings = [];
  for (const job of jobs) {
    if (job.kind === 'text') strings.push(job.en);
    if (job.kind === 'blocks') strings.push(...spanTexts(job.en));
  }
  const translations = strings.length ? await translateStrings(strings, env.OPENAI_API_KEY) : [];

  const updates = {};
  let index = 0;
  for (const job of jobs) {
    if (job.kind === 'slug') {
      updates[job.path] = {_type: 'slug', current: job.en};
    } else if (job.kind === 'text') {
      updates[job.path] = translations[index++];
    } else {
      const count = spanTexts(job.en).length;
      updates[job.path] = withSpanTexts(job.en, translations.slice(index, index + count));
      index += count;
    }
  }
  return updates;
}

async function fetchDocument(docId, env) {
  const query = encodeURIComponent(`*[_id == $id][0]`);
  const params = encodeURIComponent(JSON.stringify(docId));
  const url = `https://${env.SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${env.SANITY_DATASET}?query=${query}&$id=${params}`;
  const response = await fetch(url, {headers: {Authorization: `Bearer ${env.SANITY_AUTH_TOKEN}`}});
  if (!response.ok) {
    throw new Error(`Sanity fetch error: ${response.status}`);
  }
  return (await response.json()).result;
}

async function updateDocument(docId, updates, env) {
  const url = `https://${env.SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${env.SANITY_DATASET}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.SANITY_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({mutations: [{patch: {id: docId, set: updates}}]}),
  });
  if (!response.ok) {
    throw new Error(`Sanity update error: ${response.status} - ${await response.text()}`);
  }
  return response.json();
}

/**
 * Verify Sanity's `sanity-webhook-signature: t=<ms>,v1=<base64url HMAC-SHA256 of "<t>.<body>">`.
 * Matches @sanity/webhook's signing scheme.
 */
async function isValidSignature(header, body, secret) {
  const match = /^t=(\d+)[, ]+v1=([^, ]+)$/.exec(header ?? '');
  if (!match) return false;
  const [, timestamp, signature] = match;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${body}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return expected === signature;
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {status: 405});
    }

    const body = await request.text();
    if (!env.WEBHOOK_SECRET || !(await isValidSignature(request.headers.get('sanity-webhook-signature'), body, env.WEBHOOK_SECRET))) {
      return new Response('Invalid signature', {status: 401});
    }

    try {
      const payload = JSON.parse(body);
      const docId = payload._id || payload.documentId || payload.ids?.[0];
      if (!docId) {
        return new Response('No document ID in payload', {status: 400});
      }
      if (docId.startsWith('drafts.')) {
        return new Response('Skipping draft document', {status: 200});
      }

      const doc = await fetchDocument(docId, env);
      if (!doc) {
        return new Response('Document not found', {status: 404});
      }

      const updates = await translateDocument(doc, env);
      const count = Object.keys(updates).length;
      if (count === 0) {
        return new Response('No translation needed', {status: 200});
      }

      console.log(`Translating ${count} field(s) on ${doc._type} ${docId}`);
      await updateDocument(docId, updates, env);

      return Response.json({success: true, documentId: docId, fieldsTranslated: count});
    } catch (error) {
      console.error('Translation error:', error);
      return Response.json({error: error.message}, {status: 500});
    }
  },
};

