import { CollectionConfig } from 'payload';

export const Content: CollectionConfig = {
  slug: 'content',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description: 'Page content and layouts created with the visual page builder.',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber',
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Page title for display purposes.' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Unique identifier for the page (e.g., "home", "services").' },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: { description: 'Tenant this content belongs to.' },
    },
    {
      name: 'content',
      type: 'json',
      required: true,
      admin: { 
        description: 'JSON representation of page builder components.',
        readOnly: false,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published', 'archived'],
      defaultValue: 'draft',
      admin: { description: 'Content publication status.' },
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        {
          name: 'description',
          type: 'textarea',
          admin: { description: 'Page meta description for SEO.' },
        },
        {
          name: 'keywords',
          type: 'text',
          admin: { description: 'Comma-separated keywords for SEO.' },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Open Graph image for social sharing.' },
        },
      ],
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user) {
          if (!data.createdBy) {
            data.createdBy = req.user.id;
          }
          data.updatedBy = req.user.id;
        }
        return data;
      },
    ],
  },
  indexes: [
    { fields: ['tenant', 'slug'] },
    { fields: ['status'] },
    { fields: ['createdBy'] },
  ],
};
