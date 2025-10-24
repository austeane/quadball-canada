import { defineType, defineField } from 'sanity';
import { FiFileText } from 'react-icons/fi';
import { localeString } from '../helpers/localization';

const categories = [
  { title: 'Rules', value: 'rules' },
  { title: 'General', value: 'general' },
  { title: 'Events', value: 'events' },
  { title: 'Gameplay', value: 'gameplay' },
  { title: 'Team Canada', value: 'team-canada' },
] as const;

export default defineType({
  name: 'policy',
  title: 'Policy',
  type: 'document',
  icon: FiFileText,
  fields: [
    defineField({
      name: 'title',
      title: 'Policy Title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
      description: 'The name of the policy (e.g., "Code of Conduct", "Transfer Policy")',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: categories,
      },
      validation: (Rule) => Rule.required(),
      description: 'The category this policy belongs to',
    }),
    defineField({
      name: 'url',
      title: 'Google Doc URL',
      type: 'url',
      validation: (Rule) => Rule.required().uri({
        allowRelative: false,
        scheme: ['https'],
      }),
      description: 'Link to the Google Doc or external document',
    }),
    defineField({
      name: 'description',
      title: 'Description (Optional)',
      type: 'localeString',
      description: 'Optional brief description of the policy',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order within the category (lower numbers appear first)',
      initialValue: 100,
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Whether this policy is currently active and should be displayed',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title.en',
      titleFr: 'title.fr',
      category: 'category',
      isActive: 'isActive',
    },
    prepare({ title, titleFr, category, isActive }) {
      const categoryLabel = categories.find(c => c.value === category)?.title || category;
      return {
        title: title || titleFr || 'Untitled Policy',
        subtitle: `${categoryLabel}${!isActive ? ' (Inactive)' : ''}`,
        media: FiFileText,
      };
    },
  },
  orderings: [
    {
      title: 'Category, then Order',
      name: 'categoryOrder',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'order', direction: 'asc' },
        { field: 'title.en', direction: 'asc' },
      ],
    },
  ],
});