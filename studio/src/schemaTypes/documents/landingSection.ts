import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'landingSection',
  title: 'Landing Section',
  type: 'document',
  fields: [
    defineField({
      name: 'key',
      title: 'Section Key',
      type: 'string',
      description: 'Unique identifier for this section (e.g., "about", "events", "resources", "getInvolved")',
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          { title: 'About', value: 'about' },
          { title: 'Events', value: 'events' },
          { title: 'Resources', value: 'resources' },
          { title: 'Get Involved', value: 'getInvolved' },
        ],
      },
    }),
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'localeString',
      // English is required inside localeString; French is optional for auto-translation
    }),
    defineField({
      name: 'intro',
      title: 'Introduction Text',
      type: 'localeText',
      description: 'Paragraph that appears below the title',
      rows: 3,
    }),
    defineField({
      name: 'cards',
      title: 'Section Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'card',
          title: 'Card',
          fields: [
            defineField({
              name: 'title',
              title: 'Card Title',
              type: 'localeString',
              // English is required inside localeString; French is optional for auto-translation
            }),
            defineField({
              name: 'body',
              title: 'Card Description',
              type: 'localeText',
              rows: 3,
              // English is required inside localeText; French is optional for auto-translation
            }),
            defineField({
              name: 'ctaText',
              title: 'Call to Action Text',
              type: 'localeString',
              description: 'Text for the button/link',
              // English is required inside localeString; French is optional for auto-translation
            }),
            defineField({
              name: 'href',
              title: 'Link',
              type: 'object',
              description: 'Use relative paths for internal links (e.g., /about/) or full URLs for external (https://...)',
              fields: [
                {
                  name: 'en',
                  title: 'English URL',
                  type: 'url',
                  validation: (Rule) =>
                    Rule.required().uri({
                      allowRelative: true,
                      scheme: ['http', 'https', 'mailto', 'tel'],
                    }),
                },
                {
                  name: 'fr',
                  title: 'French URL',
                  type: 'url',
                  validation: (Rule) =>
                    Rule.required().uri({
                      allowRelative: true,
                      scheme: ['http', 'https', 'mailto', 'tel'],
                    }),
                },
              ],
            }),
            defineField({
              name: 'external',
              title: 'External Link',
              type: 'boolean',
              description: 'Check if this links to an external website',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              titleEn: 'title.en',
              titleFr: 'title.fr',
              bodyEn: 'body.en',
            },
            prepare({ titleEn, titleFr, bodyEn }) {
              return {
                title: titleEn || titleFr || 'Untitled Card',
                subtitle: bodyEn ? bodyEn.substring(0, 100) + '...' : '',
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'showContent',
      title: 'Show Dynamic Content',
      type: 'boolean',
      description: 'Show list content below cards (e.g., event list, resource list)',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      key: 'key',
      titleEn: 'title.en',
      titleFr: 'title.fr',
    },
    prepare({ key, titleEn, titleFr }) {
      const titles = {
        about: '📖',
        events: '📅',
        resources: '📚',
        getInvolved: '🤝',
      }
      return {
        title: titleEn || titleFr || 'Untitled Section',
        subtitle: `Landing Section: ${key}`,
        media: titles[key] || '📄',
      }
    },
  },
})
