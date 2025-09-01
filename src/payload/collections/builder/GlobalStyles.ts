import { CollectionConfig } from 'payload/types'

const GlobalStyles: CollectionConfig = {
  slug: 'global-styles',
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
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Colors', value: 'colors' },
        { label: 'Typography', value: 'typography' },
        { label: 'Spacing', value: 'spacing' },
        { label: 'Layout', value: 'layout' },
        { label: 'Effects', value: 'effects' },
        { label: 'Animations', value: 'animations' },
        { label: 'Custom', value: 'custom' }
      ]
    },
    {
      name: 'variables',
      type: 'json',
      required: true,
      label: 'CSS Variables'
    },
    {
      name: 'css',
      type: 'textarea',
      label: 'Custom CSS'
    },
    {
      name: 'responsive',
      type: 'json',
      label: 'Responsive Rules'
    },
    {
      name: 'theme',
      type: 'select',
      options: [
        { label: 'All Themes', value: 'all' },
        { label: 'Light Theme', value: 'light' },
        { label: 'Dark Theme', value: 'dark' },
        { label: 'Custom Theme', value: 'custom' }
      ],
      defaultValue: 'all'
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 100,
      label: 'Load Priority'
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true
    },
    {
      name: 'compiledCss',
      type: 'textarea',
      label: 'Compiled CSS (auto-generated)',
      admin: {
        readOnly: true
      }
    },
    {
      name: 'dependencies',
      type: 'array',
      label: 'Style Dependencies',
      fields: [
        {
          name: 'style',
          type: 'relationship',
          relationTo: 'global-styles',
          required: true
        },
        {
          name: 'loadOrder',
          type: 'number',
          defaultValue: 0
        }
      ]
    },
    {
      name: 'lastCompiled',
      type: 'date',
      label: 'Last Compiled'
    },
    {
      name: 'version',
      type: 'text',
      defaultValue: '1.0.0'
    }
  ]
}

export { GlobalStyles }
