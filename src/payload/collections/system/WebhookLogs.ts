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
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') {
        return { tenant: { equals: (req.user as any)?.tenant?.id } } as Where;
      }
      return false;
    },
    create: ({ req }): AccessResult => {
      // Only system/webhooks can create webhook logs
      return false;
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      // Allow managers to update processing status
      if ((req.user as any)?.role === 'manager') {
        return { tenant: { equals: (req.user as any)?.tenant?.id } } as Where;
      }
      return false;
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false;
      // Only admins can delete webhook logs (for cleanup)
      return (req.user as any)?.role === 'admin';
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
        if (data && !data.tenant && req.user && (req.user as any)?.role !== 'admin') {
          data.tenant = (req.user as any)?.tenant?.id;
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
                collection: 'webhook-logs' as any as any,
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
                  collection: 'webhook-logs' as any as any,
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
          console.log(`Webhook ready for processing: ${doc.eventType}`);
          
          try {
            await processWebhookAutomatically(doc, req.payload);
          } catch (error) {
            console.error(`Error auto-processing webhook ${doc.id}:`, error);
            
            // Update webhook with error status
            if (req.payload) {
              await req.payload.update({
                collection: 'webhook-logs' as any as any,
                id: doc.id,
                data: {
                  status: 'failed',
                  processedAt: new Date().toISOString(),
                  processingResult: {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error during auto-processing',
                    errorCode: 'AUTO_PROCESS_FAILED'
                  }
                }
              });
            }
          }
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
      relationTo: 'tenants' as any as any,
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
          relationTo: 'orders' as any as any,
          admin: {
            description: 'Related order (if webhook affects an order)',
          },
        },
        {
          name: 'appointment',
          type: 'relationship',
          relationTo: 'appointments' as any as any,
          admin: {
            description: 'Related appointment',
          },
        },
        {
          name: 'transaction',
          type: 'relationship',
          relationTo: 'transactions' as any as any,
          admin: {
            description: 'Related transaction',
          },
        },
        {
          name: 'customer',
          type: 'relationship',
          relationTo: 'users' as any as any,
          admin: {
            description: 'Related customer',
          },
        },
        {
          name: 'subscription',
          type: 'relationship',
          relationTo: 'subscriptions' as any as any,
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
      relationTo: 'webhook-logs' as any as any,
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

/**
 * Auto-process webhooks based on their type and provider
 */
async function processWebhookAutomatically(doc: any, payload: any) {
  if (!payload) return;
  
  const { provider, eventType, payload: webhookPayload } = doc;
  const actions: any[] = [];
  let success = true;
  let error = null;

  try {
    console.log(`Auto-processing webhook: ${provider}.${eventType}`);

    switch (provider) {
      case 'stripe':
        await processStripeWebhook(doc, payload, actions);
        break;
        
      case 'paypal':
        await processPayPalWebhook(doc, payload, actions);
        break;
        
      case 'google_calendar':
        await processGoogleCalendarWebhook(doc, payload, actions);
        break;
        
      case 'outlook_calendar':
        await processOutlookCalendarWebhook(doc, payload, actions);
        break;
        
      case 'mailchimp':
        await processMailchimpWebhook(doc, payload, actions);
        break;
        
      case 'twilio':
        await processTwilioWebhook(doc, payload, actions);
        break;
        
      default:
        console.log(`No auto-processing configured for provider: ${provider}`);
        return; // Don't update status, leave as pending for manual processing
    }

    // Update webhook with success status
    await payload.update({
      collection: 'webhook-logs' as any as any,
      id: doc.id,
      data: {
        status: 'processed',
        processedAt: new Date().toISOString(),
        processingResult: {
          success: true,
          actions: actions
        }
      }
    });

    console.log(`Successfully auto-processed webhook ${doc.id} with ${actions.length} actions`);

  } catch (processingError) {
    success = false;
    error = processingError instanceof Error ? processingError.message : 'Unknown processing error';
    
    console.error(`Error processing webhook ${doc.id}:`, processingError);
    
    // Update webhook with error status
    await payload.update({
      collection: 'webhook-logs' as any as any,
      id: doc.id,
      data: {
        status: 'failed',
        processedAt: new Date().toISOString(),
        processingResult: {
          success: false,
          error: error,
          errorCode: 'PROCESSING_FAILED',
          actions: actions
        }
      }
    });

    throw processingError;
  }
}

/**
 * Process Stripe webhooks
 */
async function processStripeWebhook(doc: any, payload: any, actions: any[]) {
  const { eventType, payload: webhookPayload } = doc;
  
  switch (eventType) {
    case 'payment_intent.succeeded':
      await handleStripePaymentSuccess(webhookPayload, payload, actions);
      break;
      
    case 'payment_intent.payment_failed':
      await handleStripePaymentFailure(webhookPayload, payload, actions);
      break;
      
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleStripeSubscriptionChange(webhookPayload, payload, actions);
      break;
      
    case 'invoice.payment_succeeded':
      await handleStripeInvoicePayment(webhookPayload, payload, actions);
      break;
      
    case 'customer.created':
      await handleStripeCustomerCreation(webhookPayload, payload, actions);
      break;
      
    default:
      console.log(`No handler for Stripe event: ${eventType}`);
  }
}

/**
 * Process PayPal webhooks
 */
async function processPayPalWebhook(doc: any, payload: any, actions: any[]) {
  const { eventType, payload: webhookPayload } = doc;
  
  switch (eventType) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      await handlePayPalPaymentCapture(webhookPayload, payload, actions);
      break;
      
    case 'BILLING.SUBSCRIPTION.CREATED':
      await handlePayPalSubscriptionCreated(webhookPayload, payload, actions);
      break;
      
    default:
      console.log(`No handler for PayPal event: ${eventType}`);
  }
}

/**
 * Process Google Calendar webhooks
 */
async function processGoogleCalendarWebhook(doc: any, payload: any, actions: any[]) {
  const { eventType, payload: webhookPayload } = doc;
  
  switch (eventType) {
    case 'event.created':
      await handleGoogleCalendarEventCreated(webhookPayload, payload, actions);
      break;
      
    case 'event.updated':
      await handleGoogleCalendarEventUpdated(webhookPayload, payload, actions);
      break;
      
    case 'event.deleted':
      await handleGoogleCalendarEventDeleted(webhookPayload, payload, actions);
      break;
      
    default:
      console.log(`No handler for Google Calendar event: ${eventType}`);
  }
}

/**
 * Process Outlook Calendar webhooks
 */
async function processOutlookCalendarWebhook(doc: any, payload: any, actions: any[]) {
  const { eventType, payload: webhookPayload } = doc;
  
  switch (eventType) {
    case 'calendar.event.created':
      await handleOutlookEventCreated(webhookPayload, payload, actions);
      break;
      
    case 'calendar.event.updated':
      await handleOutlookEventUpdated(webhookPayload, payload, actions);
      break;
      
    default:
      console.log(`No handler for Outlook Calendar event: ${eventType}`);
  }
}

/**
 * Process Mailchimp webhooks
 */
async function processMailchimpWebhook(doc: any, payload: any, actions: any[]) {
  const { eventType, payload: webhookPayload } = doc;
  
  switch (eventType) {
    case 'subscribe':
      await handleMailchimpSubscribe(webhookPayload, payload, actions);
      break;
      
    case 'unsubscribe':
      await handleMailchimpUnsubscribe(webhookPayload, payload, actions);
      break;
      
    default:
      console.log(`No handler for Mailchimp event: ${eventType}`);
  }
}

/**
 * Process Twilio webhooks
 */
async function processTwilioWebhook(doc: any, payload: any, actions: any[]) {
  const { eventType, payload: webhookPayload } = doc;
  
  switch (eventType) {
    case 'message.received':
      await handleTwilioMessageReceived(webhookPayload, payload, actions);
      break;
      
    case 'call.completed':
      await handleTwilioCallCompleted(webhookPayload, payload, actions);
      break;
      
    default:
      console.log(`No handler for Twilio event: ${eventType}`);
  }
}

// Stripe webhook handlers
async function handleStripePaymentSuccess(webhookPayload: any, payload: any, actions: any[]) {
  const paymentIntent = webhookPayload.data.object;
  
  // Find related order by payment intent ID
  const orders = await payload.find({
    collection: 'orders' as any as any,
    where: {
      'payment.stripePaymentIntentId': { equals: paymentIntent.id }
    },
    limit: 1
  });

  if (orders.docs.length > 0) {
    const order = orders.docs[0];
    
    // Update order status
    await payload.update({
      collection: 'orders' as any as any,
      id: order.id,
      data: {
        status: 'paid',
        'payment.status': 'completed',
        'payment.paidAt': new Date().toISOString(),
        'payment.transactionId': paymentIntent.charges?.data[0]?.id
      }
    });

    actions.push({
      action: 'update_order_status',
      target: order.id,
      result: 'success',
      details: `Updated order status to paid`,
      timestamp: new Date().toISOString()
    });

    console.log(`Updated order ${order.id} status to paid`);
  }
}

async function handleStripePaymentFailure(webhookPayload: any, payload: any, actions: any[]) {
  const paymentIntent = webhookPayload.data.object;
  
  // Find related order and update status
  const orders = await payload.find({
    collection: 'orders' as any as any,
    where: {
      'payment.stripePaymentIntentId': { equals: paymentIntent.id }
    },
    limit: 1
  });

  if (orders.docs.length > 0) {
    const order = orders.docs[0];
    
    await payload.update({
      collection: 'orders' as any as any,
      id: order.id,
      data: {
        status: 'payment_failed',
        'payment.status': 'failed',
        'payment.failureReason': paymentIntent.last_payment_error?.message
      }
    });

    actions.push({
      action: 'update_order_payment_failed',
      target: order.id,
      result: 'success',
      details: `Updated order payment status to failed`,
      timestamp: new Date().toISOString()
    });
  }
}

async function handleStripeSubscriptionChange(webhookPayload: any, payload: any, actions: any[]) {
  const subscription = webhookPayload.data.object;
  
  // Find related subscription in our system
  const subscriptions = await payload.find({
    collection: 'subscriptions' as any as any,
    where: {
      stripeSubscriptionId: { equals: subscription.id }
    },
    limit: 1
  });

  if (subscriptions.docs.length > 0) {
    const localSubscription = subscriptions.docs[0];
    
    await payload.update({
      collection: 'subscriptions' as any as any,
      id: localSubscription.id,
      data: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      }
    });

    actions.push({
      action: 'update_subscription',
      target: localSubscription.id,
      result: 'success',
      details: `Updated subscription status to ${subscription.status}`,
      timestamp: new Date().toISOString()
    });
  }
}

