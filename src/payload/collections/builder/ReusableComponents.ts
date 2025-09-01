import { CollectionConfig } from 'payload/types'

const ReusableComponents: CollectionConfig = {
  slug: 'reusable-components',
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
        { label: 'Header', value: 'header' },
        { label: 'Footer', value: 'footer' },
        { label: 'Navigation', value: 'navigation' },
        { label: 'Hero Section', value: 'hero' },
        { label: 'Call to Action', value: 'cta' },
        { label: 'Testimonials', value: 'testimonials' },
        { label: 'Contact Form', value: 'contact-form' },
        { label: 'Social Links', value: 'social-links' },
        { label: 'Newsletter Signup', value: 'newsletter' },
        { label: 'Custom', value: 'custom' }
      ]
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Layout', value: 'layout' },
        { label: 'Content', value: 'content' },
        { label: 'Interactive', value: 'interactive' },
        { label: 'Marketing', value: 'marketing' }
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
      name: 'props',
      type: 'json',
      label: 'Component Properties'
    },
    {
      name: 'isGlobal',
      type: 'checkbox',
      defaultValue: false,
      label: 'Global Component'
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
      name: 'lastUsed',
      type: 'date',
      label: 'Last Used'
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true
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
      label: 'Component Preview'
    },
    {
      name: 'dependencies',
      type: 'array',
      label: 'Dependencies',
      fields: [
        {
          name: 'component',
          type: 'relationship',
          relationTo: 'reusable-components'
        },
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: false
        }
      ]
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
    }
  ]
}

export { ReusableComponents }
