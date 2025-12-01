import {defineType} from 'sanity'

export default defineType({
  name: 'newsArticle',
  title: 'News Article',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'localeString',
      // English is required inside localeString; French is optional for auto-translation
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'localeSlug',
      // English is required inside localeSlug; French is optional
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    },
    {
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'localeString',
        },
      ],
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'object',
      fields: [
        {
          title: 'English',
          name: 'en',
          type: 'text',
          validation: (Rule) => Rule.required().max(200),
        },
        {
          title: 'French',
          name: 'fr',
          type: 'text',
          description: 'Optional — will be auto-translated if left empty',
          validation: (Rule) => Rule.max(200),
        },
      ],
    },
    {
      name: 'content',
      title: 'Content',
      type: 'localePortableText',
      // English is required inside localePortableText; French is optional for auto-translation
    },
    {
      name: 'featured',
      title: 'Featured Article',
      type: 'boolean',
      description: 'Show this article in featured sections',
      initialValue: false,
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
          description: 'Defaults to featured image if not set',
          options: {
            hotspot: true,
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      titleEn: 'title.en',
      titleFr: 'title.fr',
      date: 'publishedAt',
      media: 'featuredImage',
    },
    prepare({ titleEn, titleFr, date, media }) {
      return {
        title: titleEn || titleFr,
        subtitle: new Date(date).toLocaleDateString(),
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Publish Date, New',
      name: 'publishDateDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Publish Date, Old',
      name: 'publishDateAsc',
      by: [{ field: 'publishedAt', direction: 'asc' }],
    },
  ],
})
