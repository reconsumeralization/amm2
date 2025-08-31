// src/payload/collections/ChatConversations.ts
import type { CollectionConfig, AccessResult } from 'payload'

export const ChatConversations: CollectionConfig = {
  slug: 'chat-conversations',
  admin: {
    useAsTitle: 'subject',
    group: 'Communications',
    description: 'Manage chatbot conversations and support threads',
    defaultColumns: ['subject', 'customer', 'status', 'priority', 'lastMessageAt', 'updatedAt'],
    listSearchableFields: ['subject', '(customer as any)?.email', 'customer.name'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }): AccessResult => {
      if (!req.user) return false
      if ((req.user as any)?.role === 'admin') return true
      if ((req.user as any)?.role === 'manager') return true // Managers need to view conversations
      // Users can only view their own conversations
      return { customer: { equals: req.user.id } }
    },
    create: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager', 'customer'].includes((req.user as any)?.role)
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false
      if ((req.user as any)?.role === 'admin') return true
      if ((req.user as any)?.role === 'manager') return true // Managers can update conversations
      // Customers can only update their own conversations
      return { customer: { equals: req.user.id } }
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager'].includes((req.user as any)?.role)
    },
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user && (req.user as any)?.role !== 'admin') {
          data.tenant = (req.user as any)?.tenant?.id
        }

        // Auto-set customer for authenticated users creating conversations
        if (operation === 'create' && !data.customer && req.user && (req.user as any)?.role === 'customer') {
          data.customer = req.user.id
        }

        // Auto-set createdBy
        if (operation === 'create' && !data.createdBy && req.user) {
          data.createdBy = req.user.id
        }

        // Auto-set status for new conversations
        if (operation === 'create' && !data.status) {
          data.status = 'active'
        }

        // Auto-set priority based on subject keywords
        if (operation === 'create' && data.subject && !data.priority) {
          const subject = data.subject.toLowerCase()
          if (subject.includes('urgent') || subject.includes('emergency') || subject.includes('help')) {
            data.priority = 'urgent'
          } else if (subject.includes('complaint') || subject.includes('problem') || subject.includes('issue')) {
            data.priority = 'high'
          } else if (subject.includes('question') || subject.includes('inquiry')) {
            data.priority = 'normal'
          } else {
            data.priority = 'low'
          }
        }

        // Validate conversation has at least one message
        if (operation === 'create' && (!data.messages || data.messages.length === 0)) {
          throw new Error('Conversation must have at least one message')
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation, req, previousDoc }) => {
        if (operation === 'create') {
          console.log(`New conversation started: ${doc.subject} (${doc.customer})`)
        }

        if (operation === 'update' && previousDoc) {
          // Handle status changes
          if (doc.status !== previousDoc.status) {
            console.log(`Conversation ${doc.id} status changed: ${previousDoc.status} → ${doc.status}`)

            if (doc.status === 'resolved' && previousDoc.status !== 'resolved') {
              console.log(`Conversation resolved: ${doc.subject}`)
              // TODO: Send resolution confirmation to customer
            }

            if (doc.status === 'closed' && previousDoc.status !== 'closed') {
              console.log(`Conversation closed: ${doc.subject}`)
              // TODO: Send satisfaction survey to customer
            }
          }

          // Handle priority changes
          if (doc.priority !== previousDoc.priority) {
            console.log(`Conversation priority changed: ${previousDoc.priority} → ${doc.priority}`)
          }

          // Handle new messages
          if (doc.messages && previousDoc.messages && doc.messages.length > previousDoc.messages.length) {
            const newMessageCount = doc.messages.length - previousDoc.messages.length
            console.log(`${newMessageCount} new message(s) in conversation: ${doc.subject}`)
            // TODO: Send notification about new messages
          }
        }

        // Update conversation statistics
        if (doc.customer && req.payload) {
          try {
            // This would update customer conversation statistics
            console.log(`Updating conversation statistics for customer: ${doc.customer}`)
          } catch (error) {
            console.error('Error updating conversation statistics:', error)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
      maxLength: 200,
      index: true,
      admin: {
        description: 'Conversation subject or title',
        placeholder: 'How can I help you?',
      },
      validate: (value: any) => {
        if (!value) return 'Subject is required'
        if (value.length < 5) return 'Subject must be at least 5 characters long'
        if (value.length > 200) return 'Subject cannot exceed 200 characters'
        return true
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers' as any as any,
      required: true,
      index: true,
      admin: {
        description: 'Customer who started this conversation',
      },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        description: 'Staff member assigned to handle this conversation',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Waiting for Customer', value: 'waiting_customer' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Closed', value: 'closed' },
        { label: 'Escalated', value: 'escalated' },
      ],
      defaultValue: 'active',
      admin: {
        description: 'Current status of the conversation',
      },
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      defaultValue: 'normal',
      admin: {
        description: 'Priority level of the conversation',
      },
    },
    {
      name: 'channel',
      type: 'select',
      options: [
        { label: 'Website Chat', value: 'website_chat' },
        { label: 'Email', value: 'email' },
        { label: 'Phone', value: 'phone' },
        { label: 'SMS', value: 'sms' },
        { label: 'Social Media', value: 'social' },
        { label: 'In-Person', value: 'in_person' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'website_chat',
      admin: {
        description: 'Channel through which the conversation was initiated',
      },
    },
    {
      name: 'tags',
      type: 'array',
      maxRows: 5,
      admin: {
        description: 'Tags for categorizing this conversation',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          maxLength: 50,
        },
      ],
    },
    {
      name: 'messages',
      type: 'array',
      required: true,
      admin: {
        description: 'Conversation messages',
      },
      fields: [
        {
          name: 'sender',
          type: 'select',
          required: true,
          options: [
            { label: 'Customer', value: 'customer' },
            { label: 'Bot', value: 'bot' },
            { label: 'Agent', value: 'agent' },
            { label: 'System', value: 'system' },
          ],
          admin: {
            description: 'Who sent this message',
          },
        },
        {
          name: 'senderId',
          type: 'text',
          admin: {
            description: 'ID of the message sender',
          },
        },
        {
          name: 'content',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Message content',
          },
        },
        {
          name: 'timestamp',
          type: 'date',
          required: true,
          defaultValue: () => new Date(),
          admin: {
            description: 'When the message was sent',
          },
        },
        {
          name: 'isRead',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether this message has been read',
          },
        },
        {
          name: 'attachments',
          type: 'array',
          admin: {
            description: 'Files attached to this message',
          },
          fields: [
            {
              name: 'file',
              type: 'upload',
              relationTo: 'media' as any as any,
              required: true,
            },
            {
              name: 'filename',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'metadata',
          type: 'json',
          admin: {
            description: 'Additional metadata for this message',
          },
        },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      index: true,
      admin: {
        description: 'Tenant this conversation belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'lastMessageAt',
      type: 'date',
      admin: {
        description: 'Timestamp of the last message',
        readOnly: true,
      },
    },
    {
      name: 'messageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total number of messages in this conversation',
        readOnly: true,
      },
    },
    {
      name: 'responseTime',
      type: 'number',
      admin: {
        description: 'Average response time in minutes',
        readOnly: true,
      },
    },
    {
      name: 'satisfactionRating',
      type: 'number',
      min: 1,
      max: 5,
      admin: {
        description: 'Customer satisfaction rating (1-5)',
      },
    },
    {
      name: 'escalationReason',
      type: 'textarea',
      admin: {
        description: 'Reason for escalation (if applicable)',
        condition: (data) => data?.status === 'escalated',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        description: 'User who created this conversation',
        readOnly: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this conversation',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for this conversation',
      },
    },
  ],
  timestamps: true,
  indexes: [
    { fields: ['customer', 'status'] },
    { fields: ['assignedTo', 'status'] },
    { fields: ['status', 'priority'] },
    { fields: ['tenant', 'status'] },
    { fields: ['lastMessageAt'] },
  ],
}
