import { CollectionConfig, AccessArgs } from 'payload'

export const ServicePackages: CollectionConfig = {
  slug: 'service-packages',
  admin: {
    useAsTitle: 'name',
    description: 'Service bundles with special pricing and promotional offers',
    group: 'Business',
    defaultColumns: ['name', 'packagePrice', 'discountPercentage', 'isActive', 'featured'],
    listSearchableFields: ['name', 'description'],
    pagination: {
      defaultLimit: 25,
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Package name (e.g., "Complete Hair Transformation")',
      },
      validate: (val: string | null | undefined) => {
        if (val && val.length < 3) {
          return 'Package name must be at least 3 characters long'
        }
        return true
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        description: 'URL-friendly version of the package name',
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ data, operation, value }) => {
            if (operation === 'create' || !value) {
              return data?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      admin: {
        description: 'Detailed package description with benefits and what to expect',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      maxLength: 200,
      admin: {
        description: 'Brief description for cards and previews (max 200 characters)',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Package hero image or before/after photo',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      admin: {
        description: 'Additional images showcasing package results',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          admin: {
            description: 'Optional caption for the image',
          },
        },
      ],
    },
    {
      name: 'services',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Services included in this package',
      },
      fields: [
        {
          name: 'service',
          type: 'relationship',
          relationTo: 'services',
          required: true,
          admin: {
            allowCreate: false,
          },
        },
        {
          name: 'quantity',
          type: 'number',
          defaultValue: 1,
          min: 1,
          max: 10,
          admin: {
            description: 'How many times this service is included',
          },
        },
        {
          name: 'customDuration',
          type: 'number',
          min: 5,
          max: 480,
          admin: {
            description: 'Custom duration for this service in package (optional, in minutes)',
          },
        },
        {
          name: 'notes',
          type: 'textarea',
          admin: {
            description: 'Special notes or modifications for this service in the package',
          },
        },
      ],
    },
    {
      name: 'pricing',
      type: 'group',
      admin: {
        description: 'Package pricing and discount calculations',
      },
      fields: [
        {
          name: 'individualTotal',
          type: 'number',
          admin: {
            description: 'Total if services purchased individually (auto-calculated)',
            readOnly: true,
          },
        },
        {
          name: 'packagePrice',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Package price (in cents)',
            step: 100,
          },
        },
        {
          name: 'discountPercentage',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Discount percentage (auto-calculated)',
            readOnly: true,
          },
        },
        {
          name: 'savings',
          type: 'number',
          admin: {
            description: 'Total savings amount (auto-calculated)',
            readOnly: true,
          },
        },
        {
          name: 'currency',
          type: 'select',
          defaultValue: 'USD',
          options: [
            { label: 'USD', value: 'USD' },
            { label: 'EUR', value: 'EUR' },
            { label: 'GBP', value: 'GBP' },
            { label: 'CAD', value: 'CAD' },
          ],
          admin: {
            description: 'Package currency',
          },
        },
        {
          name: 'taxIncluded',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether tax is included in the package price',
          },
        },
      ],
    },
    {
      name: 'duration',
      type: 'group',
      admin: {
        description: 'Package duration and scheduling',
      },
      fields: [
        {
          name: 'estimatedDuration',
          type: 'number',
          min: 5,
          admin: {
            description: 'Estimated total duration in minutes (auto-calculated)',
            readOnly: true,
          },
        },
        {
          name: 'sessions',
          type: 'number',
          defaultValue: 1,
          min: 1,
          max: 20,
          admin: {
            description: 'Number of sessions required',
          },
        },
        {
          name: 'sessionInterval',
          type: 'select',
          options: [
            { label: 'Same day', value: 'same-day' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Bi-weekly', value: 'bi-weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Custom', value: 'custom' },
          ],
          admin: {
            description: 'Interval between sessions',
            condition: (data) => data.sessions > 1,
          },
        },
        {
          name: 'customInterval',
          type: 'number',
          min: 1,
          admin: {
            description: 'Custom interval in days',
            condition: (data) => data.sessions > 1 && data.sessionInterval === 'custom',
          },
        },
        {
          name: 'bufferTime',
          type: 'number',
          defaultValue: 15,
          min: 0,
          max: 60,
          admin: {
            description: 'Buffer time between services in minutes',
          },
        },
      ],
    },
    {
      name: 'benefits',
      type: 'array',
      admin: {
        description: 'Key benefits and selling points of this package',
      },
      fields: [
        {
          name: 'benefit',
          type: 'text',
          required: true,
          maxLength: 100,
        },
        {
          name: 'icon',
          type: 'text',
          admin: {
            description: 'Optional icon name or emoji',
          },
        },
        {
          name: 'highlighted',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Highlight this benefit',
          },
        },
      ],
    },
    {
      name: 'terms',
      type: 'group',
      admin: {
        description: 'Package terms, conditions, and policies',
      },
      fields: [
        {
          name: 'validityPeriod',
          type: 'number',
          defaultValue: 365,
          min: 1,
          max: 1095,
          admin: {
            description: 'Validity period in days (max 3 years)',
          },
        },
        {
          name: 'cancellationPolicy',
          type: 'select',
          defaultValue: '24h',
          options: [
            { label: 'Non-refundable', value: 'non-refundable' },
            { label: '24 hour cancellation', value: '24h' },
            { label: '48 hour cancellation', value: '48h' },
            { label: '72 hour cancellation', value: '72h' },
            { label: 'Flexible', value: 'flexible' },
          ],
        },
        {
          name: 'reschedulePolicy',
          type: 'select',
          defaultValue: 'flexible',
          options: [
            { label: 'No rescheduling', value: 'none' },
            { label: '24 hour notice', value: '24h' },
            { label: '48 hour notice', value: '48h' },
            { label: 'Flexible', value: 'flexible' },
          ],
        },
        {
          name: 'transferable',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Can this package be transferred to another person?',
          },
        },
        {
          name: 'specialNotes',
          type: 'textarea',
          admin: {
            description: 'Any special terms, conditions, or requirements',
          },
        },
      ],
    },
    {
      name: 'loyaltyBonus',
      type: 'group',
      admin: {
        description: 'Loyalty program integration and rewards',
      },
      fields: [
        {
          name: 'bonusPoints',
          type: 'number',
          defaultValue: 0,
          min: 0,
          max: 10000,
          admin: {
            description: 'Bonus loyalty points for purchasing this package',
          },
        },
        {
          name: 'multiplier',
          type: 'number',
          defaultValue: 1,
          min: 0.5,
          max: 5,
          admin: {
            description: 'Loyalty point multiplier for this package',
            step: 0.1,
          },
        },
        {
          name: 'tierRequirement',
          type: 'select',
          options: [
            { label: 'No requirement', value: 'none' },
            { label: 'Bronze tier', value: 'bronze' },
            { label: 'Silver tier', value: 'silver' },
            { label: 'Gold tier', value: 'gold' },
            { label: 'Platinum tier', value: 'platinum' },
          ],
          admin: {
            description: 'Minimum loyalty tier required to purchase',
          },
        },
      ],
    },
    {
      name: 'availability',
      type: 'group',
      admin: {
        description: 'Package availability and scheduling constraints',
      },
      fields: [
        {
          name: 'maxBookingsPerDay',
          type: 'number',
          defaultValue: 5,
          min: 1,
          max: 50,
          admin: {
            description: 'Maximum number of this package that can be booked per day',
          },
        },
        {
          name: 'advanceBookingDays',
          type: 'number',
          defaultValue: 1,
          min: 0,
          max: 365,
          admin: {
            description: 'Minimum days in advance this package must be booked',
          },
        },
        {
          name: 'seasonalAvailability',
          type: 'array',
          admin: {
            description: 'Seasonal availability restrictions',
          },
          fields: [
            {
              name: 'season',
              type: 'text',
              required: true,
            },
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
          ],
        },
      ],
    },
    {
      name: 'marketing',
      type: 'group',
      admin: {
        description: 'Marketing and promotional settings',
      },
      fields: [
        {
          name: 'tags',
          type: 'array',
          admin: {
            description: 'Marketing tags for filtering and categorization',
          },
          fields: [
            {
              name: 'tag',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'targetAudience',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'New clients', value: 'new-clients' },
            { label: 'Returning clients', value: 'returning-clients' },
            { label: 'VIP clients', value: 'vip-clients' },
            { label: 'Special occasions', value: 'special-occasions' },
            { label: 'Seasonal', value: 'seasonal' },
          ],
        },
        {
          name: 'promotionalText',
          type: 'text',
          maxLength: 50,
          admin: {
            description: 'Short promotional text (e.g., "Limited Time Offer!")',
          },
        },
        {
          name: 'badge',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Popular', value: 'popular' },
            { label: 'Best Value', value: 'best-value' },
            { label: 'New', value: 'new' },
            { label: 'Limited Time', value: 'limited-time' },
            { label: 'Exclusive', value: 'exclusive' },
          ],
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      admin: {
        description: 'SEO optimization settings',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          maxLength: 60,
          admin: {
            description: 'SEO meta title (max 60 characters)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
          admin: {
            description: 'SEO meta description (max 160 characters)',
          },
        },
        {
          name: 'keywords',
          type: 'array',
          admin: {
            description: 'SEO keywords',
          },
          fields: [
            {
              name: 'keyword',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Enable/disable this package for booking',
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature on homepage and promotional areas',
        position: 'sidebar',
      },
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      admin: {
        description: 'Display priority',
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order (lower numbers appear first)',
        position: 'sidebar',
      },
    },
    {
      name: 'analytics',
      type: 'group',
      admin: {
        description: 'Package performance analytics (read-only)',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'viewCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Number of times this package was viewed',
          },
        },
        {
          name: 'bookingCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Number of times this package was booked',
          },
        },
        {
          name: 'conversionRate',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Conversion rate (bookings/views)',
          },
        },
        {
          name: 'lastBooked',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'Last booking date',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        // Generate slug if not provided
        if (operation === 'create' && !data?.slug && data?.name) {
          data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation }) => {
        // Calculate pricing
        if (data?.services && data.services.length > 0) {
          try {
            const services = await req.payload.find({
              collection: 'services',
              where: {
                id: { in: data.services.map((s: any) => s.service) },
              },
            })

            const individualTotal = services.docs.reduce((total: number, service: any, index: number) => {
              const quantity = data.services[index]?.quantity || 1
              return total + (service.price * quantity)
            }, 0)

            if (!data.pricing) data.pricing = {}
            data.pricing.individualTotal = individualTotal
            
            if (data.pricing.packagePrice) {
              data.pricing.savings = Math.max(0, individualTotal - data.pricing.packagePrice)
              data.pricing.discountPercentage = individualTotal > 0 
                ? Math.round((data.pricing.savings / individualTotal) * 100) 
                : 0
            }
          } catch (error) {
            console.error('Error calculating package pricing:', error)
          }
        }

        // Calculate duration
        if (data?.services && data.services.length > 0) {
          try {
            const services = await req.payload.find({
              collection: 'services',
              where: {
                id: { in: data.services.map((s: any) => s.service) },
              },
            })

            const totalDuration = services.docs.reduce((total: number, service: any, index: number) => {
              const quantity = data.services[index]?.quantity || 1
              const customDuration = data.services[index]?.customDuration
              const duration = customDuration || service.duration || 0
              return total + (duration * quantity)
            }, 0)

            if (!data.duration) data.duration = {}
            const bufferTime = data.duration.bufferTime || 15
            const sessions = data.duration.sessions || 1
            data.duration.estimatedDuration = totalDuration + (bufferTime * (sessions - 1))
          } catch (error) {
            console.error('Error calculating package duration:', error)
          }
        }

        // Auto-generate SEO fields if not provided
        if (operation === 'create' || !data?.seo?.metaTitle) {
          if (!data?.seo) data.seo = {}
          if (!data.seo.metaTitle && data?.name) {
            data.seo.metaTitle = `${data.name} - Service Package`
          }
          if (!data.seo.metaDescription && data?.shortDescription) {
            data.seo.metaDescription = data.shortDescription
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        // Update analytics on view/booking (would be called from frontend)
        if (operation === 'update' && req.context?.action === 'view') {
          await req.payload.update({
            collection: 'service-packages',
            id: doc.id,
            data: {
              'analytics.viewCount': (doc.analytics?.viewCount || 0) + 1,
            },
          })
        }
      },
    ],
  },
  access: {
    read: ({ req }) => {
      // Public can read active packages
      if (!req.user) {
        return {
          isActive: { equals: true },
        }
      }
      // Authenticated users can read all
      return true
    },
    create: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      return ['admin', 'manager', 'staff'].includes(user.role)
    },
    update: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      return ['admin', 'manager', 'staff'].includes(user.role)
    },
    delete: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      return user.role === 'admin'
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 2000,
      },
    },
    maxPerDoc: 10,
  },
  timestamps: true,
}
