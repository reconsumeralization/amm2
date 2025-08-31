import { CollectionConfig } from 'payload';

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: {
    singular: 'Review',
    plural: 'Reviews',
  },
  admin: {
    useAsTitle: 'customer',
    group: 'CRM',
    description: 'Customer reviews and ratings for services and staff',
    defaultColumns: ['customer', 'service', 'rating', 'approved', 'createdAt'],
    listSearchableFields: ['customer.name', 'customer.email', 'text', 'service.name'],
  },
  access: {
    read: ({ req }): any => {
      if (!req.user) {
        // Public can read approved reviews
        return { approved: { equals: true } };
      }
      if (req.user.role === 'admin') return true;
      if (['manager', 'barber'].includes(req.user.role)) {
        return { tenant: { equals: req.user.tenant?.id } };
      }
      // Customers can read their own reviews
      return {
        tenant: { equals: req.user.tenant?.id },
        customer: { equals: req.user.id }
      };
    },
    create: ({ req }): boolean => {
      if (!req.user) return false;
      // Allow customers to create reviews, staff to create on behalf of customers
      return ['admin', 'manager', 'barber', 'customer'].includes(req.user.role);
    },
    update: ({ req }): any => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      if (req.user.role === 'manager') {
        return { tenant: { equals: req.user.tenant?.id } };
      }
      // Customers can only update their own unapproved reviews
      return {
        tenant: { equals: req.user.tenant?.id },
        customer: { equals: req.user.id },
        approved: { equals: false }
      };
    },
    delete: ({ req }): any => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      // Prevent deletion of approved reviews
      return false;
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (!data) return data;

        // Auto-assign tenant for non-admin users
        if (operation === 'create' && !data.tenant && req.user && req.user.role !== 'admin') {
          data.tenant = req.user.tenant?.id;
        }

        // Auto-assign customer for customer reviews
        if (operation === 'create' && !data.customer && req.user && req.user.role === 'customer') {
          data.customer = req.user.id;
        }

        // Validate rating range
        if (data.rating && (data.rating < 1 || data.rating > 5)) {
          throw new Error('Rating must be between 1 and 5 stars');
        }

        return data;
      },
    ],
    beforeChange: [
      ({ data, operation, req }) => {
        if (!data) return data;

        if (operation === 'create') {
          console.log(`Creating review for customer`);

          // Set submission date
          if (!data.submittedAt) {
            data.submittedAt = new Date().toISOString();
          }

          // Auto-set approved status based on user role
          if (req.user && ['admin', 'manager'].includes(req.user.role) && data.approved === undefined) {
            data.approved = true;
          }
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req, previousDoc }) => {
        if (operation === 'create') {
          console.log(`Review created: ${doc.id} (${doc.rating} stars)`);

          // Send notification to staff about new review
          try {
            const { emailService } = await import('@/lib/email-service');
            const payload = req.payload;
            
            if (payload) {
              // Get staff members (managers and barbers) to notify
              const staffMembers = await payload.find({
                collection: 'users',
                where: {
                  and: [
                    { tenant: { equals: doc.tenant } },
                    { role: { in: ['admin', 'manager', 'barber'] } },
                    { isActive: { equals: true } }
                  ]
                }
              });

              // Get customer details
              const customer = await payload.findByID({
                collection: 'users',
                id: doc.customer
              });

              // Get service details if available
              const service = doc.service ? await payload.findByID({
                collection: 'services',
                id: doc.service
              }) : null;

              // Get barber details if specified
              const barber = doc.barber ? await payload.findByID({
                collection: 'users',
                id: doc.barber
              }) : null;

              // Send notification to each staff member
              for (const staff of staffMembers.docs) {
                if (staff.email) {
                  await emailService.sendEmail({
                    to: staff.email,
                    subject: `New Customer Review - ${doc.rating} Stars - ModernMen`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #ffc107;">New Customer Review Received</h2>
                        <p>Hi ${staff.name || staff.email},</p>
                        <p>A new customer review has been submitted and ${doc.approved ? 'is now live' : 'requires moderation'}.</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                          <h3>Review Details:</h3>
                          <p><strong>Rating:</strong> ${'⭐'.repeat(doc.rating)} (${doc.rating}/5 stars)</p>
                          <p><strong>Customer:</strong> ${customer?.name || customer?.email || 'Anonymous'}</p>
                          ${service ? `<p><strong>Service:</strong> ${service.name}</p>` : ''}
                          ${barber ? `<p><strong>Barber:</strong> ${barber.name}</p>` : ''}
                          ${doc.title ? `<p><strong>Title:</strong> ${doc.title}</p>` : ''}
                          <div style="border-left: 3px solid #ffc107; padding-left: 15px; margin: 15px 0;">
                            <p><em>"${doc.text}"</em></p>
                          </div>
                          <p><strong>Status:</strong> ${doc.approved ? '✅ Approved' : '⏳ Pending Review'}</p>
                          ${doc.source ? `<p><strong>Source:</strong> ${doc.source}</p>` : ''}
                        </div>
                        
                        ${!doc.approved ? '<p>Please review and approve/moderate this review in the admin panel.</p>' : ''}
                        <p>Best regards,<br>ModernMen System</p>
                      </div>
                    `,
                    text: `New customer review: ${doc.rating}/5 stars from ${customer?.name || customer?.email || 'Anonymous'}. Review: "${doc.text}". Status: ${doc.approved ? 'Approved' : 'Pending Review'}.`
                  });
                }
              }

              console.log(`Sent new review notifications to ${staffMembers.totalDocs} staff members`);
            }

            // Update service/staff average ratings
            if (doc.approved) {
              await updateRatingsForReview(doc, payload);
            }

          } catch (error) {
            console.error('Error handling new review:', error);
          }
        }

        if (operation === 'update' && doc.approved && previousDoc && !previousDoc.approved) {
          console.log(`Review approved: ${doc.id}`);

          try {
            const { emailService } = await import('@/lib/email-service');
            const payload = req.payload;

            // Send notification to customer about approved review
            if (payload) {
              const customer = await payload.findByID({
                collection: 'users',
                id: doc.customer
              });

              if (customer?.email) {
                // Get service and barber details for the notification
                const service = doc.service ? await payload.findByID({
                  collection: 'services',
                  id: doc.service
                }) : null;

                const barber = doc.barber ? await payload.findByID({
                  collection: 'users',
                  id: doc.barber
                }) : null;

                await emailService.sendEmail({
                  to: customer.email,
                  subject: 'Your Review Has Been Published - ModernMen',
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #28a745;">Your Review is Now Live!</h2>
                      <p>Hi ${customer.name || customer.email},</p>
                      <p>Thank you for sharing your experience! Your review has been approved and is now published on our website.</p>
                      
                      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3>Your Published Review:</h3>
                        <p><strong>Rating:</strong> ${'⭐'.repeat(doc.rating)} (${doc.rating}/5 stars)</p>
                        ${service ? `<p><strong>Service:</strong> ${service.name}</p>` : ''}
                        ${barber ? `<p><strong>Barber:</strong> ${barber.name}</p>` : ''}
                        ${doc.title ? `<p><strong>Title:</strong> ${doc.title}</p>` : ''}
                        <div style="border-left: 3px solid #28a745; padding-left: 15px; margin: 15px 0;">
                          <p><em>"${doc.text}"</em></p>
                        </div>
                        ${doc.featured ? '<p style="color: #28a745;"><strong>🌟 Featured Review</strong></p>' : ''}
                      </div>
                      
                      <p>Your feedback helps other customers make informed decisions and helps us continue to provide excellent service.</p>
                      <p>Thank you for choosing ModernMen!</p>
                      <p>Best regards,<br>The ModernMen Team</p>
                    </div>
                  `,
                  text: `Your review has been published! Rating: ${doc.rating}/5 stars. Review: "${doc.text}". Thank you for your feedback!`
                });

                console.log(`Sent review approval notification to customer: ${customer.email}`);
              }

              // Recalculate average ratings now that review is approved
              await updateRatingsForReview(doc, payload);

              // Set approval timestamp and approver if not already set
              if (!doc.approvedAt) {
                await payload.update({
                  collection: 'reviews',
                  id: doc.id,
                  data: {
                    approvedAt: new Date().toISOString(),
                    approvedBy: req.user?.id
                  }
                });
              }
            }

          } catch (error) {
            console.error('Error handling approved review:', error);
          }
        }

        // Handle rating updates for already approved reviews
        if (operation === 'update' && doc.approved && previousDoc?.approved && doc.rating !== previousDoc.rating) {
          console.log(`Review rating updated: ${doc.id} (${previousDoc.rating} -> ${doc.rating} stars)`);
          
          try {
            const payload = req.payload;
            if (payload) {
              await updateRatingsForReview(doc, payload, previousDoc);
            }
          } catch (error) {
            console.error('Error updating ratings after review change:', error);
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: {
        description: 'Business this review belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      filterOptions: ({ data }): any => {
        if (!data?.tenant) return false;
        return {
          tenant: { equals: data.tenant },
          role: { equals: 'customer' }
        };
      },
      admin: {
        description: 'Customer who wrote this review',
      },
    },
    {
      name: 'appointment',
      type: 'relationship',
      relationTo: 'appointments',
      index: true,
      admin: {
        description: 'Appointment this review is for (optional)',
      },
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      admin: {
        description: 'Service being reviewed (optional)',
      },
    },
    {
      name: 'barber',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: ({ data }): any => {
        if (!data?.tenant) return false;
        return {
          tenant: { equals: data.tenant },
          role: { in: ['barber', 'manager'] }
        };
      },
      admin: {
        description: 'Staff member being reviewed (optional)',
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: 'Overall rating (1-5 stars)',
        step: 1,
      },
    },
    {
      name: 'title',
      type: 'text',
      maxLength: 200,
      admin: {
        description: 'Review title or headline',
      },
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
      maxLength: 2000,
      admin: {
        description: 'Review content',
        rows: 4,
      },
    },
    {
      name: 'categories',
      type: 'group',
      admin: {
        description: 'Detailed ratings by category',
      },
      fields: [
        {
          name: 'serviceQuality',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Service quality rating',
            step: 1,
          },
        },
        {
          name: 'staffFriendliness',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Staff friendliness rating',
            step: 1,
          },
        },
        {
          name: 'cleanliness',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Cleanliness rating',
            step: 1,
          },
        },
        {
          name: 'value',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Value for money rating',
            step: 1,
          },
        },
        {
          name: 'waitingTime',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Waiting time rating',
            step: 1,
          },
        },
      ],
    },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Has this review been approved for public display?',
      },
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Staff member who approved this review',
        condition: (data) => data.approved,
      },
    },
    {
      name: 'approvedAt',
      type: 'date',
      admin: {
        description: 'When this review was approved',
        condition: (data) => data.approved,
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this review on the website?',
        condition: (data) => data.approved,
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      required: true,
      admin: {
        description: 'When the review was submitted',
      },
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Is this a verified review (from actual customer)?',
      },
    },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Google', value: 'google' },
        { label: 'Yelp', value: 'yelp' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Email', value: 'email' },
        { label: 'In-Person', value: 'in_person' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'website',
      admin: {
        description: 'Where did this review come from?',
      },
    },
    {
      name: 'response',
      type: 'group',
      admin: {
        description: 'Business response to this review',
      },
      fields: [
        {
          name: 'responded',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Has the business responded to this review?',
          },
        },
        {
          name: 'responseText',
          type: 'textarea',
          maxLength: 1000,
          admin: {
            description: 'Business response text',
            condition: (data) => data.responded,
            rows: 3,
          },
        },
        {
          name: 'respondedBy',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'Staff member who responded',
            condition: (data) => data.responded,
          },
        },
        {
          name: 'respondedAt',
          type: 'date',
          admin: {
            description: 'When the response was posted',
            condition: (data) => data.responded,
          },
        },
      ],
    },
    {
      name: 'photos',
      type: 'array',
      admin: {
        description: 'Photos uploaded with this review',
      },
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          admin: {
            description: 'Photo caption',
          },
        },
      ],
      maxRows: 5,
    },
    {
      name: 'helpful',
      type: 'group',
      admin: {
        description: 'Helpfulness tracking',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'helpfulVotes',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of helpful votes',
            readOnly: true,
          },
        },
        {
          name: 'totalVotes',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total number of votes',
            readOnly: true,
          },
        },
        {
          name: 'helpfulnessRatio',
          type: 'number',
          admin: {
            description: 'Helpfulness ratio (0-1)',
            readOnly: true,
          },
          hooks: {
            beforeChange: [
              ({ data }) => {
                if (!data) return 0;
                if (data.totalVotes && data.totalVotes > 0) {
                  return data.helpfulVotes / data.totalVotes;
                }
                return 0;
              },
            ],
          },
        },
      ],
    },
    {
      name: 'metadata',
      type: 'group',
      admin: {
        description: 'Review metadata',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'ipAddress',
          type: 'text',
          admin: {
            description: 'IP address of reviewer',
            readOnly: true,
          },
        },
        {
          name: 'userAgent',
          type: 'text',
          admin: {
            description: 'Browser/device info',
            readOnly: true,
          },
        },
        {
          name: 'edited',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Has this review been edited?',
            readOnly: true,
          },
        },
        {
          name: 'moderationNotes',
          type: 'textarea',
          maxLength: 500,
          admin: {
            description: 'Internal moderation notes',
            rows: 2,
          },
        },
      ],
    },
  ],
  timestamps: true,
};

