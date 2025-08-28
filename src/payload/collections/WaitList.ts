import { CollectionConfig, AccessArgs } from 'payload'

export const WaitList: CollectionConfig = {
  slug: 'wait-list',
  admin: {
    useAsTitle: 'customerName',
    description: 'Wait list management for oversubscribed services',
    group: 'Appointments',
    defaultColumns: ['customerName', 'service', 'requestedDate', 'priority', 'status'],
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      index: true,
      admin: {
        description: 'Customer on wait list',
      },
    },
    {
      name: 'customerName',
      type: 'text',
      admin: {
        description: 'Customer name (auto-populated)',
        readOnly: true,
      },
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
      admin: {
        description: 'Requested service',
      },
    },
    {
      name: 'stylist',
      type: 'relationship',
      relationTo: 'stylists',
      admin: {
        description: 'Preferred stylist (optional)',
      },
    },
    {
      name: 'dateTime',
      type: 'group',
      admin: {
        description: 'Requested date and time preferences',
      },
      fields: [
        {
          name: 'requestedDate',
          type: 'date',
          required: true,
          admin: {
            description: 'Preferred date',
          },
        },
        {
          name: 'timeSlots',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Morning (9-12)', value: 'morning' },
            { label: 'Afternoon (12-5)', value: 'afternoon' },
            { label: 'Evening (5-8)', value: 'evening' },
          ],
          admin: {
            description: 'Preferred time slots',
          },
        },
        {
          name: 'flexibility',
          type: 'select',
          defaultValue: 'moderate',
          options: [
            { label: 'Exact date required', value: 'exact' },
            { label: '±1 day', value: 'one-day' },
            { label: '±3 days', value: 'three-days' },
            { label: '±1 week', value: 'one-week' },
            { label: 'Flexible', value: 'flexible' },
          ],
          admin: {
            description: 'Date flexibility',
          },
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      admin: {
        description: 'Contact preferences',
      },
      fields: [
        {
          name: 'preferredMethod',
          type: 'select',
          defaultValue: 'email',
          options: [
            { label: 'Email', value: 'email' },
            { label: 'SMS', value: 'sms' },
            { label: 'Phone', value: 'phone' },
          ],
        },
        {
          name: 'urgency',
          type: 'select',
          defaultValue: 'normal',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Normal', value: 'normal' },
            { label: 'High', value: 'high' },
            { label: 'Urgent', value: 'urgent' },
          ],
        },
        {
          name: 'specialRequests',
          type: 'textarea',
          admin: {
            description: 'Any special requests or notes',
          },
        },
      ],
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'VIP', value: 'vip' },
      ],
      admin: {
        description: 'Wait list priority',
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'waiting',
      options: [
        { label: 'Waiting', value: 'waiting' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Alternative Offered', value: 'alternative-offered' },
        { label: 'Appointment Booked', value: 'booked' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Expired', value: 'expired' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'communication',
      type: 'array',
      admin: {
        description: 'Communication history',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Email Sent', value: 'email-sent' },
            { label: 'SMS Sent', value: 'sms-sent' },
            { label: 'Phone Call', value: 'phone-call' },
            { label: 'Customer Response', value: 'customer-response' },
          ],
        },
        {
          name: 'message',
          type: 'textarea',
          required: true,
        },
        {
          name: 'date',
          type: 'date',
          required: true,
        },
        {
          name: 'staff',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
      ],
    },
    {
      name: 'alternatives',
      type: 'array',
      admin: {
        description: 'Alternative options offered',
      },
      fields: [
        {
          name: 'dateTime',
          type: 'date',
          required: true,
        },
        {
          name: 'stylist',
          type: 'relationship',
          relationTo: 'stylists',
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          options: [
            { label: 'Offered', value: 'offered' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Declined', value: 'declined' },
          ],
        },
        {
          name: 'notes',
          type: 'text',
        },
      ],
    },
    {
      name: 'waitMetrics',
      type: 'group',
      admin: {
        description: 'Wait list analytics',
      },
      fields: [
        {
          name: 'waitDays',
          type: 'number',
          admin: {
            description: 'Days on wait list',
            readOnly: true,
          },
        },
        {
          name: 'position',
          type: 'number',
          admin: {
            description: 'Current position in queue',
            readOnly: true,
          },
        },
        {
          name: 'estimatedWait',
          type: 'number',
          admin: {
            description: 'Estimated wait time in days',
            readOnly: true,
          },
        },
        {
          name: 'contactAttempts',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of contact attempts',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'website',
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Phone', value: 'phone' },
        { label: 'Walk-in', value: 'walk-in' },
        { label: 'Referral', value: 'referral' },
        { label: 'Social Media', value: 'social' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'richText',
      admin: {
        description: 'Internal notes about this wait list entry',
      },
    },
    {
      name: 'addedDate',
      type: 'date',
      admin: {
        description: 'Date added to wait list',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'resolvedDate',
      type: 'date',
      admin: {
        description: 'Date resolved',
        readOnly: true,
        position: 'sidebar',
        condition: (data) => ['booked', 'cancelled', 'expired'].includes(data.status),
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }: { data: any; req: any; operation: any }) => {
        // Auto-populate customer name
        if (data.customer && !data.customerName) {
          const customer = await req.payload.findByID({
            collection: 'customers',
            id: data.customer,
          })
          if (customer) {
            data.customerName = `${customer.firstName} ${customer.lastName}`
          }
        }

        // Set added date
        if (operation === 'create' && !data.addedDate) {
          data.addedDate = new Date()
        }

        // Set resolved date
        if (['booked', 'cancelled', 'expired'].includes(data.status) && !data.resolvedDate) {
          data.resolvedDate = new Date()
        }

        // Calculate wait days
        if (data.addedDate) {
          const added = new Date(data.addedDate)
          const now = new Date()
          const diffTime = now.getTime() - added.getTime()
          data.waitMetrics.waitDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        // Count contact attempts
        if (data.communication) {
          data.waitMetrics.contactAttempts = data.communication.length
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }: { doc: any; req: any; operation: any }) => {
        if (operation === 'create') {
          // Send confirmation email
          console.log(`Customer added to wait list: ${doc.customerName}`)

          // Auto-send confirmation email
          if (doc.customer) {
            const customer = await req.payload.findByID({
              collection: 'customers',
              id: doc.customer,
            })

            if (customer && customer.email) {
              // Here you would integrate with your email service
              console.log(`Wait list confirmation email would be sent to: ${customer.email}`)
            }
          }
        }
      },
    ],
  },
  access: {
    read: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      if (user.role === 'admin' || user.role === 'manager') return true
      // Customers can see their own wait list entries
      return { customer: { equals: user.id } }
    },
    create: ({ req }: AccessArgs) => {
      // Allow customers to add themselves to wait list
      return true
    },
    update: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      if (user.role === 'admin' || user.role === 'manager' || user.role === 'staff') return true
      // Customers can update their own entries
      return { customer: { equals: user.id } }
    },
    delete: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      return user.role === 'admin' || user.role === 'manager'
    },
  },
  timestamps: true,
}
