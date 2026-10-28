import {defineField} from 'sanity'

// An image with a focal point and English/French alt text.
export function imageWithAlt(name: string, title: string, description?: string) {
  return defineField({
    name,
    title,
    type: 'image',
    description,
    options: {hotspot: true},
    fields: [
      defineField({
        name: 'alt',
        title: 'Alt text',
        type: 'localeString',
        description: 'Describe the image for people using screen readers.',
      }),
    ],
  })
}

// Page title, subtitle and banner image shown at the top of most pages.
export const heroFields = [
  defineField({
    name: 'title',
    title: 'Page title',
    type: 'localeString',
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'subtitle',
    title: 'Subtitle',
    type: 'localeText',
    description: 'Short line shown under the title on the banner.',
  }),
  defineField({
    ...imageWithAlt('heroImage', 'Banner image', 'Leave empty to use the default banner from Site Settings.'),
    // Upcoming Events has a plain text header with no banner
    hidden: ({document}) => Boolean(document?._id?.endsWith('page-upcomingEvents')),
  }),
]

export const seoField = defineField({
  name: 'seo',
  title: 'Search & sharing',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Browser tab / search title',
      type: 'localeString',
      description: 'Defaults to "<page title> — Quadball Canada".',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Search description',
      type: 'localeText',
      description: 'One or two sentences shown in search results and link previews.',
    }),
  ],
})
