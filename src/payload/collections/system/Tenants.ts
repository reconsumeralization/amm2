import { CollectionConfig } from 'payload';

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    group: 'Admin',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      // Only authenticated users with proper tenant access
      if (req.user.role === 'admin' || req.user.role === 'manager') {
        return req.user.tenant ? { tenant: { equals: req.user.tenant.id } } : false;
      }
      return false;
    },
    create: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'owner';
    },
    update: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'owner';
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'owner';
    },
  },

  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-set createdBy for new tenants
        if (operation === 'create' && !data.createdBy && req.user) {
          data.createdBy = req.user.id
        }

        // Auto-set subscription defaults
        if (operation === 'create' && !data.subscription) {
          data.subscription = {
            plan: 'starter',
            status: 'trial',
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
            maxUsers: 5,
            maxLocations: 1
          }
        }

        // Validate domain format
        if (data.domain) {
          const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
          if (!domainRegex.test(data.domain)) {
            throw new Error('Invalid domain format')
          }
        }

        // Set default branding if not provided
        if (operation === 'create' && !data.branding) {
          data.branding = {
            primaryColor: '#1f2937', // Gray-800
            secondaryColor: '#3b82f6', // Blue-500
            logo: null,
            favicon: null
          }
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`New tenant created: ${doc.name} (${doc.slug})`)

          // Create default admin user for the tenant
          if (req.payload) {
            // This would typically create a default admin user
            console.log(`Setting up default admin user for tenant: ${doc.name}`)
          }

          // Initialize tenant-specific settings
          console.log(`Initializing settings for tenant: ${doc.name}`)
        }

        if (operation === 'update') {
          // Handle status changes
          if (doc.status === 'suspended') {
            console.log(`Tenant suspended: ${doc.name}`)
            // TODO: Implement suspension logic (disable logins, etc.)
          } else if (doc.status === 'active') {
            console.log(`Tenant activated: ${doc.name}`)
            // TODO: Implement activation logic
          }
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        if (req.payload) {
          // Check if tenant has active users before deletion
          const activeUsers = await req.payload.find({
            collection: 'users',
            where: {
              tenant: { equals: id },
              status: { equals: 'active' }
            }
          })

          if (activeUsers.totalDocs > 0) {
            throw new Error(`Cannot delete tenant with ${activeUsers.totalDocs} active users. Please deactivate all users first.`)
          }

          // Check for active subscriptions
          const tenant = await req.payload.findByID({
            collection: 'tenants',
            id: id
          })

          if (tenant?.subscription?.status === 'active') {
            throw new Error('Cannot delete tenant with active subscription. Please cancel subscription first.')
          }
        }
      },
    ],
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique name for the tenant organization',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier for the tenant',
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.name && !data?.slug) {
              data.slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            }
          },
        ],
      },
    },
    {
      name: 'domain',
      type: 'text',
      admin: {
        description: 'Custom domain for the tenant (optional)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'timezone',
          type: 'select',
          required: true,
          defaultValue: 'America/New_York',
          options: [
            { label: 'Eastern Time', value: 'America/New_York' },
            { label: 'Central Time', value: 'America/Chicago' },
            { label: 'Mountain Time', value: 'America/Denver' },
            { label: 'Pacific Time', value: 'America/Los_Angeles' },
          ],
        },
        {
          name: 'currency',
          type: 'select',
          required: true,
          defaultValue: 'USD',
          options: [
            { label: 'US Dollar', value: 'USD' },
            { label: 'Euro', value: 'EUR' },
            { label: 'British Pound', value: 'GBP' },
            { label: 'Canadian Dollar', value: 'CAD' },
          ],
        },
        {
          name: 'dateFormat',
          type: 'select',
          required: true,
          defaultValue: 'MM/DD/YYYY',
          options: [
            { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
            { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
            { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
          ],
        },
      ],
    },
    {
      name: 'availability',
      type: 'group',
      fields: [
        {
          name: 'days',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'day',
              type: 'select',
              required: true,
              options: [
                { label: 'Monday', value: 'monday' },
                { label: 'Tuesday', value: 'tuesday' },
                { label: 'Wednesday', value: 'wednesday' },
                { label: 'Thursday', value: 'thursday' },
                { label: 'Friday', value: 'friday' },
                { label: 'Saturday', value: 'saturday' },
                { label: 'Sunday', value: 'sunday' },
              ],
            },
            {
              name: 'openTime',
              type: 'text',
              required: true,
              defaultValue: '9:00 AM',
              admin: {
                description: 'Opening time (e.g., 9:00 AM)',
              },
            },
            {
              name: 'closeTime',
              type: 'text',
              required: true,
              defaultValue: '5:00 PM',
              admin: {
                description: 'Closing time (e.g., 5:00 PM)',
              },
            },
            {
              name: 'isOpen',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Is the business open on this day?',
              },
            },
          ],
        },
        {
          name: 'holidays',
          type: 'array',
          admin: {
            description: 'Special dates when the business is closed',
          },
          fields: [
            {
              name: 'date',
              type: 'date',
              required: true,
            },
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: {
                description: 'Holiday name (e.g., Christmas Day)',
              },
            },
            {
              name: 'recurring',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Does this holiday repeat annually?',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        {
          name: 'email',
          type: 'email',
          admin: {
            description: 'Primary contact email for the tenant',
          },
        },
        {
          name: 'phone',
          type: 'text',
          admin: {
            description: 'Primary contact phone number',
          },
        },
        {
          name: 'address',
          type: 'group',
          fields: [
            { name: 'street', type: 'text' },
            { name: 'city', type: 'text' },
            { name: 'state', type: 'text' },
            { name: 'zipCode', type: 'text' },
            { name: 'country', type: 'text', defaultValue: 'United States' },
          ],
        },
      ],
    },
    {
      name: 'branding',
      type: 'group',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Tenant logo for branding',
          },
        },
        {
          name: 'primaryColor',
          type: 'text',
          admin: {
            description: 'Primary brand color (hex code)',
          },
        },
        {
          name: 'secondaryColor',
          type: 'text',
          admin: {
            description: 'Secondary brand color (hex code)',
          },
        },
      ],
    },
    {
      name: 'features',
      type: 'group',
      fields: [
        {
          name: 'appointmentBooking',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Enable appointment booking functionality',
          },
        },
        {
          name: 'onlinePayments',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable online payment processing',
          },
        },
        {
          name: 'smsNotifications',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable SMS notifications for appointments',
          },
        },
        {
          name: 'emailNotifications',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Enable email notifications',
          },
        },
        {
          name: 'analytics',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Enable analytics and reporting',
          },
        },
      ],
    },
    {
      name: 'subscription',
      type: 'group',
      fields: [
        {
          name: 'plan',
          type: 'select',
          required: true,
          defaultValue: 'basic',
          options: [
            { label: 'Basic', value: 'basic' },
            { label: 'Professional', value: 'professional' },
            { label: 'Enterprise', value: 'enterprise' },
          ],
        },
        {
          name: 'billingCycle',
          type: 'select',
          required: true,
          defaultValue: 'monthly',
          options: [
            { label: 'Monthly', value: 'monthly' },
            { label: 'Yearly', value: 'yearly' },
          ],
        },
        {
          name: 'nextBillingDate',
          type: 'date',
        },
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
  ],
  timestamps: true,
};
