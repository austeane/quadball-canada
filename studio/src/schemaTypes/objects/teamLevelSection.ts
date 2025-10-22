import {defineType} from 'sanity'

const LEVEL_IDENTIFIERS = [
  {title: 'Youth', value: 'youth'},
  {title: 'Recreational', value: 'recreational'},
  {title: 'Competitive', value: 'competitive'},
  {title: 'National Team', value: 'national-team'},
] as const

export default defineType({
  name: 'teamLevelSection',
  title: 'Team Level Section',
  type: 'object',
  fields: [
    {
      name: 'identifier',
      title: 'Level',
      type: 'string',
      description: 'Key used to match teams to this level.',
      options: {
        list: LEVEL_IDENTIFIERS,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'localeText',
      description: 'Short overview shown on the Teams page.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'details',
      title: 'Expanded Details',
      type: 'localePortableText',
      description: 'Additional information visible when the level is expanded.',
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
  ],
  preview: {
    select: {
      titleEn: 'title.en',
      titleFr: 'title.fr',
      identifier: 'identifier',
    },
    prepare({ titleEn, titleFr, identifier }) {
      return {
        title: titleEn || titleFr,
        subtitle: identifier,
      }
    },
  },
})
