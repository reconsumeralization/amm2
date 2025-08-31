// src/payload/collections/Gallery.ts
import type { CollectionConfig } from 'payload'

const Gallery: CollectionConfig = {
  slug: 'gallery',
  labels: {
    singular: 'Gallery Item',
    plural: 'Gallery',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'featured', 'createdAt'],
    group: 'Content',
    description: 'Manage gallery images and media content',
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
        if (operation === 'create' && !data.slug && data.title) {
          data.slug = data.title
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
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 100,
      admin: {
        placeholder: 'Enter gallery item title...',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug for the gallery item',
        placeholder: 'url-friendly-slug',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Main image for this gallery item',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 500,
      admin: {
        placeholder: 'Describe this image or artwork...',
        description: 'Optional description displayed with the image',
      },
    },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'general',
      options: [
        {
          label: 'General',
          value: 'general',
        },
        {
          label: 'Portfolio',
          value: 'portfolio',
        },
        {
          label: 'Before & After',
          value: 'before-after',
        },
        {
          label: 'Events',
          value: 'events',
        },
        {
          label: 'Team',
          value: 'team',
        },
      ],
      admin: {
        description: 'Categorize this gallery item for better organization',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Add tags to help with searching and filtering',
        placeholder: 'Add a tag...',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this item prominently in gallery displays',
      },
    },
    {
      name: 'altText',
      type: 'text',
      admin: {
        description: 'Alternative text for accessibility (auto-generated if empty)',
        placeholder: 'Describe the image for screen readers...',
      },
    },
    {
      name: 'photographer',
      type: 'text',
      admin: {
        description: 'Credit the photographer or artist',
        placeholder: 'Photographer name...',
      },
    },
    {
      name: 'dateTaken',
      type: 'date',
      admin: {
        description: 'When was this photo taken?',
      },
    },
  ],
}

export { Gallery }
