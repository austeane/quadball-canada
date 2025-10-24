import {defineField, defineType} from 'sanity'

const provinces = [
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
] as const

export default defineType({
  name: 'volunteerOpportunity',
  title: 'Volunteer Opportunity',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title.en',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'localeText',
      rows: 3,
      validation: (Rule) => Rule.required().min(20).error('Provide a short description that encourages people to apply.'),
    }),
    defineField({
      name: 'roleType',
      title: 'Role Type',
      description: 'Helps group opportunities on the website.',
      type: 'string',
      options: {
        list: [
          { title: 'Officiating (Referee/Scorekeeper)', value: 'officiating' },
          { title: 'Event Support', value: 'event-support' },
          { title: 'Administration', value: 'administration' },
          { title: 'Coaching & Development', value: 'coaching' },
          { title: 'Communications & Marketing', value: 'communications' },
          { title: 'Governance', value: 'governance' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'timeCommitment',
      title: 'Time Commitment',
      type: 'string',
      options: {
        list: [
          { title: 'One-time', value: 'one-time' },
          { title: 'Short-term (1-3 months)', value: 'short-term' },
          { title: 'Ongoing', value: 'ongoing' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'City or community. Use "Remote" if fully online.',
    }),
    defineField({
      name: 'province',
      title: 'Province / Territory',
      type: 'string',
      options: {
        list: provinces,
      },
    }),
    defineField({
      name: 'isRemote',
      title: 'Remote friendly',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'deadline',
      title: 'Application Deadline',
      type: 'date',
    }),
    defineField({
      name: 'applicationUrl',
      title: 'Application URL',
      type: 'url',
      validation: (Rule) => Rule.required().uri({ allowRelative: false }),
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'email',
    }),
    defineField({
      name: 'orderRank',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first when sorting by priority.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title.en',
      roleType: 'roleType',
      isRemote: 'isRemote',
      location: 'location',
      province: 'province',
    },
    prepare({ title, roleType, isRemote, location, province }) {
      const roleTitleMap: Record<string, string> = {
        officiating: 'Officiating',
        'event-support': 'Event Support',
        administration: 'Administration',
        coaching: 'Coaching & Development',
        communications: 'Communications & Marketing',
        governance: 'Governance',
        other: 'Other',
      }
      const roleLabel = roleType ? roleTitleMap[roleType] ?? roleType : undefined
      const locationParts = [
        isRemote ? 'Remote friendly' : undefined,
        location,
        province,
      ].filter(Boolean)

      return {
        title: title ?? 'Untitled opportunity',
        subtitle: roleLabel
          ? `${roleLabel}${locationParts.length ? ` — ${locationParts.join(', ')}` : ''}`
          : locationParts.join(', '),
      }
    },
  },
})
