import { CollectionConfig } from 'payload'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    description: 'System notifications and alerts',
    group: 'System',
    defaultColumns: ['title', 'user', 'type', 'priority', 'read', 'createdAt'],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: {
        description: 'User who receives the notification (null for broadcasts)',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'User Created', value: 'user_created' },
        { label: 'User Updated', value: 'user_updated' },
        { label: 'User Deleted', value: 'user_deleted' },
        { label: 'Employee Created', value: 'employee_created' },
        { label: 'Employee Updated', value: 'employee_updated' },
        { label: 'Appointment Booked', value: 'appointment_booked' },
        { label: 'Appointment Updated', value: 'appointment_updated' },
        { label: 'Appointment Cancelled', value: 'appointment_cancelled' },
        { label: 'System Alert', value: 'system_alert' },
        { label: 'Security Alert', value: 'security_alert' },
        { label: 'Performance Alert', value: 'performance_alert' },
        { label: 'Maintenance Notice', value: 'maintenance_notice' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      defaultValue: 'medium',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Notification title',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Notification message content',
      },
    },
    {
      name: 'data',
      type: 'json',
      admin: {
        description: 'Additional data payload for the notification',
      },
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the notification has been read',
        position: 'sidebar',
      },
    },
    {
      name: 'readAt',
      type: 'date',
      admin: {
        description: 'When the notification was read',
        condition: (data: any) => data.read,
      },
    },
    {
      name: 'broadcast',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Send to all users',
        position: 'sidebar',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'When the notification expires (optional)',
      },
    },
    {
      name: 'actionUrl',
      type: 'text',
      admin: {
        description: 'URL to redirect to when notification is clicked',
      },
    },
    {
      name: 'actionText',
      type: 'text',
      admin: {
        description: 'Text for the action button',
      },
    },
    {
      name: 'emailSent',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether email notification was sent',
        readOnly: true,
      },
    },
    {
      name: 'smsSent',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether SMS notification was sent',
        readOnly: true,
      },
    },
    {
      name: 'metadata',
      type: 'group',
      admin: {
        description: 'Technical metadata',
      },
      fields: [
        {
          name: 'ipAddress',
          type: 'text',
          admin: {
            description: 'IP address of the event source',
            readOnly: true,
          },
        },
        {
          name: 'userAgent',
          type: 'text',
          admin: {
            description: 'User agent string',
            readOnly: true,
          },
        },
        {
          name: 'sessionId',
          type: 'text',
          admin: {
            description: 'Session ID for tracking',
            readOnly: true,
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create') {
          // Set expiration for certain notification types
          if (data.type === 'maintenance_notice' && !data.expiresAt) {
            data.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          }

          // Auto-mark as read for low priority notifications
          if (data.priority === 'low') {
            data.read = true
            data.readAt = new Date().toISOString()
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create') {
          // Trigger real-time notification
          const { notificationEmitter } = await import('../../lib/notificationEmitter')

          const notificationPayload = {
            id: doc.id,
            userId: doc.broadcast ? 'all' : (doc.user?.id || doc.user),
            type: doc.type,
            title: doc.title,
            message: doc.message,
            data: doc.data,
            timestamp: doc.createdAt,
            read: doc.read,
            priority: doc.priority
          }

          notificationEmitter.emit('notification', notificationPayload)

          // Send email for high priority notifications
          if (doc.priority === 'high' || doc.priority === 'urgent') {
            // In a real implementation, trigger email service
            console.log(`High priority notification created: ${doc.title}`)
          }
        }
      },
    ],
  },
  access: {
    read: ({ req }) => {
      const user = req.user
      if (!user) return false
      if (user.role === 'admin') return true

      // Users can only see their own notifications or broadcast notifications
      return {
        or: [
          { user: { equals: user.id } },
          { broadcast: { equals: true } }
        ]
      } as any
    },
    create: ({ req }) => {
      const user = req.user
      if (!user) return false
      return user.role === 'admin' || user.role === 'manager'
    },
    update: ({ req }) => {
      const user = req.user
      if (!user) return false
      if (user.role === 'admin') return true

      // Users can only update their own notifications (mark as read)
      return { user: { equals: user.id } }
    },
    delete: ({ req }) => {
      const user = req.user
      if (!user) return false
      return user.role === 'admin'
    },
  },
  timestamps: true,
  indexes: [
    {
      fields: ['user'],
    },
    {
      fields: ['type'],
    },
    {
      fields: ['priority'],
    },
    {
      fields: ['read'],
    },
    {
      fields: ['createdAt'],
    },
    {
      fields: ['expiresAt'],
    },
  ],
}
