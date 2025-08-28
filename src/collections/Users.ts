import { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || { id: { equals: req.user?.id } },
    update: ({ req }) => req.user?.role === 'admin' || { id: { equals: req.user?.id } },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'email', type: 'email', required: true },
    { name: 'name', type: 'text' },
    { name: 'role', type: 'select', options: ['admin', 'customer', 'staff'], defaultValue: 'customer', required: true },
    { name: 'googleAccessToken', type: 'text', admin: { hidden: true } },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants' },
    {
      name: 'bio',
      type: 'textarea',
      admin: { description: 'Short biography for barber profile.' },
    },
    {
      name: 'specialties',
      type: 'array',
      fields: [{ name: 'specialty', type: 'text' }],
      admin: { description: 'Barber specialties (e.g., fades, beard trims).' },
    },
    {
      name: 'profilePhoto',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Profile photo for barber profile.' },
    },
    {
      name: 'profile',
      type: 'group',
      admin: {
        description: 'Customer profile information',
      },
      fields: [
        {
          name: 'phone',
          type: 'text',
          admin: {
            description: 'Phone number',
          },
        },
        {
          name: 'dateOfBirth',
          type: 'date',
          admin: {
            description: 'Date of birth for personalized offers',
          },
        },
        {
          name: 'preferences',
          type: 'group',
          admin: {
            description: 'Customer preferences',
          },
          fields: [
            {
              name: 'hairType',
              type: 'select',
              options: [
                { label: 'Straight', value: 'straight' },
                { label: 'Wavy', value: 'wavy' },
                { label: 'Curly', value: 'curly' },
                { label: 'Coily', value: 'coily' },
              ],
            },
            {
              name: 'hairLength',
              type: 'select',
              options: [
                { label: 'Short', value: 'short' },
                { label: 'Medium', value: 'medium' },
                { label: 'Long', value: 'long' },
              ],
            },
            {
              name: 'beardStyle',
              type: 'select',
              options: [
                { label: 'Clean Shaven', value: 'clean' },
                { label: 'Stubble', value: 'stubble' },
                { label: 'Short Beard', value: 'short' },
                { label: 'Long Beard', value: 'long' },
                { label: 'Goatee', value: 'goatee' },
                { label: 'Mustache', value: 'mustache' },
              ],
            },
            {
              name: 'stylePreferences',
              type: 'array',
              fields: [
                {
                  name: 'preference',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'loyalty',
      type: 'group',
      admin: {
        description: 'Loyalty program information',
      },
      fields: [
        {
          name: 'points',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Current loyalty points',
            readOnly: true,
          },
        },
        {
          name: 'tier',
          type: 'select',
          options: [
            { label: 'Bronze', value: 'bronze' },
            { label: 'Silver', value: 'silver' },
            { label: 'Gold', value: 'gold' },
            { label: 'Platinum', value: 'platinum' },
          ],
          defaultValue: 'bronze',
          admin: {
            description: 'Loyalty tier level',
            readOnly: true,
          },
        },
        {
          name: 'badges',
          type: 'array',
          admin: {
            description: 'Earned loyalty badges',
            readOnly: true,
          },
          fields: [
            {
              name: 'badge',
              type: 'text',
              required: true,
            },
            {
              name: 'earnedAt',
              type: 'date',
              admin: {
                date: { pickerAppearance: 'dayAndTime' },
              },
            },
            {
              name: 'description',
              type: 'text',
            },
          ],
        },
        {
          name: 'totalSpent',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Total amount spent (in cents)',
            readOnly: true,
          },
        },
        {
          name: 'referrals',
          type: 'array',
          admin: {
            description: 'Referral history',
            readOnly: true,
          },
          fields: [
            {
              name: 'referredEmail',
              type: 'email',
            },
            {
              name: 'referredAt',
              type: 'date',
              admin: {
                date: { pickerAppearance: 'dayAndTime' },
              },
            },
            {
              name: 'converted',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
      ],
    },
    {
      name: 'consultations',
      type: 'array',
      admin: {
        description: 'AI-generated style consultations',
        readOnly: true,
      },
      fields: [
        {
          name: 'date',
          type: 'date',
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
        {
          name: 'recommendations',
          type: 'group',
          fields: [
            {
              name: 'hairstyle',
              type: 'text',
            },
            {
              name: 'beardStyle',
              type: 'text',
            },
            {
              name: 'products',
              type: 'array',
              fields: [
                {
                  name: 'product',
                  type: 'text',
                },
                {
                  name: 'reason',
                  type: 'text',
                },
              ],
            },
            {
              name: 'services',
              type: 'array',
              fields: [
                {
                  name: 'service',
                  type: 'text',
                },
                {
                  name: 'reason',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          name: 'notes',
          type: 'textarea',
        },
      ],
    },
  ],
  indexes: [
    {
      fields: ['email', 'tenant', 'role'],
      unique: true,
    },
  ],
};