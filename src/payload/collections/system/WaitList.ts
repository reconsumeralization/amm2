import type { CollectionConfig } from 'payload'
import { yoloMonitoring } from '../../lib/monitoring'

export const WaitList: CollectionConfig = {
  slug: 'wait-list',
  labels: {
    singular: 'Wait List Entry',
    plural: 'Wait List',
  },
  admin: {
    useAsTitle: 'customerName',
    description: 'Wait list management for oversubscribed services',
    group: 'Appointments',
    defaultColumns: ['customerName', 'service', 'requestedDate', 'priority', 'status', 'waitDays', 'position'],
    listSearchableFields: ['customerName', 'contact.specialRequests', 'notes'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      const userRole = req.user.role
      if (userRole === 'admin' || userRole === 'manager') return true
      if (userRole === 'barber' || userRole === 'staff') return true
      // Customers can see their own wait list entries
      if (userRole === 'customer') {
        return { customer: { equals: req.user.id } }
      }
      return false
    },
    create: ({ req }) => {
      // Allow authenticated users to add to wait list
      return !!req.user
    },
    update: ({ req }) => {
      if (!req.user) return false
      const userRole = req.user.role
      if (userRole === 'admin' || userRole === 'manager' || userRole === 'barber' || userRole === 'staff') return true
      // Customers can update their own entries (limited fields)
      if (userRole === 'customer') {
        return { customer: { equals: req.user.id } }
      }
      return false
    },
    delete: ({ req }) => {
      if (!req.user) return false
      return req.user.role === 'admin' || req.user.role === 'manager'
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Auto-populate customer name
        if (data.customer && req.payload) {
          try {
            const customer = await req.payload.findByID({
              collection: 'customers',
              id: data.customer,
            })
            if (customer) {
              data.customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown Customer'
            }
          } catch (error) {
            data.customerName = 'Unknown Customer'
          }
        }

        // Set added date
        if (operation === 'create' && !data.addedDate) {
          data.addedDate = new Date()
        }

        // Set resolved date when status changes to resolved states
        if (['booked', 'cancelled', 'expired'].includes(data.status) && !data.resolvedDate) {
          data.resolvedDate = new Date()
        }

        // Initialize waitMetrics if not exists
        if (!data.waitMetrics) {
          data.waitMetrics = {}
        }

        // Calculate wait days
        if (data.addedDate) {
          const added = new Date(data.addedDate)
          const now = data.resolvedDate ? new Date(data.resolvedDate) : new Date()
          const diffTime = now.getTime() - added.getTime()
          data.waitMetrics.waitDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        // Count contact attempts
        if (data.communication && Array.isArray(data.communication)) {
          data.waitMetrics.contactAttempts = data.communication.length
        } else {
          data.waitMetrics.contactAttempts = 0
        }

        // Auto-calculate priority based on wait time and urgency
        if (data.waitMetrics.waitDays && data.contact?.urgency) {
          const waitDays = data.waitMetrics.waitDays
          const urgency = data.contact.urgency
          
          if (urgency === 'urgent' || waitDays > 14) {
            data.priority = 'vip'
          } else if (urgency === 'high' || waitDays > 7) {
            data.priority = 'high'
          } else if (waitDays > 3) {
            data.priority = 'medium'
          } else {
            data.priority = 'low'
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation, previousDoc }) => {
        // Track wait list operations
        yoloMonitoring.trackCollectionOperation('wait-list', operation, doc.id)
        
        if (operation === 'create') {
          yoloMonitoring.trackOperation('waitlist_entry_created', {
            customerId: doc.customer,
            service: doc.service,
            priority: doc.priority,
            requestedDate: doc.dateTime?.requestedDate,
            source: doc.source
          })

          // Send confirmation notification
          if (doc.customer && req.payload) {
            try {
              const customer = await req.payload.findByID({
                collection: 'customers',
                id: doc.customer,
              })

              if (customer?.email && doc.contact?.preferredMethod !== 'phone') {
                // Queue confirmation email
                yoloMonitoring.trackOperation('waitlist_confirmation_queued', {
                  customerId: doc.customer,
                  email: customer.email,
                  waitListId: doc.id
                })
              }
            } catch (error) {
              console.error('Error sending wait list confirmation:', error)
            }
          }
        }

        if (operation === 'update' && previousDoc) {
          // Track status changes
          if (previousDoc.status !== doc.status) {
            yoloMonitoring.trackOperation('waitlist_status_changed', {
              customerId: doc.customer,
              waitListId: doc.id,
              previousStatus: previousDoc.status,
              newStatus: doc.status,
              waitDays: doc.waitMetrics?.waitDays
            })

            // Send status update notification
            if (['booked', 'cancelled', 'expired'].includes(doc.status)) {
              yoloMonitoring.trackOperation('waitlist_resolved', {
                customerId: doc.customer,
                waitListId: doc.id,
                resolution: doc.status,
                totalWaitDays: doc.waitMetrics?.waitDays
              })
            }
          }

          // Track priority changes
          if (previousDoc.priority !== doc.priority) {
            yoloMonitoring.trackOperation('waitlist_priority_changed', {
              customerId: doc.customer,
              waitListId: doc.id,
              previousPriority: previousDoc.priority,
              newPriority: doc.priority
            })
          }
        }

        // Update queue positions for all entries with same service
        if (req.payload && (operation === 'create' || (operation === 'update' && doc.status === 'waiting'))) {
          try {
            await updateQueuePositions(req.payload, doc.service)
          } catch (error) {
            console.error('Error updating queue positions:', error)
          }
        }
      },
    ],
    afterDelete: [
      ({ doc, req }) => {
        yoloMonitoring.trackCollectionOperation('wait-list', 'delete', doc.id)
        yoloMonitoring.trackOperation('waitlist_entry_deleted', {
          customerId: doc.customer,
          service: doc.service,
          finalStatus: doc.status,
          waitDays: doc.waitMetrics?.waitDays
        })

        // Update queue positions after deletion
        if (req.payload) {
          updateQueuePositions(req.payload, doc.service).catch(console.error)
        }
      }
    ],
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
      validate: async (value: any, { req }: { req: any }) => {
        if (!value) return 'Customer is required'
        
        // Check for duplicate active wait list entries
        if (req.payload) {
          try {
            const existing = await req.payload.find({
              collection: 'wait-list',
              where: {
                and: [
                  { customer: { equals: value } },
                  { status: { equals: 'waiting' } },
                ],
              },
              limit: 1,
            })
            
            if (existing.docs.length > 0) {
              return 'Customer already has an active wait list entry'
            }
          } catch (error) {
            // Allow creation if check fails
          }
        }
        
        return true
      },
    },
    {
      name: 'customerName',
      type: 'text',
      admin: {
        description: 'Customer name (auto-populated)',
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          async ({ siblingData, req }) => {
            if (siblingData.customer && req.payload) {
              try {
                const customer = await req.payload.findByID({
                  collection: 'customers',
                  id: siblingData.customer,
                })
                return `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Unknown Customer'
              } catch (error) {
                return 'Unknown Customer'
              }
            }
            return siblingData.customerName
          },
        ],
      },
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
      index: true,
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
          index: true,
          admin: {
            description: 'Preferred date',
          },
          validate: (value) => {
            if (!value) return 'Requested date is required'
            const requestedDate = new Date(value)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            if (requestedDate < today) {
              return 'Requested date cannot be in the past'
            }
            
            return true
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
            placeholder: 'e.g., wheelchair accessible, specific stylist requirements, etc.',
          },
        },
        {
          name: 'bestTimeToContact',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Morning (9-12)', value: 'morning' },
            { label: 'Afternoon (12-5)', value: 'afternoon' },
            { label: 'Evening (5-8)', value: 'evening' },
            { label: 'Weekends', value: 'weekends' },
          ],
          admin: {
            description: 'Best times to contact customer',
          },
        },
      ],
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'medium',
      index: true,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'VIP', value: 'vip' },
      ],
      admin: {
        description: 'Wait list priority (auto-calculated based on urgency and wait time)',
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'waiting',
      index: true,
      options: [
        { label: 'Waiting', value: 'waiting' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Alternative Offered', value: 'alternative-offered' },
        { label: 'Appointment Booked', value: 'booked' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Expired', value: 'expired' },
        { label: 'No Response', value: 'no-response' },
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
        initCollapsed: true,
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Email Sent', value: 'email-sent' },
            { label: 'SMS Sent', value: 'sms-sent' },
            { label: 'Phone Call Made', value: 'phone-call' },
            { label: 'Customer Response', value: 'customer-response' },
            { label: 'Voicemail Left', value: 'voicemail' },
            { label: 'Alternative Offered', value: 'alternative-offered' },
          ],
        },
        {
          name: 'message',
          type: 'textarea',
          required: true,
          admin: {
            placeholder: 'Details of the communication...',
          },
        },
        {
          name: 'date',
          type: 'date',
          required: true,
          defaultValue: () => new Date(),
        },
        {
          name: 'staff',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          admin: {
            description: 'Staff member who made contact',
          },
        },
        {
          name: 'outcome',
          type: 'select',
          options: [
            { label: 'Successful Contact', value: 'success' },
            { label: 'No Answer', value: 'no-answer' },
            { label: 'Customer Declined', value: 'declined' },
            { label: 'Customer Interested', value: 'interested' },
            { label: 'Follow-up Required', value: 'follow-up' },
          ],
        },
      ],
    },
    {
      name: 'alternatives',
      type: 'array',
      admin: {
        description: 'Alternative options offered',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'dateTime',
          type: 'date',
          required: true,
          admin: {
            description: 'Alternative appointment date/time',
          },
        },
        {
          name: 'stylist',
          type: 'relationship',
          relationTo: 'stylists',
          admin: {
            description: 'Alternative stylist',
          },
        },
        {
          name: 'service',
          type: 'relationship',
          relationTo: 'services',
          admin: {
            description: 'Alternative service (if different)',
          },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'offered',
          options: [
            { label: 'Offered', value: 'offered' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Declined', value: 'declined' },
            { label: 'Expired', value: 'expired' },
          ],
        },
        {
          name: 'notes',
          type: 'textarea',
          admin: {
            placeholder: 'Notes about this alternative...',
          },
        },
        {
          name: 'offeredDate',
          type: 'date',
          defaultValue: () => new Date(),
          admin: {
            description: 'When this alternative was offered',
          },
        },
      ],
    },
    {
      name: 'waitMetrics',
      type: 'group',
      admin: {
        description: 'Wait list analytics and metrics',
        condition: (data) => data.status !== undefined,
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
        {
          name: 'lastContactDate',
          type: 'date',
          admin: {
            description: 'Last contact attempt date',
            readOnly: true,
          },
        },
        {
          name: 'nextFollowUp',
          type: 'date',
          admin: {
            description: 'Next scheduled follow-up date',
          },
        },
      ],
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'website',
      index: true,
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Phone', value: 'phone' },
        { label: 'Walk-in', value: 'walk-in' },
        { label: 'Referral', value: 'referral' },
        { label: 'Social Media', value: 'social' },
        { label: 'Mobile App', value: 'mobile-app' },
        { label: 'Email Campaign', value: 'email-campaign' },
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
      index: true,
      admin: {
        description: 'Date added to wait list',
        readOnly: true,
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, operation }) => {
            if (operation === 'create' && !siblingData.addedDate) {
              return new Date()
            }
            return siblingData.addedDate
          },
        ],
      },
    },
    {
      name: 'resolvedDate',
      type: 'date',
      admin: {
        description: 'Date resolved',
        readOnly: true,
        position: 'sidebar',
        condition: (data) => ['booked', 'cancelled', 'expired', 'no-response'].includes(data.status),
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: {
        position: 'sidebar',
        description: 'Business location',
      },
      hooks: {
        beforeChange: [
          ({ req, siblingData }) => {
            if (req.user?.tenant && !siblingData.tenant) {
              return req.user.tenant
            }
            return siblingData.tenant
          },
        ],
      },
    },
  ],
  timestamps: true,
}

// Helper function to update queue positions
async function updateQueuePositions(payload: any, serviceId: string) {
  try {
    const waitingEntries = await payload.find({
      collection: 'wait-list',
      where: {
        and: [
          { service: { equals: serviceId } },
          { status: { equals: 'waiting' } },
        ],
      },
      sort: 'priority,-addedDate',
      limit: 1000,
    })

    const updates = waitingEntries.docs.map((entry: any, index: number) => 
      payload.update({
        collection: 'wait-list',
        id: entry.id,
        data: {
          waitMetrics: {
            ...entry.waitMetrics,
            position: index + 1,
          },
        },
      })
    )

    await Promise.all(updates)
  } catch (error) {
    console.error('Error updating queue positions:', error)
  }
}
