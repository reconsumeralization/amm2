// src/payload/collections/Integrations.ts
import type { CollectionConfig, AccessResult } from 'payload'

export const Integrations: CollectionConfig = {
  slug: 'integrations',
  admin: {
    useAsTitle: 'name',
    group: 'Admin',
    description: 'Manage external service integrations and API connections',
    defaultColumns: ['name', 'provider', 'enabled', 'lastSync', 'updatedAt'],
    listSearchableFields: ['name', 'provider', 'externalId'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager'].includes(req.user.role)
    },
    create: ({ req }): AccessResult => {
      if (!req.user) return false
      return req.user.role === 'admin'
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false
      return req.user.role === 'admin'
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false
      return req.user.role === 'admin'
    },
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user && req.user.role !== 'admin') {
          data.tenant = req.user.tenant?.id
        }

        // Validate external ID format for known providers
        if (data.provider && data.externalId) {
          const validations: { [key: string]: (id: string) => boolean } = {
            stripe: (id: string) => id.startsWith('acct_') || id.startsWith('cus_') || id.startsWith('sub_'),
            paypal: (id: string) => id.includes('@') || id.startsWith('PAYPAL_'),
            twilio: (id: string) => id.startsWith('AC') || id.startsWith('PN'),
            sendgrid: (id: string) => id.length === 32,
            mailgun: (id: string) => id.includes('@'),
            google_analytics: (id: string) => id.startsWith('GA') || id.startsWith('G-'),
            facebook_pixel: (id: string) => /^\d+$/.test(id),
          }

          const validator = validations[data.provider as keyof typeof validations]
          if (validator && !validator(data.externalId)) {
            throw new Error(`Invalid ${data.provider} ID format`)
          }
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`New integration created: ${doc.name} (${doc.provider})`)
        }

        if (operation === 'update') {
          if (doc.enabled !== doc.previous?.enabled) {
            const status = doc.enabled ? 'enabled' : 'disabled'
            console.log(`Integration ${doc.name} ${status}`)
          }
        }

        // TODO: Trigger integration sync when enabled
        if (doc.enabled && operation === 'update' && !doc.previous?.enabled) {
          console.log(`Starting sync for integration: ${doc.name}`)
          // TODO: Implement integration sync logic
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Display name for this integration',
        placeholder: 'My Integration',
      },
      validate: (value: any) => {
        if (!value) return 'Integration name is required'
        if (value.length < 2) return 'Integration name too short'
        if (value.length > 100) return 'Integration name too long'
        return true
      },
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'Twilio', value: 'twilio' },
        { label: 'SendGrid', value: 'sendgrid' },
        { label: 'Mailgun', value: 'mailgun' },
        { label: 'Google Analytics', value: 'google_analytics' },
        { label: 'Facebook Pixel', value: 'facebook_pixel' },
        { label: 'Google Tag Manager', value: 'google_tag_manager' },
        { label: 'Slack', value: 'slack' },
        { label: 'Zapier', value: 'zapier' },
        { label: 'Webhook', value: 'webhook' },
        { label: 'API', value: 'api' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Integration provider/service',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Payment', value: 'payment' },
        { label: 'Communication', value: 'communication' },
        { label: 'Email', value: 'email' },
        { label: 'Analytics', value: 'analytics' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Automation', value: 'automation' },
        { label: 'Storage', value: 'storage' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'other',
      admin: {
        description: 'Category of integration',
      },
    },
    {
      name: 'externalId',
      type: 'text',
      index: true,
      admin: {
        description: 'External service ID or account identifier',
        placeholder: 'acct_123456789 or email@example.com',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Enable this integration',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: {
        description: 'Tenant this integration belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'configuration',
      type: 'json',
      admin: {
        description: 'Additional configuration data for this integration',
      },
    },
    {
      name: 'webhookUrl',
      type: 'text',
      admin: {
        description: 'Webhook URL for receiving updates from this service',
      },
      validate: (value: any) => {
        if (value && typeof value === 'string') {
          try {
            new URL(value)
            return true
          } catch {
            return 'Please enter a valid URL'
          }
        }
        return true
      },
    },
    {
      name: 'lastSync',
      type: 'date',
      admin: {
        description: 'Last time data was synced with this integration',
        readOnly: true,
      },
    },
    {
      name: 'syncStatus',
      type: 'select',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Failed', value: 'failed' },
        { label: 'Pending', value: 'pending' },
        { label: 'Disabled', value: 'disabled' },
      ],
      defaultValue: 'disabled',
      admin: {
        description: 'Status of the last sync operation',
        readOnly: true,
      },
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      admin: {
        description: 'Error message from the last sync attempt',
        readOnly: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      maxLength: 500,
      admin: {
        description: 'Additional notes about this integration',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who created this integration',
        readOnly: true,
      },
    },
    {
      name: 'tags',
      type: 'array',
      maxRows: 5,
      admin: {
        description: 'Tags for organizing integrations',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          maxLength: 30,
        },
      ],
    },
  ],
  timestamps: true,
  indexes: [
    { fields: ['provider', 'enabled'] },
    { fields: ['tenant', 'enabled'] },
    { fields: ['category', 'enabled'] },
    { fields: ['syncStatus'] },
  ],
}
