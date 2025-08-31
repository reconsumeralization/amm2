// src/payload/collections/Redirects.ts
import type { CollectionConfig, AccessResult } from 'payload'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    useAsTitle: 'from',
    group: 'SEO & Admin',
    description: 'Manage URL redirects for SEO and content migration',
    defaultColumns: ['from', 'to', 'status', 'active', 'updatedAt'],
    listSearchableFields: ['from', 'to'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager'].includes(req.user.role)
    },
    create: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager'].includes(req.user.role)
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager'].includes(req.user.role)
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false
      return req.user.role === 'admin'
    },
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user && req.user.role !== 'admin') {
          data.tenant = req.user.tenant?.id
        }

        // Validate URL formats
        if (data.from) {
          // Ensure from URL starts with /
          if (!data.from.startsWith('/')) {
            data.from = '/' + data.from
          }
          // Remove trailing slash unless it's just /
          if (data.from !== '/' && data.from.endsWith('/')) {
            data.from = data.from.slice(0, -1)
          }
        }

        if (data.to) {
          // Validate that 'to' is a valid URL or relative path
          if (!data.to.startsWith('/') && !data.to.startsWith('http')) {
            throw new Error('Redirect destination must be a relative path (starting with /) or absolute URL')
          }
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`New redirect created: ${doc.from} → ${doc.to} (${doc.status})`)
        }

        if (operation === 'update') {
          console.log(`Redirect updated: ${doc.from} → ${doc.to} (${doc.status})`)
        }

        // TODO: Clear redirect cache if using caching layer
      },
    ],
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Source URL path (e.g., /old-page)',
        placeholder: '/old-page-url',
      },
      validate: (value: any) => {
        if (!value) return 'From URL is required'
        if (!value.startsWith('/')) return 'From URL must start with /'
        if (value.includes(' ')) return 'From URL cannot contain spaces'
        return true
      },
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Destination URL (absolute or relative path)',
        placeholder: '/new-page-url or https://example.com/new-url',
      },
      validate: (value: any) => {
        if (!value) return 'To URL is required'
        if (!value.startsWith('/') && !value.startsWith('http')) {
          return 'To URL must be a relative path (starting with /) or absolute URL'
        }
        return true
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: '301 - Permanent Redirect', value: '301' },
        { label: '302 - Temporary Redirect', value: '302' },
        { label: '307 - Temporary Redirect (POST)', value: '307' },
        { label: '308 - Permanent Redirect (POST)', value: '308' },
      ],
      defaultValue: '301',
      required: true,
      admin: {
        description: 'HTTP redirect status code',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: {
        description: 'Enable this redirect',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: {
        description: 'Tenant this redirect belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 200,
      admin: {
        description: 'Optional description of why this redirect exists',
        placeholder: 'Reason for redirect (e.g., page moved, URL cleanup)',
      },
    },
    {
      name: 'hits',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Number of times this redirect has been used',
        readOnly: true,
      },
    },
    {
      name: 'lastHit',
      type: 'date',
      admin: {
        description: 'Last time this redirect was accessed',
        readOnly: true,
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who created this redirect',
        readOnly: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this redirect',
      },
    },
  ],
  timestamps: true,
  indexes: [
    { fields: ['from'] },
    { fields: ['active', 'tenant'] },
    { fields: ['hits'] },
  ],
}
