import {defineType} from 'sanity'
import {FiBookOpen} from 'react-icons/fi'
import {imageWithAlt} from '../helpers/fields'

export default defineType({
  name: 'infoArticle',
  title: 'Info Article',
  type: 'document',
  icon: FiBookOpen,
  description: 'Evergreen pages at /info/… such as What is Quadball and Inclusion & Gender Equity.',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'localeString',
      // English is required inside localeString; French is optional for auto-translation
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'localeSlug',
      // English is required inside localeSlug; French is optional
    },
    imageWithAlt('heroImage', 'Hero Image'),
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'localeText',
      description: 'Short summary used on preview cards.',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'localePortableText',
      // English is required inside localePortableText; French is optional for auto-translation
    },
    {
      name: 'cta',
      title: 'Closing box',
      type: 'callToAction',
      description: 'Optional box at the end of the article, e.g. inviting readers to get in touch.',
      initialValue: {
        body: {
          en: 'If this sounds like the sport for you, reach out to find out how to join a team near you.',
          fr: 'Si ce sport vous intéresse, contactez-nous pour savoir comment rejoindre une équipe près de chez vous.',
        },
        buttonLabel: {en: 'Contact Us', fr: 'Nous contacter'},
        buttonLink: {en: '/contact/', fr: '/fr/contact/'},
      },
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'localeString',
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'localeText',
        },
        {
          name: 'ogImage',
          title: 'Open Graph Image',
          type: 'image',
          options: { hotspot: true },
        },
      ],
    },
  ],
  preview: {
    select: {
      titleEn: 'title.en',
      titleFr: 'title.fr',
    },
    prepare({titleEn, titleFr}) {
      return {
        title: titleEn || titleFr || 'Untitled',
      }
    },
  },
})
