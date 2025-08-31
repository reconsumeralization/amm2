import { CollectionConfig } from 'payload';

const FAQ: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
    description: 'Frequently Asked Questions',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      admin: {
        description: 'The FAQ question',
      },
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
      admin: {
        description: 'The FAQ answer (supports rich text)',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Services', value: 'services' },
        { label: 'Pricing', value: 'pricing' },
        { label: 'Appointments', value: 'appointments' },
        { label: 'Products', value: 'products' },
        { label: 'General', value: 'general' },
      ],
      admin: {
        description: 'FAQ category for organization',
      },
    },
    {
      name: 'order',
      type: 'number',
      admin: {
        description: 'Display order within category',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show this FAQ on the website',
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this FAQ prominently',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
};

export { FAQ };
