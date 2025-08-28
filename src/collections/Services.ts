import { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    description: 'Hair salon services and pricing',
    group: 'Business',
    defaultColumns: ['name', 'category', 'price', 'duration', 'isActive'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Service name (e.g., "Men\'s Haircut")',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Haircut & Styling', value: 'haircut' },
        { label: 'Color Services', value: 'color' },
        { label: 'Treatment & Care', value: 'treatment' },
        { label: 'Beard & Grooming', value: 'beard' },
        { label: 'Special Services', value: 'special' },
      ],
      admin: {
        description: 'Service category for organization',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Detailed description of the service',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Price in cents (e.g., 3500 = $35.00)',
        step: 100,
      },
      validate: (value: number | null | undefined) => {
        if (value == null) return true // Allow empty values
        if (typeof value === 'number') {
          if (value < 0) return 'Price cannot be negative'
          if (value > 100000) return 'Price seems too high (max $1,000)'
        }
        return true
      },
    },
    {
      name: 'duration',
      type: 'number',
      required: true,
      min: 5,
      max: 480, // 8 hours
      admin: {
        description: 'Duration in minutes',
        step: 5,
      },
      validate: (value: number | null | undefined) => {
        if (value == null) return true // Allow empty values
        if (typeof value === 'number') {
          if (value < 5) return 'Duration must be at least 5 minutes'
          if (value > 480) return 'Duration cannot exceed 8 hours'
        }
        return true
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Service image or before/after photo',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      admin: {
        description: 'Additional service images',
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
        },
      ],
    },
    {
      name: 'preparationTime',
      type: 'number',
      defaultValue: 15,
      min: 0,
      max: 60,
      admin: {
        description: 'Minutes needed to prepare for this service',
      },
      validate: (value: number | null | undefined) => {
        if (value == null) return true // Allow empty values
        if (typeof value === 'number') {
          if (value < 0) return 'Preparation time cannot be negative'
          if (value > 60) return 'Preparation time cannot exceed 60 minutes'
        }
        return true
      },
    },
    {
      name: 'bufferTime',
      type: 'number',
      defaultValue: 15,
      min: 0,
      max: 60,
      admin: {
        description: 'Buffer time after service (cleanup, etc.)',
      },
      validate: (value: number | null | undefined) => {
        if (value == null) return true // Allow empty values
        if (typeof value === 'number') {
          if (value < 0) return 'Buffer time cannot be negative'
          if (value > 60) return 'Buffer time cannot exceed 60 minutes'
        }
        return true
      },
    },
    {
      name: 'requiredSkills',
      type: 'array',
      admin: {
        description: 'Skills required to perform this service',
      },
      fields: [
        {
          name: 'skill',
          type: 'text',
          required: true,
        },
        {
          name: 'level',
          type: 'select',
          required: true,
          options: [
            { label: 'Beginner', value: 'beginner' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' },
            { label: 'Expert', value: 'expert' },
          ],
        },
      ],
    },
    {
      name: 'products',
      type: 'array',
      admin: {
        description: 'Products used in this service',
      },
      fields: [
        {
          name: 'product',
          type: 'text',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          min: 1,
          defaultValue: 1,
        },
        {
          name: 'unit',
          type: 'select',
          options: [
            { label: 'ml', value: 'ml' },
            { label: 'oz', value: 'oz' },
            { label: 'pieces', value: 'pieces' },
            { label: 'bottles', value: 'bottles' },
          ],
        },
      ],
    },
    {
      name: 'pricingTiers',
      type: 'array',
      admin: {
        description: 'Different pricing options (e.g., different lengths)',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'duration',
          type: 'number',
          required: true,
          min: 5,
        },
        {
          name: 'description',
          type: 'text',
        },
      ],
    },
    {
      name: 'loyaltyPoints',
      type: 'group',
      admin: {
        description: 'Loyalty points earned for this service',
      },
      fields: [
        {
          name: 'pointsEarned',
          type: 'number',
          defaultValue: 10,
          min: 0,
          admin: {
            description: 'Points earned per service',
          },
        },
        {
          name: 'bonusMultiplier',
          type: 'number',
          defaultValue: 1,
          min: 0.5,
          max: 5,
          admin: {
            description: 'Multiplier for loyalty tiers',
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Enable/disable this service',
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this service on homepage',
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
      name: 'seo',
      type: 'group',
      admin: {
        description: 'SEO settings for this service',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: {
            description: 'SEO title (50-60 characters)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: {
            description: 'SEO description (150-160 characters)',
          },
        },
        {
          name: 'keywords',
          type: 'array',
          fields: [
            {
              name: 'keyword',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Ensure price is in cents
        if (data.price && data.price < 100) {
          // If price is less than 100, assume it's in dollars and convert to cents
          data.price = Math.round(data.price * 100)
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create' || operation === 'update') {
          // Update related appointments if service details changed
          console.log(`Service updated: ${doc.name}`)
        }
      },
    ],
  },
  access: {
    read: () => true, // Public read access for frontend
    create: ({ req }) => {
      return req.user?.role === 'admin' || req.user?.role === 'manager'
    },
    update: ({ req }) => {
      return req.user?.role === 'admin' || req.user?.role === 'manager'
    },
    delete: ({ req }) => {
      return req.user?.role === 'admin'
    },
  },
  timestamps: true,
}