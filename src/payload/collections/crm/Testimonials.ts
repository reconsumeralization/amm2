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
          data.tenant = (req.user as any)?.tenant.id
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
                collection: 'users' as any as any,
                id: doc.barber
              })

              if (barber?.email) {
                console.log(`Notifying barber ${barber.email} of new testimonial`)
                
                try {
                  const { emailService } = await import('@/lib/email-service');
                  
                  // Get client information for the notification
                  const client = doc.client ? await req.payload.findByID({
                    collection: 'users' as any as any,
                    id: doc.client
                  }) : null;

                  await emailService.sendEmail({
                    to: barber.email,
                    subject: 'New Testimonial Received - ModernMen',
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #ffc107;">New Customer Testimonial</h2>
                        <p>Hi ${barber.name || barber.email},</p>
                        <p>Great news! You've received a new testimonial from a happy customer.</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                          <h3>Testimonial Details:</h3>
                          <p><strong>Rating:</strong> ${'⭐'.repeat(doc.rating || 5)} (${doc.rating}/5 stars)</p>
                          <p><strong>Customer:</strong> ${client?.name || 'Anonymous'}</p>
                          ${doc.service ? `<p><strong>Service:</strong> ${doc.service?.name || 'Service'}</p>` : ''}
                          <div style="border-left: 3px solid #ffc107; padding-left: 15px; margin: 15px 0;">
                            <p><em>"${doc.content}"</em></p>
                          </div>
                          <p><strong>Status:</strong> ${doc.status === 'approved' ? '✅ Approved' : '⏳ Pending Review'}</p>
                        </div>
                        
                        <p>Keep up the excellent work! Customer feedback like this helps build your reputation and attracts new clients.</p>
                        <p>Best regards,<br>The ModernMen Team</p>
                      </div>
                    `,
                    text: `New testimonial received! Rating: ${doc.rating}/5 stars. Customer: ${client?.name || 'Anonymous'}. Testimonial: "${doc.content}". Status: ${doc.status}.`
                  });

                  console.log(`Successfully sent testimonial notification to barber: ${barber.email}`);
                } catch (emailError) {
                  console.error('Error sending barber testimonial notification:', emailError);
                }
              }
            } catch (error) {
              console.error('Error notifying barber:', error)
            }
          }

          // Update barber's average rating
          if (doc.barber && req.payload) {
            try {
              const allTestimonials = await req.payload.find({
                collection: 'testimonials' as any as any,
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
                  collection: 'users' as any as any,
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
                    collection: 'users' as any as any,
                    id: doc.client
                  })

                  if (client?.email) {
                    console.log(`Notifying client ${client.email} of testimonial approval`)
                    
                    try {
                      const { emailService } = await import('@/lib/email-service');
                      
                      // Get barber information for the notification
                      const barber = doc.barber ? await req.payload.findByID({
                        collection: 'users' as any as any,
                        id: doc.barber
                      }) : null;

                      await emailService.sendEmail({
                        to: client.email,
                        subject: 'Testimonial Approved - Thank You! - ModernMen',
                        html: `
                          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #28a745;">Your Testimonial Has Been Approved!</h2>
                            <p>Hi ${client.name || client.email},</p>
                            <p>Thank you for sharing your experience! Your testimonial has been approved and is now live on our website.</p>
                            
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                              <h3>Your Published Testimonial:</h3>
                              <p><strong>Rating:</strong> ${'⭐'.repeat(doc.rating || 5)} (${doc.rating}/5 stars)</p>
                              <p><strong>About:</strong> ${barber?.name || 'Our Team'}</p>
                              <div style="border-left: 3px solid #28a745; padding-left: 15px; margin: 15px 0;">
                                <p><em>"${doc.content}"</em></p>
                              </div>
                            </div>
                            
                            <p>Your feedback helps other customers make informed decisions and helps us continue to provide excellent service.</p>
                            <p>Thank you for being a valued customer!</p>
                            <p>Best regards,<br>The ModernMen Team</p>
                          </div>
                        `,
                        text: `Your testimonial has been approved! Rating: ${doc.rating}/5 stars. Your review: "${doc.content}". Thank you for your feedback!`
                      });

                      console.log(`Successfully sent approval notification to client: ${client.email}`);
                    } catch (emailError) {
                      console.error('Error sending testimonial approval notification:', emailError);
                    }
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
                    collection: 'users' as any as any,
                    id: doc.client
                  })

                  if (client?.email) {
                    console.log(`Notifying client ${client.email} of testimonial rejection`)
                    
                    try {
                      const { emailService } = await import('@/lib/email-service');
                      
                      // Get barber information for the notification
                      const barber = doc.barber ? await req.payload.findByID({
                        collection: 'users' as any as any,
                        id: doc.barber
                      }) : null;

                      await emailService.sendEmail({
                        to: client.email,
                        subject: 'Testimonial Update - ModernMen',
                        html: `
                          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #6c757d;">Testimonial Review Update</h2>
                            <p>Hi ${client.name || client.email},</p>
                            <p>Thank you for taking the time to share your feedback with us. After review, we were unable to publish your recent testimonial.</p>
                            
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                              <h3>Your Submission:</h3>
                              <p><strong>Rating:</strong> ${'⭐'.repeat(doc.rating || 5)} (${doc.rating}/5 stars)</p>
                              <p><strong>About:</strong> ${barber?.name || 'Our Team'}</p>
                              <div style="border-left: 3px solid #6c757d; padding-left: 15px; margin: 15px 0;">
                                <p><em>"${doc.content}"</em></p>
                              </div>
                              ${doc.moderatorNotes ? `<p><strong>Moderator Notes:</strong> ${doc.moderatorNotes}</p>` : ''}
                            </div>
                            
                            <p>This may be due to our content guidelines or review policies. If you have questions about this decision, please don't hesitate to contact us.</p>
                            <p>We value your feedback and appreciate your understanding.</p>
                            <p>Best regards,<br>The ModernMen Team</p>
                          </div>
                        `,
                        text: `Your testimonial submission was not approved for publication. Rating: ${doc.rating}/5 stars. Content: "${doc.content}". ${doc.moderatorNotes ? 'Notes: ' + doc.moderatorNotes : ''} Contact us if you have questions.`
                      });

                      console.log(`Successfully sent rejection notification to client: ${client.email}`);
                    } catch (emailError) {
                      console.error('Error sending testimonial rejection notification:', emailError);
                    }
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
                collection: 'testimonials' as any as any,
                where: {
                  barber: { equals: doc.barber },
                  status: { equals: 'approved' }
                }
              })

              if (allTestimonials.totalDocs > 0) {
                const totalRating = allTestimonials.docs.reduce((sum, testimonial) => sum + (testimonial.rating || 0), 0)
                const averageRating = totalRating / allTestimonials.totalDocs

                await req.payload.update({
                  collection: 'users' as any as any,
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
              collection: 'testimonials' as any as any,
              id: id
            })

            if (testimonial?.barber) {
              const remainingTestimonials = await req.payload.find({
                collection: 'testimonials' as any as any,
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
                  collection: 'users' as any as any,
                  id: testimonial.barber,
                  data: {
                    averageRating: Math.round(averageRating * 10) / 10
                  }
                })

                console.log(`Updated barber rating after testimonial deletion: ${averageRating.toFixed(1)} stars`)
              } else {
                // No testimonials left, reset rating
                await req.payload.update({
                  collection: 'users' as any as any,
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
      relationTo: 'users' as any as any,
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
      relationTo: 'users' as any as any,
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
      relationTo: 'services' as any as any,
      admin: {
        description: 'The service this testimonial relates to',
      },
    },
    {
      name: 'appointment',
      type: 'relationship',
      relationTo: 'appointments' as any as any,
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
      relationTo: 'tenants' as any as any,
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
