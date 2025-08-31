import { CollectionConfig } from 'payload';

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    useAsTitle: 'from',
    group: 'Content',
    description: 'URL redirects for legacy paths and SEO.',
    defaultColumns: ['from', 'to', 'statusCode', 'tenant'],
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Path starting with / (e.g., /old-path)' },
      validate: (value: string | string[] | null | undefined) => {
        if (!value) return 'Path is required';
        if (Array.isArray(value)) return 'Path cannot be an array';
        if (!value.startsWith('/')) return 'Must start with /';
        return true;
      },
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      admin: { description: 'Absolute or relative destination URL.' },
    },
    {
      name: 'statusCode',
      type: 'number',
      defaultValue: 301,
      admin: { description: 'HTTP status code (301 permanent, 302 temporary).' },
    },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
}

