import {defineType} from 'sanity'

export default defineType({
  name: 'eventBidsPage',
  title: 'Event Bids Page',
  type: 'document',
  fields: [
    {
      name: 'domesticHosts',
      title: 'Selected Hosts — Domestic',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'eventName',
              title: 'Event Name',
              type: 'localeString',
            },
            {
              name: 'hostCity',
              title: 'Host City',
              type: 'string',
            },
            {
              name: 'dateLabel',
              title: 'Date Label',
              type: 'localeString',
              description: 'e.g. "June 2026" or "Summer 2026"',
            },
            {
              name: 'eventUrl',
              title: 'Event URL',
              type: 'url',
              description: 'Optional link to the event page',
            },
          ],
          preview: {
            select: {
              title: 'eventName.en',
              subtitle: 'hostCity',
            },
          },
        },
      ],
    },
    {
      name: 'internationalHosts',
      title: 'Selected Hosts — International',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'eventName',
              title: 'Event Name',
              type: 'localeString',
            },
            {
              name: 'hostCity',
              title: 'Host City',
              type: 'string',
            },
            {
              name: 'dateLabel',
              title: 'Date Label',
              type: 'localeString',
              description: 'e.g. "July 2026" or "TBD"',
            },
            {
              name: 'description',
              title: 'Description',
              type: 'localeText',
              description: 'Optional extra context about this international event',
            },
            {
              name: 'eventUrl',
              title: 'Event URL',
              type: 'url',
              description: 'Optional link to the event page',
            },
          ],
          preview: {
            select: {
              title: 'eventName.en',
              subtitle: 'hostCity',
            },
          },
        },
      ],
    },
    {
      name: 'currentBids',
      title: 'Current Bid Cycle',
      type: 'object',
      fields: [
        {
          name: 'status',
          title: 'Status',
          type: 'string',
          options: {
            list: [
              {title: 'Open', value: 'open'},
              {title: 'Closed', value: 'closed'},
              {title: 'Coming Soon', value: 'coming-soon'},
            ],
          },
          initialValue: 'closed',
        },
        {
          name: 'statusMessage',
          title: 'Status Message',
          type: 'localeString',
          description: 'e.g. "Bids are now open for the 2026–27 season"',
        },
        {
          name: 'bidManualFile',
          title: 'Bid Manual (PDF)',
          type: 'file',
          options: {
            accept: '.pdf',
          },
        },
        {
          name: 'bidManualTitle',
          title: 'Bid Manual Link Title',
          type: 'localeString',
          description: 'e.g. "Download the Bid Manual"',
        },
        {
          name: 'submissionUrl',
          title: 'Submission URL',
          type: 'url',
          description: 'Link to the bid submission form',
        },
        {
          name: 'deadline',
          title: 'Submission Deadline',
          type: 'date',
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
        {
          name: 'ogImage',
          title: 'Open Graph Image',
          type: 'image',
          options: {hotspot: true},
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Event Bids Page',
      }
    },
  },
})
