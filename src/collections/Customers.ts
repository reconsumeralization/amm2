import { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'fullName',
    description: 'Client database and profiles',
    group: 'Customers',
    defaultColumns: ['fullName', 'email', 'phone', 'loyaltyTier', 'totalSpent'],
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Customer first name',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Customer last name',
      },
    },
    {
      name: 'fullName',
      type: 'text',
      admin: {
        description: 'Auto-generated full name',
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }: { siblingData: any } ) => {
            return `${siblingData.firstName || ''} ${siblingData.lastName || ''}`.trim()
          },
        ],
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Primary email address',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Primary phone number',
      },
    },
    {
      name: 'secondaryPhone',
      type: 'text',
      admin: {
        description: 'Secondary phone number',
      },
    },
    {
      name: 'dateOfBirth',
      type: 'date',
      admin: {
        description: 'Customer date of birth',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Customer profile picture',
      },
    },
    {
      name: 'hairProfile',
      type: 'group',
      admin: {
        description: 'Hair characteristics and preferences',
      },
      fields: [
        {
          name: 'hairType',
          type: 'select',
          options: [
            { label: 'Straight', value: 'straight' },
            { label: 'Wavy', value: 'wavy' },
            { label: 'Curly', value: 'curly' },
            { label: 'Kinky/Coily', value: 'kinky' },
          ],
        },
        {
          name: 'hairLength',
          type: 'select',
          options: [
            { label: 'Short (above ears)', value: 'short' },
            { label: 'Medium (ears to shoulders)', value: 'medium' },
            { label: 'Long (below shoulders)', value: 'long' },
            { label: 'Very Long (below chest)', value: 'very-long' },
          ],
        },
        {
          name: 'hairDensity',
          type: 'select',
          options: [
            { label: 'Fine', value: 'fine' },
            { label: 'Medium', value: 'medium' },
            { label: 'Thick', value: 'thick' },
          ],
        },
        {
          name: 'scalpCondition',
          type: 'select',
          options: [
            { label: 'Normal', value: 'normal' },
            { label: 'Dry', value: 'dry' },
            { label: 'Oily', value: 'oily' },
            { label: 'Sensitive', value: 'sensitive' },
            { label: 'Dandruff', value: 'dandruff' },
          ],
        },
        {
          name: 'chemicalHistory',
          type: 'array',
          admin: {
            description: 'Previous chemical treatments',
          },
          fields: [
            {
              name: 'treatment',
              type: 'select',
              required: true,
              options: [
                { label: 'Color', value: 'color' },
                { label: 'Perm', value: 'perm' },
                { label: 'Relaxer', value: 'relaxer' },
                { label: 'Highlights', value: 'highlights' },
                { label: 'Other', value: 'other' },
              ],
            },
            {
              name: 'date',
              type: 'date',
            },
            {
              name: 'notes',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'preferences',
      type: 'group',
      admin: {
        description: 'Service and communication preferences',
      },
      fields: [
        {
          name: 'preferredStylist',
          type: 'relationship',
          relationTo: 'stylists',
          admin: {
            description: 'Preferred stylist',
          },
        },
        {
          name: 'preferredServices',
          type: 'relationship',
          relationTo: 'services',
          hasMany: true,
          admin: {
            description: 'Frequently requested services',
          },
        },
        {
          name: 'emailReminders',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Send email appointment reminders',
          },
        },
        {
          name: 'smsReminders',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Send SMS appointment reminders',
          },
        },
        {
          name: 'marketingEmails',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Send promotional emails',
          },
        },
        {
          name: 'specialOffers',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Send special offers and promotions',
          },
        },
        {
          name: 'preferredDays',
          type: 'select',
          hasMany: true,
          admin: {
            description: 'Preferred days for appointments',
          },
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
          name: 'preferredTimes',
          type: 'select',
          hasMany: true,
          admin: {
            description: 'Preferred times for appointments',
          },
          options: [
            { label: 'Morning (9-12)', value: 'morning' },
            { label: 'Afternoon (12-5)', value: 'afternoon' },
            { label: 'Evening (5-8)', value: 'evening' },
          ],
        },
      ],
    },
    {
      name: 'loyaltyProgram',
      type: 'group',
      admin: {
        description: 'Loyalty program information',
      },
      fields: [
        {
          name: 'loyaltyPoints',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Current loyalty points balance',
            readOnly: true,
          },
        },
        {
          name: 'loyaltyTier',
          type: 'select',
          defaultValue: 'bronze',
          options: [
            { label: 'Bronze (0-99 points)', value: 'bronze' },
            { label: 'Silver (100-299 points)', value: 'silver' },
            { label: 'Gold (300-699 points)', value: 'gold' },
            { label: 'Platinum (700+ points)', value: 'platinum' },
          ],
          admin: {
            description: 'Current loyalty tier',
            readOnly: true,
          },
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
          name: 'visitCount',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Total number of visits',
            readOnly: true,
          },
        },
        {
          name: 'memberSince',
          type: 'date',
          admin: {
            description: 'Loyalty program join date',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'emergencyContact',
      type: 'group',
      admin: {
        description: 'Emergency contact information',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          admin: {
            description: 'Emergency contact name',
          },
        },
        {
          name: 'relationship',
          type: 'text',
          admin: {
            description: 'Relationship to customer',
          },
        },
        {
          name: 'phone',
          type: 'text',
          admin: {
            description: 'Emergency contact phone',
          },
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this customer',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Customer tags for organization',
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
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Active customer account',
        position: 'sidebar',
      },
    },
    {
      name: 'lastVisit',
      type: 'date',
      admin: {
        description: 'Date of last visit',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'nextAppointment',
      type: 'date',
      admin: {
        description: 'Date of next scheduled appointment',
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }: { data: any, req: any, operation: string }) => {
        if (operation === 'create') {
          // Set member since date for new customers
          if (!data.memberSince) {
            data.memberSince = new Date()
          }
        }

        // Update loyalty tier based on points
        if (data.loyaltyPoints !== undefined) {
          if (data.loyaltyPoints >= 700) {
            data.loyaltyTier = 'platinum'
          } else if (data.loyaltyPoints >= 300) {
            data.loyaltyTier = 'gold'
          } else if (data.loyaltyPoints >= 100) {
            data.loyaltyTier = 'silver'
          } else {
            data.loyaltyTier = 'bronze'
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }: { doc: any, req: any, operation: string }) => {
        if (operation === 'create') {
          console.log(`New customer created: ${doc.fullName} (${doc.email})`)
        }
      },
    ],
  },
  access: {
    read: ({ req }: { req: any }) => {
      const user = req.user
      if (!user) return false
      // Customers can read their own data, staff can read all
      if (user.role === 'customer') {
        return { id: { equals: user.id } }
      }
      return true
    },
    create: ({ req }: { req: any }) => {
      // Allow customers to create their own accounts via frontend
      return true
    },
    update: ({ req }: { req: any }) => {
      const user = req.user
      if (!user) return false
      if (user.role === 'admin' || user.role === 'manager' || user.role === 'staff') return true
      // Customers can update their own data
      return { id: { equals: user.id } }
    },
    delete: ({ req }: { req: any }) => {
      return req.user?.role === 'admin'
    },
  },
  timestamps: true,
}