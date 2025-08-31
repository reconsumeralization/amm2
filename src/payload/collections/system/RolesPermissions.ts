// src/payload/collections/RolesPermissions.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const RolesPermissions: CollectionConfig = withDefaultHooks({
  slug: 'roles-permissions',
  admin: {
    useAsTitle: 'name',
    group: 'Admin',
    description: 'Manage custom roles and granular permissions',
    defaultColumns: ['name', 'description', 'isActive', 'userCount'],
    listSearchableFields: ['name', 'description'],
  },
  access: {
    read: ({ req }: any) => {
      if (!req.user) return false;
      return req.user.role === 'admin';
    },
    create: ({ req }: any) => {
      if (!req.user) return false;
      return req.user.role === 'admin';
    },
    update: ({ req }: any) => {
      if (!req.user) return false;
      return req.user.role === 'admin';
    },
    delete: ({ req }: any) => {
      if (!req.user) return false;
      return req.user.role === 'admin';
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Role name (e.g., Manager, Editor, Sales)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what this role can do',
        rows: 3,
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this role is currently active',
      },
    },
    {
      name: 'isSystemRole',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this is a built-in system role (cannot be deleted)',
      },
    },
    {
      name: 'permissions',
      type: 'group',
      admin: {
        description: 'Granular permissions for this role',
      },
      fields: [
        {
          name: 'collections',
          type: 'group',
          admin: {
            description: 'Collection-level permissions',
          },
          fields: [
            {
              name: 'users',
              type: 'group',
              admin: {
                description: 'User management permissions',
              },
              fields: [
                { name: 'read', type: 'checkbox', defaultValue: false },
                { name: 'create', type: 'checkbox', defaultValue: false },
                { name: 'update', type: 'checkbox', defaultValue: false },
                { name: 'delete', type: 'checkbox', defaultValue: false },
              ],
            },
            {
              name: 'products',
              type: 'group',
              admin: {
                description: 'Product management permissions',
              },
              fields: [
                { name: 'read', type: 'checkbox', defaultValue: false },
                { name: 'create', type: 'checkbox', defaultValue: false },
                { name: 'update', type: 'checkbox', defaultValue: false },
                { name: 'delete', type: 'checkbox', defaultValue: false },
              ],
            },
            {
              name: 'orders',
              type: 'group',
              admin: {
                description: 'Order management permissions',
              },
              fields: [
                { name: 'read', type: 'checkbox', defaultValue: false },
                { name: 'create', type: 'checkbox', defaultValue: false },
                { name: 'update', type: 'checkbox', defaultValue: false },
                { name: 'delete', type: 'checkbox', defaultValue: false },
              ],
            },
            {
              name: 'content',
              type: 'group',
              admin: {
                description: 'Content management permissions',
              },
              fields: [
                { name: 'read', type: 'checkbox', defaultValue: false },
                { name: 'create', type: 'checkbox', defaultValue: false },
                { name: 'update', type: 'checkbox', defaultValue: false },
                { name: 'delete', type: 'checkbox', defaultValue: false },
              ],
            },
          ],
        },
        {
          name: 'features',
          type: 'group',
          admin: {
            description: 'Feature-level permissions',
          },
          fields: [
            {
              name: 'analytics',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Access to analytics and reporting',
              },
            },
            {
              name: 'marketing',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Access to marketing tools and campaigns',
              },
            },
            {
              name: 'settings',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Access to system settings',
              },
            },
            {
              name: 'exports',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Ability to export data',
              },
            },
          ],
        },
        {
          name: 'restrictions',
          type: 'group',
          admin: {
            description: 'Additional restrictions and limits',
          },
          fields: [
            {
              name: 'maxLoginAttempts',
              type: 'number',
              defaultValue: 5,
              admin: {
                description: 'Maximum login attempts before lockout',
              },
            },
            {
              name: 'sessionTimeout',
              type: 'number',
              defaultValue: 480, // 8 hours in minutes
              admin: {
                description: 'Session timeout in minutes',
              },
            },
            {
              name: 'requireMfa',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Require multi-factor authentication',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'assignedUsers',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Users assigned to this role',
        readOnly: true,
      },
    },
    {
      name: 'userCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of users with this role',
        readOnly: true,
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who created this role',
        readOnly: true,
      },
    },
    {
      name: 'parentRole',
      type: 'relationship',
      relationTo: 'roles-permissions',
      admin: {
        description: 'Parent role to inherit permissions from',
      },
    },
    {
      name: 'hierarchyLevel',
      type: 'number',
      defaultValue: 1,
      admin: {
        description: 'Role hierarchy level (higher numbers have more authority)',
        readOnly: true,
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'The tenant this role belongs to',
        condition: (data: any, siblingData: any, { user }: any) => user?.role === 'admin',
      },
      hooks: {
        beforeChange: [
          ({ req, value }: any) => {
            if (!value && req.user && req.user.role !== 'admin') {
              return req.user.tenant?.id;
            }
            return value;
          },
        ],
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req }: any) => {
        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user && req.user.role !== 'admin') {
          data.tenant = req.user.tenant?.id;
        }

        // Set created by
        if (operation === 'create' && req.user) {
          data.createdBy = req.user.id;
        }

        // Mark system roles
        if (['admin', 'manager', 'user'].includes(data.name?.toLowerCase())) {
          data.isSystemRole = true;
        }

        // Calculate hierarchy level based on parent
        if (data.parentRole) {
          // This would need to be calculated recursively
          data.hierarchyLevel = 2; // Placeholder
        }

        return data;
      },
    ],
    beforeDelete: [
      ({ data, req }: any) => {
        // Prevent deletion of system roles
        if (data.isSystemRole) {
          throw new Error('System roles cannot be deleted');
        }

        // Check if role has assigned users
        if (data.userCount && data.userCount > 0) {
          throw new Error('Cannot delete role with assigned users. Reassign users first.');
        }

        return data;
      },
    ],
  },
  timestamps: true,
});
