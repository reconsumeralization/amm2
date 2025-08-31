import { CollectionConfig } from 'payload';

export const MediaFolders: CollectionConfig = {
  slug: 'mediaFolders',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    description: 'Organize media files into folders for better management.',
    defaultColumns: ['name', 'parent', 'mediaCount', 'updatedAt'],
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber' || req.user?.role === 'manager',
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber' || req.user?.role === 'manager',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber' || req.user?.role === 'manager',
    delete: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value || value.trim().length === 0) return 'Name is required';
        if (value.length > 100) return 'Name too long (max 100 characters)';
        // Check for invalid characters
        if (!/^[a-zA-Z0-9\s\-_()]+$/.test(value)) {
          return 'Name can only contain letters, numbers, spaces, hyphens, underscores, and parentheses';
        }
        return true;
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Optional description for the folder.' },
      validate: (value: string | null | undefined) => {
        if (value && value.length > 500) return 'Description too long (max 500 characters)';
        return true;
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'mediaFolders',
      admin: { 
        description: 'Parent folder (leave empty for root level).',
        position: 'sidebar',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: { 
        description: 'Tenant this folder belongs to.',
        position: 'sidebar',
      },
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'URL-friendly version of the folder name.',
        readOnly: true,
      },
    },
    {
      name: 'path',
      type: 'text',
      admin: {
        description: 'Full path to this folder.',
        readOnly: true,
      },
    },
    {
      name: 'color',
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Yellow', value: 'yellow' },
        { label: 'Red', value: 'red' },
        { label: 'Purple', value: 'purple' },
        { label: 'Orange', value: 'orange' },
        { label: 'Pink', value: 'pink' },
      ],
      defaultValue: 'default',
      admin: {
        description: 'Color coding for visual organization.',
        position: 'sidebar',
      },
    },
    {
      name: 'isSystem',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'System folder (cannot be deleted by users).',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'mediaCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of media files in this folder.',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'permissions',
      type: 'group',
      admin: { 
        description: 'Access permissions for this folder.',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'allowedUsers',
          type: 'relationship',
          relationTo: 'users',
          hasMany: true,
          admin: { description: 'Specific users allowed to access this folder.' },
        },
        {
          name: 'allowedRoles',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Manager', value: 'manager' },
            { label: 'Barber', value: 'barber' },
            { label: 'Customer', value: 'customer' },
          ],
          defaultValue: ['admin', 'manager', 'barber'],
          admin: { description: 'User roles allowed to access this folder.' },
        },
      ],
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { 
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { 
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (req.user) {
          if (operation === 'create') {
            data.createdBy = req.user.id;
          }
          data.updatedBy = req.user.id;
        }

        // Generate slug from name
        if (data.name) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s\-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim();
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Update path after creation/update
        const payload = req.payload;
        
        let path = doc.name;
        if (doc.parent) {
          const parent = await payload.findByID({
            collection: 'mediaFolders',
            id: doc.parent,
          });
          if (parent) {
            path = `${parent.path}/${doc.name}`;
          }
        }

        if (path !== doc.path) {
          await payload.update({
            collection: 'mediaFolders',
            id: doc.id,
            data: { path },
          });
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const payload = req.payload;
        
        // Check if folder has children
        const children = await payload.find({
          collection: 'mediaFolders',
          where: { parent: { equals: id } },
          limit: 1,
        });

        if (children.totalDocs > 0) {
          throw new Error('Cannot delete folder that contains subfolders. Please delete or move subfolders first.');
        }

        // Check if folder has media files
        const media = await payload.find({
          collection: 'media',
          where: { 'folders.folder': { equals: id } },
          limit: 1,
        });

        if (media.totalDocs > 0) {
          throw new Error('Cannot delete folder that contains media files. Please move or delete files first.');
        }

        return true;
      },
    ],
  },
  indexes: [
    { fields: ['tenant', 'name'] },
    { fields: ['parent'] },
    { fields: ['slug'] },
    { fields: ['createdAt'] },
    { fields: ['updatedAt'] },
  ],
  timestamps: true,
};
