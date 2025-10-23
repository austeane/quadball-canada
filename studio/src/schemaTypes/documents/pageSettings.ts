import {defineType} from 'sanity'

export default defineType({
  name: 'pageSettings',
  title: 'Page Settings',
  type: 'document',
  fields: [
    {
      name: 'aboutHeroImage',
      title: 'About Page Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hero image for /about/ and /fr/a-propos/ pages',
    },
    {
      name: 'contactHeroImage',
      title: 'Contact Page Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hero image for /contact/ and /fr/contact/ pages',
    },
    {
      name: 'eventsHeroImage',
      title: 'Events Page Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hero image for /events/ and /fr/evenements/ pages',
    },
    {
      name: 'getInvolvedHeroImage',
      title: 'Get Involved Page Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hero image for /get-involved/ and /fr/participer/ pages',
    },
    {
      name: 'teamsHeroImage',
      title: 'Teams Page Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hero image for /teams/ and /fr/equipes/ pages',
    },
    {
      name: 'newsHeroImage',
      title: 'News Page Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hero image for /news/ and /fr/nouvelles/ pages',
    },
    {
      name: 'boardHeroImage',
      title: 'Board Page Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hero image for /about/meet-the-board/ and /fr/a-propos/conseil/ pages',
    },
    {
      name: 'staffHeroImage',
      title: 'Staff Page Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hero image for /about/meet-the-staff/ and /fr/a-propos/equipe/ pages',
    },
    {
      name: 'defaultHeroImage',
      title: 'Default Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Fallback hero image for pages without a specific image',
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Page Settings',
      }
    },
  },
})
