import { CollectionConfig } from 'payload/types'

const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
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
      name: 'title',
      type: 'text',
      required: true
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true
    },
    {
      name: 'description',
      type: 'textarea'
    },
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'templates'
    },
    {
      name: 'layout',
      type: 'relationship',
      relationTo: 'layouts'
    },
    {
      name: 'sections',
      type: 'array',
      label: 'Page Sections',
      fields: [
        {
          name: 'section',
          type: 'relationship',
          relationTo: 'sections',
          required: true
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0
        },
        {
          name: 'settings',
          type: 'json'
        }
      ]
    },
    {
      name: 'content',
      type: 'json',
      label: 'Page Content'
    },
    {
      name: 'metadata',
      type: 'group',
      label: 'Page Metadata',
      fields: [
        {
          name: 'keywords',
          type: 'text'
        },
        {
          name: 'author',
          type: 'text'
        },
        {
          name: 'robots',
          type: 'select',
          defaultValue: 'index,follow',
          options: [
            { label: 'Index, Follow', value: 'index,follow' },
            { label: 'Index, No Follow', value: 'index,nofollow' },
            { label: 'No Index, Follow', value: 'noindex,follow' },
            { label: 'No Index, No Follow', value: 'noindex,nofollow' }
          ]
        },
        {
          name: 'canonical',
          type: 'text'
        }
      ]
    },
    {
      name: 'seo',
      type: 'relationship',
      relationTo: 'seo',
      label: 'SEO Settings'
    },
    {
      name: 'theme',
      type: 'relationship',
      relationTo: 'themes'
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Review', value: 'review' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' }
      ]
    },
    {
      name: 'publishedAt',
      type: 'date'
    },
    {
      name: 'expiresAt',
      type: 'date'
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true
    },
    {
      name: 'lastModifiedBy',
      type: 'relationship',
      relationTo: 'users'
    },
    {
      name: 'version',
      type: 'text',
      defaultValue: '1.0.0'
    },
    {
      name: 'isHomePage',
      type: 'checkbox',
      defaultValue: false,
      label: 'Home Page'
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      label: 'Parent Page'
    },
    {
      name: 'scripts',
      type: 'json',
      label: 'Custom Scripts'
    },
    {
      name: 'analytics',
      type: 'json',
      label: 'Analytics Configuration'
    },
    {
      name: 'preview',
      type: 'upload',
      relationTo: 'media',
      label: 'Page Preview Image'
    }
  ]
}

export { Pages }
