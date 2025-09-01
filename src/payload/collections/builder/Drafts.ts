import { CollectionConfig } from 'payload/types'

const Drafts: CollectionConfig = {
  slug: 'drafts',
  admin: {
    useAsTitle: 'name',
    group: 'Builder'
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor',
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor',
    delete: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor'
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true
    },
    {
      name: 'description',
      type: 'textarea'
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Page', value: 'page' },
        { label: 'Section', value: 'section' },
        { label: 'Block', value: 'block' },
        { label: 'Template', value: 'template' },
        { label: 'Theme', value: 'theme' }
      ]
    },
    {
      name: 'content',
      type: 'json',
      required: true
    },
    {
      name: 'settings',
      type: 'json'
    },
    {
      name: 'styles',
      type: 'json'
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: ['pages', 'sections', 'blocks', 'templates', 'themes']
    },
    {
      name: 'version',
      type: 'text',
      defaultValue: '1.0.0'
    },
    {
      name: 'isAutoSaved',
      type: 'checkbox',
      defaultValue: false,
      label: 'Auto-saved Draft'
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Expiration Date'
    },
    {
      name: 'metadata',
      type: 'json'
    },
    {
      name: 'createdAt',
      type: 'date',
      defaultValue: () => new Date()
    },
    {
      name: 'updatedAt',
      type: 'date',
      defaultValue: () => new Date()
    }
  ]
}

export { Drafts }
