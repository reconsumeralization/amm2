import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'content',
    description: 'Customer testimonials and reviews',
    group: 'Content',
    defaultColumns: ['content', 'barber', 'client', 'status', 'rating', 'createdAt'],
    listSearchableFields: ['content', 'barber.name', 'client.name'],
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { tenant: { equals: req.user?.tenant?.id } }
    },
    create: ({ req }) => {
      return req.user?.role === 'client' || req.user?.role === 'customer' || req.user?.role === 'admin'
    },
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user?.role === 'manager') return { tenant: { equals: req.user?.tenant?.id } }
      return false
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user?.tenant?.id) {
          data.tenant = req.user.tenant.id
        }

        // Auto-set client if creating own testimonial
        if (!data.client && req.user?.role === 'client') {
          data.client = req.user.id
        }

        // Auto-set status for new testimonials
        if (operation === 'create' && !data.status) {
          data.status = req.user?.role === 'admin' ? 'approved' : 'pending'
        }

        // Validate testimonial content
        if (data.content) {
          // Check minimum length
          if (data.content.length < 20) {
            throw new Error('Testimonial must be at least 20 characters long')
          }

          // Check for inappropriate content (basic filter)
          const inappropriateWords = ['spam', 'test', 'fake', 'dummy']
          const lowerContent = data.content.toLowerCase()
          if (inappropriateWords.some(word => lowerContent.includes(word))) {
            throw new Error('Testimonial contains inappropriate content')
          }
        }

        // Validate rating
        if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
          throw new Error('Rating must be between 1 and 5 stars')
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req, previousDoc }) => {
        if (operation === 'create') {
          console.log(`New testimonial submitted for ${doc.barber?.name || 'Unknown Barber'}`)

          // Send notification to barber
          if (doc.barber && req.payload) {
            try {
              const barber = await req.payload.findByID({
                collection: 'users',
                id: doc.barber
              })

              if (barber?.email) {
                console.log(`Notifying barber ${barber.email} of new testimonial`)
                // TODO: Implement barber notification
                // await notifyBarberOfTestimonial(barber.email, doc)
              }
            } catch (error) {
              console.error('Error notifying barber:', error)
            }
          }

          // Update barber's average rating
          if (doc.barber && req.payload) {
            try {
              const allTestimonials = await req.payload.find({
                collection: 'testimonials',
                where: {
                  barber: { equals: doc.barber },
                  status: { equals: 'approved' }
                }
              })

              if (allTestimonials.totalDocs > 0) {
                const totalRating = allTestimonials.docs.reduce((sum, testimonial) => sum + (testimonial.rating || 0), 0)
                const averageRating = totalRating / allTestimonials.totalDocs

                // Update barber's profile with new average rating
                await req.payload.update({
                  collection: 'users',
                  id: doc.barber,
                  data: {
                    averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal
                  }
                })

                console.log(`Updated barber rating to ${averageRating.toFixed(1)} stars`)
              }
            } catch (error) {
              console.error('Error updating barber rating:', error)
            }
          }
        }

        if (operation === 'update' && previousDoc) {
          // Handle status changes
          if (doc.status !== previousDoc.status) {
            console.log(`Testimonial ${doc.id} status changed from ${previousDoc.status} to ${doc.status}`)

            if (doc.status === 'approved' && previousDoc.status !== 'approved') {
              // Send approval notification to client
              if (doc.client && req.payload) {
                try {
                  const client = await req.payload.findByID({
                    collection: 'users',
                    id: doc.client
                  })

                  if (client?.email) {
                    console.log(`Notifying client ${client.email} of testimonial approval`)
                    // TODO: Implement approval notification
                  }
                } catch (error) {
                  console.error('Error sending approval notification:', error)
                }
              }
            }

            if (doc.status === 'rejected' && previousDoc.status !== 'rejected') {
              // Send rejection notification
              if (doc.client && req.payload) {
                try {
                  const client = await req.payload.findByID({
                    collection: 'users',
                    id: doc.client
                  })

                  if (client?.email) {
                    console.log(`Notifying client ${client.email} of testimonial rejection`)
                    // TODO: Implement rejection notification
                  }
                } catch (error) {
                  console.error('Error sending rejection notification:', error)
                }
              }
            }
          }

          // Update barber rating if rating changed
          if (doc.rating !== previousDoc.rating && doc.barber && req.payload) {
            try {
              const allTestimonials = await req.payload.find({
                collection: 'testimonials',
                where: {
                  barber: { equals: doc.barber },
                  status: { equals: 'approved' }
                }
              })

              if (allTestimonials.totalDocs > 0) {
                const totalRating = allTestimonials.docs.reduce((sum, testimonial) => sum + (testimonial.rating || 0), 0)
                const averageRating = totalRating / allTestimonials.totalDocs

                await req.payload.update({
                  collection: 'users',
                  id: doc.barber,
                  data: {
                    averageRating: Math.round(averageRating * 10) / 10
                  }
                })

                console.log(`Updated barber rating to ${averageRating.toFixed(1)} stars after rating change`)
              }
            } catch (error) {
              console.error('Error updating barber rating after change:', error)
            }
          }
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Only admins can delete testimonials
        if (req.user?.role !== 'admin') {
          throw new Error('Only administrators can delete testimonials')
        }

        // Update barber's rating after deletion
        if (req.payload) {
          try {
            const testimonial = await req.payload.findByID({
              collection: 'testimonials',
              id: id
            })

            if (testimonial?.barber) {
              const remainingTestimonials = await req.payload.find({
                collection: 'testimonials',
                where: {
                  barber: { equals: testimonial.barber },
                  status: { equals: 'approved' },
                  id: { not_equals: id }
                }
              })

              if (remainingTestimonials.totalDocs > 0) {
                const totalRating = remainingTestimonials.docs.reduce((sum, t) => sum + (t.rating || 0), 0)
                const averageRating = totalRating / remainingTestimonials.totalDocs

                await req.payload.update({
                  collection: 'users',
                  id: testimonial.barber,
                  data: {
                    averageRating: Math.round(averageRating * 10) / 10
                  }
                })

                console.log(`Updated barber rating after testimonial deletion: ${averageRating.toFixed(1)} stars`)
              } else {
                // No testimonials left, reset rating
                await req.payload.update({
                  collection: 'users',
                  id: testimonial.barber,
                  data: {
                    averageRating: null
                  }
                })

                console.log('Reset barber rating - no testimonials remaining')
              }
            }
          } catch (error) {
            console.error('Error updating barber rating after testimonial deletion:', error)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'content',
      type: 'textarea',
      required: true,
      maxLength: 1000,
      admin: {
        description: 'The testimonial content (max 1000 characters)',
        placeholder: 'Share your experience...',
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: 'Rating from 1 to 5 stars',
        step: 1,
      },
    },
    {
      name: 'barber',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      filterOptions: {
        role: { equals: 'barber' },
      },
      admin: {
        description: 'The barber this testimonial is about',
      },
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: {
        role: { in: ['client', 'customer'] },
      },
      admin: {
        description: 'The client who wrote this testimonial',
      },
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      admin: {
        description: 'The service this testimonial relates to',
      },
    },
    {
      name: 'appointment',
      type: 'relationship',
      relationTo: 'appointments',
      admin: {
        description: 'The appointment this testimonial relates to',
      },
    },
    {
      name: 'likes',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Number of likes this testimonial has received',
        readOnly: true,
      },
    },
    {
      name: 'isVerified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mark as verified testimonial',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this testimonial on homepage',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'The BarberShop/tenant this testimonial belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'pending',
      required: true,
      admin: {
        description: 'Approval status of the testimonial',
      },
    },
    {
      name: 'moderatorNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes for moderation (not visible to clients)',
        condition: (data, siblingData, { user }) => user?.role === 'admin' || user?.role === 'manager',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description: 'When this testimonial was published',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  timestamps: true,
}
