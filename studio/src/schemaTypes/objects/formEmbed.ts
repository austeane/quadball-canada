import {defineType} from 'sanity'

export default defineType({
  name: 'formEmbed',
  title: 'Form Embed',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'For internal reference only',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'formType',
      title: 'Form Type',
      type: 'string',
      options: {
        list: [
          { title: 'Newsletter Signup', value: 'newsletter' },
          { title: 'Contact Form', value: 'contact' },
          { title: 'Registration', value: 'registration' },
          { title: 'Survey', value: 'survey' },
          { title: 'Custom Embed', value: 'custom' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'heading',
      title: 'Form Heading',
      type: 'localeString',
    },
    {
      name: 'description',
      title: 'Form Description',
      type: 'localeText',
    },
    {
      name: 'provider',
      title: 'Provider',
      type: 'string',
      options: {
        list: [
          { title: 'Mailchimp', value: 'mailchimp' },
          { title: 'SendGrid', value: 'sendgrid' },
          { title: 'Google Forms', value: 'google' },
          { title: 'Typeform', value: 'typeform' },
          { title: 'Custom HTML', value: 'custom' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'embedCode',
      title: 'Embed Code',
      type: 'text',
      description: 'HTML embed code or form ID',
      hidden: ({ parent }) => parent?.provider !== 'custom',
    },
    {
      name: 'formId',
      title: 'Form ID',
      type: 'string',
      description: 'Form or list ID from the provider',
      hidden: ({ parent }) => parent?.provider === 'custom',
    },
    {
      name: 'apiEndpoint',
      title: 'API Endpoint',
      type: 'url',
      description: 'Form submission endpoint',
      hidden: ({ parent }) => parent?.provider === 'custom',
    },
    {
      name: 'successMessage',
      title: 'Success Message',
      type: 'localeText',
      description: 'Message shown after successful submission',
    },
    {
      name: 'privacyNotice',
      title: 'Privacy Notice',
      type: 'localePortableText',
      description: 'Privacy policy text shown with the form',
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Tags to segment subscribers (for newsletter forms)',
      hidden: ({ parent }) => parent?.formType !== 'newsletter',
    },
  ],
  preview: {
    select: {
      title: 'title',
      formType: 'formType',
      provider: 'provider',
    },
    prepare({ title, formType, provider }) {
      return {
        title,
        subtitle: `${formType} - ${provider}`,
      }
    },
  },
})