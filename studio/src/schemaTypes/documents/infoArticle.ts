import {defineType} from 'sanity'

export default defineType({
  name: 'infoArticle',
  title: 'Information Article',
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
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      description: 'Optional category for organizing informational articles.'
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'localeText',
      description: 'Short summary used on preview cards.',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'localePortableText',
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
          options: { hotspot: true },
        },
      ],
    },
  ],
  preview: {
    select: {
      titleEn: 'title.en',
      titleFr: 'title.fr',
      category: 'category.title',
    },
    prepare({titleEn, titleFr, category}) {
      return {
        title: titleEn || titleFr || 'Untitled',
        subtitle: category ? `Category: ${category}` : undefined,
      }
    },
  },
})
