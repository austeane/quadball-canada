// Localization helpers for bilingual content

export const localeString = {
  title: 'Localized string',
  name: 'localeString',
  type: 'object',
  fields: [
    {
      title: 'English',
      name: 'en',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      title: 'French',
      name: 'fr',
      type: 'string',
      description: 'Optional — will be auto-translated if left empty',
    },
  ],
};

export const localeText = {
  title: 'Localized text',
  name: 'localeText',
  type: 'object',
  fields: [
    {
      title: 'English',
      name: 'en',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      title: 'French',
      name: 'fr',
      type: 'text',
      description: 'Optional — will be auto-translated if left empty',
    },
  ],
};

export const localeSlug = {
  title: 'Localized slug',
  name: 'localeSlug',
  type: 'object',
  fields: [
    {
      title: 'English',
      name: 'en',
      type: 'slug',
      options: {
        source: 'title.en',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      title: 'French',
      name: 'fr',
      type: 'slug',
      options: {
        source: 'title.en', // Falls back to English slug
        maxLength: 96,
      },
      description: 'Optional — will use English slug if left empty',
    },
  ],
};

export const localePortableText = {
  title: 'Localized rich text',
  name: 'localePortableText',
  type: 'object',
  fields: [
    {
      title: 'English',
      name: 'en',
      type: 'blockContent',
      validation: (Rule: any) => Rule.required(),
    },
    {
      title: 'French',
      name: 'fr',
      type: 'blockContent',
      description: 'Optional — will be auto-translated if left empty',
    },
  ],
};

const linkRule = (Rule: any) =>
  Rule.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']});

// A link with an English and a French destination. Internal pages use relative
// paths (e.g. /contact/ and /fr/contact/); external sites use full URLs.
export const localeUrl = {
  title: 'Link',
  name: 'localeUrl',
  type: 'object',
  options: {columns: 2},
  fields: [
    {
      title: 'English link',
      name: 'en',
      type: 'url',
      description: 'e.g. /contact/ or https://example.com',
      validation: (Rule: any) => linkRule(Rule).required(),
    },
    {
      title: 'French link',
      name: 'fr',
      type: 'url',
      description: 'e.g. /fr/contact/ — leave empty to use the English link',
      validation: linkRule,
    },
  ],
};

export const supportedLanguages = [
  { id: 'en', title: 'English', isDefault: true },
  { id: 'fr', title: 'French' },
];

// Helper to create localized fields
export function localizeField(field: any, languages = supportedLanguages) {
  return {
    ...field,
    type: 'object',
    fields: languages.map(lang => ({
      title: lang.title,
      name: lang.id,
      type: field.type === 'blockContent' ? 'blockContent' : field.type,
      validation: lang.isDefault ? (Rule: any) => Rule.required() : undefined,
    })),
  };
}