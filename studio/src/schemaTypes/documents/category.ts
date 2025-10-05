import {defineType} from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
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
      name: 'description',
      title: 'Description',
      type: 'localeText',
    },
    {
      name: 'color',
      title: 'Category Color',
      type: 'color',
      description: 'Used for category badges and highlights',
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which categories appear in listings',
    },
  ],
  preview: {
    select: {
      titleEn: 'title.en',
      titleFr: 'title.fr',
      order: 'order',
    },
    prepare({ titleEn, titleFr, order }) {
      return {
        title: titleEn || titleFr,
        subtitle: order ? `Order: ${order}` : '',
      }
    },
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Title',
      name: 'titleAsc',
      by: [{ field: 'title.en', direction: 'asc' }],
    },
  ],
})