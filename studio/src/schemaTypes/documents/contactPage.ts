import {defineArrayMember, defineField, defineType} from 'sanity'
import {FiMail} from 'react-icons/fi'
import {seoField} from '../helpers/fields'

export default defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  icon: FiMail,
  fields: [
    defineField({
      name: 'title',
      title: 'Page title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'subtitle', title: 'Subtitle', type: 'localeText'}),
    defineField({
      name: 'cards',
      title: 'Contact cards',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'contactCard',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {
                list: [
                  {title: 'Envelope', value: 'mail'},
                  {title: 'Newspaper', value: 'newspaper'},
                  {title: 'Trophy', value: 'trophy'},
                  {title: 'Handshake', value: 'handshake'},
                  {title: 'People', value: 'users'},
                ],
              },
              initialValue: 'mail',
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'localeString',
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'description', title: 'Description', type: 'localeText'}),
            defineField({
              name: 'email',
              title: 'Email',
              type: 'email',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {select: {title: 'title.en', subtitle: 'email'}},
        }),
      ],
    }),
    defineField({
      name: 'socialHeading',
      title: 'Social media heading',
      type: 'localeString',
      description: 'The social links themselves are edited in Site Settings.',
    }),
    defineField({name: 'socialBody', title: 'Social media text', type: 'localeText'}),
    seoField,
  ],
  preview: {prepare: () => ({title: 'Contact Page'})},
})
