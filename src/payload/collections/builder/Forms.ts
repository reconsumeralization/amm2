import type { CollectionConfig } from 'payload/types'

const Forms: CollectionConfig = {
  slug: 'forms',
  admin: {
    useAsTitle: 'name',
    group: 'Builder'
  },
  access: {
    read: () => true,
    create: ({ req }: { req: any }) => req.user?.role === 'admin' || req.user?.role === 'editor',
    update: ({ req }: { req: any }) => req.user?.role === 'admin' || req.user?.role === 'editor',
    delete: ({ req }: { req: any }) => req.user?.role === 'admin'
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
        { label: 'Contact Form', value: 'contact' },
        { label: 'Newsletter Signup', value: 'newsletter' },
        { label: 'Appointment Booking', value: 'appointment' },
        { label: 'Survey', value: 'survey' },
        { label: 'Feedback', value: 'feedback' },
        { label: 'Custom', value: 'custom' }
      ]
    },
    {
      name: 'fields',
      type: 'json',
      required: true,
      label: 'Form Fields Configuration'
    },
    {
      name: 'settings',
      type: 'json',
      label: 'Form Settings'
    },
    {
      name: 'validation',
      type: 'json',
      label: 'Validation Rules'
    },
    {
      name: 'actions',
      type: 'json',
      required: true,
      label: 'Form Actions'
    },
    {
      name: 'styling',
      type: 'json',
      label: 'Form Styling'
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true
    },
    {
      name: 'requiresAuth',
      type: 'checkbox',
      defaultValue: false,
      label: 'Requires Authentication'
    },
    {
      name: 'maxSubmissions',
      type: 'number',
      label: 'Max Submissions (0 = unlimited)',
      defaultValue: 0,
      min: 0
    },
    {
      name: 'submissionLimit',
      type: 'select',
      label: 'Submission Limit Period',
      options: [
        { label: 'No Limit', value: 'none' },
        { label: 'Per Hour', value: 'hour' },
        { label: 'Per Day', value: 'day' },
        { label: 'Per Week', value: 'week' },
        { label: 'Per Month', value: 'month' }
      ]
    },
    {
      name: 'confirmation',
      type: 'json',
      label: 'Confirmation Settings'
    }
  ]
}

export { Forms }
