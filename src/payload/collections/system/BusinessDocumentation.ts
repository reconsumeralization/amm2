import type { CollectionConfig, AccessResult, Where } from 'payload'

export const BusinessDocumentation: CollectionConfig = {
  slug: 'business-documentation',
  labels: {
    singular: 'Business Document',
    plural: 'Business Documentation',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'tenant', 'isPublic', 'status', 'version', 'updatedAt'],
    group: 'Content',
    description: 'Manage business documentation, policies, and procedures',
    listSearchableFields: ['title', 'content', 'tags.tag', 'category', 'summary', 'keywords'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
    preview: (doc) => `${doc.title} v${doc.version} - ${doc.category}`,
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  access: {
    read: ({ req }): AccessResult => {
      if (!req.user) {
        return {
          isPublic: { equals: true },
          status: { equals: 'published' }
        } as Where
      }
      if ((req.user as any)?.role === 'admin') return true
      return {
        or: [
          {
            tenant: { equals: (req.user as any)?.tenant?.id },
            status: { in: ['published', 'draft'] }
          },
          {
            isPublic: { equals: true },
            status: { equals: 'published' }
          }
        ]
      } as Where
    },
    create: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager'].includes((req.user as any)?.role)
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false
      if ((req.user as any)?.role === 'admin') return true
      return {
        tenant: { equals: (req.user as any)?.tenant?.id },
        status: { not_equals: 'archived' }
      } as Where
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false
      if ((req.user as any)?.role === 'admin') return true
      return {
        tenant: { equals: (req.user as any)?.tenant?.id },
        status: { in: ['draft', 'archived'] }
      } as Where
    },
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-set tenant for non-admin users
        if (operation === 'create' && !data.tenant && req.user && (req.user as any)?.role !== 'admin') {
          data.tenant = (req.user as any)?.tenant?.id
        }

        // Auto-set author on create
        if (operation === 'create' && !data.author && req.user) {
          data.author = req.user.id
        }

        // Auto-set version if not provided
        if (operation === 'create' && !data.version) {
          data.version = '1.0'
        }

        // Auto-set effective date if not provided
        if (operation === 'create' && !data.effectiveDate) {
          data.effectiveDate = new Date()
        }

        // Auto-set status if not provided
        if (operation === 'create' && !data.status) {
          data.status = 'draft'
        }

        // Auto-generate slug from title if not provided
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }

        // Auto-generate summary from content if not provided
        if (data.content && !data.summary) {
          const textContent = typeof data.content === 'string' 
            ? data.content 
            : JSON.stringify(data.content)
          data.summary = textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '')
        }

        // Track version history
        if (operation === 'update' && data.version) {
          if (!data.versionHistory) data.versionHistory = []
          data.versionHistory.push({
            version: data.version,
            changedAt: new Date(),
            changedBy: req.user?.id,
            changes: data.changeNotes || 'Version updated'
          })
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation, req }) => {
        // Log document changes for audit trail
        if (operation === 'update' && req.user) {
          // This would typically integrate with an audit logging system
          console.log(`Document ${doc.title} updated by ${req.user.email}`)
        }
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      unique: false,
      index: true,
      admin: {
        description: 'Title of the business document',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly identifier (auto-generated from title)',
        position: 'sidebar',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      maxLength: 500,
      admin: {
        description: 'Brief summary of the document (auto-generated if not provided)',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Main content of the document',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Policy', value: 'policy' },
        { label: 'Procedure', value: 'procedure' },
        { label: 'Guidelines', value: 'guidelines' },
        { label: 'Training', value: 'training' },
        { label: 'Safety', value: 'safety' },
        { label: 'Legal', value: 'legal' },
        { label: 'HR', value: 'hr' },
        { label: 'Operations', value: 'operations' },
        { label: 'Quality Assurance', value: 'qa' },
        { label: 'Compliance', value: 'compliance' },
        { label: 'Emergency', value: 'emergency' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'policy',
      required: true,
      index: true,
      admin: {
        description: 'Category of the business document',
      },
    },
    {
      name: 'subcategory',
      type: 'text',
      admin: {
        description: 'Optional subcategory for more specific classification',
      },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
      defaultValue: 'medium',
      admin: {
        description: 'Priority level of this document',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Under Review', value: 'review' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
        { label: 'Expired', value: 'expired' },
      ],
      defaultValue: 'draft',
      required: true,
      index: true,
      admin: {
        description: 'Current status of the document',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Tags for organizing and searching documents',
      },
    },
    {
      name: 'keywords',
      type: 'text',
      admin: {
        description: 'Comma-separated keywords for search optimization',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      index: true,
      admin: {
        description: 'Tenant this document belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users' as any as any,
      required: true,
      admin: {
        description: 'Document author',
        readOnly: true,
      },
    },
    {
      name: 'reviewers',
      type: 'relationship',
      relationTo: 'users' as any as any,
      hasMany: true,
      filterOptions: {
        role: { in: ['admin', 'manager'] }
      },
      admin: {
        description: 'Users assigned to review this document',
      },
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        description: 'User who approved this document',
        readOnly: true,
      },
    },
    {
      name: 'approvedAt',
      type: 'date',
      admin: {
        description: 'Date when document was approved',
        readOnly: true,
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Make this document publicly accessible',
      },
    },
    {
      name: 'requiresAcknowledgment',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Require staff to acknowledge reading this document',
      },
    },
    {
      name: 'version',
      type: 'text',
      defaultValue: '1.0',
      required: true,
      admin: {
        description: 'Document version number',
      },
    },
    {
      name: 'versionHistory',
      type: 'array',
      fields: [
        {
          name: 'version',
          type: 'text',
          required: true,
        },
        {
          name: 'changedAt',
          type: 'date',
          required: true,
        },
        {
          name: 'changedBy',
          type: 'relationship',
          relationTo: 'users' as any as any,
          required: true,
        },
        {
          name: 'changes',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        readOnly: true,
        description: 'History of document versions and changes',
      },
    },
    {
      name: 'changeNotes',
      type: 'textarea',
      admin: {
        description: 'Notes about changes made in this version',
      },
    },
    {
      name: 'effectiveDate',
      type: 'date',
      required: true,
      admin: {
        description: 'Date when this document becomes effective',
      },
    },
    {
      name: 'expirationDate',
      type: 'date',
      admin: {
        description: 'Date when this document expires (optional)',
      },
    },
    {
      name: 'reviewDate',
      type: 'date',
      admin: {
        description: 'Date when this document should be reviewed next',
      },
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'media' as any as any,
      hasMany: true,
      admin: {
        description: 'Related files and attachments',
      },
    },
    {
      name: 'relatedDocuments',
      type: 'relationship',
      relationTo: 'business-documentation' as any as any,
      hasMany: true,
      admin: {
        description: 'Related business documents',
      },
    },
    {
      name: 'acknowledgments',
      type: 'array',
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users' as any as any,
          required: true,
        },
        {
          name: 'acknowledgedAt',
          type: 'date',
          required: true,
        },
        {
          name: 'version',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        readOnly: true,
        description: 'Staff acknowledgments of this document',
      },
    },
    {
      name: 'viewCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Number of times this document has been viewed',
      },
    },
    {
      name: 'downloadCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Number of times this document has been downloaded',
      },
    },
  ],
}
