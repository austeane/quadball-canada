import {defineType} from 'sanity'

export default defineType({
  name: 'eventHub',
  title: 'Event Hub',
  type: 'document',
  fields: [
    {
      name: 'event',
      title: 'Event',
      type: 'reference',
      to: [{type: 'event'}],
      description: 'The event this hub page is for. Inherits dates, location, registration, teams, documents, and featured image.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'localeSlug',
      description: 'URL slug for this hub page (independent of the event slug)',
    },
    {
      name: 'title',
      title: 'Hero Title',
      type: 'localeString',
      description: 'Large H1 on the hero (e.g. "National Championship 2026")',
    },
    {
      name: 'heroLabel',
      title: 'Hero Label',
      type: 'localeString',
      description: 'Small monospace label above the title (e.g. "Quadball Canada Presents")',
    },
    {
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'localeString',
      description: 'Serif subtitle below the title (e.g. "March 14-15, 2026 - Oshawa, Ontario")',
    },
    {
      name: 'heroCtaPrimary',
      title: 'Hero Primary CTA',
      type: 'object',
      fields: [
        {name: 'label', title: 'Label', type: 'localeString'},
        {name: 'href', title: 'URL', type: 'string'},
      ],
    },
    {
      name: 'heroCtaSecondary',
      title: 'Hero Secondary CTA',
      type: 'object',
      fields: [
        {name: 'label', title: 'Label', type: 'localeString'},
        {name: 'href', title: 'URL', type: 'string'},
      ],
    },
    {
      name: 'aboutContent',
      title: 'About Content',
      type: 'localePortableText',
      description: 'Rich text for the "About the Tournament" section',
    },
    {
      name: 'formatBadges',
      title: 'Format Badges',
      type: 'array',
      of: [{type: 'localeString'}],
      description: 'Format pills (e.g. "Pool Play + Bracket", "Full Contact")',
    },
    {
      name: 'registrationNote',
      title: 'Registration Note',
      type: 'localeText',
      description: 'Additional note for the registration section',
    },
    {
      name: 'registrationIncludes',
      title: 'Registration Includes',
      type: 'array',
      of: [{type: 'localeString'}],
      description: 'List of what registration includes (e.g. "Tournament entry", "Referee fees")',
    },
    {
      name: 'quickLinks',
      title: 'Quick Links',
      type: 'array',
      description: 'External links displayed in the About section (e.g. info package, registration portal)',
      of: [
        {
          type: 'object',
          name: 'quickLink',
          fields: [
            {name: 'label', title: 'Label', type: 'localeString'},
            {name: 'url', title: 'URL', type: 'url'},
          ],
          preview: {
            select: {title: 'label.en', subtitle: 'url'},
          },
        },
      ],
    },
    {
      name: 'schedulePublished',
      title: 'Schedule Published',
      type: 'boolean',
      description: 'When off, the schedule section shows a "check back later" placeholder instead of the schedule details.',
      initialValue: false,
    },
    {
      name: 'schedule',
      title: 'Schedule',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'scheduleDay',
          title: 'Schedule Day',
          fields: [
            {name: 'dayLabel', title: 'Day Label', type: 'localeString', description: 'e.g. "Day 1 -- Pool Play"'},
            {name: 'daySubtitle', title: 'Day Subtitle', type: 'localeString', description: 'e.g. "Saturday, March 14"'},
            {name: 'date', title: 'Date', type: 'date'},
            {
              name: 'items',
              title: 'Schedule Items',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'scheduleItem',
                  title: 'Schedule Item',
                  fields: [
                    {name: 'time', title: 'Time', type: 'string', description: 'e.g. "9:00 AM"'},
                    {name: 'label', title: 'Label', type: 'localeString'},
                    {name: 'description', title: 'Description', type: 'localeString'},
                    {name: 'highlight', title: 'Highlight', type: 'boolean', initialValue: false},
                  ],
                  preview: {
                    select: {title: 'label.en', subtitle: 'time'},
                  },
                },
              ],
            },
          ],
          preview: {
            select: {title: 'dayLabel.en', subtitle: 'daySubtitle.en'},
          },
        },
      ],
    },
    {
      name: 'venue',
      title: 'Venue & Travel',
      type: 'object',
      fields: [
        {name: 'travelInfo', title: 'Getting There', type: 'localePortableText'},
        {name: 'hotels', title: 'Nearby Hotels', type: 'localePortableText'},
        {name: 'mapUrl', title: 'Map Embed URL', type: 'url'},
        {name: 'directionsUrl', title: 'Directions URL', type: 'url'},
      ],
    },
    {
      name: 'howToWatch',
      title: 'How to Watch',
      type: 'object',
      fields: [
        {name: 'description', title: 'Description', type: 'localeText'},
        {
          name: 'channels',
          title: 'Channels',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'watchChannel',
              fields: [
                {name: 'name', title: 'Name', type: 'string'},
                {name: 'url', title: 'URL', type: 'url'},
                {
                  name: 'platform',
                  title: 'Platform',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'YouTube', value: 'youtube'},
                      {title: 'Twitch', value: 'twitch'},
                      {title: 'Twitter / X', value: 'twitter'},
                      {title: 'Instagram', value: 'instagram'},
                      {title: 'Facebook', value: 'facebook'},
                      {title: 'TikTok', value: 'tiktok'},
                      {title: 'Other', value: 'other'},
                    ],
                  },
                },
              ],
              preview: {
                select: {title: 'name', subtitle: 'platform'},
              },
            },
          ],
        },
      ],
    },
    {
      name: 'sponsors',
      title: 'Sponsors',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'sponsor',
          fields: [
            {name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required()},
            {name: 'logo', title: 'Logo', type: 'image'},
            {name: 'url', title: 'Website', type: 'url'},
            {
              name: 'tier',
              title: 'Tier',
              type: 'string',
              options: {
                list: [
                  {title: 'Title', value: 'title'},
                  {title: 'Gold', value: 'gold'},
                  {title: 'Silver', value: 'silver'},
                  {title: 'Bronze', value: 'bronze'},
                  {title: 'Community', value: 'community'},
                ],
              },
            },
          ],
          preview: {
            select: {title: 'name', subtitle: 'tier', media: 'logo'},
          },
        },
      ],
    },
    {
      name: 'contactEmails',
      title: 'Contact Emails',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'contactEmail',
          fields: [
            {name: 'label', title: 'Label', type: 'localeString'},
            {name: 'email', title: 'Email', type: 'string'},
          ],
          preview: {
            select: {title: 'label.en', subtitle: 'email'},
          },
        },
      ],
    },
    {
      name: 'admissionNote',
      title: 'Admission Note',
      type: 'localeString',
      description: 'Quick facts admission value (e.g. "Free")',
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {name: 'metaTitle', title: 'Meta Title', type: 'localeString'},
        {name: 'metaDescription', title: 'Meta Description', type: 'localeText'},
        {
          name: 'ogImage',
          title: 'Open Graph Image',
          type: 'image',
          fields: [
            {name: 'alt', title: 'Alt Text', type: 'localeString'},
          ],
        },
      ],
    },
  ],
  preview: {
    select: {
      titleEn: 'title.en',
      titleFr: 'title.fr',
      eventTitle: 'event.title.en',
      media: 'event.featuredImage',
    },
    prepare({titleEn, titleFr, eventTitle, media}) {
      return {
        title: titleEn || titleFr || 'Untitled Hub',
        subtitle: eventTitle ? `Hub for: ${eventTitle}` : 'No event linked',
        media,
      }
    },
  },
})
