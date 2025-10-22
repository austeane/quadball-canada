import {defineType} from 'sanity'

export default defineType({
  name: 'nationalTeamPage',
  title: 'National Team Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        {
          name: 'subtitle',
          title: 'Subtitle',
          type: 'localeString',
        },
        {
          name: 'image',
          title: 'Hero Image',
          type: 'image',
          options: {hotspot: true},
        },
      ],
    },
    {
      name: 'content',
      title: 'Content',
      type: 'localePortableText',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'cta',
      title: 'Call to Action',
      type: 'object',
      fields: [
        {
          name: 'label',
          title: 'Label',
          type: 'localeString',
        },
        {
          name: 'href',
          title: 'Link',
          type: 'string',
        },
      ],
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'localeString',
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'localeText',
        },
        {
          name: 'ogImage',
          title: 'Open Graph Image',
          type: 'image',
          options: {hotspot: true},
        },
      ],
    },
  ],
  preview: {
    select: {
      titleEn: 'title.en',
      titleFr: 'title.fr',
    },
    prepare({ titleEn, titleFr }) {
      return {
        title: titleEn || titleFr || 'National Team Page',
      }
    },
  },
})
