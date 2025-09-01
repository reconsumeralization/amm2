import { CollectionConfig } from 'payload/types'

const Translations: CollectionConfig = {
  slug: 'translations',
  admin: {
    useAsTitle: 'key',
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
      name: 'key',
      type: 'text',
      required: true,
      unique: true
    },
    {
      name: 'namespace',
      type: 'select',
      options: [
        { label: 'Common', value: 'common' },
        { label: 'Navigation', value: 'nav' },
        { label: 'Forms', value: 'forms' },
        { label: 'Errors', value: 'errors' },
        { label: 'Success', value: 'success' },
        { label: 'Buttons', value: 'buttons' },
        { label: 'Labels', value: 'labels' },
        { label: 'Placeholders', value: 'placeholders' },
        { label: 'Custom', value: 'custom' }
      ]
    },
    {
      name: 'translations',
      type: 'json',
      required: true,
      label: 'Language Translations'
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description/Context'
    },
    {
      name: 'defaultValue',
      type: 'text',
      label: 'Default/Fallback Value'
    },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'text',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'HTML', value: 'html' },
        { label: 'Plural', value: 'plural' },
        { label: 'Date/Time', value: 'datetime' },
        { label: 'Number', value: 'number' }
      ]
    },
    {
      name: 'variables',
      type: 'array',
      label: 'Template Variables',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true
        },
        {
          name: 'type',
          type: 'select',
          defaultValue: 'string',
          options: [
            { label: 'String', value: 'string' },
            { label: 'Number', value: 'number' },
            { label: 'Date', value: 'date' },
            { label: 'Boolean', value: 'boolean' }
          ]
        },
        {
          name: 'description',
          type: 'textarea'
        }
      ]
    },
    {
      name: 'context',
      type: 'select',
      options: [
        { label: 'UI Component', value: 'component' },
        { label: 'Page Content', value: 'content' },
        { label: 'Email Template', value: 'email' },
        { label: 'API Response', value: 'api' },
        { label: 'Validation Message', value: 'validation' },
        { label: 'Notification', value: 'notification' }
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
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true
    },
    {
      name: 'lastModified',
      type: 'date',
      defaultValue: () => new Date()
    },
    {
      name: 'modifiedBy',
      type: 'relationship',
      relationTo: 'users'
    },
    {
      name: 'usage',
      type: 'array',
      label: 'Usage References',
      fields: [
        {
          name: 'file',
          type: 'text'
        },
        {
          name: 'line',
          type: 'number'
        },
        {
          name: 'component',
          type: 'text'
        }
      ]
    }
  ]
}

export { Translations }
