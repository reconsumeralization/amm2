import type { CollectionConfig } from 'payload';

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'code',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      // Only authenticated users with proper tenant access
      if (req.user.role === 'admin' || req.user.role === 'manager') {
        return req.user.tenant ? { tenant: { equals: req.user.tenant.id } } : false;
      }
      return false;
    },
    create: ({ req }: any) => !!req.user && req.user?.role === 'admin',
    update: ({ req }: any) => !!req.user && req.user?.role === 'admin',
    delete: ({ req }: any) => !!req.user && req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique coupon code for customers to use',
      },
    },
    {
      name: 'discountType',
      type: 'select',
      required: true,
      options: [
        { label: 'Percentage', value: 'percent' },
        { label: 'Fixed Amount', value: 'fixed' },
      ],
      defaultValue: 'percent',
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Discount amount (percentage or fixed value)',
      },
    },
    {
      name: 'startsAt',
      type: 'date',
      admin: {
        description: 'When the coupon becomes active',
      },
    },
    {
      name: 'endsAt',
      type: 'date',
      admin: {
        description: 'When the coupon expires',
      },
    },
    {
      name: 'maxUses',
      type: 'number',
      min: 1,
      admin: {
        description: 'Maximum number of times this coupon can be used (leave empty for unlimited)',
      },
    },
    {
      name: 'uses',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Number of times this coupon has been used',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this coupon is currently active',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation, payload }: any) => {
        if (operation === 'create' && doc.uses == null) {
          await payload.update({
            collection: 'coupons',
            id: doc.id,
            data: { uses: 0 },
            req,
          });
        }
      },
    ],
  },
};

export default Coupons;
