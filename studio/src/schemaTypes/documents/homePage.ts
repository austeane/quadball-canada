import {defineField, defineType} from 'sanity'
import {FiHome} from 'react-icons/fi'
import {imageWithAlt} from '../helpers/fields'

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  icon: FiHome,
  groups: [
    {name: 'hero', title: 'Banner', default: true},
    {name: 'feature', title: 'What is Quadball'},
    {name: 'support', title: 'Support section'},
  ],
  fields: [
    defineField({
      name: 'hero',
      title: 'Banner',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({name: 'title', title: 'Title', type: 'localeString'}),
        defineField({name: 'subtitle', title: 'Subtitle', type: 'localeText'}),
        defineField({name: 'buttonLabel', title: 'Button label', type: 'localeString'}),
        defineField({name: 'buttonLink', title: 'Button link', type: 'localeUrl'}),
        imageWithAlt('image', 'Banner image', 'Leave empty to use the standard Quadball Canada cover photo.'),
      ],
    }),
    defineField({
      name: 'featuredArticle',
      title: 'Featured article',
      type: 'reference',
      to: [{type: 'infoArticle'}],
      group: 'feature',
      description:
        'The About Us article previewed below the banner (title, summary and image), with a link to read more.',
    }),
    defineField({
      name: 'support',
      title: 'Support section',
      type: 'object',
      group: 'support',
      fields: [
        defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
        defineField({name: 'body', title: 'Text', type: 'localeText'}),
        defineField({name: 'donateLabel', title: 'Donate button label', type: 'localeString'}),
        defineField({
          name: 'donateUrl',
          title: 'Donate link',
          type: 'url',
          description: 'Leave empty to use the Donate link from Site Settings.',
        }),
        defineField({name: 'sponsorshipLabel', title: 'Sponsorship label', type: 'localeString'}),
        defineField({name: 'sponsorshipEmail', title: 'Sponsorship email', type: 'email'}),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Home Page'})},
})
