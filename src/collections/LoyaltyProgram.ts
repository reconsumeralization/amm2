
import { CollectionConfig } from 'payload/types';

export const LoyaltyProgram: CollectionConfig = {
  slug: 'loyalty-program',
  admin: {
    useAsTitle: 'customer',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
    },
    {
      name: 'points',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'history',
      type: 'array',
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
        },
        {
          name: 'activity',
          type: 'text',
          required: true,
        },
        {
          name: 'points',
          type: 'number',
          required: true,
        },
      ],
    },
  ],
};
