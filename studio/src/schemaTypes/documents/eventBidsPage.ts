import {defineArrayMember, defineField, defineType} from 'sanity'
import {FiAward} from 'react-icons/fi'
import {heroFields, imageWithAlt, seoField} from '../helpers/fields'

const paragraphsHint = 'Leave a blank line between paragraphs.'

export default defineType({
  name: 'eventBidsPage',
  title: 'Event Bids Page',
  type: 'document',
  icon: FiAward,
  groups: [
    {name: 'intro', title: 'Banner & intro', default: true},
    {name: 'application', title: 'Application'},
    {name: 'cycle', title: 'Current bid cycle'},
    {name: 'selection', title: 'Selection'},
    {name: 'hosts', title: 'Selected hosts'},
    {name: 'getInvolved', title: 'Get involved'},
  ],
  fields: [
    ...heroFields.map((field) => ({...field, group: 'intro'})),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'object',
      group: 'intro',
      fields: [
        defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
        defineField({name: 'body', title: 'Text', type: 'localeText', description: paragraphsHint}),
      ],
    }),
    {
      ...imageWithAlt('introImage', 'Intro image', 'Photo shown beside the intro.'),
      group: 'intro',
    },
    defineField({
      name: 'application',
      title: 'Application process',
      type: 'object',
      group: 'application',
      fields: [
        defineField({name: 'label', title: 'Section label', type: 'localeString'}),
        defineField({name: 'howToBidHeading', title: '"How to bid" heading', type: 'localeString'}),
        defineField({name: 'howToBidBody', title: '"How to bid" text', type: 'localeText', description: paragraphsHint}),
        defineField({name: 'whoCanBidHeading', title: '"Who can bid" heading', type: 'localeString'}),
        defineField({
          name: 'whoCanBid',
          title: 'Who can bid',
          type: 'array',
          of: [defineArrayMember({type: 'localeString'})],
        }),
      ],
    }),
    defineField({
      name: 'steps',
      title: 'Submission steps',
      type: 'object',
      group: 'application',
      fields: [
        defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
        defineField({
          name: 'items',
          title: 'Steps',
          type: 'array',
          description: 'Shown as a numbered timeline, in this order.',
          of: [defineArrayMember({type: 'localeText'})],
        }),
      ],
    }),
    defineField({
      name: 'selection',
      title: 'Selection process',
      type: 'object',
      group: 'selection',
      fields: [
        defineField({name: 'label', title: 'Section label', type: 'localeString'}),
        defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
        defineField({name: 'body', title: 'Text', type: 'localeText', description: paragraphsHint}),
      ],
    }),
    {
      ...imageWithAlt('selectionImage', 'Selection image', 'Photo shown beside the selection process.'),
      group: 'selection',
    },
    defineField({
      name: 'getInvolved',
      title: 'Get involved',
      type: 'object',
      group: 'getInvolved',
      fields: [
        defineField({name: 'label', title: 'Section label', type: 'localeString'}),
        defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
        defineField({name: 'body', title: 'Text', type: 'localeText', description: paragraphsHint}),
        defineField({name: 'contactPrompt', title: 'Contact line', type: 'localeString'}),
        defineField({
          name: 'contactEmails',
          title: 'Contact emails',
          type: 'array',
          of: [defineArrayMember({type: 'email'})],
        }),
      ],
    }),
    {
      ...imageWithAlt('getInvolvedImage', 'Get involved image', 'Photo shown beside the get involved section.'),
      group: 'getInvolved',
    },
    defineField({
      name: 'crossLink',
      title: 'Grassroots events box',
      type: 'callToAction',
      group: 'getInvolved',
      description: 'The box at the bottom pointing to Host an Event.',
    }),
    {
      name: 'domesticHosts',
      title: 'Selected Hosts — Domestic',
      type: 'array',
      group: 'hosts',
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
      group: 'hosts',
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
      group: 'cycle',
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
    {...seoField, group: 'intro'},
  ],
  preview: {
    prepare() {
      return {
        title: 'Event Bids Page',
      }
    },
  },
})
