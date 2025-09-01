import { CollectionConfig } from 'payload/types'

const BlockRevisions: CollectionConfig = {
  slug: 'block-revisions',
  admin: {
    useAsTitle: 'version',
    group: 'Builder'
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor',
    delete: ({ req }) => req.user?.role === 'admin'
  },
  fields: [
    {
      name: 'block',
      type: 'relationship',
      relationTo: 'blocks',
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
      name: 'metadata',
      type: 'json'
    }
  ]
}

export { BlockRevisions }
