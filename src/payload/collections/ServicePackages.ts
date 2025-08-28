import { CollectionConfig, AccessArgs } from 'payload'

export const ServicePackages: CollectionConfig = {
  slug: 'service-packages',
  admin: {
    useAsTitle: 'name',
    description: 'Service bundles with special pricing',
    group: 'Business',
    defaultColumns: ['name', 'totalPrice', 'discountPercentage', 'isActive'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Package name (e.g., "Complete Hair Transformation")',
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      admin: {
        description: 'Detailed package description',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Package image or before/after photo',
      },
    },
    {
      name: 'services',
      type: 'array',
      required: true,
      admin: {
        description: 'Services included in this package',
      },
      fields: [
        {
          name: 'service',
          type: 'relationship',
          relationTo: 'services',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          defaultValue: 1,
          min: 1,
          admin: {
            description: 'How many times this service is included',
          },
        },
        {
          name: 'customDuration',
          type: 'number',
          min: 5,
          admin: {
            description: 'Custom duration for this service in package (optional)',
          },
        },
      ],
    },
    {
      name: 'pricing',
      type: 'group',
      admin: {
        description: 'Package pricing and discounts',
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
            description: 'Total savings (auto-calculated)',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'duration',
      type: 'group',
      admin: {
        description: 'Package duration',
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
          ],
          admin: {
            description: 'Interval between sessions',
            condition: (data) => data.sessions > 1,
          },
        },
      ],
    },
    {
      name: 'benefits',
      type: 'array',
      admin: {
        description: 'Additional benefits of this package',
      },
      fields: [
        {
          name: 'benefit',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'terms',
      type: 'group',
      admin: {
        description: 'Package terms and conditions',
      },
      fields: [
        {
          name: 'validityPeriod',
          type: 'number',
          defaultValue: 365,
          admin: {
            description: 'Validity period in days',
          },
        },
        {
          name: 'cancellationPolicy',
          type: 'select',
          options: [
            { label: 'Non-refundable', value: 'non-refundable' },
            { label: '24 hour cancellation', value: '24h' },
            { label: '48 hour cancellation', value: '48h' },
            { label: 'Flexible', value: 'flexible' },
          ],
        },
        {
          name: 'specialNotes',
          type: 'textarea',
          admin: {
            description: 'Any special terms or conditions',
          },
        },
      ],
    },
    {
      name: 'loyaltyBonus',
      type: 'group',
      admin: {
        description: 'Loyalty program integration',
      },
      fields: [
        {
          name: 'bonusPoints',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Bonus loyalty points for purchasing this package',
          },
        },
        {
          name: 'multiplier',
          type: 'number',
          defaultValue: 1,
          min: 0.5,
          max: 3,
          admin: {
            description: 'Loyalty point multiplier for this package',
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Enable/disable this package',
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature on homepage',
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }: { data: any; req: any }) => {
        // Calculate pricing
        if (data.services && data.services.length > 0) {
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

          data.pricing.individualTotal = individualTotal
          data.pricing.savings = individualTotal - data.pricing.packagePrice
          data.pricing.discountPercentage = Math.round((data.pricing.savings / individualTotal) * 100)
        }

        // Calculate duration
        if (data.services && data.services.length > 0) {
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

          data.duration.estimatedDuration = totalDuration
        }

        return data
      },
    ],
  },
  access: {
    read: () => true,
    create: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      return user.role === 'admin' || user.role === 'manager'
    },
    update: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      return user.role === 'admin' || user.role === 'manager'
    },
    delete: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      return user.role === 'admin'
    },
  },
  timestamps: true,
}
