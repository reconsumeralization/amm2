import { CollectionConfig } from 'payload/types'

const ConditionalRules: CollectionConfig = {
  slug: 'conditional-rules',
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
      name: 'conditionType',
      type: 'select',
      required: true,
      options: [
        { label: 'User Authentication', value: 'auth' },
        { label: 'User Role', value: 'role' },
        { label: 'Device Type', value: 'device' },
        { label: 'Browser', value: 'browser' },
        { label: 'Screen Size', value: 'screen-size' },
        { label: 'Time of Day', value: 'time' },
        { label: 'Geolocation', value: 'location' },
        { label: 'Custom', value: 'custom' }
      ]
    },
    {
      name: 'conditions',
      type: 'json',
      required: true,
      label: 'Condition Configuration'
    },
    {
      name: 'actions',
      type: 'json',
      required: true,
      label: 'Actions to Perform'
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 100
    },
    {
      name: 'target',
      type: 'select',
      required: true,
      options: [
        { label: 'Page', value: 'page' },
        { label: 'Section', value: 'section' },
        { label: 'Block', value: 'block' },
        { label: 'Component', value: 'component' }
      ]
    },
    {
      name: 'targetId',
      type: 'text',
      required: true,
      label: 'Target ID'
    },
    {
      name: 'fallback',
      type: 'json',
      label: 'Fallback Configuration'
    }
  ]
}

export { ConditionalRules }
