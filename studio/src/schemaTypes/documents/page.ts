import {defineArrayMember, defineField, defineType} from 'sanity'
import {FiFile} from 'react-icons/fi'
import {heroFields, seoField} from '../helpers/fields'

// A standalone site page at a fixed address (e.g. Host an Event, Meet the Board).
// Each page's document is listed by name under "Pages" in the Studio sidebar.
export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: FiFile,
  fields: [
    ...heroFields,
    defineField({
      name: 'sections',
      title: 'Page content',
      type: 'array',
      description:
        'Content shown below the banner. On pages with a list (board, staff, policies…), it appears after the list.',
      of: [
        defineArrayMember({type: 'textSection'}),
        defineArrayMember({type: 'columnsSection'}),
        defineArrayMember({type: 'ctaSection'}),
      ],
    }),
    seoField,
  ],
  preview: {
    select: {title: 'title.en', subtitle: 'subtitle.en', media: 'heroImage'},
  },
})