/**
 * Helper function to update average ratings when reviews change
 */
async function updateRatingsForReview(doc: any, payload: any, previousDoc?: any) {
  try {
    // Update barber/staff average rating
    if (doc.barber) {
      await updateBarberRating(doc.barber, payload);
    }

    // Update service average rating
    if (doc.service) {
      await updateServiceRating(doc.service, payload);
    }

    // Update overall business rating
    await updateBusinessRating(doc.tenant, payload);

    console.log(`Updated ratings for review ${doc.id}`);
  } catch (error) {
    console.error('Error updating ratings:', error);
  }
}

/**
 * Update barber's average rating based on all approved reviews
 */
async function updateBarberRating(barberId: string, payload: any) {
  try {
    const reviews = await payload.find({
      collection: 'reviews',
      where: {
        and: [
          { barber: { equals: barberId } },
          { approved: { equals: true } }
        ]
      },
      limit: 1000 // Should be enough for most barbers
    });

    if (reviews.totalDocs > 0) {
      const totalRating = reviews.docs.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
      const averageRating = totalRating / reviews.totalDocs;

      // Calculate category averages if available
      const categoryAverages: any = {};
      const categoryFields = ['serviceQuality', 'staffFriendliness', 'cleanliness', 'value', 'waitingTime'];
      
      categoryFields.forEach(field => {
        const validRatings = reviews.docs
          .filter((review: any) => review.categories && review.categories[field])
          .map((review: any) => review.categories[field]);
        
        if (validRatings.length > 0) {
          categoryAverages[field] = validRatings.reduce((sum: number, rating: number) => sum + rating, 0) / validRatings.length;
        }
      });

      await payload.update({
        collection: 'users',
        id: barberId,
        data: {
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          totalReviews: reviews.totalDocs,
          categoryRatings: Object.keys(categoryAverages).length > 0 ? categoryAverages : undefined
        }
      });

      console.log(`Updated barber ${barberId} rating to ${averageRating.toFixed(1)} stars (${reviews.totalDocs} reviews)`);
    } else {
      // No reviews, reset ratings
      await payload.update({
        collection: 'users',
        id: barberId,
        data: {
          averageRating: null,
          totalReviews: 0,
          categoryRatings: null
        }
      });

      console.log(`Reset barber ${barberId} rating - no reviews`);
    }
  } catch (error) {
    console.error(`Error updating barber rating for ${barberId}:`, error);
  }
}

