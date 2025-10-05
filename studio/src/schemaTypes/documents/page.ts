import {defineType} from 'sanity'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'localeSlug',
      validation: (Rule) => Rule.required(),
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
          options: {
            hotspot: true,
          },
        },
      ],
    },
    {
      name: 'content',
      title: 'Content',
      type: 'localePortableText',
    },
    {
      name: 'sidebar',
      title: 'Sidebar Content',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'ctaBlock' },
            { type: 'formEmbed' },
          ],
        },
      ],
    },
  ],
  preview: {
    select: {
      titleEn: 'title.en',
      titleFr: 'title.fr',
      slugEn: 'slug.en.current',
    },
    prepare({ titleEn, titleFr, slugEn }) {
      return {
        title: titleEn || titleFr,
        subtitle: `/${slugEn}`,
      }
    },
  },
})