import { CollectionConfig } from 'payload/types'

const Integrations: CollectionConfig = {
  slug: 'integrations',
  admin: {
    useAsTitle: 'name',
    group: 'Builder'
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
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
        { label: 'API', value: 'api' },
        { label: 'Webhook', value: 'webhook' },
        { label: 'Database', value: 'database' },
        { label: 'Email Service', value: 'email' },
        { label: 'Payment Gateway', value: 'payment' },
        { label: 'Analytics', value: 'analytics' },
        { label: 'CRM', value: 'crm' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Custom', value: 'custom' }
      ]
    },
    {
      name: 'provider',
      type: 'select',
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'Mailchimp', value: 'mailchimp' },
        { label: 'SendGrid', value: 'sendgrid' },
        { label: 'Google Analytics', value: 'google-analytics' },
        { label: 'Facebook Pixel', value: 'facebook-pixel' },
        { label: 'Zapier', value: 'zapier' },
        { label: 'Slack', value: 'slack' },
        { label: 'Custom', value: 'custom' }
      ]
    },
    {
      name: 'config',
      type: 'json',
      required: true,
      label: 'Configuration'
    },
    {
      name: 'credentials',
      type: 'json',
      label: 'API Credentials'
    },
    {
      name: 'webhooks',
      type: 'json',
      label: 'Webhook Configuration'
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true
    },
    {
      name: 'isTestMode',
      type: 'checkbox',
      defaultValue: false,
      label: 'Test Mode'
    },
    {
      name: 'rateLimit',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true
        },
        {
          name: 'requests',
          type: 'number',
          defaultValue: 100,
          min: 1
        },
        {
          name: 'period',
          type: 'select',
          defaultValue: 'minute',
          options: [
            { label: 'Second', value: 'second' },
            { label: 'Minute', value: 'minute' },
            { label: 'Hour', value: 'hour' },
            { label: 'Day', value: 'day' }
          ]
        }
      ]
    },
    {
      name: 'errorHandling',
      type: 'json',
      label: 'Error Handling Configuration'
    },
    {
      name: 'logs',
      type: 'array',
      label: 'Integration Logs',
      fields: [
        {
          name: 'timestamp',
          type: 'date',
          required: true
        },
        {
          name: 'level',
          type: 'select',
          required: true,
          options: [
            { label: 'Info', value: 'info' },
            { label: 'Warning', value: 'warning' },
            { label: 'Error', value: 'error' }
          ]
        },
        {
          name: 'message',
          type: 'text',
          required: true
        },
        {
          name: 'data',
          type: 'json'
        }
      ]
    },
    {
      name: 'lastTested',
      type: 'date',
      label: 'Last Tested'
    },
    {
      name: 'testStatus',
      type: 'select',
      options: [
        { label: 'Not Tested', value: 'not-tested' },
        { label: 'Success', value: 'success' },
        { label: 'Failed', value: 'failed' }
      ]
    }
  ]
}

export { Integrations }
