import { CollectionConfig } from 'payload/types'

const Themes: CollectionConfig = {
  slug: 'themes',
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
        { label: 'Light Theme', value: 'light' },
        { label: 'Dark Theme', value: 'dark' },
        { label: 'Custom Theme', value: 'custom' },
        { label: 'Brand Theme', value: 'brand' }
      ]
    },
    {
      name: 'colors',
      type: 'group',
      label: 'Color Palette',
      fields: [
        {
          name: 'primary',
          type: 'text',
          label: 'Primary Color'
        },
        {
          name: 'secondary',
          type: 'text',
          label: 'Secondary Color'
        },
        {
          name: 'accent',
          type: 'text',
          label: 'Accent Color'
        },
        {
          name: 'background',
          type: 'text',
          label: 'Background Color'
        },
        {
          name: 'foreground',
          type: 'text',
          label: 'Foreground Color'
        },
        {
          name: 'muted',
          type: 'text',
          label: 'Muted Color'
        },
        {
          name: 'border',
          type: 'text',
          label: 'Border Color'
        }
      ]
    },
    {
      name: 'typography',
      type: 'group',
      label: 'Typography',
      fields: [
        {
          name: 'fontFamily',
          type: 'text',
          label: 'Font Family'
        },
        {
          name: 'fontSize',
          type: 'json',
          label: 'Font Sizes'
        },
        {
          name: 'fontWeight',
          type: 'json',
          label: 'Font Weights'
        },
        {
          name: 'lineHeight',
          type: 'json',
          label: 'Line Heights'
        }
      ]
    },
    {
      name: 'spacing',
      type: 'json',
      label: 'Spacing Scale'
    },
    {
      name: 'borderRadius',
      type: 'json',
      label: 'Border Radius'
    },
    {
      name: 'shadows',
      type: 'json',
      label: 'Shadow Definitions'
    },
    {
      name: 'animations',
      type: 'json',
      label: 'Animation Definitions'
    },
    {
      name: 'components',
      type: 'json',
      label: 'Component Styles'
    },
    {
      name: 'css',
      type: 'textarea',
      label: 'Custom CSS'
    },
    {
      name: 'variables',
      type: 'json',
      label: 'CSS Variables'
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      label: 'Default Theme'
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true
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
      label: 'Theme Preview'
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'themes',
      label: 'Parent Theme'
    },
    {
      name: 'extends',
      type: 'array',
      label: 'Extended Themes',
      fields: [
        {
          name: 'theme',
          type: 'relationship',
          relationTo: 'themes'
        },
        {
          name: 'overrides',
          type: 'json',
          label: 'Style Overrides'
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

export { Themes }
