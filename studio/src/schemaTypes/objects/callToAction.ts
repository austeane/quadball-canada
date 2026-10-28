import {defineField, defineType} from 'sanity'

// A heading, short text and button, used for call-to-action boxes across the site.
export default defineType({
  name: 'callToAction',
  title: 'Call to action',
  type: 'object',
  fields: [
    defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
    defineField({name: 'body', title: 'Text', type: 'localeText'}),
    defineField({name: 'buttonLabel', title: 'Button label', type: 'localeString'}),
    defineField({
      name: 'buttonLink',
      title: 'Button link',
      type: 'localeUrl',
      description: 'Leave empty to show the box without a button.',
    }),
  ],
  preview: {
    select: {title: 'heading.en', subtitle: 'buttonLabel.en'},
  },
})
