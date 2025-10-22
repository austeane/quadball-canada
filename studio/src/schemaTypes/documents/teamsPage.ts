import {defineType} from 'sanity'

export default defineType({
  name: 'teamsPage',
  title: 'Teams Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'intro',
      title: 'Introductory Copy',
      type: 'localePortableText',
      description: 'Shown beneath the page heading.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'levels',
      title: 'Levels of Play',
      type: 'array',
      of: [{type: 'teamLevelSection'}],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error('Add at least one level of play to display on the page.'),
    },
    {
      name: 'cta',
      title: 'Support CTA',
      type: 'object',
      fields: [
        {
          name: 'heading',
          title: 'Heading',
          type: 'localeString',
        },
        {
          name: 'body',
          title: 'Body',
          type: 'localeText',
        },
        {
          name: 'buttonLabel',
          title: 'Button Label',
          type: 'localeString',
        },
        {
          name: 'buttonHref',
          title: 'Button Link',
          type: 'string',
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
        title: titleEn || titleFr || 'Teams Page',
      }
    },
  },
})
