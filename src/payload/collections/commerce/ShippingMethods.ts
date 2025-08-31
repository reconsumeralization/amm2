// src/payload/collections/ShippingMethods.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const ShippingMethods: CollectionConfig = withDefaultHooks({
  slug: 'shipping-methods',
  admin: {
    useAsTitle: 'name',
    group: 'Commerce',
    description: 'Manage shipping options and rates',
    defaultColumns: ['name', 'carrier', 'serviceType', 'baseRate', 'estimatedDays', 'isActive'],
    listSearchableFields: ['name', 'carrier', 'serviceType'],
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
        description: 'Display name for the shipping method',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of the shipping method',
        rows: 3,
      },
    },
    {
      name: 'carrier',
      type: 'text',
      required: true,
      admin: {
        description: 'Shipping carrier (UPS, FedEx, USPS, etc.)',
      },
    },
    {
      name: 'serviceType',
      type: 'text',
      required: true,
      admin: {
        description: 'Service type (Ground, Express, Overnight, etc.)',
      },
    },
    {
      name: 'carrierServiceCode',
      type: 'text',
      admin: {
        description: 'Carrier-specific service code for API integration',
      },
    },
    {
      name: 'baseRate',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Base shipping rate in cents',
        step: 1,
      },
    },
    {
      name: 'rateType',
      type: 'select',
      options: [
        { label: 'Flat Rate', value: 'flat' },
        { label: 'Weight Based', value: 'weight' },
        { label: 'Percentage of Order', value: 'percentage' },
        { label: 'Tiered', value: 'tiered' },
      ],
      defaultValue: 'flat',
      admin: {
        description: 'How the shipping rate is calculated',
      },
    },
    {
      name: 'weightTiers',
      type: 'array',
      admin: {
        description: 'Weight-based pricing tiers',
        condition: (data: any) => data?.rateType === 'weight' || data?.rateType === 'tiered',
      },
      fields: [
        {
          name: 'minWeight',
          type: 'number',
          required: true,
          admin: {
            description: 'Minimum weight in pounds',
          },
        },
        {
          name: 'maxWeight',
          type: 'number',
          admin: {
            description: 'Maximum weight in pounds',
          },
        },
        {
          name: 'rate',
          type: 'number',
          required: true,
          admin: {
            description: 'Shipping rate for this weight range in cents',
          },
        },
      ],
    },
    {
      name: 'percentageRate',
      type: 'number',
      admin: {
        description: 'Percentage of order total (e.g., 5 for 5%)',
        condition: (data: any) => data?.rateType === 'percentage',
      },
      validate: (value: any, { data }: any) => {
        if (data?.rateType === 'percentage' && (!value || value <= 0 || value > 100)) {
          return 'Percentage must be between 1 and 100';
        }
        return true;
      },
    },
    {
      name: 'freeShippingThreshold',
      type: 'number',
      admin: {
        description: 'Order total threshold for free shipping in cents',
      },
    },
    {
      name: 'estimatedDays',
      type: 'number',
      admin: {
        description: 'Estimated delivery time in business days',
      },
    },
    {
      name: 'deliveryWindow',
      type: 'group',
      admin: {
        description: 'Delivery time window',
      },
      fields: [
        {
          name: 'minDays',
          type: 'number',
          admin: {
            description: 'Minimum delivery days',
          },
        },
        {
          name: 'maxDays',
          type: 'number',
          admin: {
            description: 'Maximum delivery days',
          },
        },
      ],
    },
    {
      name: 'trackingAvailable',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether tracking is available for this method',
      },
    },
    {
      name: 'signatureRequired',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether signature is required for delivery',
      },
    },
    {
      name: 'insuranceAvailable',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether shipping insurance is available',
      },
    },
    {
      name: 'international',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this method supports international shipping',
      },
    },
    {
      name: 'restrictedCountries',
      type: 'array',
      admin: {
        description: 'Countries where this shipping method is not available',
        condition: (data: any) => data?.international === true,
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
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this shipping method is currently available',
      },
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
      name: 'handlingFee',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Additional handling fee in cents',
      },
    },
    {
      name: 'taxRate',
      type: 'number',
      admin: {
        description: 'Tax rate applied to shipping (percentage)',
      },
    },
    {
      name: 'apiSettings',
      type: 'group',
      admin: {
        description: 'API settings for carrier integration',
      },
      fields: [
        {
          name: 'apiEnabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether to use carrier API for rates',
          },
        },
        {
          name: 'apiKey',
          type: 'text',
          admin: {
            description: 'API key for carrier integration',
            condition: (data: any) => data?.apiSettings?.apiEnabled,
          },
        },
        {
          name: 'accountNumber',
          type: 'text',
          admin: {
            description: 'Carrier account number',
            condition: (data: any) => data?.apiSettings?.apiEnabled,
          },
        },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'The tenant this shipping method belongs to',
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

        // Set estimated days from delivery window if not set
        if (!data.estimatedDays && data.deliveryWindow) {
          const { minDays, maxDays } = data.deliveryWindow;
          if (minDays && maxDays) {
            data.estimatedDays = Math.round((minDays + maxDays) / 2);
          } else if (minDays) {
            data.estimatedDays = minDays;
          } else if (maxDays) {
            data.estimatedDays = maxDays;
          }
        }

        return data;
      },
    ],
  },
  timestamps: true,
});
