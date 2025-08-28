import { CollectionConfig } from 'payload/types';
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: { useAsTitle: 'content' },
  access: {
    read: ({ req }) => ({ tenant: { equals: req.user?.tenant?.id } }),
    create: ({ req }) => req.user?.role === 'client' || req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'content', type: 'text', required: true },
    { name: 'barber', type: 'relationship', relationTo: 'users', required: true },
    { name: 'client', type: 'relationship', relationTo: 'users' },
    { name: 'likes', type: 'number', defaultValue: 0 },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true },
    { name: 'status', type: 'select', options: ['pending', 'approved', 'rejected'], defaultValue: 'pending' },
  ],
};
