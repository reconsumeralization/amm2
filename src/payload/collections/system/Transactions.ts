import { CollectionConfig } from 'payload';

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  labels: {
    singular: 'Transaction',
    plural: 'Transactions',
  },
  admin: {
    useAsTitle: 'reference',
    group: 'Commerce',
    description: 'Payment transactions and reconciliation records',
    defaultColumns: ['reference', 'order', 'amount', 'currency', 'status', 'provider', 'createdAt'],
    listSearchableFields: ['reference', 'providerId', 'order.bookingNumber', 'notes'],
  },
  access: {
    read: ({ req }): any => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      if (['manager', 'barber'].includes((req.user as any).role)) {
        return { tenant: { equals: (req.user as any).tenant?.id } };
      }
      // Customers can only read their own transactions
      return {
        tenant: { equals: (req.user as any).tenant?.id },
        order: {
          user: { equals: req.user.id }
        }
      };
    },
    create: ({ req }): boolean => {
      if (!req.user) return false;
      // Only system/webhooks can create transactions
      return false;
    },
    update: ({ req }): any => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      // Allow managers to update transaction status for reconciliation
      if ((req.user as any).role === 'manager') {
        return { tenant: { equals: (req.user as any).tenant?.id } };
      }
      return false;
    },
    delete: ({ req }): any => {
      if (!req.user) return false;
      if ((req.user as any).role === 'admin') return true;
      // Prevent accidental deletion
      return false;
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (!data) return data;

        // Generate reference if not provided
        if (operation === 'create' && !data.reference) {
          data.reference = generateTransactionReference();
        }

        // Validate amounts
        if (data.amount && data.amount < 0) {
          throw new Error('Transaction amount cannot be negative');
        }

        return data;
      },
    ],
    beforeChange: [
      ({ data, operation, req }) => {
        if (!data) return data;

        if (operation === 'create') {
          console.log(`Creating transaction: ${data.reference}`);
        }

        if (operation === 'update') {
          console.log(`Updating transaction: ${data.reference}`);
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`Transaction created: ${doc.reference} (${doc.id})`);
        }

        // Update order payment status based on transaction status
        if (doc.order && req.payload) {
          try {
            const order = await req.payload.findByID({
              collection: 'orders' as any as any as any,
              id: doc.order
            });

            if (order) {
              let newPaymentStatus = (order as any).paymentStatus;

              if (doc.status === 'succeeded' && doc.type === 'payment') {
                newPaymentStatus = 'paid';
              } else if (doc.status === 'failed') {
                newPaymentStatus = 'failed';
              } else if (doc.status === 'refunded') {
                newPaymentStatus = 'refunded';
              }

              if (newPaymentStatus !== (order as any).paymentStatus) {
                await req.payload.update({
                  collection: 'orders' as any as any as any,
                  id: doc.order,
                  data: {
                    paymentStatus: newPaymentStatus,
                    updatedAt: new Date().toISOString()
                  } as any
                });
                console.log(`Updated order ${(order as any).id} payment status to ${newPaymentStatus}`);
              }
            }
          } catch (error) {
            console.error('Error updating order payment status:', error);
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
        description: 'Unique transaction reference',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any as any,
      required: true,
      index: true,
      admin: {
        description: 'Business this transaction belongs to',
        condition: (data, siblingData, { user }) => (user as any)?.role === 'admin',
      },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders' as any as any as any,
      index: true,
      admin: {
        description: 'Related order (if applicable)',
      },
    },
    {
      name: 'appointment',
      type: 'relationship',
      relationTo: 'appointments' as any as any as any,
      index: true,
      admin: {
        description: 'Related appointment (if applicable)',
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users' as any as any,
      index: true,
      admin: {
        description: 'Customer involved in this transaction',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Payment', value: 'payment' },
        { label: 'Refund', value: 'refund' },
        { label: 'Chargeback', value: 'chargeback' },
        { label: 'Payout', value: 'payout' },
        { label: 'Transfer', value: 'transfer' },
        { label: 'Fee', value: 'fee' },
        { label: 'Adjustment', value: 'adjustment' },
        { label: 'Gift Card Purchase', value: 'gift_card_purchase' },
        { label: 'Gift Card Redemption', value: 'gift_card_redemption' },
      ],
      admin: {
        description: 'Type of transaction',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Succeeded', value: 'succeeded' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Disputed', value: 'disputed' },
        { label: 'Partially Refunded', value: 'partially_refunded' },
      ],
      admin: {
        description: 'Current status of the transaction',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Transaction amount (in cents)',
        step: 1,
      },
    },
    {
      name: 'currency',
      type: 'select',
      required: true,
      defaultValue: 'USD',
      options: [
        { label: 'US Dollar', value: 'USD' },
        { label: 'Euro', value: 'EUR' },
        { label: 'British Pound', value: 'GBP' },
        { label: 'Canadian Dollar', value: 'CAD' },
      ],
      admin: {
        description: 'Transaction currency',
      },
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      defaultValue: 'stripe',
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'Square', value: 'square' },
        { label: 'Cash', value: 'cash' },
        { label: 'Check', value: 'check' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'Gift Card', value: 'gift_card' },
        { label: 'Store Credit', value: 'store_credit' },
      ],
      admin: {
        description: 'Payment provider or method',
      },
    },
    {
      name: 'providerId',
      type: 'text',
      admin: {
        description: 'Provider-specific transaction ID',
      },
    },
    {
      name: 'providerReference',
      type: 'text',
      admin: {
        description: 'Provider reference number',
      },
    },
    {
      name: 'paymentMethod',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Credit Card', value: 'card' },
            { label: 'Debit Card', value: 'debit' },
            { label: 'Bank Account', value: 'bank' },
            { label: 'Digital Wallet', value: 'wallet' },
            { label: 'Cash', value: 'cash' },
            { label: 'Check', value: 'check' },
          ],
          admin: {
            description: 'Type of payment method',
          },
        },
        {
          name: 'last4',
          type: 'text',
          admin: {
            description: 'Last 4 digits of card/account',
          },
        },
        {
          name: 'brand',
          type: 'select',
          options: [
            { label: 'Visa', value: 'visa' },
            { label: 'Mastercard', value: 'mastercard' },
            { label: 'American Express', value: 'amex' },
            { label: 'Discover', value: 'discover' },
            { label: 'Other', value: 'other' },
          ],
          admin: {
            description: 'Card brand',
          },
        },
        {
          name: 'walletType',
          type: 'select',
          options: [
            { label: 'Apple Pay', value: 'apple_pay' },
            { label: 'Google Pay', value: 'google_pay' },
            { label: 'PayPal', value: 'paypal' },
            { label: 'Venmo', value: 'venmo' },
          ],
          admin: {
            description: 'Digital wallet type',
          },
        },
      ],
      admin: {
        description: 'Payment method details',
      },
    },
    {
      name: 'fees',
      type: 'group',
      fields: [
        {
          name: 'processingFee',
          type: 'number',
          min: 0,
          admin: {
            description: 'Processing fee charged by provider (in cents)',
            step: 1,
          },
        },
        {
          name: 'platformFee',
          type: 'number',
          min: 0,
          admin: {
            description: 'Platform fee (in cents)',
            step: 1,
          },
        },
        {
          name: 'netAmount',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Net amount after fees (in cents)',
          },
          hooks: {
            beforeChange: [
              ({ data }) => {
                if (!data) return 0;
                return (data.amount || 0) - (data.processingFee || 0) - (data.platformFee || 0);
              },
            ],
          },
        },
      ],
      admin: {
        description: 'Transaction fees and net amount',
      },
    },
    {
      name: 'webhookData',
      type: 'group',
      fields: [
        {
          name: 'webhookId',
          type: 'text',
          admin: {
            description: 'Webhook event ID from provider',
          },
        },
        {
          name: 'webhookType',
          type: 'text',
          admin: {
            description: 'Type of webhook event',
          },
        },
        {
          name: 'webhookReceivedAt',
          type: 'date',
          admin: {
            description: 'When webhook was received',
          },
        },
        {
          name: 'rawPayload',
          type: 'textarea',
          maxLength: 10000,
          admin: {
            description: 'Raw webhook payload for debugging',
            rows: 10,
          },
        },
      ],
      admin: {
        description: 'Webhook-related information',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata from payment provider',
      },
    },
    {
      name: 'failureReason',
      type: 'text',
      admin: {
        description: 'Reason for transaction failure',
        condition: (data) => data.status === 'failed',
      },
    },
    {
      name: 'refundInfo',
      type: 'group',
      fields: [
        {
          name: 'originalTransaction',
          type: 'relationship',
          relationTo: 'transactions' as any as any as any,
          admin: {
            description: 'Original transaction being refunded',
          },
        },
        {
          name: 'refundAmount',
          type: 'number',
          min: 0,
          admin: {
            description: 'Amount being refunded (in cents)',
            step: 1,
          },
        },
        {
          name: 'refundReason',
          type: 'select',
          options: [
            { label: 'Customer Request', value: 'customer_request' },
            { label: 'Duplicate', value: 'duplicate' },
            { label: 'Fraud', value: 'fraud' },
            { label: 'Product/Service Issue', value: 'service_issue' },
            { label: 'Other', value: 'other' },
          ],
          admin: {
            description: 'Reason for refund',
          },
        },
        {
          name: 'refundProcessedAt',
          type: 'date',
          admin: {
            description: 'When refund was processed',
          },
        },
      ],
      admin: {
        description: 'Refund-specific information',
        condition: (data) => data.type === 'refund',
      },
    },
    {
      name: 'reconciliation',
      type: 'group',
      fields: [
        {
          name: 'reconciled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether this transaction has been reconciled',
          },
        },
        {
          name: 'reconciledAt',
          type: 'date',
          admin: {
            description: 'When transaction was reconciled',
          },
        },
        {
          name: 'reconciledBy',
          type: 'relationship',
          relationTo: 'users' as any as any,
          admin: {
            description: 'Who reconciled this transaction',
          },
        },
        {
          name: 'reconciliationNotes',
          type: 'textarea',
          maxLength: 1000,
          admin: {
            description: 'Notes about reconciliation',
            rows: 3,
          },
        },
      ],
      admin: {
        description: 'Reconciliation status and notes',
      },
    },
    {
      name: 'processedAt',
      type: 'date',
      admin: {
        description: 'When transaction was processed by provider',
      },
    },
    {
      name: 'settledAt',
      type: 'date',
      admin: {
        description: 'When transaction was settled/funds available',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Internal notes about this transaction',
        rows: 3,
      },
    },
  ],
  timestamps: true,
};

// Helper function to generate transaction references
function generateTransactionReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `TXN-${timestamp}-${random}`;
}
