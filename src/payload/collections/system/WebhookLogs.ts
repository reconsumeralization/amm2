import { CollectionConfig, Where, AccessResult } from 'payload';

export const WebhookLogs: CollectionConfig = {
  slug: 'webhook-logs',
  labels: {
    singular: 'Webhook Log',
    plural: 'Webhook Logs',
  },
  admin: {
    useAsTitle: 'id',
    group: 'Admin',
    description: 'Inbound webhook events for debugging and replay',
    defaultColumns: ['provider', 'eventType', 'status', 'receivedAt', 'processedAt'],
    listSearchableFields: ['provider', 'eventType', 'webhookId', 'notes'],
    pagination: {
      defaultLimit: 50,
      limits: [25, 50, 100, 200],
    },
  },
  access: {
    read: ({ req }): AccessResult => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      if (req.user.role === 'manager') {
        return { tenant: { equals: req.user.tenant?.id } } as Where;
      }
      return false;
    },
    create: ({ req }): AccessResult => {
      // Only system/webhooks can create webhook logs
      return false;
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      // Allow managers to update processing status
      if (req.user.role === 'manager') {
        return { tenant: { equals: req.user.tenant?.id } } as Where;
      }
      return false;
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false;
      // Only admins can delete webhook logs (for cleanup)
      return req.user.role === 'admin';
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (!data) return data;

        // Set received timestamp if not provided
        if (operation === 'create' && !data.receivedAt) {
          data.receivedAt = new Date().toISOString();
        }

        // Auto-assign tenant for non-admin users
        if (data && !data.tenant && req.user && req.user.role !== 'admin') {
          data.tenant = req.user.tenant?.id;
        }

        return data;
      },
    ],
    beforeChange: [
      ({ data, operation, req }) => {
        if (!data) return data;

        if (operation === 'create') {
          console.log(`Logging webhook from ${data.provider}: ${data.eventType}`);
          
          // Set initial processing metadata
          data.processingMetadata = {
            receivedTimestamp: Date.now(),
            processingStarted: false,
            version: '1.0',
          };
        }

        if (operation === 'update') {
          // Track processing time
          if (data.status === 'processed' && !data.processedAt) {
            data.processedAt = new Date().toISOString();
          }

          // Update processing metadata
          if (data.status === 'processing' && data.processingMetadata) {
            data.processingMetadata.processingStarted = true;
            data.processingMetadata.processingStartedAt = Date.now();
          }
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`Webhook logged: ${doc.provider} - ${doc.eventType} (${doc.id})`);
          
          // Check for duplicates
          if (doc.webhookId && req.payload) {
            try {
              const existing = await req.payload.find({
                collection: 'webhook-logs',
                where: {
                  and: [
                    { webhookId: { equals: doc.webhookId } },
                    { provider: { equals: doc.provider } },
                    { id: { not_equals: doc.id } },
                  ],
                },
                limit: 1,
              });

              if (existing.docs.length > 0) {
                await req.payload.update({
                  collection: 'webhook-logs',
                  id: doc.id,
                  data: {
                    duplicateOf: existing.docs[0].id,
                    status: 'ignored',
                    processingResult: {
                      success: false,
                      error: 'Duplicate webhook detected',
                    },
                  },
                });
              }
            } catch (error) {
              console.error('Error checking for duplicate webhooks:', error);
            }
          }
        }

        // Auto-process certain webhook types if configured
        if (operation === 'create' && doc.status === 'pending' && !doc.duplicateOf) {
          // TODO: Implement auto-processing logic for known webhook types
          console.log(`Webhook ready for processing: ${doc.eventType}`);
        }
      },
    ],
    afterDelete: [
      ({ doc, req }) => {
        console.log(`Webhook log deleted: ${doc.provider} - ${doc.eventType} (${doc.id}) by ${req.user?.email}`);
      },
    ],
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
      admin: {
        description: 'Business this webhook belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'Square', value: 'square' },
        { label: 'Google Calendar', value: 'google_calendar' },
        { label: 'Outlook Calendar', value: 'outlook_calendar' },
        { label: 'Zoom', value: 'zoom' },
        { label: 'Microsoft Teams', value: 'teams' },
        { label: 'Mailchimp', value: 'mailchimp' },
        { label: 'Slack', value: 'slack' },
        { label: 'Twilio', value: 'twilio' },
        { label: 'SendGrid', value: 'sendgrid' },
        { label: 'Shopify', value: 'shopify' },
        { label: 'WooCommerce', value: 'woocommerce' },
        { label: 'Custom', value: 'custom' },
        { label: 'Unknown', value: 'unknown' },
      ],
      admin: {
        description: 'Service that sent the webhook',
      },
      index: true,
    },
    {
      name: 'eventType',
      type: 'text',
      required: true,
      admin: {
        description: 'Type of event (e.g., payment_intent.succeeded)',
      },
      index: true,
    },
    {
      name: 'webhookId',
      type: 'text',
      admin: {
        description: 'Unique webhook event ID from provider',
      },
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Processed', value: 'processed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Ignored', value: 'ignored' },
        { label: 'Retried', value: 'retried' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        description: 'Processing status of the webhook',
      },
      index: true,
    },
    {
      name: 'receivedAt',
      type: 'date',
      required: true,
      admin: {
        description: 'When the webhook was received',
      },
      index: true,
    },
    {
      name: 'processedAt',
      type: 'date',
      admin: {
        description: 'When the webhook was processed',
      },
      index: true,
    },
    {
      name: 'processingDuration',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Processing time in milliseconds',
      },
      hooks: {
        beforeChange: [
          ({ data, siblingData }) => {
            const webhookData = data || siblingData;
            if (webhookData?.receivedAt && webhookData?.processedAt) {
              const received = new Date(webhookData.receivedAt);
              const processed = new Date(webhookData.processedAt);
              return processed.getTime() - received.getTime();
            }
            return null;
          },
        ],
      },
    },
    {
      name: 'headers',
      type: 'json',
      admin: {
        description: 'HTTP headers from the webhook request',
      },
    },
    {
      name: 'payload',
      type: 'json',
      required: true,
      admin: {
        description: 'Webhook payload data',
      },
    },
    {
      name: 'rawPayload',
      type: 'textarea',
      maxLength: 50000,
      admin: {
        description: 'Raw webhook payload as received (for debugging)',
        rows: 10,
      },
    },
    {
      name: 'signature',
      type: 'text',
      admin: {
        description: 'Webhook signature for verification',
      },
    },
    {
      name: 'signatureVerified',
      type: 'checkbox',
      admin: {
        description: 'Whether the webhook signature was verified',
        readOnly: true,
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        description: 'IP address of the webhook sender',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        description: 'User agent of the webhook sender',
      },
    },
    {
      name: 'processingMetadata',
      type: 'group',
      fields: [
        {
          name: 'receivedTimestamp',
          type: 'number',
          admin: {
            description: 'Unix timestamp when webhook was received',
            readOnly: true,
          },
        },
        {
          name: 'processingStarted',
          type: 'checkbox',
          admin: {
            description: 'Whether processing has started',
            readOnly: true,
          },
        },
        {
          name: 'processingStartedAt',
          type: 'number',
          admin: {
            description: 'Unix timestamp when processing started',
            readOnly: true,
          },
        },
        {
          name: 'version',
          type: 'text',
          admin: {
            description: 'Webhook processing version',
            readOnly: true,
          },
        },
        {
          name: 'processingNode',
          type: 'text',
          admin: {
            description: 'Server node that processed this webhook',
            readOnly: true,
          },
        },
      ],
      admin: {
        description: 'Internal processing metadata',
      },
    },
    {
      name: 'processingResult',
      type: 'group',
      fields: [
        {
          name: 'success',
          type: 'checkbox',
          admin: {
            description: 'Whether processing was successful',
          },
        },
        {
          name: 'error',
          type: 'textarea',
          maxLength: 2000,
          admin: {
            description: 'Error message if processing failed',
            rows: 3,
          },
        },
        {
          name: 'errorCode',
          type: 'text',
          admin: {
            description: 'Error code for categorization',
          },
        },
        {
          name: 'stackTrace',
          type: 'textarea',
          maxLength: 10000,
          admin: {
            description: 'Stack trace if processing failed',
            rows: 5,
            condition: (data) => !data.success,
          },
        },
        {
          name: 'actions',
          type: 'array',
          admin: {
            description: 'Actions taken in response to this webhook',
          },
          fields: [
            {
              name: 'action',
              type: 'text',
              required: true,
              admin: {
                description: 'Action that was performed',
              },
            },
            {
              name: 'target',
              type: 'text',
              admin: {
                description: 'Target of the action (e.g., order ID)',
              },
            },
            {
              name: 'result',
              type: 'select',
              options: [
                { label: 'Success', value: 'success' },
                { label: 'Failed', value: 'failed' },
                { label: 'Skipped', value: 'skipped' },
                { label: 'Partial', value: 'partial' },
              ],
              admin: {
                description: 'Result of the action',
              },
            },
            {
              name: 'details',
              type: 'text',
              admin: {
                description: 'Additional details about the action',
              },
            },
            {
              name: 'timestamp',
              type: 'date',
              required: true,
              defaultValue: () => new Date().toISOString(),
            },
          ],
        },
        {
          name: 'createdRecords',
          type: 'array',
          admin: {
            description: 'Records created as a result of this webhook',
          },
          fields: [
            {
              name: 'collection',
              type: 'text',
              required: true,
              admin: {
                description: 'Collection name',
              },
            },
            {
              name: 'recordId',
              type: 'text',
              required: true,
              admin: {
                description: 'ID of the created record',
              },
            },
            {
              name: 'recordType',
              type: 'text',
              admin: {
                description: 'Type of record created',
              },
            },
          ],
        },
        {
          name: 'updatedRecords',
          type: 'array',
          admin: {
            description: 'Records updated as a result of this webhook',
          },
          fields: [
            {
              name: 'collection',
              type: 'text',
              required: true,
              admin: {
                description: 'Collection name',
              },
            },
            {
              name: 'recordId',
              type: 'text',
              required: true,
              admin: {
                description: 'ID of the updated record',
              },
            },
            {
              name: 'changes',
              type: 'json',
              admin: {
                description: 'Changes made to the record',
              },
            },
          ],
        },
      ],
      admin: {
        description: 'Results of webhook processing',
        condition: (data) => data.status !== 'pending',
      },
    },
    {
      name: 'retryInfo',
      type: 'group',
      fields: [
        {
          name: 'retryCount',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Number of retry attempts',
          },
        },
        {
          name: 'maxRetries',
          type: 'number',
          min: 0,
          defaultValue: 3,
          admin: {
            description: 'Maximum number of retry attempts',
          },
        },
        {
          name: 'nextRetryAt',
          type: 'date',
          admin: {
            description: 'When to attempt next retry',
          },
        },
        {
          name: 'retryStrategy',
          type: 'select',
          defaultValue: 'exponential',
          options: [
            { label: 'Exponential Backoff', value: 'exponential' },
            { label: 'Linear', value: 'linear' },
            { label: 'Fixed Interval', value: 'fixed' },
            { label: 'Custom', value: 'custom' },
          ],
          admin: {
            description: 'Retry strategy to use',
          },
        },
        {
          name: 'retryHistory',
          type: 'array',
          admin: {
            description: 'History of retry attempts',
          },
          fields: [
            {
              name: 'attempt',
              type: 'number',
              required: true,
              admin: {
                description: 'Retry attempt number',
              },
            },
            {
              name: 'attemptedAt',
              type: 'date',
              required: true,
              admin: {
                description: 'When retry was attempted',
              },
            },
            {
              name: 'result',
              type: 'select',
              options: [
                { label: 'Success', value: 'success' },
                { label: 'Failed', value: 'failed' },
                { label: 'Pending', value: 'pending' },
              ],
              admin: {
                description: 'Result of retry attempt',
              },
            },
            {
              name: 'error',
              type: 'text',
              admin: {
                description: 'Error from retry attempt',
              },
            },
            {
              name: 'duration',
              type: 'number',
              admin: {
                description: 'Duration of retry attempt in milliseconds',
              },
            },
          ],
        },
      ],
      admin: {
        description: 'Retry configuration and history',
        condition: (data) => data.status === 'failed' || (data.retryInfo && data.retryInfo.retryCount > 0),
      },
    },
    {
      name: 'relatedRecords',
      type: 'group',
      fields: [
        {
          name: 'order',
          type: 'relationship',
          relationTo: 'orders',
          admin: {
            description: 'Related order (if webhook affects an order)',
          },
        },
        {
          name: 'appointment',
          type: 'relationship',
          relationTo: 'appointments',
          admin: {
            description: 'Related appointment',
          },
        },
        {
          name: 'transaction',
          type: 'relationship',
          relationTo: 'transactions',
          admin: {
            description: 'Related transaction',
          },
        },
        {
          name: 'customer',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'Related customer',
          },
        },
        {
          name: 'subscription',
          type: 'relationship',
          relationTo: 'subscriptions',
          admin: {
            description: 'Related subscription',
          },
        },
      ],
      admin: {
        description: 'Records affected by this webhook',
      },
    },
    {
      name: 'duplicateOf',
      type: 'relationship',
      relationTo: 'webhook-logs',
      admin: {
        description: 'If this is a duplicate webhook, reference to original',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Internal notes about this webhook',
        rows: 3,
      },
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
      admin: {
        description: 'Processing priority',
      },
      index: true,
    },
    {
      name: 'environment',
      type: 'select',
      defaultValue: 'production',
      options: [
        { label: 'Production', value: 'production' },
        { label: 'Staging', value: 'staging' },
        { label: 'Development', value: 'development' },
        { label: 'Test', value: 'test' },
      ],
      admin: {
        description: 'Environment this webhook was sent to',
      },
      index: true,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          maxLength: 50,
        },
      ],
      admin: {
        description: 'Tags for categorizing webhooks',
      },
      maxRows: 10,
    },
    {
      name: 'archived',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this webhook log is archived',
      },
      index: true,
    },
  ],
  indexes: [
    { fields: ['tenant', 'provider'] },
    { fields: ['tenant', 'status'] },
    { fields: ['provider', 'eventType'] },
    { fields: ['webhookId', 'provider'] },
    { fields: ['status', 'priority'] },
    { fields: ['receivedAt'] },
    { fields: ['processedAt'] },
    { fields: ['environment'] },
    { fields: ['archived'] },
    { fields: ['duplicateOf'] },
  ],
  timestamps: true,
};
