// src/payload/collections/BuilderIntegrations.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const Integrations: CollectionConfig = withDefaultHooks({
  slug: 'builder-integrations',
  admin: {
    useAsTitle: 'name',
    group: 'Visual Builder',
    description: 'API connections for blocks (maps, forms, feeds) - example: pull Shopify products or Google Maps data',
    defaultColumns: ['name', 'provider', 'type', 'isActive', 'lastSyncedAt'],
    listSearchableFields: ['name', 'description', 'provider'],
  },
  access: {
    read: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true;
      return { createdBy: { equals: req.user.id } };
    },
    create: ({ req }: any) => {
      if (!req.user) return false;
      return ['admin', 'manager'].includes((req.user as any)?.role);
    },
    update: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true;
      return { createdBy: { equals: req.user.id } };
    },
    delete: ({ req }: any) => {
      if (!req.user) return false;
      return (req.user as any)?.role === 'admin';
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Integration name for admin reference',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what this integration does',
        rows: 2,
      },
    },
    {
      name: 'provider',
      type: 'select',
      options: [
        { label: 'Google Maps', value: 'google-maps' },
        { label: 'Google Analytics', value: 'google-analytics' },
        { label: 'Shopify', value: 'shopify' },
        { label: 'Mailchimp', value: 'mailchimp' },
        { label: 'Stripe', value: 'stripe' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'YouTube', value: 'youtube' },
        { label: 'Vimeo', value: 'vimeo' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'Twitter/X', value: 'twitter' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Weather API', value: 'weather' },
        { label: 'Stock API', value: 'stock' },
        { label: 'Custom API', value: 'custom' },
        { label: 'Webhook', value: 'webhook' },
        { label: 'RSS Feed', value: 'rss' },
        { label: 'Database', value: 'database' },
      ],
      required: true,
      admin: {
        description: 'Third-party service or API provider',
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Maps', value: 'maps' },
        { label: 'Forms', value: 'forms' },
        { label: 'Feeds', value: 'feeds' },
        { label: 'Analytics', value: 'analytics' },
        { label: 'Social Media', value: 'social' },
        { label: 'E-commerce', value: 'ecommerce' },
        { label: 'Payment', value: 'payment' },
        { label: 'Media', value: 'media' },
        { label: 'Weather', value: 'weather' },
        { label: 'Data', value: 'data' },
        { label: 'Custom', value: 'custom' },
      ],
      required: true,
      admin: {
        description: 'Type of integration',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this integration is active',
      },
    },
    {
      name: 'isGlobal',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this integration can be used across all tenants',
      },
    },
    {
      name: 'configuration',
      type: 'group',
      admin: {
        description: 'API configuration and credentials',
      },
      fields: [
        {
          name: 'apiKey',
          type: 'text',
          admin: {
            description: 'API key for the service',
          },
        },
        {
          name: 'apiSecret',
          type: 'text',
          admin: {
            description: 'API secret or private key',
          },
        },
        {
          name: 'accessToken',
          type: 'text',
          admin: {
            description: 'OAuth access token',
          },
        },
        {
          name: 'refreshToken',
          type: 'text',
          admin: {
            description: 'OAuth refresh token',
          },
        },
        {
          name: 'baseUrl',
          type: 'text',
          admin: {
            description: 'Base URL for API endpoints',
          },
        },
        {
          name: 'webhookUrl',
          type: 'text',
          admin: {
            condition: (data: any) => data?.type === 'webhook',
            description: 'Webhook URL for receiving data',
          },
        },
        {
          name: 'webhookSecret',
          type: 'text',
          admin: {
            condition: (data: any) => data?.type === 'webhook',
            description: 'Secret for webhook signature verification',
          },
        },
        {
          name: 'headers',
          type: 'json',
          admin: {
            description: 'Custom headers to include in API requests',
          },
        },
        {
          name: 'rateLimit',
          type: 'group',
          admin: {
            description: 'Rate limiting configuration',
          },
          fields: [
            {
              name: 'requestsPerMinute',
              type: 'number',
              defaultValue: 60,
              admin: {
                description: 'Maximum requests per minute',
              },
            },
            {
              name: 'requestsPerHour',
              type: 'number',
              defaultValue: 1000,
              admin: {
                description: 'Maximum requests per hour',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'mapping',
      type: 'group',
      admin: {
        description: 'Field mapping for data transformation',
      },
      fields: [
        {
          name: 'sourceFields',
          type: 'array',
          admin: {
            description: 'Fields available from the external source',
          },
          fields: [
            {
              name: 'sourceField',
              type: 'text',
              required: true,
              admin: {
                description: 'Field name from external source',
              },
            },
            {
              name: 'dataType',
              type: 'select',
              options: [
                { label: 'String', value: 'string' },
                { label: 'Number', value: 'number' },
                { label: 'Boolean', value: 'boolean' },
                { label: 'Date', value: 'date' },
                { label: 'Array', value: 'array' },
                { label: 'Object', value: 'object' },
              ],
              defaultValue: 'string',
              admin: {
                description: 'Data type of the field',
              },
            },
            {
              name: 'description',
              type: 'text',
              admin: {
                description: 'Description of the field',
              },
            },
          ],
        },
        {
          name: 'fieldMapping',
          type: 'array',
          admin: {
            description: 'Mapping from source fields to internal fields',
          },
          fields: [
            {
              name: 'sourceField',
              type: 'text',
              required: true,
              admin: {
                description: 'Source field name',
              },
            },
            {
              name: 'targetField',
              type: 'text',
              required: true,
              admin: {
                description: 'Target field name in your system',
              },
            },
            {
              name: 'transform',
              type: 'textarea',
              admin: {
                description: 'JavaScript transformation code',
                rows: 3,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'syncSettings',
      type: 'group',
      admin: {
        description: 'Data synchronization settings',
      },
      fields: [
        {
          name: 'syncEnabled',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Whether to sync data automatically',
          },
        },
        {
          name: 'syncFrequency',
          type: 'select',
          options: [
            { label: 'Real-time', value: 'realtime' },
            { label: 'Every 5 minutes', value: '5min' },
            { label: 'Every 15 minutes', value: '15min' },
            { label: 'Every hour', value: 'hourly' },
            { label: 'Every 6 hours', value: '6hours' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Manual', value: 'manual' },
          ],
          defaultValue: 'hourly',
          admin: {
            description: 'How often to sync data',
          },
        },
        {
          name: 'lastSyncedAt',
          type: 'date',
          admin: {
            description: 'Last time data was synchronized',
            readOnly: true,
          },
        },
        {
          name: 'nextSyncAt',
          type: 'date',
          admin: {
            description: 'Next scheduled sync',
            readOnly: true,
          },
        },
        {
          name: 'syncErrors',
          type: 'array',
          admin: {
            description: 'Recent sync errors',
            readOnly: true,
          },
          fields: [
            {
              name: 'error',
              type: 'text',
              admin: {
                description: 'Error message',
              },
            },
            {
              name: 'timestamp',
              type: 'date',
              admin: {
                description: 'When the error occurred',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'caching',
      type: 'group',
      admin: {
        description: 'Caching configuration',
      },
      fields: [
        {
          name: 'cacheEnabled',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Whether to cache API responses',
          },
        },
        {
          name: 'cacheDuration',
          type: 'number',
          defaultValue: 3600, // 1 hour
          admin: {
            description: 'Cache duration in seconds',
          },
        },
        {
          name: 'cacheKey',
          type: 'text',
          admin: {
            description: 'Custom cache key pattern',
          },
        },
      ],
    },
    {
      name: 'blocks',
      type: 'relationship',
      relationTo: 'builder-blocks' as any as any,
      hasMany: true,
      admin: {
        description: 'Blocks that use this integration',
      },
    },

    {
      name: 'connectionStatus',
      type: 'select',
      options: [
        { label: 'Not Tested', value: 'not_tested' },
        { label: 'Success', value: 'success' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'not_tested',
      admin: {
        description: 'Connection test status',
        readOnly: true,
      },
    },
    {
      name: 'documentation',
      type: 'group',
      admin: {
        description: 'Integration documentation and setup instructions',
      },
      fields: [
        {
          name: 'setupInstructions',
          type: 'richText',
          admin: {
            description: 'Step-by-step setup instructions',
          },
        },
        {
          name: 'apiDocsUrl',
          type: 'text',
          admin: {
            description: 'URL to the API documentation',
          },
        },
        {
          name: 'supportUrl',
          type: 'text',
          admin: {
            description: 'URL to support resources',
          },
        },
      ],
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of times this integration is used',
        readOnly: true,
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Tags for organizing integrations',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          admin: {
            description: 'Tag name',
          },
        },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata about this integration',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ req, operation, value }: any) => {
            if (operation === 'create' && !value) {
              return req.user?.id;
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      admin: {
        position: 'sidebar',
        condition: (data: any, siblingData: any, { user }: any) => user?.role === 'admin',
      },
      hooks: {
        beforeChange: [
          ({ req, value }: any) => {
            if (!value && req.user && (req.user as any)?.role !== 'admin') {
              return (req.user as any)?.tenant?.id;
            }
            return value;
          },
        ],
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req }: any) => {
        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user && (req.user as any)?.role !== 'admin') {
          data.tenant = (req.user as any)?.tenant?.id;
        }

        return data;
      },
    ],
  },
  timestamps: true,
});
