import { CollectionConfig } from 'payload';

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    group: 'Admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'availability',
      type: 'group',
      fields: [
        { name: 'days', type: 'array', fields: [{ name: 'day', type: 'text' }] },
        { name: 'hours', type: 'text', defaultValue: '9:00 AM - 5:00 PM' },
      ],
    },
  ],
};