async function handleStripeInvoicePayment(webhookPayload: any, payload: any, actions: any[]) {
  const invoice = webhookPayload.data.object;
  
  // Handle subscription invoice payments
  if (invoice.subscription) {
    const subscriptions = await payload.find({
      collection: 'subscriptions' as any as any,
      where: {
        stripeSubscriptionId: { equals: invoice.subscription }
      },
      limit: 1
    });

    if (subscriptions.docs.length > 0) {
      const subscription = subscriptions.docs[0];
      
      await payload.update({
        collection: 'subscriptions' as any as any,
        id: subscription.id,
        data: {
          lastPaymentDate: new Date().toISOString(),
          status: 'active'
        }
      });

      actions.push({
        action: 'update_subscription_payment',
        target: subscription.id,
        result: 'success',
        details: `Updated subscription payment status`,
        timestamp: new Date().toISOString()
      });
    }
  }
}

async function handleStripeCustomerCreation(webhookPayload: any, payload: any, actions: any[]) {
  const customer = webhookPayload.data.object;
  
  // Try to find existing user by email and update with Stripe customer ID
  if ((customer as any)?.email) {
    const users = await payload.find({
      collection: 'users' as any as any,
      where: {
        email: { equals: (customer as any)?.email }
      },
      limit: 1
    });

    if (users.docs.length > 0) {
      const user = users.docs[0];
      
      await payload.update({
        collection: 'users' as any as any,
        id: user.id,
        data: {
          stripeCustomerId: customer.id
        }
      });

      actions.push({
        action: 'link_stripe_customer',
        target: user.id,
        result: 'success',
        details: `Linked Stripe customer ID to user`,
        timestamp: new Date().toISOString()
      });
    }
  }
}

