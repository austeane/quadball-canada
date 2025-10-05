import {defineType} from 'sanity'

export default defineType({
  name: 'player',
  title: 'Player',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'jerseyNumber',
      title: 'Jersey Number',
      type: 'number',
    },
    {
      name: 'position',
      title: 'Primary Position',
      type: 'string',
      options: {
        list: [
          { title: 'Chaser', value: 'chaser' },
          { title: 'Beater', value: 'beater' },
          { title: 'Keeper', value: 'keeper' },
          { title: 'Seeker', value: 'seeker' },
          { title: 'Utility', value: 'utility' },
        ],
      },
    },
    {
      name: 'birthdate',
      title: 'Birth Date',
      type: 'date',
    },
    {
      name: 'hometown',
      title: 'Hometown',
      type: 'string',
    },
    {
      name: 'bio',
      title: 'Biography',
      type: 'localeText',
    },
    {
      name: 'photo',
      title: 'Player Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'nationalTeam',
      title: 'National Team Member',
      type: 'boolean',
      description: 'Is this player on a Canadian national team?',
      initialValue: false,
    },
    {
      name: 'nationalTeamYears',
      title: 'National Team Years',
      type: 'array',
      of: [{ type: 'number' }],
      hidden: ({ parent }) => !parent?.nationalTeam,
    },
    {
      name: 'achievements',
      title: 'Achievements',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Achievement',
              type: 'localeString',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'year',
              title: 'Year',
              type: 'number',
            },
            {
              name: 'event',
              title: 'Event/Tournament',
              type: 'string',
            },
          ],
        },
      ],
    },
    {
      name: 'stats',
      title: 'Career Stats',
      type: 'object',
      fields: [
        {
          name: 'gamesPlayed',
          title: 'Games Played',
          type: 'number',
        },
        {
          name: 'goalsScored',
          title: 'Goals Scored',
          type: 'number',
        },
        {
          name: 'assists',
          title: 'Assists',
          type: 'number',
        },
        {
          name: 'snitchCatches',
          title: 'Snitch Catches',
          type: 'number',
        },
      ],
    },
    {
      name: 'socialMedia',
      title: 'Social Media',
      type: 'object',
      fields: [
        {
          name: 'instagram',
          title: 'Instagram',
          type: 'url',
        },
        {
          name: 'twitter',
          title: 'Twitter/X',
          type: 'url',
        },
      ],
    },
    {
      name: 'active',
      title: 'Active Player',
      type: 'boolean',
      description: 'Is this player currently active?',
      initialValue: true,
    },
  ],
  preview: {
    select: {
      title: 'name',
      position: 'position',
      jersey: 'jerseyNumber',
      media: 'photo',
      active: 'active',
      national: 'nationalTeam',
    },
    prepare({ title, position, jersey, media, active, national }) {
      const subtitle = [
        jersey ? `#${jersey}` : null,
        position,
        national ? '🍁' : null,
        !active ? '(Retired)' : null,
      ].filter(Boolean).join(' • ')

      return {
        title,
        subtitle,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
    {
      title: 'Jersey Number',
      name: 'jerseyAsc',
      by: [{ field: 'jerseyNumber', direction: 'asc' }],
    },
  ],
})