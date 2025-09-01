import { CollectionConfig } from 'payload/types'

const PublishQueue: CollectionConfig = {
  slug: 'publish-queue',
  admin: {
    useAsTitle: 'title',
    group: 'Builder'
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor',
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
      name: 'description',
      type: 'textarea'
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Page', value: 'page' },
        { label: 'Section', value: 'section' },
        { label: 'Block', value: 'block' },
        { label: 'Template', value: 'template' },
        { label: 'Theme', value: 'theme' }
      ]
    },
    {
      name: 'item',
      type: 'relationship',
      relationTo: ['pages', 'sections', 'blocks', 'templates', 'themes'],
      required: true
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Publish', value: 'publish' },
        { label: 'Unpublish', value: 'unpublish' },
        { label: 'Update', value: 'update' },
        { label: 'Delete', value: 'delete' }
      ]
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' }
      ]
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' }
      ]
    },
    {
      name: 'scheduledAt',
      type: 'date',
      label: 'Scheduled Publish Time'
    },
    {
      name: 'completedAt',
      type: 'date',
      label: 'Completed At'
    },
    {
      name: 'error',
      type: 'textarea',
      label: 'Error Message'
    },
    {
      name: 'attempts',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 5
    },
    {
      name: 'maxAttempts',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 10
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users'
    },
    {
      name: 'metadata',
      type: 'json'
    }
  ]
}

export { PublishQueue }