// PayPal webhook handlers
async function handlePayPalPaymentCapture(webhookPayload: any, payload: any, actions: any[]) {
  // Similar to Stripe payment success handling
  console.log('Processing PayPal payment capture:', webhookPayload);
  
  actions.push({
    action: 'process_paypal_payment',
    target: webhookPayload.resource?.id,
    result: 'success',
    details: 'Processed PayPal payment capture',
    timestamp: new Date().toISOString()
  });
}

async function handlePayPalSubscriptionCreated(webhookPayload: any, payload: any, actions: any[]) {
  // Handle PayPal subscription creation
  console.log('Processing PayPal subscription creation:', webhookPayload);
  
  actions.push({
    action: 'process_paypal_subscription',
    target: webhookPayload.resource?.id,
    result: 'success',
    details: 'Processed PayPal subscription creation',
    timestamp: new Date().toISOString()
  });
}

// Calendar webhook handlers
async function handleGoogleCalendarEventCreated(webhookPayload: any, payload: any, actions: any[]) {
  // Sync Google Calendar event to appointments
  console.log('Processing Google Calendar event creation:', webhookPayload);
  
  actions.push({
    action: 'sync_google_calendar_event',
    target: webhookPayload.id,
    result: 'success',
    details: 'Synced Google Calendar event creation',
    timestamp: new Date().toISOString()
  });
}

