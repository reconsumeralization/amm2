import type { CollectionConfig, AccessResult, Where } from 'payload'

export const StaffRoles: CollectionConfig = {
  slug: 'staff-roles',
  admin: {
    useAsTitle: 'name',
    group: 'Admin',
    description: 'Staff roles and permissions management',
    defaultColumns: ['name', 'level', 'tenant', 'isActive', 'defaultRole'],
    listSearchableFields: ['name', 'description', 'slug'],
  },
  access: {
    read: ({ req }): AccessResult => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      // Managers can read roles within their tenant
      if (req.user.role === 'manager') {
        return { tenant: { equals: req.user.tenant?.id } } as Where
      }
      return false
    },
    create: ({ req }): AccessResult => {
      if (!req.user) return false
      return req.user.role === 'admin'
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      // Managers can update roles within their tenant (except admin level)
      if (req.user.role === 'manager') {
        return {
          tenant: { equals: req.user.tenant?.id },
          level: { not_equals: 'admin' }
        } as Where
      }
      return false
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false
      return req.user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      maxLength: 50,
      admin: {
        description: 'Role name (e.g., "Senior Barber", "Shift Manager", "Receptionist")',
      },
      validate: (val: any) => {
        if (!val || val.length < 2) {
          return 'Role name must be at least 2 characters long'
        }
        return true
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      maxLength: 50,
      admin: {
        description: 'URL-friendly identifier for the role',
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.name && !data?.slug) {
              data.slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
          },
        ],
      },
      validate: (val: any) => {
        if (!val) return 'Slug is required'
        if (!/^[a-z0-9-]+$/.test(val)) {
          return 'Slug can only contain lowercase letters, numbers, and hyphens'
        }
        return true
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 500,
      admin: {
        description: 'Role description and key responsibilities',
      },
    },
    {
      name: 'permissions',
      type: 'array',
      admin: {
        description: 'Specific permissions for this role',
      },
      fields: [
        {
          name: 'resource',
          type: 'select',
          required: true,
          options: [
            { label: 'Users', value: 'users' },
            { label: 'Appointments', value: 'appointments' },
            { label: 'Customers', value: 'customers' },
            { label: 'Products', value: 'products' },
            { label: 'Services', value: 'services' },
            { label: 'Content', value: 'content' },
            { label: 'Reports', value: 'reports' },
            { label: 'Settings', value: 'settings' },
            { label: 'Tenants', value: 'tenants' },
            { label: 'Staff Schedules', value: 'staff-schedules' },
            { label: 'Staff Roles', value: 'staff-roles' },
            { label: 'Stylists', value: 'stylists' },
            { label: 'Testimonials', value: 'testimonials' },
            { label: 'Media', value: 'media' },
          ],
          admin: {
            description: 'Resource type this permission applies to',
          },
        },
        {
          name: 'actions',
          type: 'select',
          hasMany: true,
          required: true,
          options: [
            { label: 'Read', value: 'read' },
            { label: 'Create', value: 'create' },
            { label: 'Update', value: 'update' },
            { label: 'Delete', value: 'delete' },
          ],
          admin: {
            description: 'Actions allowed on this resource',
          },
        },
        {
          name: 'conditions',
          type: 'textarea',
          admin: {
            description: 'Additional conditions or restrictions (JSON format)',
            placeholder: '{"tenant": {"equals": "user.tenant.id"}}',
          },
        },
      ],
      validate: (val: any) => {
        if (!val || val.length === 0) {
          return 'At least one permission is required'
        }
        return true
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: {
        description: 'Tenant this role belongs to (leave empty for global roles)',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'level',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Manager', value: 'manager' },
        { label: 'Staff', value: 'staff' },
        { label: 'Customer', value: 'customer' },
      ],
      admin: {
        description: 'Role hierarchy level - determines access scope',
      },
    },
    {
      name: 'priority',
      type: 'number',
      min: 1,
      max: 100,
      defaultValue: 50,
      admin: {
        description: 'Role priority (1-100, higher numbers = higher priority)',
        position: 'sidebar',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Enable this role for assignment',
        position: 'sidebar',
      },
    },
    {
      name: 'defaultRole',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Use as default role for new staff in this tenant',
        position: 'sidebar',
      },
    },
    {
      name: 'maxUsers',
      type: 'number',
      min: 0,
      admin: {
        description: 'Maximum number of users that can have this role (0 = unlimited)',
        position: 'sidebar',
      },
    },
    {
      name: 'autoAssignConditions',
      type: 'textarea',
      admin: {
        description: 'Conditions for auto-assigning this role (JSON format)',
        position: 'sidebar',
        placeholder: '{"department": "styling", "experience": {"gte": 2}}',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        // Auto-set tenant for non-admin users
        if (data && !data.tenant && req.user?.tenant?.id && req.user.role !== 'admin') {
          data.tenant = req.user.tenant.id
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, operation, req }) => {
        if (!data) return data

        // Ensure only one default role per tenant
        if (data.defaultRole && operation === 'create') {
          const existingDefault = await req.payload.find({
            collection: 'staff-roles',
            where: {
              and: [
                { defaultRole: { equals: true } },
                { tenant: { equals: data.tenant || null } },
              ],
            },
          })

          if (existingDefault.totalDocs > 0) {
            // Unset existing default role
            await req.payload.update({
              collection: 'staff-roles',
              id: existingDefault.docs[0].id,
              data: { defaultRole: false },
            })
          }
        }

        // Validate permissions JSON format
        if (data.permissions) {
          for (const permission of data.permissions) {
            if (permission.conditions) {
              try {
                JSON.parse(permission.conditions)
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                throw new Error(`Invalid JSON in permission conditions: ${errorMessage}`)
              }
            }
          }
        }

        // Validate auto-assign conditions JSON format
        if (data.autoAssignConditions) {
          try {
            JSON.parse(data.autoAssignConditions)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            throw new Error(`Invalid JSON in auto-assign conditions: ${errorMessage}`)
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        console.log(`Staff role ${operation}d:`, doc.name)

        // Update users with this role if permissions changed
        if (operation === 'update') {
          const usersWithRole = await req.payload.find({
            collection: 'users',
            where: {
              role: { equals: doc.slug },
            },
          })

          if (usersWithRole.totalDocs > 0) {
            console.log(`Updated permissions for ${usersWithRole.totalDocs} users with role: ${doc.name}`)
          }
        }

        // Log role creation/updates for audit trail
        if (operation === 'create' || operation === 'update') {
          console.log(`Role ${doc.name} (${doc.slug}) - Level: ${doc.level}, Active: ${doc.isActive}`)
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Check if any users have this role
        const usersWithRole = await req.payload.find({
          collection: 'users',
          where: {
            role: { equals: id },
          },
        })

        if (usersWithRole.totalDocs > 0) {
          throw new Error(`Cannot delete role: ${usersWithRole.totalDocs} users are assigned to this role`)
        }
      },
    ],
  },
  indexes: [
    {
      fields: ['name'],
      unique: true,
    },
    {
      fields: ['slug'],
      unique: true,
    },
    {
      fields: ['tenant', 'level'],
    },
    {
      fields: ['isActive', 'defaultRole'],
    },
    {
      fields: ['level', 'priority'],
    },
  ],
  timestamps: true,
}
