import {defineType} from 'sanity'

export default defineType({
  name: 'color',
  title: 'Color',
  type: 'object',
  fields: [
    {
      name: 'hex',
      title: 'Hex',
      type: 'string',
      validation: (Rule) => Rule.regex(/^#([0-9a-fA-F]{3}){1,2}$/).warning('Expected hex color like #ff0000'),
    },
  ],
  preview: {
    select: {hex: 'hex'},
    prepare({hex}) {
      return {title: hex || 'No color'}
    },
  },
})