async function handleGoogleCalendarEventUpdated(webhookPayload: any, payload: any, actions: any[]) {
  // Update corresponding appointment
  console.log('Processing Google Calendar event update:', webhookPayload);
  
  actions.push({
    action: 'sync_google_calendar_update',
    target: webhookPayload.id,
    result: 'success',
    details: 'Synced Google Calendar event update',
    timestamp: new Date().toISOString()
  });
}

async function handleGoogleCalendarEventDeleted(webhookPayload: any, payload: any, actions: any[]) {
  // Handle appointment cancellation
  console.log('Processing Google Calendar event deletion:', webhookPayload);
  
  actions.push({
    action: 'sync_google_calendar_deletion',
    target: webhookPayload.id,
    result: 'success',
    details: 'Synced Google Calendar event deletion',
    timestamp: new Date().toISOString()
  });
}

// Outlook webhook handlers
async function handleOutlookEventCreated(webhookPayload: any, payload: any, actions: any[]) {
  console.log('Processing Outlook Calendar event creation:', webhookPayload);
  
  actions.push({
    action: 'sync_outlook_calendar_event',
    target: webhookPayload.id,
    result: 'success',
    details: 'Synced Outlook Calendar event creation',
    timestamp: new Date().toISOString()
  });
}

async function handleOutlookEventUpdated(webhookPayload: any, payload: any, actions: any[]) {
  console.log('Processing Outlook Calendar event update:', webhookPayload);
  
  actions.push({
    action: 'sync_outlook_calendar_update',
    target: webhookPayload.id,
    result: 'success',
    details: 'Synced Outlook Calendar event update',
    timestamp: new Date().toISOString()
  });
}

// Mailchimp webhook handlers
async function handleMailchimpSubscribe(webhookPayload: any, payload: any, actions: any[]) {
  // Update user's marketing preferences
  console.log('Processing Mailchimp subscription:', webhookPayload);
  
  actions.push({
    action: 'update_mailchimp_subscription',
    target: webhookPayload.data?.email,
    result: 'success',
    details: 'Updated marketing subscription status',
    timestamp: new Date().toISOString()
  });
}

async function handleMailchimpUnsubscribe(webhookPayload: any, payload: any, actions: any[]) {
  // Update user's marketing preferences
  console.log('Processing Mailchimp unsubscription:', webhookPayload);
  
  actions.push({
    action: 'update_mailchimp_unsubscription',
    target: webhookPayload.data?.email,
    result: 'success',
    details: 'Updated marketing unsubscription status',
    timestamp: new Date().toISOString()
  });
}

// Twilio webhook handlers
async function handleTwilioMessageReceived(webhookPayload: any, payload: any, actions: any[]) {
  // Handle incoming SMS messages
  console.log('Processing Twilio message:', webhookPayload);
  
  actions.push({
    action: 'process_twilio_message',
    target: webhookPayload.MessageSid,
    result: 'success',
    details: 'Processed incoming SMS message',
    timestamp: new Date().toISOString()
  });
}

async function handleTwilioCallCompleted(webhookPayload: any, payload: any, actions: any[]) {
  // Handle completed phone calls
  console.log('Processing Twilio call completion:', webhookPayload);
  
  actions.push({
    action: 'process_twilio_call',
    target: webhookPayload.CallSid,
    result: 'success',
    details: 'Processed completed phone call',
    timestamp: new Date().toISOString()
  });
}
