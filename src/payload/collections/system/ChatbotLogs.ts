// src/payload/collections/system/ChatbotLogs.ts
import type { CollectionConfig } from 'payload'

export const ChatbotLogs: CollectionConfig = {
  slug: 'chatbot-logs',
  admin: {
    useAsTitle: 'message',
    group: 'System',
    description: 'Logs of chatbot conversations for analytics and debugging.',
    defaultColumns: ['message', 'user', 'tenant', 'step', 'createdAt'],
    listSearchableFields: ['message', 'user', 'tenant', 'step'],
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: () => false, // Only allow server-side creation
    update: () => false,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users' as any as any,
      required: true,
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'step',
      type: 'text',
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
    },
  ],
  timestamps: true,
}
