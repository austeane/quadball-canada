import {defineType} from 'sanity'
import {FiUsers} from 'react-icons/fi'
import {imageWithAlt} from '../helpers/fields'

export default defineType({
  name: 'teamsPage',
  title: 'Teams Page',
  type: 'document',
  icon: FiUsers,
  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    },
    imageWithAlt('heroImage', 'Banner image', 'Leave empty to use the default banner from Site Settings.'),
    {
      name: 'intro',
      title: 'Introductory Copy',
      type: 'localePortableText',
      description: 'Shown beneath the page heading.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'levelsHeading',
      title: 'Levels of play heading',
      type: 'localeString',
    },
    {
      name: 'levelsIntro',
      title: 'Levels of play intro',
      type: 'localeText',
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
      title: 'Contact box',
      type: 'callToAction',
      description: 'Shown after the team directory.',
    },
    {
      name: 'communityCta',
      title: 'Discord box',
      type: 'callToAction',
      description: 'Shown at the bottom of the page.',
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
