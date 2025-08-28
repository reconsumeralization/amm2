import { CollectionConfig } from 'payload'

export const Stylists: CollectionConfig = {
  slug: 'stylists',
  admin: {
    useAsTitle: 'name',
    description: 'Professional stylists and their schedules',
    group: 'Staff',
    defaultColumns: ['name', 'specializations', 'rating', 'isActive'],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
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
      admin: {
        description: 'Professional biography for website',
      },
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Professional headshot',
      },
    },
    {
      name: 'portfolio',
      type: 'array',
      admin: {
        description: 'Portfolio images showcasing work',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
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
          relationTo: 'services',
        },
      ],
    },
    {
      name: 'specializations',
      type: 'relationship',
      relationTo: 'services',
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
              relationTo: 'media',
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
              relationTo: 'services',
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
  hooks: {
    beforeChange: [
      async ({ data, req }: { data: any, req: any }) => {
        // Auto-populate name from linked user
        if (data.user && !data.name) {
          const user = await req.payload.findByID({
            collection: 'users',
            id: data.user,
          })
          if (user) {
            data.name = user.name
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }: { doc: any, req: any, operation: string }) => {
        if (operation === 'create' || operation === 'update') {
          console.log(`Stylist profile updated: ${doc.name}`)
        }
      },
    ],
  },
  access: {
    read: ({ req }) => {
      // Allow public read for basic stylist info
      if (!req.user) return { isActive: { equals: true } }
      // Staff can read all stylist info
      if (req.user.role === 'admin' || req.user.role === 'manager' || req.user.role === 'barber') return true
      return false
    },
    create: ({ req }) => {
      return req.user?.role === 'admin' || req.user?.role === 'manager'
    },
    update: ({ req }) => {
      const user = req.user
      if (!user) return false
      if (user.role === 'admin' || user.role === 'manager') return true
      // Allow barbers to update their own profiles
      return { user: { equals: user.id } }
    },
    delete: ({ req }) => {
      return req.user?.role === 'admin' || req.user?.role === 'manager'
    },
  },
  timestamps: true,
}