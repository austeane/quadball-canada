import {defineType} from 'sanity'

export default defineType({
  name: 'team',
  title: 'Team',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Team Name',
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
      name: 'city',
      title: 'City',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'province',
      title: 'Province',
      type: 'string',
      options: {
        list: [
          { title: 'Alberta', value: 'AB' },
          { title: 'British Columbia', value: 'BC' },
          { title: 'Manitoba', value: 'MB' },
          { title: 'New Brunswick', value: 'NB' },
          { title: 'Newfoundland and Labrador', value: 'NL' },
          { title: 'Northwest Territories', value: 'NT' },
          { title: 'Nova Scotia', value: 'NS' },
          { title: 'Nunavut', value: 'NU' },
          { title: 'Ontario', value: 'ON' },
          { title: 'Prince Edward Island', value: 'PE' },
          { title: 'Quebec', value: 'QC' },
          { title: 'Saskatchewan', value: 'SK' },
          { title: 'Yukon', value: 'YT' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'levelOfPlay',
      title: 'Level of Play',
      type: 'string',
      description: 'Select the best fit for this program.',
      options: {
        list: [
          { title: 'Youth', value: 'youth' },
          { title: 'Recreational', value: 'recreational' },
          { title: 'Competitive', value: 'competitive' },
          { title: 'National Team', value: 'national-team' },
        ],
        layout: 'radio',
      },
      initialValue: 'recreational',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'division',
      title: 'Program Type',
      type: 'string',
      options: {
        list: [
          { title: 'Club', value: 'club' },
          { title: 'University', value: 'university' },
          { title: 'Youth', value: 'youth' },
          { title: 'Development', value: 'development' },
        ],
      },
    },
    {
      name: 'founded',
      title: 'Founded Year',
      type: 'number',
      validation: (Rule) => Rule.min(2000).max(new Date().getFullYear()),
    },
    {
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Is this team currently active?',
      initialValue: true,
    },
    {
      name: 'logo',
      title: 'Team Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'localeString',
          description: 'Describe the logo for accessibility.',
        },
      ],
    },
    {
      name: 'primaryColor',
      title: 'Primary Color',
      type: 'color',
      options: {
        disableAlpha: false,
      },
    },
    {
      name: 'secondaryColor',
      title: 'Secondary Color',
      type: 'color',
      options: {
        disableAlpha: false,
      },
    },
    {
      name: 'description',
      title: 'Description',
      type: 'localeText',
    },
    {
      name: 'website',
      title: 'Website',
      type: 'url',
    },
    {
      name: 'email',
      title: 'Contact Email',
      type: 'email',
    },
    {
      name: 'socialMedia',
      title: 'Social Media',
      type: 'object',
      fields: [
        {
          name: 'facebook',
          title: 'Facebook',
          type: 'url',
        },
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
        {
          name: 'tiktok',
          title: 'TikTok',
          type: 'url',
        },
      ],
    },
    {
      name: 'homefield',
      title: 'Home Field/Venue',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Venue Name',
          type: 'string',
        },
        {
          name: 'address',
          title: 'Address',
          type: 'text',
        },
        {
          name: 'coordinates',
          title: 'Coordinates',
          type: 'geopoint',
        },
      ],
    },
    {
      name: 'roster',
      title: 'Current Roster',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'player' }],
        },
      ],
    },
    {
      name: 'coaches',
      title: 'Coaches',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'role',
              title: 'Role',
              type: 'string',
              options: {
                list: [
                  { title: 'Head Coach', value: 'head_coach' },
                  { title: 'Assistant Coach', value: 'assistant_coach' },
                  { title: 'Manager', value: 'manager' },
                ],
              },
            },
            {
              name: 'email',
              title: 'Email',
              type: 'email',
            },
          ],
        },
      ],
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
            },
            {
              name: 'year',
              title: 'Year',
              type: 'number',
            },
            {
              name: 'description',
              title: 'Description',
              type: 'localeText',
            },
          ],
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'name',
      city: 'city',
      province: 'province',
      media: 'logo',
      active: 'active',
      levelOfPlay: 'levelOfPlay',
    },
    prepare({ title, city, province, media, active, levelOfPlay }) {
      const location = [city, province].filter(Boolean).join(', ');
      const status = active === false ? ' (Inactive)' : '';
      const levelLabels: Record<string, string> = {
        youth: 'Youth',
        recreational: 'Recreational',
        competitive: 'Competitive',
        'national-team': 'National Team',
        'full-contact': 'Competitive',
      };
      const level = levelLabels[levelOfPlay as keyof typeof levelLabels] || undefined;
      const subtitleParts = [level, location].filter(Boolean);
      return {
        title,
        subtitle: `${subtitleParts.join(' — ') || 'Location TBD'}${status}`,
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
      title: 'Province, City',
      name: 'location',
      by: [
        { field: 'province', direction: 'asc' },
        { field: 'city', direction: 'asc' },
      ],
    },
  ],
})
