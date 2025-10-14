import {defineType} from 'sanity'

export default defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'localeString',
      description: 'Main page title (e.g., "About Us")',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'localeString',
      description: 'Hero subtitle text',
    },
    {
      name: 'heroCtaText',
      title: 'Hero CTA Text',
      type: 'localeString',
      description: 'Text for the call-to-action button in the hero',
    },
    {
      name: 'heroCtaHref',
      title: 'Hero CTA Link',
      type: 'string',
      description: 'URL for the hero CTA button (e.g., /get-involved/)',
    },
    {
      name: 'content',
      title: 'Page Content',
      type: 'localePortableText',
      description: 'Main content of the About page',
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
  ],
  preview: {
    select: {
      titleEn: 'title.en',
      titleFr: 'title.fr',
    },
    prepare({ titleEn, titleFr }) {
      return {
        title: titleEn || titleFr,
        subtitle: 'About Page',
      }
    },
  },
})
