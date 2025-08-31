import type { CollectionConfig, AccessResult, Where } from 'payload'

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  labels: {
    singular: 'Appointment',
    plural: 'Appointments',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'user', 'tenant', 'date', 'service', 'status', 'paymentStatus'],
    group: 'Bookings',
    description: 'Manage customer appointments and bookings',
    listSearchableFields: ['title', 'service', 'notes', 'user.name', 'user.email', 'bookingNumber'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
    preview: (doc) => `${doc.title} - ${doc.date ? new Date(doc.date as string).toLocaleDateString() : 'No Date'}`,
  },
  versions: {
    drafts: false,
    maxPerDoc: 10,
  },
  access: {
    create: ({ req }): boolean => {
      if (!req.user) return false
      // Only authenticated users can create appointments
      return ['admin', 'manager', 'barber', 'customer'].includes(req.user.role)
    },
    read: ({ req }): AccessResult => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      if (req.user.role === 'manager' || req.user.role === 'barber') {
        // Staff can view appointments for their tenant
        return { tenant: { equals: req.user.tenant?.id } } as Where
      }
      // Customers can only view their own appointments
      return { user: { equals: req.user.id } } as Where
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      if (req.user.role === 'manager' || req.user.role === 'barber') {
        return { tenant: { equals: req.user.tenant?.id } } as Where
      }
      // Customers can update their own appointments (with restrictions)
      return { 
        and: [
          { user: { equals: req.user.id } },
          { status: { not_in: ['completed', 'cancelled'] } }
        ]
      } as Where
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      // Customers can cancel their own future appointments
      return { 
        and: [
          { user: { equals: req.user.id } },
          { status: { in: ['pending', 'confirmed'] } },
          { date: { greater_than: new Date().toISOString() } }
        ]
      } as Where
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (!data) return data
        
        // Auto-assign tenant for non-admin users
        if (operation === 'create' && !data.tenant && req.user && req.user.role !== 'admin') {
          data.tenant = req.user.tenant?.id
        }
        
        // Validate appointment time slots
        if (data.date && data.duration) {
          const appointmentDate = new Date(data.date as string)
          const dayOfWeek = appointmentDate.getDay()
          const hour = appointmentDate.getHours()
          
          // Business hours validation (9 AM - 6 PM, Monday-Saturday)
          if (dayOfWeek === 0 || hour < 9 || hour >= 18) {
            throw new Error('Appointments can only be scheduled during business hours (9 AM - 6 PM, Monday-Saturday)')
          }
        }
        
        return data
      },
    ],
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        if (!data) return data
        
        const now = new Date().toISOString()
        
        if (operation === 'create') {
          data.createdAt = now
          data.bookingNumber = `APT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
          
          // Check for double bookings
          if (data.barber && data.date && data.duration) {
            const startTime = new Date(data.date as string)
            const endTime = new Date(startTime.getTime() + ((data.duration as number) * 60000))
            
            // Query for conflicting appointments
            const conflictingAppointments = await req.payload.find({
              collection: 'appointments',
              where: {
                and: [
                  { barber: { equals: data.barber } },
                  { status: { not_in: ['cancelled', 'no-show'] } },
                  {
                    or: [
                      {
                        and: [
                          { date: { less_than_equal: data.date } },
                          { endTime: { greater_than: data.date } }
                        ]
                      },
                      {
                        and: [
                          { date: { less_than: endTime.toISOString() } },
                          { endTime: { greater_than_equal: endTime.toISOString() } }
                        ]
                      }
                    ]
                  }
                ]
              }
            })
            
            if (conflictingAppointments.totalDocs > 0) {
              throw new Error('This time slot is already booked for the selected barber')
            }
          }
        }
        
        data.updatedAt = now

        // Auto-calculate end time based on duration
        if (data.date && data.duration) {
          const startTime = new Date(data.date as string)
          const endTime = new Date(startTime.getTime() + ((data.duration as number) * 60000))
          data.endTime = endTime.toISOString()
        }

        // Auto-calculate price from services
        if (operation === 'create' || (data.service !== originalDoc?.service) || (data.additionalServices !== originalDoc?.additionalServices)) {
          let totalPrice = 0
          
          // Get main service price
          if (data.service) {
            const service = await req.payload.findByID({
              collection: 'services',
              id: data.service as string
            })
            totalPrice += service.price || 0
          }
          
          // Add additional services prices
          if (data.additionalServices && Array.isArray(data.additionalServices) && data.additionalServices.length > 0) {
            for (const serviceId of data.additionalServices) {
              const service = await req.payload.findByID({
                collection: 'services',
                id: serviceId as string
              })
              totalPrice += service.price || 0
            }
          }
          
          data.price = totalPrice
        }

        // Track status changes with enhanced history
        if (operation === 'update' && originalDoc && originalDoc.status !== data.status) {
          data.statusHistory = data.statusHistory || []
          data.statusHistory.push({
            status: data.status,
            previousStatus: originalDoc.status,
            changedAt: now,
            changedBy: req.user?.email || 'system',
            reason: data.statusChangeReason || 'No reason provided'
          })
          
          // Clear temporary status change reason
          delete data.statusChangeReason
        }

        // Handle recurring appointments
        if (operation === 'create' && data.isRecurring && data.recurringPattern) {
          data.isParentAppointment = true
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req, previousDoc }) => {
        // Send notifications or sync with external services
        if (operation === 'create') {
          console.log(`New appointment created: ${doc.bookingNumber}`)

          // Send confirmation email to customer
          try {
            if (doc.user && req.payload) {
              const customer = await req.payload.findByID({
                collection: 'users',
                id: doc.user
              })

              if (customer?.email) {
                // Import email service dynamically to avoid circular dependencies
                const { emailService } = await import('@/lib/email-service')
                try {
                  await emailService.sendAppointmentConfirmation(
                    customer.email,
                    customer.name || customer.email,
                    {
                      service: doc.service || 'Appointment',
                      date: new Date(doc.date).toLocaleDateString(),
                      time: doc.time || 'TBD',
                      stylist: doc.barber || 'Staff Member',
                      location: 'ModernMen Hair Salon'
                    }
                  )
                  console.log(`Appointment confirmation email sent to: ${customer.email}`)
                } catch (emailError) {
                  console.error('Failed to send appointment confirmation email:', emailError)
                }
              }
            }
          } catch (error) {
            console.error('Error sending confirmation email:', error)
          }

          // Notify assigned barber
          try {
            if (doc.barber && req.payload) {
              const barber = await req.payload.findByID({
                collection: 'users',
                id: doc.barber
              })

              if (barber?.email) {
                const { emailService } = await import('@/lib/email-service')
                try {
                  await emailService.sendStaffNotification(
                    barber.email,
                    barber.name || 'Staff Member',
                    'new_appointment',
                    {
                      appointmentDate: new Date(doc.date).toLocaleDateString(),
                      appointmentTime: doc.time || 'TBD',
                      service: doc.service || 'Appointment',
                      customerName: customer?.name || 'Customer'
                    }
                  )
                  console.log(`Staff notification sent to: ${barber.email}`)
                } catch (emailError) {
                  console.error('Failed to send staff notification:', emailError)
                }
              }
            }
          } catch (error) {
            console.error('Error notifying barber:', error)
          }

          // Update customer loyalty points for booking
          try {
            if (doc.user && req.payload) {
              const loyaltyProgram = await req.payload.find({
                collection: 'loyalty-program',
                where: {
                  customer: { equals: doc.user },
                  status: { equals: 'active' }
                }
              })

              if (loyaltyProgram.totalDocs > 0) {
                const loyaltyRecord = loyaltyProgram.docs[0]
                const bookingPoints = 100 // Points for booking appointment

                await req.payload.update({
                  collection: 'loyalty-program',
                  id: loyaltyRecord.id,
                  data: {
                    points: (loyaltyRecord.points || 0) + bookingPoints,
                    lastActivity: new Date()
                  }
                })

                console.log(`Awarded ${bookingPoints} loyalty points for booking`)
              }
            }
          } catch (error) {
            console.error('Error updating loyalty points:', error)
          }

          // Create recurring appointments if needed
          if (doc.isRecurring && doc.recurringPattern && doc.isParentAppointment) {
            await createRecurringAppointments(doc, req)
          }
        }

        if (operation === 'update') {
          if (doc.status === 'cancelled' && previousDoc?.status !== 'cancelled') {
            console.log(`Appointment cancelled: ${doc.bookingNumber}`)

            // Send cancellation emails
            try {
              // Notify customer
              if (doc.user && req.payload) {
                const customer = await req.payload.findByID({
                  collection: 'users',
                  id: doc.user
                })
                if (customer?.email) {
                  console.log(`Sending cancellation email to customer: ${customer.email}`)
                }
              }

              // Notify barber
              if (doc.barber && req.payload) {
                const barber = await req.payload.findByID({
                  collection: 'users',
                  id: doc.barber
                })
                if (barber?.email) {
                  console.log(`Notifying barber of cancellation: ${barber.email}`)
                }
              }
            } catch (error) {
              console.error('Error sending cancellation notifications:', error)
            }

            // Refund loyalty points if applicable
            if (doc.status === 'cancelled' && previousDoc?.status === 'confirmed') {
              try {
                if (doc.user && req.payload) {
                  const loyaltyProgram = await req.payload.find({
                    collection: 'loyalty-program',
                    where: {
                      customer: { equals: doc.user },
                      status: { equals: 'active' }
                    }
                  })

                  if (loyaltyProgram.totalDocs > 0) {
                    const loyaltyRecord = loyaltyProgram.docs[0]
                    const refundPoints = 50 // Partial refund for cancellation

                    await req.payload.update({
                      collection: 'loyalty-program',
                      id: loyaltyRecord.id,
                      data: {
                        points: Math.max(0, (loyaltyRecord.points || 0) - refundPoints)
                      }
                    })

                    console.log(`Deducted ${refundPoints} points for cancellation`)
                  }
                }
              } catch (error) {
                console.error('Error processing point refund:', error)
              }
            }
          }

          if (doc.status === 'completed' && previousDoc?.status !== 'completed') {
            console.log(`Appointment completed: ${doc.bookingNumber}`)

            // Award completion bonus points
            try {
              if (doc.user && req.payload) {
                const loyaltyProgram = await req.payload.find({
                  collection: 'loyalty-program',
                  where: {
                    customer: { equals: doc.user },
                    status: { equals: 'active' }
                  }
                })

                if (loyaltyProgram.totalDocs > 0) {
                  const loyaltyRecord = loyaltyProgram.docs[0]
                  const completionPoints = 200 // Bonus points for completing appointment

                  await req.payload.update({
                    collection: 'loyalty-program',
                    id: loyaltyRecord.id,
                    data: {
                      points: (loyaltyRecord.points || 0) + completionPoints,
                      completedAppointments: (loyaltyRecord.completedAppointments || 0) + 1,
                      lastActivity: new Date()
                    }
                  })

                  console.log(`Awarded ${completionPoints} bonus points for completion`)
                }
              }
            } catch (error) {
              console.error('Error awarding completion points:', error)
            }

            // Send follow-up email
            try {
              if (doc.user && req.payload) {
                const customer = await req.payload.findByID({
                  collection: 'users',
                  id: doc.user
                })
                if (customer?.email) {
                  const { emailService } = await import('@/lib/email-service')
                  try {
                    // Send a simple follow-up email after completed appointments
                    await emailService.sendEmail({
                      to: customer.email,
                      subject: 'Thank you for visiting ModernMen!',
                      html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                          <h2 style="color: #333;">Thank you for your visit!</h2>
                          <p>Hi ${customer.name || customer.email},</p>
                          <p>Thank you for choosing ModernMen for your grooming needs. We hope you loved your new look!</p>
                          <p>We'd love to hear about your experience. Please consider leaving us a review or booking your next appointment.</p>
                          <p>Looking forward to seeing you again soon!</p>
                          <p>Best regards,<br>The ModernMen Team</p>
                        </div>
                      `,
                      text: `Hi ${customer.name || customer.email},\n\nThank you for choosing ModernMen for your grooming needs. We hope you loved your new look!\n\nWe'd love to hear about your experience. Please consider leaving us a review or booking your next appointment.\n\nLooking forward to seeing you again soon!\n\nBest regards,\nThe ModernMen Team`
                    })
                    console.log(`Follow-up email sent to: ${customer.email}`)
                  } catch (emailError) {
                    console.error('Failed to send follow-up email:', emailError)
                  }
                }
              }
            } catch (error) {
              console.error('Error sending follow-up email:', error)
            }
          }

          if (doc.status === 'confirmed' && previousDoc?.status === 'pending') {
            console.log(`Appointment confirmed: ${doc.bookingNumber}`)

            // Send confirmation notification
            try {
              if (doc.user && req.payload) {
                const customer = await req.payload.findByID({
                  collection: 'users',
                  id: doc.user
                })
                if (customer?.email) {
                  console.log(`Sending confirmation notification to: ${customer.email}`)
                }
              }
            } catch (error) {
              console.error('Error sending confirmation notification:', error)
            }
          }
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Prevent deletion of completed appointments for audit purposes
        const appointment = await req.payload.findByID({
          collection: 'appointments',
          id
        })
        
        if (appointment.status === 'completed') {
          throw new Error('Completed appointments cannot be deleted for audit purposes. Please cancel instead.')
        }
        
        // Handle recurring appointment deletion
        if (appointment.isParentAppointment) {
          // TODO: Handle deletion of child appointments
          console.log(`Deleting parent recurring appointment: ${appointment.bookingNumber}`)
        }
      },
    ],
  },
  fields: [
    {
      name: 'bookingNumber',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        description: 'Unique booking reference number',
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: ({ req }) => {
        return 'Appointment'
      },
      maxLength: 100,
      admin: {
        description: 'A brief title for the appointment',
      },
      validate: (val: any) => {
        if (!val || (typeof val === 'string' && val.length < 3)) {
          return 'Title must be at least 3 characters long'
        }
        return true
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        description: 'The customer booking the appointment',
      },
      hooks: {
        beforeChange: [
          ({ req, value }) => {
            // Auto-assign current user for customer role
            if (!value && req.user && req.user.role === 'customer') {
              return req.user.id
            }
            return value
          },
        ],
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: {
        description: 'The business/location for this appointment',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'barber',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: ({ data }): Where | false => {
        if (!data?.tenant) return false
        return {
          role: { equals: 'barber' },
          tenant: { equals: data.tenant },
          isActive: { equals: true }
        } as Where
      },
      admin: {
        description: 'The barber assigned to this appointment',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Start date and time of the appointment',
      },
      validate: (value) => {
        if (!value) return 'Date is required'
        
        const appointmentDate = new Date(value)
        const now = new Date()
        const maxFutureDate = new Date()
        maxFutureDate.setMonth(maxFutureDate.getMonth() + 6) // 6 months ahead
        
        if (appointmentDate <= now) {
          return 'Appointment date must be in the future'
        }
        if (appointmentDate > maxFutureDate) {
          return 'Appointment cannot be scheduled more than 6 months in advance'
        }
        
        // Check if it's within business hours
        const dayOfWeek = appointmentDate.getDay()
        const hour = appointmentDate.getHours()
        
        if (dayOfWeek === 0) {
          return 'Appointments cannot be scheduled on Sundays'
        }
        if (hour < 9 || hour >= 18) {
          return 'Appointments must be scheduled between 9 AM and 6 PM'
        }
        
        return true
      },
    },
    {
      name: 'endTime',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Calculated end time based on start time and duration',
        position: 'sidebar',
      },
    },
    {
      name: 'duration',
      type: 'number',
      required: true,
      defaultValue: 30,
      min: 15,
      max: 240,
      admin: {
        description: 'Duration in minutes',
        step: 15,
      },
      validate: (value: any) => {
        if (!value) return 'Duration is required'
        if (typeof value === 'number') {
          if (value < 15 || value > 240) {
            return 'Duration must be between 15 and 240 minutes'
          }
          if (value % 15 !== 0) {
            return 'Duration must be in 15-minute increments'
          }
        }
        return true
      },
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
      filterOptions: ({ data }): Where | false => {
        if (!data?.tenant) return false
        return {
          tenant: { equals: data.tenant },
          isActive: { equals: true }
        } as Where
      },
      admin: {
        description: 'The primary service being booked',
      },
    },
    {
      name: 'additionalServices',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      filterOptions: ({ data }): Where | false => {
        if (!data?.tenant) return false
        return {
          tenant: { equals: data.tenant },
          isActive: { equals: true },
          id: { not_equals: data.service }
        } as Where
      },
      admin: {
        description: 'Additional services added to this appointment',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        readOnly: true,
        description: 'Total price in cents (automatically calculated from services)',
        step: 1,
      },
    },
    {
      name: 'deposit',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Deposit amount in cents',
        step: 1,
      },
      validate: (value: any, { data }: { data: any }) => {
        if (!value || !data) return true
        if (typeof value === 'number' && data.price && value > data.price) {
          return 'Deposit cannot be greater than total price'
        }
        return true
      },
    },
    {
      name: 'discountAmount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Discount amount in cents',
        step: 1,
      },
    },
    {
      name: 'discountReason',
      type: 'text',
      admin: {
        description: 'Reason for discount',
        condition: (data) => data.discountAmount > 0,
      },
    },
    {
      name: 'finalPrice',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Final price after discounts (calculated automatically)',
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (!data) return 0
            return (data.price || 0) - (data.discountAmount || 0)
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'No Show', value: 'no-show' },
        { label: 'Rescheduled', value: 'rescheduled' },
      ],
      defaultValue: 'pending',
      required: true,
      index: true,
      admin: {
        description: 'Current status of the appointment',
      },
    },
    {
      name: 'statusChangeReason',
      type: 'text',
      admin: {
        description: 'Reason for status change (temporary field)',
        condition: (data, siblingData, { user }) => ['admin', 'manager', 'barber'].includes(user?.role),
      },
    },
    {
      name: 'statusHistory',
      type: 'array',
      fields: [
        {
          name: 'status',
          type: 'text',
          required: true,
        },
        {
          name: 'previousStatus',
          type: 'text',
        },
        {
          name: 'changedAt',
          type: 'date',
          required: true,
        },
        {
          name: 'changedBy',
          type: 'text',
          required: true,
        },
        {
          name: 'reason',
          type: 'text',
        },
        {
          name: 'notes',
          type: 'text',
        },
      ],
      admin: {
        readOnly: true,
        description: 'Complete history of status changes',
        position: 'sidebar',
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paid', value: 'paid' },
        { label: 'Partially Paid', value: 'partially-paid' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Failed', value: 'failed' },
        { label: 'Pending', value: 'pending' },
        { label: 'Disputed', value: 'disputed' },
      ],
      defaultValue: 'unpaid',
      required: true,
      index: true,
      admin: {
        description: 'Payment status for this appointment',
      },
    },
    {
      name: 'paymentMethod',
      type: 'select',
      options: [
        { label: 'Cash', value: 'cash' },
        { label: 'Card', value: 'card' },
        { label: 'Online', value: 'online' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'Gift Card', value: 'gift_card' },
        { label: 'Store Credit', value: 'store_credit' },
      ],
      admin: {
        description: 'Method of payment',
        condition: (data) => data.paymentStatus !== 'unpaid',
      },
    },
    {
      name: 'paymentDetails',
      type: 'group',
      fields: [
        {
          name: 'transactionId',
          type: 'text',
          admin: {
            description: 'Payment processor transaction ID',
          },
        },
        {
          name: 'paidAmount',
          type: 'number',
          min: 0,
          admin: {
            description: 'Amount actually paid in cents',
          },
        },
        {
          name: 'paidAt',
          type: 'date',
          admin: {
            description: 'When payment was received',
          },
        },
        {
          name: 'refundAmount',
          type: 'number',
          min: 0,
          admin: {
            description: 'Amount refunded in cents',
          },
        },
        {
          name: 'refundedAt',
          type: 'date',
          admin: {
            description: 'When refund was processed',
          },
        },
      ],
      admin: {
        condition: (data) => data.paymentStatus !== 'unpaid',
        description: 'Detailed payment information',
      },
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Stripe Payment Intent ID for tracking payments',
        position: 'sidebar',
      },
    },
    {
      name: 'googleEventId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Google Calendar Event ID for syncing',
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Additional notes or special requests from customer',
        rows: 3,
      },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Internal staff notes (not visible to customers)',
        rows: 3,
        condition: (data, siblingData, { user }) => ['admin', 'manager', 'barber'].includes(user?.role),
      },
    },
    {
      name: 'customerPreferences',
      type: 'group',
      fields: [
        {
          name: 'allergies',
          type: 'text',
          admin: {
            description: 'Known allergies or sensitivities',
          },
        },
        {
          name: 'preferredProducts',
          type: 'text',
          admin: {
            description: 'Customer preferred products',
          },
        },
        {
          name: 'avoidProducts',
          type: 'text',
          admin: {
            description: 'Products to avoid',
          },
        },
        {
          name: 'specialInstructions',
          type: 'textarea',
          admin: {
            description: 'Special care instructions',
            rows: 2,
          },
        },
      ],
      admin: {
        description: 'Customer preferences and requirements',
      },
    },
    {
      name: 'reminderSettings',
      type: 'group',
      fields: [
        {
          name: 'reminderSent',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            readOnly: true,
            description: 'Whether a reminder has been sent',
          },
        },
        {
          name: 'reminderSentAt',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'When the reminder was sent',
          },
        },
        {
          name: 'reminderMethod',
          type: 'select',
          options: [
            { label: 'Email', value: 'email' },
            { label: 'SMS', value: 'sms' },
            { label: 'Both', value: 'both' },
            { label: 'None', value: 'none' },
          ],
          defaultValue: 'email',
          admin: {
            description: 'Preferred reminder method',
          },
        },
        {
          name: 'reminderTime',
          type: 'select',
          options: [
            { label: '1 hour before', value: '1h' },
            { label: '2 hours before', value: '2h' },
            { label: '1 day before', value: '1d' },
            { label: '2 days before', value: '2d' },
          ],
          defaultValue: '1d',
          admin: {
            description: 'When to send reminder',
          },
        },
      ],
      admin: {
        description: 'Reminder notification settings',
      },
    },
    {
      name: 'cancellationReason',
      type: 'select',
      options: [
        { label: 'Customer Request', value: 'customer_request' },
        { label: 'Staff Unavailable', value: 'staff_unavailable' },
        { label: 'Emergency', value: 'emergency' },
        { label: 'Weather', value: 'weather' },
        { label: 'No Show', value: 'no_show' },
        { label: 'Double Booking', value: 'double_booking' },
        { label: 'Equipment Issue', value: 'equipment_issue' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        condition: (data) => data.status === 'cancelled',
        description: 'Reason for cancellation',
      },
    },
    {
      name: 'cancellationNotes',
      type: 'textarea',
      admin: {
        condition: (data) => data.status === 'cancelled',
        description: 'Additional details about the cancellation',
        rows: 2,
      },
    },
    {
      name: 'cancellationFee',
      type: 'number',
      min: 0,
      admin: {
        condition: (data) => data.status === 'cancelled',
        description: 'Cancellation fee charged (in cents)',
      },
    },
    {
      name: 'rescheduleHistory',
      type: 'array',
      fields: [
        {
          name: 'previousDate',
          type: 'date',
          required: true,
          admin: {
            description: 'Original appointment date/time',
          },
        },
        {
          name: 'newDate',
          type: 'date',
          required: true,
          admin: {
            description: 'Rescheduled date/time',
          },
        },
        {
          name: 'reason',
          type: 'text',
          admin: {
            description: 'Reason for rescheduling',
          },
        },
        {
          name: 'rescheduledBy',
          type: 'text',
          admin: {
            description: 'Who initiated the reschedule',
          },
        },
        {
          name: 'rescheduledAt',
          type: 'date',
          defaultValue: () => new Date().toISOString(),
          admin: {
            description: 'When the reschedule occurred',
          },
        },
        {
          name: 'rescheduleeFee',
          type: 'number',
          min: 0,
          admin: {
            description: 'Fee charged for rescheduling (in cents)',
          },
        },
      ],
      admin: {
        description: 'Complete history of rescheduled appointments',
        position: 'sidebar',
      },
    },
    {
      name: 'feedback',
      type: 'group',
      fields: [
        {
          name: 'customerRating',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Customer rating (1-5 stars)',
            step: 1,
          },
        },
        {
          name: 'customerFeedback',
          type: 'textarea',
          admin: {
            description: 'Customer feedback and comments',
            rows: 3,
          },
        },
        {
          name: 'serviceQuality',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Service quality rating',
          },
        },
        {
          name: 'staffFriendliness',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Staff friendliness rating',
          },
        },
        {
          name: 'cleanliness',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Cleanliness rating',
          },
        },
        {
          name: 'wouldRecommend',
          type: 'checkbox',
          admin: {
            description: 'Would customer recommend to others?',
          },
        },
        {
          name: 'feedbackDate',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'When feedback was submitted',
          },
        },
      ],
      admin: {
        condition: (data) => data.status === 'completed',
        description: 'Customer feedback and ratings',
      },
    },
    {
      name: 'isRecurring',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Is this part of a recurring appointment series?',
      },
    },
    {
      name: 'isParentAppointment',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'Is this the parent of a recurring series?',
        position: 'sidebar',
      },
    },
    {
      name: 'recurringPattern',
      type: 'group',
      fields: [
        {
          name: 'frequency',
          type: 'select',
          options: [
            { label: 'Weekly', value: 'weekly' },
            { label: 'Bi-weekly', value: 'biweekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Custom', value: 'custom' },
          ],
          required: true,
        },
        {
          name: 'interval',
          type: 'number',
          min: 1,
          max: 52,
          defaultValue: 1,
          admin: {
            description: 'Repeat every X periods',
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            description: 'When to stop creating recurring appointments',
          },
        },
        {
          name: 'maxOccurrences',
          type: 'number',
          min: 1,
          max: 100,
          admin: {
            description: 'Maximum number of appointments to create',
          },
        },
        {
          name: 'skipWeekends',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Skip weekends when creating recurring appointments',
          },
        },
        {
          name: 'skipHolidays',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Skip holidays when creating recurring appointments',
          },
        },
      ],
      admin: {
        condition: (data) => data.isRecurring,
        description: 'Recurring appointment configuration',
      },
      validate: (value: any, { data }: { data: any }) => {
        if (data.isRecurring) {
          if (!value?.endDate && !value?.maxOccurrences) {
            return 'Either end date or max occurrences must be specified for recurring appointments'
          }
        }
        return true
      },
    },
    {
      name: 'parentAppointment',
      type: 'relationship',
      relationTo: 'appointments',
      admin: {
        description: 'Parent appointment if this is part of a recurring series',
        condition: (data) => data.isRecurring && !data.isParentAppointment,
        position: 'sidebar',
      },
    },
    {
      name: 'childAppointments',
      type: 'relationship',
      relationTo: 'appointments',
      hasMany: true,
      admin: {
        readOnly: true,
        description: 'Child appointments in this recurring series',
        condition: (data) => data.isParentAppointment,
        position: 'sidebar',
      },
    },
    {
      name: 'metadata',
      type: 'group',
      fields: [
        {
          name: 'source',
          type: 'select',
          options: [
            { label: 'Website', value: 'website' },
            { label: 'Phone', value: 'phone' },
            { label: 'Walk-in', value: 'walk_in' },
            { label: 'Mobile App', value: 'mobile_app' },
            { label: 'Social Media', value: 'social_media' },
            { label: 'Referral', value: 'referral' },
          ],
          defaultValue: 'website',
          admin: {
            description: 'How the appointment was booked',
          },
        },
        {
          name: 'deviceType',
          type: 'select',
          options: [
            { label: 'Desktop', value: 'desktop' },
            { label: 'Mobile', value: 'mobile' },
            { label: 'Tablet', value: 'tablet' },
          ],
          admin: {
            description: 'Device used for booking',
          },
        },
        {
          name: 'ipAddress',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'IP address of booking',
          },
        },
        {
          name: 'userAgent',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Browser user agent',
          },
        },
      ],
      admin: {
        description: 'Booking metadata and analytics',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}

