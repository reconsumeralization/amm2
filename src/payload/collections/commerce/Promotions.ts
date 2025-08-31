import type { CollectionConfig } from 'payload';

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  labels: {
    singular: 'Promotion',
    plural: 'Promotions',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description: 'Manage promotional campaigns and special offers',
    defaultColumns: ['title', 'type', 'active', 'startsAt', 'endsAt', 'updatedAt'],
    listSearchableFields: ['title', 'description', 'code'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: () => true, // Public promotions
    create: ({ req }) => {
      if (!req.user) return false;
      const userRole = req.user?.role;
      return userRole === 'admin' || userRole === 'manager';
    },
    update: ({ req }) => {
      if (!req.user) return false;
      const userRole = req.user?.role;
      return userRole === 'admin' || userRole === 'manager';
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      const userRole = req.user?.role;
      return userRole === 'admin' || userRole === 'manager';
    },
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Validate date range
        if (data.startsAt && data.endsAt && new Date(data.startsAt) >= new Date(data.endsAt)) {
          throw new Error('Start date must be before end date');
        }
        
        // Auto-generate slug from title if not provided
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`New promotion created: ${doc.title}`);
        }
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Promotion title for display',
        placeholder: 'Enter promotion title...',
      },
      validate: (value: string | null | undefined) => {
        if (!value || value.length < 1) return 'Title is required';
        if (value.length > 100) return 'Title too long (max 100 characters)';
        return true;
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly identifier (auto-generated from title)',
        placeholder: 'promotion-slug',
      },
      validate: (value: string | null | undefined) => {
        if (value && !/^[a-z0-9-]+$/.test(value)) {
          return 'Slug can only contain lowercase letters, numbers, and hyphens';
        }
        return true;
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Detailed promotion description',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      maxLength: 200,
      admin: {
        description: 'Brief promotion summary (max 200 characters)',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'discount',
      options: [
        { label: 'Discount', value: 'discount' },
        { label: 'BOGO', value: 'bogo' },
        { label: 'Free Service', value: 'free-service' },
        { label: 'Package Deal', value: 'package' },
        { label: 'Seasonal', value: 'seasonal' },
        { label: 'New Customer', value: 'new-customer' },
        { label: 'Loyalty Reward', value: 'loyalty' },
      ],
      admin: {
        description: 'Type of promotion',
      },
    },
    {
      name: 'code',
      type: 'text',
      unique: true,
      admin: {
        description: 'Promotional code for customers to use (optional)',
        placeholder: 'SAVE20',
      },
      validate: (value: string | null | undefined) => {
        if (value && !/^[A-Z0-9]+$/.test(value)) {
          return 'Promo code can only contain uppercase letters and numbers';
        }
        return true;
      },
    },
    {
      name: 'discountType',
      type: 'select',
      options: [
        { label: 'Percentage', value: 'percentage' },
        { label: 'Fixed Amount', value: 'fixed' },
        { label: 'Free Item', value: 'free' },
      ],
      admin: {
        description: 'How the discount is calculated',
        condition: (data) => data.type === 'discount',
      },
    },
    {
      name: 'discountValue',
      type: 'number',
      min: 0,
      admin: {
        description: 'Discount amount (percentage or dollar value)',
        condition: (data) => data.discountType === 'percentage' || data.discountType === 'fixed',
      },
    },
    {
      name: 'minimumPurchase',
      type: 'number',
      min: 0,
      admin: {
        description: 'Minimum purchase amount required (optional)',
      },
    },
    {
      name: 'maxUses',
      type: 'number',
      min: 1,
      admin: {
        description: 'Maximum number of times this promotion can be used (optional)',
      },
    },
    {
      name: 'usesCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Number of times this promotion has been used',
      },
    },
    {
      name: 'startsAt',
      type: 'date',
      required: true,
      admin: {
        description: 'When the promotion becomes active',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endsAt',
      type: 'date',
      admin: {
        description: 'When the promotion expires (optional for ongoing promotions)',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this promotion is currently active',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Display this promotion prominently on the website',
      },
    },
    {
      name: 'cta',
      type: 'text',
      admin: {
        description: 'Call-to-action text (e.g., "Book Now", "Shop Today")',
        placeholder: 'Book Now',
      },
    },
    {
      name: 'ctaUrl',
      type: 'text',
      admin: {
        description: 'URL for the call-to-action button (optional)',
        placeholder: '/book-appointment',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media' as any as any,
      admin: {
        description: 'Promotional image or banner',
      },
    },
    {
      name: 'applicableServices',
      type: 'relationship',
      relationTo: 'services' as any as any,
      hasMany: true,
      admin: {
        description: 'Services this promotion applies to (leave empty for all services)',
      },
    },
    {
      name: 'applicableProducts',
      type: 'relationship',
      relationTo: 'products' as any as any,
      hasMany: true,
      admin: {
        description: 'Products this promotion applies to (leave empty for all products)',
      },
    },
    {
      name: 'targetAudience',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'All Customers', value: 'all' },
        { label: 'New Customers', value: 'new' },
        { label: 'Returning Customers', value: 'returning' },
        { label: 'VIP Members', value: 'vip' },
        { label: 'Birthday Month', value: 'birthday' },
      ],
      admin: {
        description: 'Who this promotion is targeted towards',
      },
    },
    {
      name: 'terms',
      type: 'richText',
      admin: {
        description: 'Terms and conditions for this promotion',
      },
    },
  ],
};
