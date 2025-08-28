import { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical/dist/index.js';

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    description: 'Community events and workshops',
    group: 'Community',
    defaultColumns: ['title', 'date', 'capacity', 'attendees', 'isActive'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Event title (e.g., "Fade Masterclass")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier',
      },
    },
        // {
    //   name: 'description',
    //   type: 'richText',
    //   editor: () => lexicalEditor({}),
    //   required: true,
    //   admin: {
    //     description: 'Detailed event description',
    //   },
    // },,
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Event date and time',
      },
    },
    {
      name: 'duration',
      type: 'number',
      required: true,
      min: 30,
      max: 480,
      admin: {
        description: 'Duration in minutes',
        step: 15,
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Workshop', value: 'workshop' },
        { label: 'Masterclass', value: 'masterclass' },
        { label: 'Community Event', value: 'community' },
        { label: 'Product Launch', value: 'product' },
        { label: 'Special Event', value: 'special' },
      ],
      admin: {
        description: 'Event category',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Event promotional image',
      },
    },
    {
      name: 'capacity',
      type: 'number',
      required: true,
      min: 1,
      max: 100,
      admin: {
        description: 'Maximum number of attendees',
      },
    },
    {
      name: 'attendees',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Registered attendees',
        readOnly: true,
      },
    },
    {
      name: 'waitlist',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Waitlist attendees',
        readOnly: true,
      },
    },
    {
      name: 'price',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Event price in cents (0 for free events)',
        step: 100,
      },
    },
    {
      name: 'instructor',
      type: 'relationship',
      relationTo: 'stylists',
      admin: {
        description: 'Event instructor/stylist',
      },
    },
    {
      name: 'location',
      type: 'group',
      admin: {
        description: 'Event location details',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'In-Store', value: 'store' },
            { label: 'Online', value: 'online' },
            { label: 'External Venue', value: 'external' },
          ],
          defaultValue: 'store',
        },
        {
          name: 'address',
          type: 'textarea',
          admin: {
            condition: (data) => data.location?.type === 'external',
          },
        },
        {
          name: 'zoomLink',
          type: 'text',
          admin: {
            condition: (data) => data.location?.type === 'online',
          },
        },
      ],
    },
    {
      name: 'loyaltyPoints',
      type: 'number',
      defaultValue: 25,
      min: 0,
      admin: {
        description: 'Loyalty points earned for attending',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Enable/disable this event',
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this event on homepage',
        position: 'sidebar',
      },
    },
    {
      name: 'seo',
      type: 'group',
      admin: {
        description: 'SEO settings for this event',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: {
            description: 'SEO title (50-60 characters)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: {
            description: 'SEO description (150-160 characters)',
          },
        },
        {
          name: 'keywords',
          type: 'array',
          fields: [
            {
              name: 'keyword',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Ensure price is in cents
        if (data.price && data.price < 100) {
          data.price = Math.round(data.price * 100);
        }

        // Generate slug if not provided
        if (!data.slug && data.title) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create' || operation === 'update') {
          console.log(`Event updated: ${doc.title}`);
        }
      },
    ],
  },
  access: {
    read: () => true, // Public read access for frontend
    create: ({ req }) => {
      return req.user?.role === 'admin' || req.user?.role === 'manager';
    },
    update: ({ req }) => {
      return req.user?.role === 'admin' || req.user?.role === 'manager';
    },
    delete: ({ req }) => {
      return req.user?.role === 'admin';
    },
  },
  timestamps: true,
};
