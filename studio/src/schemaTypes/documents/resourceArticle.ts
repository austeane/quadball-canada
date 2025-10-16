import {defineType} from 'sanity'

export default defineType({
  name: 'resourceArticle',
  title: 'Resource',
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
      type: 'string',
      options: {
        list: [
          {title: 'Guide', value: 'guide'},
          {title: 'Tool', value: 'tool'},
          {title: 'Website', value: 'website'},
          {title: 'Document', value: 'document'},
          {title: 'Video', value: 'video'},
          {title: 'Other', value: 'other'},
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      description: 'If this resource links to an external website, add the URL here',
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
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
      type: 'localeText',
      description: 'Short summary used on preview cards',
      validation: (Rule) => Rule.max(200),
    },
    {
      name: 'content',
      title: 'Content',
      type: 'localePortableText',
      description: 'Full content (optional if this is just an external link)',
    },
    {
      name: 'featured',
      title: 'Featured Resource',
      type: 'boolean',
      description: 'Highlight this resource at the top of the list',
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
          description: 'Defaults to hero image if not set',
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
      category: 'category',
      media: 'heroImage',
    },
    prepare({titleEn, titleFr, category, media}) {
      return {
        title: titleEn || titleFr || 'Untitled',
        subtitle: category ? category.charAt(0).toUpperCase() + category.slice(1) : undefined,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        {field: 'featured', direction: 'desc'},
        {field: 'title.en', direction: 'asc'},
      ],
    },
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [{field: 'title.en', direction: 'asc'}],
    },
    {
      title: 'Category',
      name: 'category',
      by: [
        {field: 'category', direction: 'asc'},
        {field: 'title.en', direction: 'asc'},
      ],
    },
  ],
})
