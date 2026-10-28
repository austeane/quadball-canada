// Pure helpers for finding and filling French fields; no network access.

const LOCALE_TEXT_TYPES = new Set(['localeString', 'localeText']);
// Values that are links, not text (untyped {en, fr} link objects in older documents)
const LINK_PATTERN = /^(https?:|mailto:|tel:|\/)/;

function isLocaleObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (LOCALE_TEXT_TYPES.has(value._type) || value._type === 'localePortableText') return true;
  // Older documents store localized objects without a _type
  const keys = Object.keys(value).filter((key) => !key.startsWith('_'));
  return keys.length > 0 && keys.every((key) => key === 'en' || key === 'fr') && 'en' in value;
}

const isEmpty = (value) =>
  value == null || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && value.length === 0);

// Path segment for an array item: by _key when it has one, otherwise by index
const itemPath = (base, item, index) =>
  item && typeof item === 'object' && item._key ? `${base}[_key=="${item._key}"]` : `${base}[${index}]`;

/**
 * Collect every localized field that has English but no French.
 * Returns jobs of {path, kind: 'text' | 'blocks' | 'slug', en}.
 */
export function collectJobs(value, path, jobs) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectJobs(item, itemPath(path, item, index), jobs));
    return jobs;
  }
  if (!value || typeof value !== 'object') return jobs;

  if (value._type === 'localeSlug') {
    if (value.en?.current && !value.fr?.current) jobs.push({path: `${path}.fr`, kind: 'slug', en: value.en.current});
    return jobs;
  }
  if (value._type === 'localeUrl') return jobs;

  if (isLocaleObject(value)) {
    if (!isEmpty(value.en) && isEmpty(value.fr)) {
      if (typeof value.en === 'string' && LINK_PATTERN.test(value.en.trim())) return jobs;
      if (typeof value.en === 'string') jobs.push({path: `${path}.fr`, kind: 'text', en: value.en});
      else if (Array.isArray(value.en)) jobs.push({path: `${path}.fr`, kind: 'blocks', en: value.en});
    }
    return jobs;
  }

  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith('_')) continue;
    collectJobs(child, path ? `${path}.${key}` : key, jobs);
  }
  return jobs;
}

// The span texts of a Portable Text array, in order
export function spanTexts(blocks) {
  const texts = [];
  for (const block of blocks) {
    if (block?._type !== 'block') continue;
    for (const child of block.children ?? []) {
      if (child?._type === 'span' && child.text?.trim()) texts.push(child.text);
    }
  }
  return texts;
}

// Copy of the blocks with each non-empty span text replaced, in order
export function withSpanTexts(blocks, translations) {
  let index = 0;
  return blocks.map((block) => {
    if (block?._type !== 'block') return block;
    return {
      ...block,
      children: (block.children ?? []).map((child) =>
        child?._type === 'span' && child.text?.trim() ? {...child, text: translations[index++]} : child,
      ),
    };
  });
}
