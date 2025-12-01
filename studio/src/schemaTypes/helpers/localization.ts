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