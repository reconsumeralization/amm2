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
      ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`Review created: ${doc.id} (${doc.rating} stars)`);

          // TODO: Send notification to staff about new review
          // TODO: Update service/staff average ratings
        }

        if (operation === 'update' && doc.approved && !doc.approvedAt) {
          console.log(`Review approved: ${doc.id}`);

          // TODO: Send notification to customer about approved review
          // TODO: Recalculate average ratings
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
