import type { CollectionConfig } from 'payload';

export const GiftCards: CollectionConfig = {
  slug: 'gift-cards',
  admin: {
    useAsTitle: 'code',
  },
  access: {
    read: () => true,
    create: ({ req }: any) => !!req.user && req.user.roles?.includes('admin'),
    update: ({ req }: any) => !!req.user && req.user.roles?.includes('admin'),
    delete: ({ req }: any) => !!req.user && req.user.roles?.includes('admin'),
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique gift card code',
      },
    },
    {
      name: 'balance',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Current balance of the gift card',
      },
    },
    {
      name: 'issuedTo',
      type: 'text',
      admin: {
        description: 'Name or email of the gift card recipient',
      },
    },
    {
      name: 'issuedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Staff member who issued the gift card',
      },
    },
    {
      name: 'expiryDate',
      type: 'date',
      admin: {
        description: 'Expiration date of the gift card',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this gift card is active and can be used',
      },
    },
    {
      name: 'transactions',
      type: 'array',
      admin: {
        description: 'Transaction history for this gift card',
      },
      fields: [
        {
          name: 'amount',
          type: 'number',
          required: true,
          admin: {
            description: 'Amount used in this transaction',
          },
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Purchase', value: 'purchase' },
            { label: 'Refund', value: 'refund' },
            { label: 'Adjustment', value: 'adjustment' },
          ],
        },
        {
          name: 'order',
          type: 'relationship',
          relationTo: 'orders',
          admin: {
            description: 'Associated order (if applicable)',
          },
        },
        {
          name: 'date',
          type: 'date',
          required: true,
          defaultValue: () => new Date().toISOString(),
        },
        {
          name: 'notes',
          type: 'textarea',
          admin: {
            description: 'Optional notes about this transaction',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation, payload }: any) => {
        // Calculate current balance from transactions
        if (operation === 'update' && doc.transactions) {
          let calculatedBalance = doc.transactions.reduce((total: any, transaction: any) => {
            if (transaction.type === 'purchase') {
              return total - transaction.amount;
            } else if (transaction.type === 'refund' || transaction.type === 'adjustment') {
              return total + transaction.amount;
            }
            return total;
          }, doc.balance || 0);

          if (calculatedBalance !== doc.balance) {
            await payload.update({
              collection: 'gift-cards',
              id: doc.id,
              data: { balance: calculatedBalance },
              req,
            });
          }
        }
      },
    ],
  },
};

export default GiftCards;
