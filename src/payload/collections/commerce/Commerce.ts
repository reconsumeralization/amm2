import { CollectionConfig } from 'payload';

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  labels: {
    singular: 'Coupon',
    plural: 'Coupons',
  },
  admin: {
    useAsTitle: 'code',
    group: 'Commerce',
    description: 'Manage discount codes and promotional offers',
    defaultColumns: ['code', 'discountType', 'amount', 'uses', 'maxUses', 'active', 'startsAt', 'endsAt'],
    listSearchableFields: ['code', 'name', 'description'],
  },
  access: {
    read: ({ req }): any => {
      if (!req.user) return { active: { equals: true } };
      if ((req.user as any)?.role === 'admin') return true;
      if (['manager', 'barber'].includes((req.user as any)?.role)) {
        return { tenant: { equals: (req.user as any)?.tenant?.id } };
      }
      // Customers can read active coupons for validation
      return {
        tenant: { equals: (req.user as any)?.tenant?.id },
        active: { equals: true },
        and: [
          { startsAt: { less_than_equal: new Date().toISOString() } },
          {
            or: [
              { endsAt: { greater_than_equal: new Date().toISOString() } },
              { endsAt: { equals: null } }
            ]
          }
        ]
      };
    },
    create: ({ req }): boolean => {
      if (!req.user) return false;
      return ['admin', 'manager'].includes((req.user as any)?.role);
    },
    update: ({ req }): any => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') {
        return { tenant: { equals: (req.user as any)?.tenant?.id } };
      }
      return false;
    },
    delete: ({ req }): any => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      // Prevent deletion if coupon has been used
      return false;
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (!data) return data;

        // Auto-assign tenant for non-admin users
        if (operation === 'create' && !data.tenant && req.user && (req.user as any)?.role !== 'admin') {
          data.tenant = (req.user as any)?.tenant?.id;
        }

        // Validate coupon code format
        if (data.code) {
          const codeRegex = /^[A-Z0-9_-]+$/i;
          if (!codeRegex.test(data.code)) {
            throw new Error('Coupon code can only contain letters, numbers, hyphens, and underscores');
          }
          if (data.code.length < 3 || data.code.length > 20) {
            throw new Error('Coupon code must be between 3 and 20 characters');
          }
        }

        // Validate discount values
        if (data.discountType && data.amount) {
          if (data.discountType === 'percent' && (data.amount < 0 || data.amount > 100)) {
            throw new Error('Percentage discount must be between 0 and 100');
          }
          if (data.discountType === 'fixed' && data.amount < 0) {
            throw new Error('Fixed discount cannot be negative');
          }
        }

        // Validate date range
        if (data.startsAt && data.endsAt && data.startsAt >= data.endsAt) {
          throw new Error('Start date must be before end date');
        }

        return data;
      },
    ],
    beforeChange: [
      async ({ data, operation, req }) => {
        if (!data) return data;

        if (operation === 'create') {
          // Ensure code is uppercase
          if (data.code) {
            data.code = data.code.toUpperCase();
          }

          // Set default values
          if (data.uses === undefined) {
            data.uses = 0;
          }

          console.log(`Creating coupon: ${data.code}`);
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`Coupon created: ${doc.code} (${doc.id})`);

          // TODO: Send notification to staff about new coupon
          // TODO: Log coupon creation for audit trail
        }

        if (operation === 'update' && doc.active === false && doc.uses > 0) {
          console.log(`Coupon deactivated: ${doc.code} (${doc.uses} uses)`);
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        if (req.payload) {
          // Check if coupon has been used in orders
          const couponUsage = await req.payload.find({
            collection: 'orders' as any as any,
            where: {
              coupon: { equals: id }
            }
          });

          if (couponUsage.totalDocs > 0) {
            throw new Error(`Cannot delete coupon that has been used in ${couponUsage.totalDocs} orders`);
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      index: true,
      admin: {
        description: 'Business this coupon belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Unique coupon code (case-insensitive, stored as uppercase)',
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.code) {
              data.code = data.code.toUpperCase();
            }
          },
        ],
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal name for this coupon',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 500,
      admin: {
        description: 'Customer-facing description of the coupon',
        rows: 3,
      },
    },
    {
      name: 'discountType',
      type: 'select',
      required: true,
      options: [
        { label: 'Percentage', value: 'percent' },
        { label: 'Fixed Amount', value: 'fixed' },
        { label: 'Free Shipping', value: 'free_shipping' },
      ],
      admin: {
        description: 'Type of discount',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Discount value (percentage for percent type, amount in cents for fixed type)',
        step: 1,
        condition: (data) => data.discountType && data.discountType !== 'free_shipping',
      },
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'USD',
      options: [
        { label: 'US Dollar', value: 'USD' },
        { label: 'Euro', value: 'EUR' },
        { label: 'British Pound', value: 'GBP' },
        { label: 'Canadian Dollar', value: 'CAD' },
      ],
      admin: {
        description: 'Currency for fixed amount discounts',
        condition: (data) => data.discountType === 'fixed',
      },
    },
    {
      name: 'startsAt',
      type: 'date',
      admin: {
        description: 'Date when coupon becomes active (leave empty for immediate activation)',
      },
    },
    {
      name: 'endsAt',
      type: 'date',
      admin: {
        description: 'Date when coupon expires (leave empty for no expiration)',
      },
    },
    {
      name: 'maxUses',
      type: 'number',
      min: 0,
      admin: {
        description: 'Maximum number of times this coupon can be used (0 = unlimited)',
      },
    },
    {
      name: 'maxUsesPerUser',
      type: 'number',
      min: 1,
      defaultValue: 1,
      admin: {
        description: 'Maximum uses per customer',
      },
    },
    {
      name: 'uses',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Current number of uses',
        position: 'sidebar',
      },
    },
    {
      name: 'minimumPurchase',
      type: 'number',
      min: 0,
      admin: {
        description: 'Minimum purchase amount required (in cents, 0 = no minimum)',
        step: 1,
      },
    },
    {
      name: 'maximumDiscount',
      type: 'number',
      min: 0,
      admin: {
        description: 'Maximum discount amount (in cents, for percentage discounts)',
        step: 1,
        condition: (data) => data.discountType === 'percent',
      },
    },
    {
      name: 'applicableProducts',
      type: 'relationship',
      relationTo: 'products' as any as any,
      hasMany: true,
      filterOptions: ({ data }): any => {
        if (!data?.tenant) return false;
        return {
          tenant: { equals: data.tenant },
          isActive: { equals: true }
        };
      },
      admin: {
        description: 'Specific products this coupon applies to (leave empty for all products)',
      },
    },
    {
      name: 'excludedProducts',
      type: 'relationship',
      relationTo: 'products' as any as any,
      hasMany: true,
      filterOptions: ({ data }): any => {
        if (!data?.tenant) return false;
        return {
          tenant: { equals: data.tenant },
          isActive: { equals: true }
        };
      },
      admin: {
        description: 'Products excluded from this coupon',
      },
    },
    {
      name: 'applicableServices',
      type: 'relationship',
      relationTo: 'services' as any as any,
      hasMany: true,
      filterOptions: ({ data }): any => {
        if (!data?.tenant) return false;
        return {
          tenant: { equals: data.tenant },
          isActive: { equals: true }
        };
      },
      admin: {
        description: 'Specific services this coupon applies to (leave empty for all services)',
      },
    },
    {
      name: 'customerEligibility',
      type: 'group',
      fields: [
        {
          name: 'firstTimeCustomersOnly',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Only available to first-time customers',
          },
        },
        {
          name: 'minimumLoyaltyPoints',
          type: 'number',
          min: 0,
          admin: {
            description: 'Minimum loyalty points required',
          },
        },
        {
          name: 'specificCustomers',
          type: 'relationship',
          relationTo: 'users' as any as any,
          hasMany: true,
          filterOptions: ({ data }): any => {
            if (!data?.tenant) return false;
            return {
              tenant: { equals: data.tenant },
              role: { equals: 'customer' }
            };
          },
          admin: {
            description: 'Specific customers this coupon applies to (leave empty for all eligible customers)',
          },
        },
      ],
      admin: {
        description: 'Customer eligibility requirements',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      admin: {
        description: 'Is this coupon currently active?',
      },
    },
    {
      name: 'usageHistory',
      type: 'array',
      admin: {
        readOnly: true,
        description: 'History of coupon usage',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'order',
          type: 'relationship',
          relationTo: 'orders' as any as any,
          required: true,
        },
        {
          name: 'customer',
          type: 'relationship',
          relationTo: 'users' as any as any,
          required: true,
        },
        {
          name: 'usedAt',
          type: 'date',
          required: true,
        },
        {
          name: 'discountAmount',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Discount amount applied (in cents)',
          },
        },
      ],
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        readOnly: true,
        description: 'User who created this coupon',
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Internal notes about this coupon',
        rows: 3,
      },
    },
    {
      name: 'analytics',
      type: 'group',
      admin: {
        description: 'Usage analytics',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'totalRevenue',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Total revenue from orders using this coupon',
          },
        },
        {
          name: 'averageOrderValue',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Average order value for coupon users',
          },
        },
        {
          name: 'conversionRate',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Percentage of coupon views that result in purchases',
          },
        },
      ],
    },
  ],
  timestamps: true,
};