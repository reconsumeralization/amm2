// src/payload/collections/Contacts.ts
import type { CollectionConfig } from 'payload'

const Contacts: CollectionConfig = {
  slug: 'contacts',
  labels: {
    singular: 'Contact',
    plural: 'Contacts',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'subject', 'status', 'createdAt'],
    group: 'Communications',
    description: 'Manage contact form submissions and inquiries',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true, // public contact form
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Auto-set priority based on subject keywords
        if (operation === 'create' && data.subject && !data.priority) {
          const subject = data.subject.toLowerCase()
          if (subject.includes('urgent') || subject.includes('emergency') || subject.includes('asap')) {
            data.priority = 'urgent'
          } else if (subject.includes('complaint') || subject.includes('problem') || subject.includes('issue')) {
            data.priority = 'high'
          } else if (subject.includes('question') || subject.includes('inquiry')) {
            data.priority = 'normal'
          } else {
            data.priority = 'low'
          }
        }

        // Auto-set status for new submissions
        if (operation === 'create' && !data.status) {
          data.status = 'new'
        }

        // Validate email format
        if (data.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(data.email)) {
            throw new Error('Invalid email format')
          }
        }

        // Sanitize message content
        if (data.message) {
          // Remove potentially harmful HTML/script tags
          data.message = data.message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          data.message = data.message.replace(/<[^>]*>/g, '') // Remove HTML tags
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`New contact submission from ${doc.name} (${doc.email}) - Priority: ${doc.priority}`)

          // Send notification to admins
          if (req.payload) {
            // Find admin users to notify
            console.log('Notifying admin users about new contact submission')
            // TODO: Implement admin notification system
            // await notifyAdminsOfContactSubmission(doc)
          }

          // Auto-response to customer
          console.log(`Sending auto-response to ${doc.email}`)
          // TODO: Implement auto-response email
          // await sendAutoResponseEmail(doc.email, doc)
        }

        if (operation === 'update') {
          // Handle status changes
          if (doc.status === 'responded') {
            console.log(`Contact marked as responded: ${doc.subject}`)
          } else if (doc.status === 'closed') {
            console.log(`Contact closed: ${doc.subject}`)
            // TODO: Send satisfaction survey
          }
        }
      },
    ],
    beforeDelete: [
      ({ req, id }) => {
        // Only admins can delete contact submissions
        if (req.user?.role !== 'admin') {
          throw new Error('Only administrators can delete contact submissions')
        }

        console.log(`Contact submission ${id} being deleted by ${req.user?.email}`)
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 100,
      admin: {
        placeholder: 'Enter your full name...',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        placeholder: 'your.email@example.com',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        placeholder: '+1 (555) 123-4567',
        description: 'Optional phone number for follow-up',
      },
    },
    {
      name: 'subject',
      type: 'select',
      required: true,
      defaultValue: 'general',
      options: [
        {
          label: 'General Inquiry',
          value: 'general',
        },
        {
          label: 'Service Request',
          value: 'service',
        },
        {
          label: 'Support',
          value: 'support',
        },
        {
          label: 'Partnership',
          value: 'partnership',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
      admin: {
        description: 'Select the type of inquiry',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      maxLength: 2000,
      admin: {
        placeholder: 'Please describe your inquiry in detail...',
        rows: 6,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        {
          label: 'New',
          value: 'new',
        },
        {
          label: 'In Progress',
          value: 'in-progress',
        },
        {
          label: 'Resolved',
          value: 'resolved',
        },
        {
          label: 'Closed',
          value: 'closed',
        },
      ],
      admin: {
        description: 'Current status of the inquiry',
        position: 'sidebar',
      },
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'medium',
      options: [
        {
          label: 'Low',
          value: 'low',
        },
        {
          label: 'Medium',
          value: 'medium',
        },
        {
          label: 'High',
          value: 'high',
        },
        {
          label: 'Urgent',
          value: 'urgent',
        },
      ],
      admin: {
        description: 'Priority level for follow-up',
        position: 'sidebar',
      },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Assign this inquiry to a team member',
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes (not visible to contact)',
        placeholder: 'Add internal notes about this inquiry...',
        position: 'sidebar',
      },
    },
    {
      name: 'followUpDate',
      type: 'date',
      admin: {
        description: 'Schedule follow-up date',
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}

export { Contacts }
