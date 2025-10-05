import {defineType} from 'sanity'

export default defineType({
  name: 'ctaBlock',
  title: 'CTA Block',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'heading',
      title: 'Heading',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'localeText',
    },
    {
      name: 'buttonText',
      title: 'Button Text',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'buttonUrl',
      title: 'Button URL',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'style',
      title: 'Style',
      type: 'string',
      options: {
        list: [
          { title: 'Primary', value: 'primary' },
          { title: 'Secondary', value: 'secondary' },
          { title: 'Accent', value: 'accent' },
          { title: 'Dark', value: 'dark' },
        ],
      },
      initialValue: 'primary',
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Icon name from icon library',
    },
    {
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
  ],
  preview: {
    select: {
      titleEn: 'heading.en',
      titleFr: 'heading.fr',
      style: 'style',
      media: 'backgroundImage',
    },
    prepare({ titleEn, titleFr, style, media }) {
      return {
        title: titleEn || titleFr,
        subtitle: `CTA Block (${style})`,
        media,
      }
    },
  },
})