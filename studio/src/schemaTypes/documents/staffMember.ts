import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'staffMember',
  title: 'Staff Member',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'memberType',
      title: 'Staff Type',
      type: 'string',
      options: {
        list: [
          { title: 'Director', value: 'director' },
          { title: 'Coordinator', value: 'coordinator' },
        ],
        layout: 'radio',
      },
      initialValue: 'director',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role / Title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'localeText',
      description: 'Required for directors. Optional for coordinators.',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const memberType = (context.document as { memberType?: string } | undefined)?.memberType
          if (memberType === 'director' && !value) {
            return 'Directors must include a bio.'
          }
          return true
        }),
    }),
    defineField({
      name: 'headshot',
      title: 'Headshot',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'localeString',
        }),
      ],
    }),
    defineField({
      name: 'reportsTo',
      title: 'Reports To',
      type: 'reference',
      to: [{ type: 'staffMember' }],
      options: {
        filter: 'memberType == "director"',
      },
      hidden: ({ document }) => document?.memberType === 'director',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const memberType = (context.document as { memberType?: string } | undefined)?.memberType
          if (memberType === 'coordinator' && !value) {
            return 'Coordinators must specify the director they report to.'
          }
          if (memberType === 'director' && value) {
            return 'Directors should not have a "Reports To" value.'
          }
          return true
        }),
    }),
    defineField({
      name: 'orderRank',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first.',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      roleEn: 'role.en',
      roleFr: 'role.fr',
      media: 'headshot',
      memberType: 'memberType',
    },
    prepare({ title, roleEn, roleFr, media, memberType }) {
      return {
        title,
        subtitle: `${memberType === 'coordinator' ? 'Coordinator' : 'Director'} - ${roleEn || roleFr || ''}`.trim().replace(/\s-\s$/, ''),
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Display order',
      name: 'displayOrderAsc',
      by: [
        { field: 'orderRank', direction: 'asc' },
        { field: 'name', direction: 'asc' },
      ],
    },
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
})
