import { CollectionConfig } from 'payload/types'

const Layouts: CollectionConfig = {
  slug: 'layouts',
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
        { label: 'Page Layout', value: 'page' },
        { label: 'Section Layout', value: 'section' },
        { label: 'Header Layout', value: 'header' },
        { label: 'Footer Layout', value: 'footer' },
        { label: 'Sidebar Layout', value: 'sidebar' },
        { label: 'Grid Layout', value: 'grid' },
        { label: 'Flex Layout', value: 'flex' },
        { label: 'Custom Layout', value: 'custom' }
      ]
    },
    {
      name: 'structure',
      type: 'json',
      required: true,
      label: 'Layout Structure'
    },
    {
      name: 'grid',
      type: 'group',
      label: 'Grid Configuration',
      fields: [
        {
          name: 'columns',
          type: 'number',
          defaultValue: 12,
          min: 1,
          max: 24
        },
        {
          name: 'gap',
          type: 'text',
          defaultValue: '1rem'
        },
        {
          name: 'responsive',
          type: 'json',
          label: 'Responsive Breakpoints'
        }
      ]
    },
    {
      name: 'flex',
      type: 'group',
      label: 'Flex Configuration',
      fields: [
        {
          name: 'direction',
          type: 'select',
          defaultValue: 'row',
          options: [
            { label: 'Row', value: 'row' },
            { label: 'Column', value: 'column' },
            { label: 'Row Reverse', value: 'row-reverse' },
            { label: 'Column Reverse', value: 'column-reverse' }
          ]
        },
        {
          name: 'justify',
          type: 'select',
          defaultValue: 'flex-start',
          options: [
            { label: 'Start', value: 'flex-start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'flex-end' },
            { label: 'Space Between', value: 'space-between' },
            { label: 'Space Around', value: 'space-around' },
            { label: 'Space Evenly', value: 'space-evenly' }
          ]
        },
        {
          name: 'align',
          type: 'select',
          defaultValue: 'stretch',
          options: [
            { label: 'Stretch', value: 'stretch' },
            { label: 'Start', value: 'flex-start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'flex-end' },
            { label: 'Baseline', value: 'baseline' }
          ]
        }
      ]
    },
    {
      name: 'spacing',
      type: 'json',
      label: 'Spacing Configuration'
    },
    {
      name: 'styles',
      type: 'json',
      label: 'Layout Styles'
    },
    {
      name: 'responsive',
      type: 'json',
      label: 'Responsive Behavior'
    },
    {
      name: 'constraints',
      type: 'json',
      label: 'Layout Constraints'
    },
    {
      name: 'isReusable',
      type: 'checkbox',
      defaultValue: false,
      label: 'Reusable Layout'
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
      label: 'Layout Preview'
    }
  ]
}

export { Layouts }
