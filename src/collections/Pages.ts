import { CollectionConfig } from 'payload';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description: 'Routes that map to content entries and control SEO/visibility.',
    defaultColumns: ['title', 'slug', 'status', 'tenant', 'updatedAt'],
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber' || req.user?.role === 'manager',
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true, index: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Path without leading slash (e.g., "about", "services/haircut").' },
      validate: (value) => {
        if (!value || value.length < 1) return 'Slug is required';
        if (!/^[a-z0-9-/]+$/.test(value)) return 'Use lowercase letters, numbers, hyphens, and slashes';
        if (value.startsWith('/')) return 'Do not include leading slash';
        return true;
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'content',
      type: 'relationship',
      relationTo: 'content',
      required: true,
      admin: { description: 'Content entry to render for this page.' },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      index: true,
    },
    {
      name: 'visibility',
      type: 'group',
      fields: [
        { name: 'listed', type: 'checkbox', defaultValue: true },
        { name: 'protected', type: 'checkbox', defaultValue: false },
        { name: 'roles', type: 'select', hasMany: true, options: [
          { label: 'Admin', value: 'admin' },
          { label: 'Manager', value: 'manager' },
          { label: 'Barber', value: 'barber' },
          { label: 'Customer', value: 'customer' },
        ], admin: { condition: (data) => data.visibility?.protected } },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'canonicalUrl', type: 'text' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Sitemap priority (0-1 represented as 0-1000).' },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
  ],
}

