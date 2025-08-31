import { CollectionConfig } from 'payload';

export const Blocks: CollectionConfig = {
  slug: 'builder-blocks',
  admin: {
    useAsTitle: 'name',
    group: 'Editor',
    description: 'Reusable content blocks/snippets for the visual builder.',
    defaultColumns: ['name', 'category', 'tenant', 'updatedAt'],
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber' || req.user?.role === 'manager',
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true, index: true },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Hero', value: 'hero' },
        { label: 'Features', value: 'features' },
        { label: 'CTA', value: 'cta' },
        { label: 'Gallery', value: 'gallery' },
        { label: 'Testimonial', value: 'testimonial' },
        { label: 'Footer', value: 'footer' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'custom',
      index: true,
    },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants' as any as any, required: true },
    {
      name: 'content',
      type: 'json',
      required: true,
      admin: { description: 'JSON for this block per the builder schema.' },
    },
    { name: 'css', type: 'textarea' },
    { name: 'js', type: 'textarea' },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
  ],
}

