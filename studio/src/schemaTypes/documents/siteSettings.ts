import {defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'siteName',
      title: 'Site Name',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'siteDescription',
      title: 'Site Description',
      type: 'localeText',
      description: 'Default meta description',
    },
    {
      name: 'siteUrl',
      title: 'Site URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'defaultOgImage',
      title: 'Default Open Graph Image',
      type: 'image',
      description: 'Default image for social media sharing',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'Site logo',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Site favicon (32x32 or 16x16)',
    },
    {
      name: 'navigation',
      title: 'Main Navigation',
      type: 'object',
      fields: [
        {
          name: 'items',
          title: 'Navigation Items',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'label',
                  title: 'Label',
                  type: 'localeString',
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: 'url',
                  title: 'URL',
                  type: 'string',
                  description: 'Internal path or external URL',
                },
                {
                  name: 'targetBlank',
                  title: 'Open in new tab',
                  type: 'boolean',
                  initialValue: false,
                },
                {
                  name: 'children',
                  title: 'Submenu Items',
                  type: 'array',
                  of: [
                    {
                      type: 'object',
                      fields: [
                        {
                          name: 'label',
                          title: 'Label',
                          type: 'localeString',
                          validation: (Rule) => Rule.required(),
                        },
                        {
                          name: 'url',
                          title: 'URL',
                          type: 'string',
                          validation: (Rule) => Rule.required(),
                        },
                        {
                          name: 'targetBlank',
                          title: 'Open in new tab',
                          type: 'boolean',
                          initialValue: false,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'footer',
      title: 'Footer Settings',
      type: 'object',
      fields: [
        {
          name: 'copyrightText',
          title: 'Copyright Text',
          type: 'localeString',
        },
        {
          name: 'columns',
          title: 'Footer Columns',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'title',
                  title: 'Column Title',
                  type: 'localeString',
                },
                {
                  name: 'links',
                  title: 'Links',
                  type: 'array',
                  of: [
                    {
                      type: 'object',
                      fields: [
                        {
                          name: 'label',
                          title: 'Label',
                          type: 'localeString',
                        },
                        {
                          name: 'url',
                          title: 'URL',
                          type: 'string',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'socialMedia',
      title: 'Social Media Links',
      type: 'object',
      fields: [
        {
          name: 'facebook',
          title: 'Facebook',
          type: 'url',
        },
        {
          name: 'instagram',
          title: 'Instagram',
          type: 'url',
        },
        {
          name: 'twitter',
          title: 'Twitter/X',
          type: 'url',
        },
        {
          name: 'youtube',
          title: 'YouTube',
          type: 'url',
        },
        {
          name: 'tiktok',
          title: 'TikTok',
          type: 'url',
        },
        {
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
        },
      ],
    },
    {
      name: 'contact',
      title: 'Contact Information',
      type: 'object',
      fields: [
        {
          name: 'email',
          title: 'Contact Email',
          type: 'email',
        },
        {
          name: 'phone',
          title: 'Phone Number',
          type: 'string',
        },
        {
          name: 'address',
          title: 'Address',
          type: 'text',
        },
      ],
    },
    {
      name: 'analytics',
      title: 'Analytics',
      type: 'object',
      fields: [
        {
          name: 'googleAnalyticsId',
          title: 'Google Analytics ID',
          type: 'string',
          description: 'GA4 Measurement ID (e.g., G-XXXXXXXXXX)',
        },
        {
          name: 'googleTagManagerId',
          title: 'Google Tag Manager ID',
          type: 'string',
          description: 'GTM Container ID (e.g., GTM-XXXXXX)',
        },
      ],
    },
    {
      name: 'cookieConsent',
      title: 'Cookie Consent Settings',
      type: 'object',
      fields: [
        {
          name: 'enabled',
          title: 'Enable Cookie Consent',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'message',
          title: 'Consent Message',
          type: 'localeText',
        },
        {
          name: 'privacyPolicyUrl',
          title: 'Privacy Policy URL',
          type: 'string',
        },
      ],
    },
    {
      name: 'announcement',
      title: 'Announcement Banner',
      type: 'object',
      fields: [
        {
          name: 'enabled',
          title: 'Show Announcement',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'message',
          title: 'Announcement Message',
          type: 'localeString',
        },
        {
          name: 'link',
          title: 'Link',
          type: 'object',
          fields: [
            {
              name: 'text',
              title: 'Link Text',
              type: 'localeString',
            },
            {
              name: 'url',
              title: 'URL',
              type: 'string',
            },
          ],
        },
        {
          name: 'dismissible',
          title: 'Can be dismissed',
          type: 'boolean',
          initialValue: true,
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      }
    },
  },
})