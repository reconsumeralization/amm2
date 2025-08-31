import type { CollectionConfig } from 'payload'

export const Stylists: CollectionConfig = {
  slug: 'stylists',
  admin: {
    useAsTitle: 'name',
    description: 'Professional stylists and their schedules',
    group: 'Staff',
    defaultColumns: ['name', 'specializations', 'rating', 'isActive'],
    listSearchableFields: ['name', 'bio', 'user.name', 'user.email'],
  },
  access: {
    read: ({ req }) => {
      // Allow public read for basic stylist info
      if (!req.user) return { isActive: { equals: true } }
      // Staff can read all stylist info
      if ((req.user as any)?.role === 'admin' || (req.user as any)?.role === 'manager' || (req.user as any)?.role === 'barber') return true
      return { isActive: { equals: true } }
    },
    create: ({ req }) => {
      return req.user?.role === 'admin' || req.user?.role === 'manager'
    },
    update: ({ req }) => {
      const user = req.user
      if (!user) return false
      if ((user as any)?.role === 'admin' || (user as any)?.role === 'manager') return true
      // Allow barbers to update their own profiles
      return { user: { equals: user.id } }
    },
    delete: ({ req }) => {
      return req.user?.role === 'admin' || req.user?.role === 'manager'
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Auto-populate name from linked user
        if (data.user && !data.name) {
          const user = await req.payload.findByID({
            collection: 'users' as any as any,
            id: data.user,
          })
          if (user) {
            data.name = user.name
          }
        }

        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user?.tenant?.id) {
          data.tenant = (req.user as any)?.tenant.id
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create' || operation === 'update') {
          console.log(`Stylist profile updated: ${doc.name}`)
        }
      },
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users' as any as any,
      required: true,
      unique: true,
      filterOptions: {
        role: { equals: 'barber' },
      },
      admin: {
        description: 'Link to user account',
      },
    },
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Display name (auto-populated from user)',
        readOnly: true,
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      maxLength: 500,
      admin: {
        description: 'Professional biography for website (max 500 characters)',
      },
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media' as any as any,
      admin: {
        description: 'Professional headshot',
      },
    },
    {
      name: 'portfolio',
      type: 'array',
      maxRows: 12,
      admin: {
        description: 'Portfolio images showcasing work (max 12 images)',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media' as any as any,
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
        },
        {
          name: 'service',
          type: 'relationship',
          relationTo: 'services' as any as any,
        },
      ],
    },
    {
      name: 'specializations',
      type: 'relationship',
      relationTo: 'services' as any as any,
      hasMany: true,
      admin: {
        description: 'Services this stylist specializes in',
      },
    },
    {
      name: 'experience',
      type: 'group',
      admin: {
        description: 'Professional experience and qualifications',
      },
      fields: [
        {
          name: 'yearsExperience',
          type: 'number',
          min: 0,
          max: 50,
          admin: {
            description: 'Years of professional experience',
          },
        },
        {
          name: 'certifications',
          type: 'array',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'issuingOrganization',
              type: 'text',
            },
            {
              name: 'year',
              type: 'number',
              min: 1900,
              max: new Date().getFullYear(),
            },
            {
              name: 'certificate',
              type: 'upload',
              relationTo: 'media' as any as any,
            },
          ],
        },
        {
          name: 'awards',
          type: 'array',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'year',
              type: 'number',
              min: 1900,
              max: new Date().getFullYear(),
            },
            {
              name: 'description',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'schedule',
      type: 'group',
      admin: {
        description: 'Working schedule and availability',
      },
      fields: [
        {
          name: 'workDays',
          type: 'select',
          hasMany: true,
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
          admin: {
            description: 'Days available for appointments',
          },
        },
        {
          name: 'workHours',
          type: 'group',
          fields: [
            {
              name: 'startTime',
              type: 'text',
              defaultValue: '09:00',
              required: true,
              admin: {
                description: 'Format: HH:MM (24-hour)',
              },
            },
            {
              name: 'endTime',
              type: 'text',
              defaultValue: '17:00',
              required: true,
              admin: {
                description: 'Format: HH:MM (24-hour)',
              },
            },
            {
              name: 'breakStart',
              type: 'text',
              defaultValue: '12:00',
              admin: {
                description: 'Break start time',
              },
            },
            {
              name: 'breakEnd',
              type: 'text',
              defaultValue: '13:00',
              admin: {
                description: 'Break end time',
              },
            },
          ],
        },
        {
          name: 'timeOff',
          type: 'array',
          admin: {
            description: 'Scheduled time off',
          },
          fields: [
            {
              name: 'startDate',
              type: 'date',
              required: true,
            },
            {
              name: 'endDate',
              type: 'date',
              required: true,
            },
            {
              name: 'reason',
              type: 'select',
              options: [
                { label: 'Vacation', value: 'vacation' },
                { label: 'Sick Leave', value: 'sick' },
                { label: 'Personal', value: 'personal' },
                { label: 'Training', value: 'training' },
                { label: 'Other', value: 'other' },
              ],
            },
            {
              name: 'notes',
              type: 'text',
            },
          ],
        },
        {
          name: 'maxAppointmentsPerDay',
          type: 'number',
          defaultValue: 8,
          min: 1,
          max: 20,
          admin: {
            description: 'Maximum appointments per day',
          },
        },
      ],
    },
    {
      name: 'performance',
      type: 'group',
      admin: {
        description: 'Performance metrics and ratings',
      },
      fields: [
        {
          name: 'rating',
          type: 'number',
          min: 0,
          max: 5,
          defaultValue: 0,
          admin: {
            description: 'Average customer rating (0-5 stars)',
            readOnly: true,
          },
        },
        {
          name: 'reviewCount',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Total number of reviews',
            readOnly: true,
          },
        },
        {
          name: 'totalAppointments',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Total appointments completed',
            readOnly: true,
          },
        },
        {
          name: 'onTimeRate',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 100,
          admin: {
            description: 'Percentage of on-time starts',
            readOnly: true,
          },
        },
        {
          name: 'averageServiceTime',
          type: 'number',
          min: 0,
          admin: {
            description: 'Average service duration in minutes',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'pricing',
      type: 'group',
      admin: {
        description: 'Custom pricing for this stylist',
      },
      fields: [
        {
          name: 'customPricing',
          type: 'array',
          admin: {
            description: 'Service-specific pricing overrides',
          },
          fields: [
            {
              name: 'service',
              type: 'relationship',
              relationTo: 'services' as any as any,
              required: true,
            },
            {
              name: 'price',
              type: 'number',
              required: true,
              min: 0,
              admin: {
                description: 'Price in cents',
              },
            },
            {
              name: 'duration',
              type: 'number',
              min: 5,
              admin: {
                description: 'Duration in minutes (override)',
              },
            },
          ],
        },
        {
          name: 'hourlyRate',
          type: 'number',
          min: 0,
          admin: {
            description: 'Base hourly rate in cents',
          },
        },
      ],
    },
    {
      name: 'socialMedia',
      type: 'group',
      admin: {
        description: 'Social media profiles',
      },
      fields: [
        {
          name: 'instagram',
          type: 'text',
          admin: {
            description: 'Instagram username or URL',
          },
        },
        {
          name: 'facebook',
          type: 'text',
          admin: {
            description: 'Facebook profile URL',
          },
        },
        {
          name: 'website',
          type: 'text',
          admin: {
            description: 'Personal website or portfolio',
          },
        },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      admin: {
        description: 'The BarberShop/tenant this stylist belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Available for appointments',
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature on team page',
        position: 'sidebar',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order on team page',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
  indexes: [
    {
      fields: ['user'],
      unique: true,
    },
    {
      fields: ['tenant', 'isActive'],
    },
    {
      fields: ['featured', 'displayOrder'],
    },
  ],
}
