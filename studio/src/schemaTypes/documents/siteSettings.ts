import {defineArrayMember, defineField, defineType} from 'sanity'
import {FiSettings} from 'react-icons/fi'
import {imageWithAlt} from '../helpers/fields'

const menuLink = (name: string, title: string) =>
  defineArrayMember({
    type: 'object',
    name,
    title,
    fields: [
      defineField({
        name: 'label',
        title: 'Label',
        type: 'localeString',
        validation: (Rule) => Rule.required(),
      }),
      defineField({
        name: 'link',
        title: 'Link',
        type: 'localeUrl',
        validation: (Rule) => Rule.required(),
      }),
    ],
    preview: {select: {title: 'label.en', subtitle: 'link.en'}},
  })

export const socialPlatforms = [
  {title: 'Instagram', value: 'instagram'},
  {title: 'TikTok', value: 'tiktok'},
  {title: 'YouTube', value: 'youtube'},
  {title: 'Facebook', value: 'facebook'},
  {title: 'Discord', value: 'discord'},
  {title: 'X (Twitter)', value: 'x'},
  {title: 'LinkedIn', value: 'linkedin'},
]

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: FiSettings,
  groups: [
    {name: 'menu', title: 'Menu', default: true},
    {name: 'footer', title: 'Footer'},
    {name: 'social', title: 'Social media'},
    {name: 'general', title: 'General'},
  ],
  fields: [
    defineField({
      name: 'navigation',
      title: 'Main menu',
      type: 'array',
      group: 'menu',
      description:
        'Top-level menu items, in order. Add sub-items to make a dropdown. Links starting with https:// open in a new tab.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'menuItem',
          title: 'Menu item',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'localeString',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'localeUrl',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'children',
              title: 'Dropdown items',
              type: 'array',
              of: [menuLink('menuSubItem', 'Dropdown item')],
            }),
          ],
          preview: {
            select: {title: 'label.en', children: 'children'},
            prepare: ({title, children}) => ({
              title,
              subtitle: children?.length ? `${children.length} dropdown items` : undefined,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'storeUrl',
      title: 'Store link',
      type: 'url',
      group: 'menu',
      description: 'Where the Store button in the header goes.',
    }),
    defineField({
      name: 'donateUrl',
      title: 'Donate link',
      type: 'url',
      group: 'menu',
      description: 'Where the Donate buttons in the header and on the home page go.',
    }),
    defineField({
      name: 'footerColumns',
      title: 'Footer link columns',
      type: 'array',
      group: 'footer',
      description: 'The social media column is added automatically after these.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerColumn',
          fields: [
            defineField({
              name: 'title',
              title: 'Column heading',
              type: 'localeString',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [menuLink('footerLink', 'Link')],
            }),
          ],
          preview: {select: {title: 'title.en'}},
        }),
      ],
    }),
    defineField({
      name: 'charityNumber',
      title: 'Charitable registration number',
      type: 'string',
      group: 'footer',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social media links',
      type: 'array',
      group: 'social',
      description: 'Shown in the top bar, the footer and on the Contact page.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {list: socialPlatforms},
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {select: {title: 'platform', subtitle: 'url'}},
        }),
      ],
    }),
    defineField({
      name: 'siteDescription',
      title: 'Default search description',
      type: 'localeText',
      group: 'general',
      description: 'Used in search results for pages that don’t have their own description.',
    }),
    defineField({
      ...imageWithAlt(
        'defaultHeroImage',
        'Default banner image',
        'Used on any page whose own banner image is empty.',
      ),
      group: 'general',
    }),
  ],
  preview: {prepare: () => ({title: 'Site Settings'})},
})