// Helper function to create recurring appointments
async function createRecurringAppointments(parentDoc: any, req: any) {
  const { recurringPattern } = parentDoc
  if (!recurringPattern) return

  const appointments = []
  const startDate = new Date(parentDoc.date)
  let currentDate = new Date(startDate)
  let count = 0
  const maxCount = recurringPattern.maxOccurrences || 52
  const endDate = recurringPattern.endDate ? new Date(recurringPattern.endDate) : null

  while (count < maxCount && (!endDate || currentDate <= endDate)) {
    // Calculate next occurrence
    switch (recurringPattern.frequency) {
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (7 * recurringPattern.interval))
        break
      case 'biweekly':
        currentDate.setDate(currentDate.getDate() + (14 * recurringPattern.interval))
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + recurringPattern.interval)
        break
    }

    // Skip weekends if configured
    if (recurringPattern.skipWeekends && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
      continue
    }

    // Skip if past end date
    if (endDate && currentDate > endDate) {
      break
    }

    // Create child appointment
    const childAppointment = {
      ...parentDoc,
      id: undefined,
      bookingNumber: undefined,
      date: currentDate.toISOString(),
      isParentAppointment: false,
      parentAppointment: parentDoc.id,
      createdAt: undefined,
      updatedAt: undefined,
    }

    try {
      const created = await req.payload.create({
        collection: 'appointments',
        data: childAppointment,
      })
      appointments.push(created.id)
    } catch (error: any) {
      console.error(`Failed to create recurring appointment: ${error.message}`)
    }

    count++
  }

  // Update parent with child references
  if (appointments.length > 0) {
    await req.payload.update({
      collection: 'appointments',
      id: parentDoc.id,
      data: {
        childAppointments: appointments,
      },
    })
  }
}
