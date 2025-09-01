import { CollectionConfig } from 'payload/types'

const Templates: CollectionConfig = {
  slug: 'templates',
  admin: {
    useAsTitle: 'name',
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
        { label: 'Page Template', value: 'page' },
        { label: 'Section Template', value: 'section' },
        { label: 'Block Template', value: 'block' },
        { label: 'Email Template', value: 'email' },
        { label: 'Layout Template', value: 'layout' }
      ]
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Business', value: 'business' },
        { label: 'Portfolio', value: 'portfolio' },
        { label: 'Blog', value: 'blog' },
        { label: 'E-commerce', value: 'ecommerce' },
        { label: 'Landing Page', value: 'landing' },
        { label: 'Custom', value: 'custom' }
      ]
    },
    {
      name: 'structure',
      type: 'json',
      required: true,
      label: 'Template Structure'
    },
    {
      name: 'content',
      type: 'json',
      label: 'Default Content'
    },
    {
      name: 'styles',
      type: 'json',
      label: 'Template Styles'
    },
    {
      name: 'variables',
      type: 'json',
      label: 'Template Variables'
    },
    {
      name: 'layout',
      type: 'relationship',
      relationTo: 'layouts'
    },
    {
      name: 'theme',
      type: 'relationship',
      relationTo: 'themes'
    },
    {
      name: 'sections',
      type: 'array',
      label: 'Default Sections',
      fields: [
        {
          name: 'section',
          type: 'relationship',
          relationTo: 'sections'
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0
        },
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: false
        }
      ]
    },
    {
      name: 'placeholders',
      type: 'json',
      label: 'Content Placeholders'
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      label: 'Default Template'
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      label: 'Times Used'
    },
    {
      name: 'version',
      type: 'text',
      defaultValue: '1.0.0'
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Template Preview'
    },
    {
      name: 'previewUrl',
      type: 'text',
      label: 'Preview URL'
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text'
        }
      ]
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true
    },
    {
      name: 'lastModified',
      type: 'date',
      defaultValue: () => new Date()
    }
  ]
}

export { Templates }
