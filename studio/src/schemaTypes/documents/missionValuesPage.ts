import {defineArrayMember, defineField, defineType} from 'sanity'
import {FiHeart} from 'react-icons/fi'
import {seoField} from '../helpers/fields'

export default defineType({
  name: 'missionValuesPage',
  title: 'Mission & Values',
  type: 'document',
  icon: FiHeart,
  fields: [
    defineField({
      name: 'title',
      title: 'Page title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mission',
      title: 'Mission statement',
      type: 'localeText',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'values',
      title: 'Values',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'value',
          fields: [
            defineField({
              name: 'title',
              title: 'Value',
              type: 'localeString',
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'description', title: 'Description', type: 'localeText'}),
          ],
          preview: {select: {title: 'title.en', subtitle: 'description.en'}},
        }),
      ],
    }),
    seoField,
  ],
  preview: {prepare: () => ({title: 'Mission & Values'})},
})
