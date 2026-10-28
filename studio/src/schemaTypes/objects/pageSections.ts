import {defineArrayMember, defineField, defineType} from 'sanity'
import {FiAlignLeft, FiColumns, FiZap} from 'react-icons/fi'

// Section types a Page can be built from. Each renders as its own block on the site.

export const textSection = defineType({
  name: 'textSection',
  title: 'Text',
  type: 'object',
  icon: FiAlignLeft,
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
    defineField({name: 'body', title: 'Text', type: 'localePortableText'}),
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      options: {
        list: [
          {title: 'Plain', value: 'plain'},
          {title: 'Highlighted box', value: 'panel'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'plain',
    }),
  ],
  preview: {
    select: {heading: 'heading.en', style: 'style'},
    prepare: ({heading, style}) => ({
      title: heading || 'Text',
      subtitle: style === 'panel' ? 'Text · highlighted box' : 'Text',
    }),
  },
})

export const columnsSection = defineType({
  name: 'columnsSection',
  title: 'Side-by-side columns',
  type: 'object',
  icon: FiColumns,
  fields: [
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'array',
      validation: (Rule) => Rule.min(2).max(3),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'column',
          fields: [
            defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
            defineField({name: 'body', title: 'Text', type: 'localePortableText'}),
          ],
          preview: {select: {title: 'heading.en'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {first: 'columns.0.heading.en', second: 'columns.1.heading.en'},
    prepare: ({first, second}) => ({
      title: [first, second].filter(Boolean).join(' | ') || 'Columns',
      subtitle: 'Side-by-side columns',
    }),
  },
})

export const ctaSection = defineType({
  name: 'ctaSection',
  title: 'Call to action',
  type: 'object',
  icon: FiZap,
  fields: [
    defineField({name: 'cta', title: 'Content', type: 'callToAction'}),
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      options: {
        list: [
          {title: 'Pink', value: 'primary'},
          {title: 'Grey', value: 'light'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'primary',
    }),
  ],
  preview: {
    select: {heading: 'cta.heading.en'},
    prepare: ({heading}) => ({title: heading || 'Call to action', subtitle: 'Call to action'}),
  },
})
