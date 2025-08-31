// src/payload/collections/system/EmailLogs.ts
import type { CollectionConfig } from 'payload'

export const EmailLogs: CollectionConfig = {
  slug: 'email-logs',
  admin: {
    useAsTitle: 'subject',
    group: 'System',
    description: 'Logs of sent emails for tracking and debugging.',
    defaultColumns: ['to', 'subject', 'template', 'status', 'sentAt'],
    listSearchableFields: ['to', 'subject', 'template'],
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: () => false, // Only allow server-side creation
    update: () => false,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'to',
      type: 'text',
      required: true,
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'template',
      type: 'text',
      required: true,
    },
    {
      name: 'data',
      type: 'json',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
    },
    {
      name: 'messageId',
      type: 'text',
    },
    {
      name: 'sentAt',
      type: 'date',
      required: true,
    },
    {
      name: 'status',
      type: 'text',
      required: true,
    },
  ],
  timestamps: true,
}
