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
      name: 'resourcesHeroImage',
      title: 'Resources Page Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hero image for /resources/ and /fr/ressources/ pages',
    },
    {
      name: 'policiesHeroImage',
      title: 'Policies Page Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hero image for /resources/policies/ and /fr/ressources/politiques/ pages',
    },
    {
      name: 'startingTeamHeroImage',
      title: 'Starting a Team Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hero image for /resources/starting-a-team/ and /fr/ressources/demarrer-une-equipe/ pages',
    },
    {
      name: 'planningTournamentHeroImage',
      title: 'Planning a Tournament Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hero image for /resources/planning-a-tournament/ and /fr/ressources/planifier-un-tournoi/ pages',
    },
    {
      name: 'hostEventHeroImage',
      title: 'Host an Event Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hero image for /get-involved/host-an-event/ and /fr/simpliquer/organiser-un-evenement/ pages',
    },
    {
      name: 'volunteerHeroImage',
      title: 'Volunteer Opportunities Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hero image for /volunteer-opportunities/ and /fr/benevolat/ pages',
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
