import { CollectionConfig } from 'payload';

export const NavigationMenus: CollectionConfig = {
  slug: 'navigationMenus',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    description: 'Reusable navigation menus with hierarchical items.',
    defaultColumns: ['name', 'location', 'tenant', 'updatedAt'],
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber' || req.user?.role === 'manager',
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', required: true, index: true },
    {
      name: 'location',
      type: 'select',
      options: [
        { label: 'Header', value: 'header' },
        { label: 'Footer', value: 'footer' },
        { label: 'Sidebar', value: 'sidebar' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'header',
      index: true,
    },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Item', plural: 'Items' },
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'linkType',
          type: 'select',
          options: [
            { label: 'Internal Page', value: 'page' },
            { label: 'External URL', value: 'external' },
            { label: 'Content Entry', value: 'content' },
          ],
          defaultValue: 'page',
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          admin: { condition: (data) => data.linkType === 'page' },
        },
        {
          name: 'content',
          type: 'relationship',
          relationTo: 'content',
          admin: { condition: (data) => data.linkType === 'content' },
        },
        {
          name: 'url',
          type: 'text',
          admin: { condition: (data) => data.linkType === 'external' },
        },
        { name: 'newTab', type: 'checkbox', defaultValue: false },
        { name: 'icon', type: 'text' },
        { name: 'order', type: 'number', defaultValue: 0 },
        {
          name: 'children',
          type: 'array',
          admin: { description: 'Nested child menu items.' },
          fields: [
            { name: 'label', type: 'text', required: true },
            {
              name: 'linkType',
              type: 'select',
              options: [
                { label: 'Internal Page', value: 'page' },
                { label: 'External URL', value: 'external' },
                { label: 'Content Entry', value: 'content' },
              ],
              defaultValue: 'page',
            },
            { name: 'page', type: 'relationship', relationTo: 'pages', admin: { condition: (data) => data.linkType === 'page' } },
            { name: 'content', type: 'relationship', relationTo: 'content', admin: { condition: (data) => data.linkType === 'content' } },
            { name: 'url', type: 'text', admin: { condition: (data) => data.linkType === 'external' } },
            { name: 'newTab', type: 'checkbox', defaultValue: false },
            { name: 'icon', type: 'text' },
            { name: 'order', type: 'number', defaultValue: 0 },
          ],
        },
      ],
    },
  ],
}

