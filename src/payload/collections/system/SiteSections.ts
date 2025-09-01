// src/payload/collections/SiteSections.ts
import type { CollectionConfig } from 'payload'
import { withLexicalEditor } from '../../../payload/utils/withLexicalEditor'

const SiteSections: CollectionConfig = withLexicalEditor({
  slug: 'site-sections',
  labels: {
    singular: 'Site Section',
    plural: 'Site Sections',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'published', 'order', 'updatedAt'],
    group: 'Content',
    description: 'Manage website sections and page components',
  },
  access: {
    read: () => true, // public read
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data.slug && data.name) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 100,
      admin: {
        placeholder: 'Enter section name...',
        description: 'Display name for this section',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier for this section',
        placeholder: 'section-slug',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'hero',
      options: [
        {
          label: 'Hero Section',
          value: 'hero',
        },
        {
          label: 'Features Section',
          value: 'features',
        },
        {
          label: 'Call to Action',
          value: 'cta',
        },
        {
          label: 'About Section',
          value: 'about',
        },
        {
          label: 'Services Section',
          value: 'services',
        },
        {
          label: 'Testimonials',
          value: 'testimonials',
        },
        {
          label: 'Contact Section',
          value: 'contact',
        },
        {
          label: 'Gallery Section',
          value: 'gallery',
        },
      ],
      admin: {
        description: 'Type of section component',
      },
    },
    {
      name: 'content',
      type: 'richText',
      admin: {
        description: 'Main content for this section',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order on the page (lower numbers appear first)',
        step: 1,
      },
    },
    {
      name: 'background',
      type: 'upload',
      relationTo: 'media' as any as any,
      admin: {
        description: 'Background image for this section',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this section is visible on the website',
      },
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'backgroundColor',
          type: 'text',
          admin: {
            placeholder: '#ffffff or transparent',
            description: 'Background color (hex code or CSS value)',
          },
        },
        {
          name: 'textColor',
          type: 'text',
          admin: {
            placeholder: '#000000',
            description: 'Text color (hex code)',
          },
        },
        {
          name: 'padding',
          type: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' },
          ],
          admin: {
            description: 'Section padding size',
          },
        },
        {
          name: 'fullWidth',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Make section full width of the screen',
          },
        },
      ],
      admin: {
        description: 'Visual and layout settings for this section',
      },
    },
  ],
})

export { SiteSections }
