// src/payload/collections/crm/CustomerTags.ts
import type { CollectionConfig } from 'payload'

export const CustomerTags: CollectionConfig = {
  slug: 'customer-tags',
  admin: {
    useAsTitle: 'name',
    group: 'CRM',
    description: 'Tags for segmenting and organizing customers.',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
