import { CollectionConfig } from 'payload/types'

const DynamicData: CollectionConfig = {
  slug: 'dynamic-data',
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
      name: 'dataType',
      type: 'select',
      required: true,
      options: [
        { label: 'API Endpoint', value: 'api' },
        { label: 'Database Query', value: 'database' },
        { label: 'Static JSON', value: 'static' },
        { label: 'External Service', value: 'external' },
        { label: 'Calculated', value: 'calculated' }
      ]
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'Internal API', value: 'internal-api' },
        { label: 'External API', value: 'external-api' },
        { label: 'Database Collection', value: 'collection' },
        { label: 'Static Data', value: 'static' },
        { label: 'Formula', value: 'formula' }
      ]
    },
    {
      name: 'endpoint',
      type: 'text',
      label: 'API Endpoint URL',
      admin: {
        condition: (data) => data?.dataType === 'api' || data?.source === 'internal-api' || data?.source === 'external-api'
      }
    },
    {
      name: 'collection',
      type: 'select',
      label: 'Target Collection',
      options: [
        { label: 'Users', value: 'users' },
        { label: 'Products', value: 'products' },
        { label: 'Orders', value: 'orders' },
        { label: 'Customers', value: 'customers' },
        { label: 'Appointments', value: 'appointments' },
        { label: 'Pages', value: 'pages' },
        { label: 'Media', value: 'media' }
      ],
      admin: {
        condition: (data) => data?.dataType === 'database' || data?.source === 'collection'
      }
    },
    {
      name: 'query',
      type: 'json',
      label: 'Query Parameters',
      admin: {
        condition: (data) => data?.dataType === 'database' || data?.dataType === 'api'
      }
    },
    {
      name: 'staticData',
      type: 'json',
      label: 'Static Data',
      admin: {
        condition: (data) => data?.dataType === 'static' || data?.source === 'static'
      }
    },
    {
      name: 'formula',
      type: 'textarea',
      label: 'Calculation Formula',
      admin: {
        condition: (data) => data?.dataType === 'calculated' || data?.source === 'formula'
      }
    },
    {
      name: 'transform',
      type: 'json',
      label: 'Data Transformation'
    },
    {
      name: 'cache',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true
        },
        {
          name: 'ttl',
          type: 'number',
          defaultValue: 300,
          label: 'Cache TTL (seconds)',
          min: 0
        }
      ]
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true
    },
    {
      name: 'lastFetched',
      type: 'date',
      label: 'Last Data Fetch'
    },
    {
      name: 'errorCount',
      type: 'number',
      defaultValue: 0,
      min: 0
    }
  ]
}

export { DynamicData }
