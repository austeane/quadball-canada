import {defineType} from 'sanity'

export default defineType({
  name: 'event',
  title: 'Upcoming Event',
  type: 'document',
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
    {
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      options: {
        list: [
          { title: 'Tournament', value: 'tournament' },
          { title: 'Training', value: 'training' },
          { title: 'Meeting', value: 'meeting' },
          { title: 'Social', value: 'social' },
          { title: 'Camp', value: 'camp' },
          { title: 'Workshop', value: 'workshop' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'localeText',
    },
    {
      name: 'content',
      title: 'Full Content',
      type: 'localePortableText',
    },
    {
      name: 'startDateTime',
      title: 'Start Date & Time',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'endDateTime',
      title: 'End Date & Time',
      type: 'datetime',
      validation: (Rule) => Rule.required().min(Rule.valueOfField('startDateTime')),
    },
    {
      name: 'timezone',
      title: 'Timezone',
      type: 'string',
      description: 'IANA timezone identifier (e.g., America/Toronto)',
      initialValue: 'America/Toronto',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'recurrence',
      title: 'Recurrence Rule',
      type: 'object',
      fields: [
        {
          name: 'enabled',
          title: 'Is Recurring',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'rrule',
          title: 'RRULE',
          type: 'string',
          description: 'RFC 5545 recurrence rule (e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR)',
          hidden: ({ parent }) => !parent?.enabled,
        },
        {
          name: 'exceptions',
          title: 'Exception Dates',
          type: 'array',
          of: [{ type: 'datetime' }],
          hidden: ({ parent }) => !parent?.enabled,
        },
      ],
    },
    {
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        {
          name: 'type',
          title: 'Location Type',
          type: 'string',
          options: {
            list: [
              { title: 'Physical', value: 'physical' },
              { title: 'Online', value: 'online' },
              { title: 'Hybrid', value: 'hybrid' },
            ],
          },
          initialValue: 'physical',
        },
        {
          name: 'name',
          title: 'Venue Name',
          type: 'localeString',
        },
        {
          name: 'address',
          title: 'Address',
          type: 'text',
          hidden: ({ parent }) => parent?.type === 'online',
        },
        {
          name: 'coordinates',
          title: 'Coordinates',
          type: 'geopoint',
          hidden: ({ parent }) => parent?.type === 'online',
        },
        {
          name: 'onlineUrl',
          title: 'Online Meeting URL',
          type: 'url',
          hidden: ({ parent }) => parent?.type === 'physical',
        },
        {
          name: 'mapUrl',
          title: 'Map URL',
          type: 'url',
          hidden: ({ parent }) => parent?.type === 'online',
        },
      ],
    },
    {
      name: 'registration',
      title: 'Registration',
      type: 'object',
      fields: [
        {
          name: 'required',
          title: 'Registration Required',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'url',
          title: 'Registration URL',
          type: 'url',
          hidden: ({ parent }) => !parent?.required,
        },
        {
          name: 'deadline',
          title: 'Registration Deadline',
          type: 'datetime',
          hidden: ({ parent }) => !parent?.required,
        },
        {
          name: 'capacity',
          title: 'Capacity',
          type: 'number',
          hidden: ({ parent }) => !parent?.required,
        },
        {
          name: 'price',
          title: 'Price (CAD)',
          type: 'number',
          hidden: ({ parent }) => !parent?.required,
        },
      ],
    },
    {
      name: 'teams',
      title: 'Participating Teams',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'team' }],
        },
      ],
    },
    {
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'localeString',
        },
      ],
    },
    {
      name: 'documents',
      title: 'Related Documents',
      type: 'array',
      of: [
        {
          type: 'file',
          fields: [
            {
              name: 'title',
              title: 'Document Title',
              type: 'localeString',
            },
            {
              name: 'category',
              title: 'Category',
              type: 'string',
              options: {
                list: [
                  { title: 'Schedule', value: 'schedule' },
                  { title: 'Rules', value: 'rules' },
                  { title: 'Results', value: 'results' },
                  { title: 'Forms', value: 'forms' },
                  { title: 'Other', value: 'other' },
                ],
              },
            },
          ],
        },
      ],
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
      ],
    },
  ],
  preview: {
    select: {
      titleEn: 'title.en',
      titleFr: 'title.fr',
      date: 'startDateTime',
      eventType: 'eventType',
      media: 'featuredImage',
    },
    prepare({ titleEn, titleFr, date, eventType, media }) {
      return {
        title: titleEn || titleFr,
        subtitle: `${eventType} - ${new Date(date).toLocaleDateString()}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Date, Upcoming',
      name: 'dateAsc',
      by: [{ field: 'startDateTime', direction: 'asc' }],
    },
    {
      title: 'Date, Past',
      name: 'dateDesc',
      by: [{ field: 'startDateTime', direction: 'desc' }],
    },
  ],
})
