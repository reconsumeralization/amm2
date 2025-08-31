// src/payload/collections/PaymentMethods.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const PaymentMethods: CollectionConfig = withDefaultHooks({
  slug: 'payment-methods',
  admin: {
    useAsTitle: 'name',
    group: 'Commerce',
    description: 'Manage payment gateways and methods',
    defaultColumns: ['name', 'provider', 'methodType', 'isActive', 'processingFee'],
    listSearchableFields: ['name', 'provider', 'methodType'],
  },
  access: {
    read: ({ req }: any) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      if (req.user.role === 'manager') return true;
      return false;
    },
    create: ({ req }: any) => {
      if (!req.user) return false;
      return ['admin', 'manager'].includes(req.user.role);
    },
    update: ({ req }: any) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      if (req.user.role === 'manager') return true;
      return false;
    },
    delete: ({ req }: any) => {
      if (!req.user) return false;
      return req.user.role === 'admin';
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name for the payment method',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of the payment method',
        rows: 3,
      },
    },
    {
      name: 'provider',
      type: 'select',
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'Square', value: 'square' },
        { label: 'Authorize.net', value: 'authorize_net' },
        { label: 'Braintree', value: 'braintree' },
        { label: 'Apple Pay', value: 'apple_pay' },
        { label: 'Google Pay', value: 'google_pay' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'Cash on Delivery', value: 'cod' },
        { label: 'Custom', value: 'custom' },
      ],
      required: true,
      admin: {
        description: 'Payment provider or gateway',
      },
    },
    {
      name: 'methodType',
      type: 'select',
      options: [
        { label: 'Credit Card', value: 'credit_card' },
        { label: 'Debit Card', value: 'debit_card' },
        { label: 'Digital Wallet', value: 'digital_wallet' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'Cash on Delivery', value: 'cod' },
        { label: 'Buy Now Pay Later', value: 'bnpl' },
        { label: 'Cryptocurrency', value: 'crypto' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
      admin: {
        description: 'Type of payment method',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this payment method is available to customers',
      },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this is the default payment method',
      },
    },
    {
      name: 'processingFee',
      type: 'group',
      admin: {
        description: 'Processing fees and rates',
      },
      fields: [
        {
          name: 'feeType',
          type: 'select',
          options: [
            { label: 'Percentage', value: 'percentage' },
            { label: 'Fixed Amount', value: 'fixed' },
            { label: 'Percentage + Fixed', value: 'percentage_plus_fixed' },
          ],
          defaultValue: 'percentage',
          admin: {
            description: 'Type of processing fee',
          },
        },
        {
          name: 'percentageRate',
          type: 'number',
          admin: {
            description: 'Percentage fee (e.g., 2.9 for 2.9%)',
            condition: (data: any) => data?.feeType === 'percentage' || data?.feeType === 'percentage_plus_fixed',
          },
        },
        {
          name: 'fixedFee',
          type: 'number',
          admin: {
            description: 'Fixed fee in cents',
            condition: (data: any) => data?.feeType === 'fixed' || data?.feeType === 'percentage_plus_fixed',
          },
        },
        {
          name: 'feeCap',
          type: 'number',
          admin: {
            description: 'Maximum fee amount in cents',
          },
        },
      ],
    },
    {
      name: 'settlement',
      type: 'group',
      admin: {
        description: 'Settlement and payout settings',
      },
      fields: [
        {
          name: 'settlementPeriod',
          type: 'select',
          options: [
            { label: 'Instant', value: 'instant' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Manual', value: 'manual' },
          ],
          defaultValue: 'daily',
          admin: {
            description: 'How often funds are settled',
          },
        },
        {
          name: 'reservePercentage',
          type: 'number',
          admin: {
            description: 'Percentage held in reserve (for chargebacks)',
          },
        },
        {
          name: 'reservePeriod',
          type: 'number',
          admin: {
            description: 'Reserve period in days',
          },
        },
      ],
    },
    {
      name: 'configuration',
      type: 'group',
      admin: {
        description: 'Provider-specific configuration',
      },
      fields: [
        {
          name: 'apiKey',
          type: 'text',
          admin: {
            description: 'API key for the payment provider',
          },
        },
        {
          name: 'apiSecret',
          type: 'text',
          admin: {
            description: 'API secret for the payment provider',
          },
        },
        {
          name: 'webhookSecret',
          type: 'text',
          admin: {
            description: 'Webhook secret for validating provider callbacks',
          },
        },
        {
          name: 'merchantId',
          type: 'text',
          admin: {
            description: 'Merchant ID from the payment provider',
          },
        },
        {
          name: 'testMode',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Whether this configuration is for testing/sandbox',
          },
        },
      ],
    },
    {
      name: 'supportedCurrencies',
      type: 'array',
      admin: {
        description: 'Currencies supported by this payment method',
      },
      fields: [
        {
          name: 'currency',
          type: 'select',
          options: [
            { label: 'USD', value: 'USD' },
            { label: 'EUR', value: 'EUR' },
            { label: 'GBP', value: 'GBP' },
            { label: 'CAD', value: 'CAD' },
            { label: 'AUD', value: 'AUD' },
            { label: 'JPY', value: 'JPY' },
            { label: 'Other', value: 'other' },
          ],
          required: true,
          admin: {
            description: 'Currency code',
          },
        },
        {
          name: 'isDefault',
          type: 'checkbox',
          admin: {
            description: 'Whether this is the default currency for this method',
          },
        },
      ],
    },
    {
      name: 'minimumAmount',
      type: 'number',
      admin: {
        description: 'Minimum transaction amount in cents',
      },
    },
    {
      name: 'maximumAmount',
      type: 'number',
      admin: {
        description: 'Maximum transaction amount in cents',
      },
    },
    {
      name: 'supportedCountries',
      type: 'array',
      admin: {
        description: 'Countries where this payment method is available',
      },
      fields: [
        {
          name: 'countryCode',
          type: 'text',
          required: true,
          admin: {
            description: 'ISO country code (e.g., US, CA, UK)',
          },
        },
        {
          name: 'countryName',
          type: 'text',
          admin: {
            description: 'Full country name',
          },
        },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      admin: {
        description: 'Payment method performance metrics',
      },
      fields: [
        {
          name: 'totalTransactions',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total number of transactions',
            readOnly: true,
          },
        },
        {
          name: 'totalVolume',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total transaction volume in cents',
            readOnly: true,
          },
        },
        {
          name: 'successRate',
          type: 'number',
          admin: {
            description: 'Success rate percentage',
            readOnly: true,
          },
        },
        {
          name: 'averageTransaction',
          type: 'number',
          admin: {
            description: 'Average transaction amount in cents',
            readOnly: true,
          },
        },
        {
          name: 'chargebackRate',
          type: 'number',
          admin: {
            description: 'Chargeback rate percentage',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order (lower numbers appear first)',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'The tenant this payment method belongs to',
        condition: (data: any, siblingData: any, { user }: any) => user?.role === 'admin',
      },
      hooks: {
        beforeChange: [
          ({ req, value }: any) => {
            if (!value && req.user && req.user.role !== 'admin') {
              return req.user.tenant?.id;
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
        if (!data.tenant && req.user && req.user.role !== 'admin') {
          data.tenant = req.user.tenant?.id;
        }

        // Calculate success rate
        if (data.analytics && data.analytics.totalTransactions && data.analytics.totalTransactions > 0) {
          // This would need to be calculated based on successful transactions
          // For now, we'll set a placeholder
          data.analytics.successRate = 95; // Default assumption
        }

        // Ensure only one default payment method
        if (data.isDefault && operation === 'create') {
          // You might want to implement logic to unset other defaults
          console.log('Setting default payment method');
        }

        return data;
      },
    ],
  },
  timestamps: true,
});