/**
 * Update service's average rating based on all approved reviews
 */
async function updateServiceRating(serviceId: string, payload: any) {
  try {
    const reviews = await payload.find({
      collection: 'reviews',
      where: {
        and: [
          { service: { equals: serviceId } },
          { approved: { equals: true } }
        ]
      },
      limit: 1000
    });

    if (reviews.totalDocs > 0) {
      const totalRating = reviews.docs.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
      const averageRating = totalRating / reviews.totalDocs;

      await payload.update({
        collection: 'services',
        id: serviceId,
        data: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: reviews.totalDocs
        }
      });

      console.log(`Updated service ${serviceId} rating to ${averageRating.toFixed(1)} stars (${reviews.totalDocs} reviews)`);
    } else {
      await payload.update({
        collection: 'services',
        id: serviceId,
        data: {
          averageRating: null,
          totalReviews: 0
        }
      });

      console.log(`Reset service ${serviceId} rating - no reviews`);
    }
  } catch (error) {
    console.error(`Error updating service rating for ${serviceId}:`, error);
  }
}

/**
 * Update business's overall average rating based on all approved reviews
 */
async function updateBusinessRating(tenantId: string, payload: any) {
  try {
    const reviews = await payload.find({
      collection: 'reviews',
      where: {
        and: [
          { tenant: { equals: tenantId } },
          { approved: { equals: true } }
        ]
      },
      limit: 10000 // Large limit for businesses with many reviews
    });

    if (reviews.totalDocs > 0) {
      const totalRating = reviews.docs.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
      const averageRating = totalRating / reviews.totalDocs;

      // Calculate rating distribution
      const ratingDistribution = [0, 0, 0, 0, 0]; // [1-star, 2-star, 3-star, 4-star, 5-star]
      reviews.docs.forEach((review: any) => {
        if (review.rating && review.rating >= 1 && review.rating <= 5) {
          ratingDistribution[review.rating - 1]++;
        }
      });

      await payload.update({
        collection: 'tenants',
        id: tenantId,
        data: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: reviews.totalDocs,
          ratingDistribution: ratingDistribution
        }
      });

      console.log(`Updated business ${tenantId} rating to ${averageRating.toFixed(1)} stars (${reviews.totalDocs} total reviews)`);
    } else {
      await payload.update({
        collection: 'tenants',
        id: tenantId,
        data: {
          averageRating: null,
          totalReviews: 0,
          ratingDistribution: [0, 0, 0, 0, 0]
        }
      });

      console.log(`Reset business ${tenantId} rating - no reviews`);
    }
  } catch (error) {
    console.error(`Error updating business rating for ${tenantId}:`, error);
  }
}
