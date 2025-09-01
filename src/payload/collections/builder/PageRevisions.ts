import { CollectionConfig } from 'payload/types'

const PageRevisions: CollectionConfig = {
  slug: 'page-revisions',
  admin: {
    useAsTitle: 'version',
    group: 'Builder'
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor',
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor',
    delete: ({ req }) => req.user?.role === 'admin'
  },
  fields: [
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      required: true
    },
    {
      name: 'version',
      type: 'text',
      required: true,
      defaultValue: '1.0.0'
    },
    {
      name: 'content',
      type: 'json',
      required: true
    },
    {
      name: 'sections',
      type: 'json',
      label: 'Page Sections'
    },
    {
      name: 'metadata',
      type: 'json',
      label: 'Page Metadata'
    },
    {
      name: 'changes',
      type: 'textarea',
      label: 'Change Description'
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false
    },
    {
      name: 'publishedAt',
      type: 'date'
    },
    {
      name: 'isAutosave',
      type: 'checkbox',
      defaultValue: false,
      label: 'Auto-saved Revision'
    },
    {
      name: 'parentRevision',
      type: 'relationship',
      relationTo: 'page-revisions'
    },
    {
      name: 'diff',
      type: 'json',
      label: 'Changes from Parent'
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Review', value: 'review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' }
      ]
    },
    {
      name: 'reviewComments',
      type: 'array',
      label: 'Review Comments',
      fields: [
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          required: true
        },
        {
          name: 'comment',
          type: 'textarea',
          required: true
        },
        {
          name: 'timestamp',
          type: 'date',
          required: true
        },
        {
          name: 'type',
          type: 'select',
          defaultValue: 'comment',
          options: [
            { label: 'Comment', value: 'comment' },
            { label: 'Approval', value: 'approval' },
            { label: 'Rejection', value: 'rejection' }
          ]
        }
      ]
    }
  ]
}

export { PageRevisions }
