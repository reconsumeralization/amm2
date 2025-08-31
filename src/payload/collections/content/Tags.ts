// src/payload/collections/Tags.ts
import type { CollectionConfig, AccessResult } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    group: 'Content Management',
    description: 'Manage tags for organizing content and products',
    defaultColumns: ['name', 'category', 'usageCount', 'createdAt'],
    listSearchableFields: ['name', 'description'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager', 'barber'].includes((req.user as any)?.role)
    },
    create: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager'].includes((req.user as any)?.role)
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager'].includes((req.user as any)?.role)
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false
      return (req.user as any)?.role === 'admin'
    },
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user && (req.user as any)?.role !== 'admin') {
          data.tenant = (req.user as any)?.tenant?.id
        }

        // Auto-generate slug from name if not provided
        if (operation === 'create' && data.name && !data.slug) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }

        // Auto-set createdBy
        if (operation === 'create' && !data.createdBy && req.user) {
          data.createdBy = req.user.id
        }

        // Validate tag name
        if (data.name) {
          // Remove special characters except spaces and hyphens
          data.name = data.name.replace(/[^a-zA-Z0-9\s-]/g, '')
          // Trim whitespace
          data.name = data.name.trim()

          if (data.name.length < 2) {
            throw new Error('Tag name must be at least 2 characters long')
          }

          if (data.name.length > 50) {
            throw new Error('Tag name cannot exceed 50 characters')
          }
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`New tag created: ${doc.name} (${doc.category})`)
        }

        if (operation === 'update') {
          console.log(`Tag updated: ${doc.name}`)
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Tag name for display',
        placeholder: 'Tag Name',
      },
      validate: (value: any) => {
        if (!value) return 'Tag name is required'
        if (value.length < 2) return 'Tag name must be at least 2 characters long'
        if (value.length > 50) return 'Tag name cannot exceed 50 characters'
        if (!/^[a-zA-Z0-9\s-]+$/.test(value)) {
          return 'Tag name can only contain letters, numbers, spaces, and hyphens'
        }
        return true
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly version of the tag name',
        placeholder: 'tag-slug',
      },
      validate: (value: any) => {
        if (!value) return 'Tag slug is required'
        if (!/^[a-z0-9-]+$/.test(value)) {
          return 'Tag slug can only contain lowercase letters, numbers, and hyphens'
        }
        if (value.length < 2) return 'Tag slug must be at least 2 characters long'
        if (value.length > 50) return 'Tag slug cannot exceed 50 characters'
        return true
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 200,
      admin: {
        description: 'Brief description of what this tag represents',
        placeholder: 'Describe when to use this tag...',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Product', value: 'product' },
        { label: 'Service', value: 'service' },
        { label: 'Content', value: 'content' },
        { label: 'Blog', value: 'blog' },
        { label: 'Location', value: 'location' },
        { label: 'Seasonal', value: 'seasonal' },
        { label: 'Promotion', value: 'promotion' },
        { label: 'General', value: 'general' },
      ],
      defaultValue: 'general',
      required: true,
      index: true,
      admin: {
        description: 'Category this tag belongs to',
      },
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Hex color code for tag display (e.g., #FF5733)',
        placeholder: '#FF5733',
      },
      validate: (value: any) => {
        if (value && !/^#[0-9A-F]{6}$/i.test(value)) {
          return 'Please enter a valid hex color code (e.g., #FF5733)'
        }
        return true
      },
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Icon name from your icon library (e.g., tag, star, heart)',
        placeholder: 'tag',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      index: true,
      admin: {
        description: 'Tenant this tag belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      index: true,
      admin: {
        description: 'Number of times this tag has been used',
        readOnly: true,
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: {
        description: 'Whether this tag is available for use',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this tag prominently',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        description: 'User who created this tag',
        readOnly: true,
      },
    },
    {
      name: 'parentTag',
      type: 'relationship',
      relationTo: 'tags' as any as any,
      admin: {
        description: 'Parent tag for hierarchical organization',
      },
    },
    {
      name: 'synonyms',
      type: 'array',
      maxRows: 5,
      admin: {
        description: 'Alternative names or synonyms for this tag',
      },
      fields: [
        {
          name: 'synonym',
          type: 'text',
          required: true,
          maxLength: 50,
          validate: (value: any) => {
            if (!value) return 'Synonym is required'
            if (value.length > 50) return 'Synonym cannot exceed 50 characters'
            return true
          },
        },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for this tag',
      },
    },
  ],
  timestamps: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['slug'] },
    { fields: ['category', 'isActive'] },
    { fields: ['tenant', 'isActive'] },
    { fields: ['usageCount'] },
  ],
}
