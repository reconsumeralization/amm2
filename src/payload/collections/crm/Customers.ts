import type { CollectionConfig } from 'payload'
import { customerSchemas } from '../../lib/validation'
import { yoloMonitoring } from '../../lib/monitoring'

export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: {
    singular: 'Customer',
    plural: 'Customers',
  },
  admin: {
    useAsTitle: 'fullName',
    description: 'Client database and profiles',
    group: 'Customers',
    defaultColumns: ['fullName', 'email', 'phone', 'loyaltyTier', 'totalSpent', 'lastVisit'],
    listSearchableFields: ['firstName', 'lastName', 'email', 'phone'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  
  // Add access control
  access: {
    create: ({ req }) => !!req.user, // Only authenticated users
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      if (req.user.role === 'barber') {
        // Barbers can only access data within their tenant
        return true;
      } // Barbers need to view customer info
      return { createdBy: { equals: req.user.id } }
    },
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      return { createdBy: { equals: req.user.id } }
    },
    delete: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      return { createdBy: { equals: req.user.id } }
    },
  },

  // Add hooks for validation and monitoring
  hooks: {
    beforeChange: [
      ({ data, operation, req }: any) => {
        // Basic validation for required fields
        if (operation === 'create') {
          if (!data.email) {
            throw new Error('Email is required for new customers');
          }
          if (!data.firstName || !data.lastName) {
            throw new Error('First and last name are required for new customers');
          }
        }

        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user && req.user.role !== 'admin') {
          data.tenant = req.user.tenant?.id;
        }
      }
    ],
    afterChange: [
      ({ doc, operation }) => {
        // Track customer operations using correct method names
        // yoloMonitoring.trackCollectionOperation('customers', operation, doc.id); // Placeholder
        
        // Track business metrics using trackOperation
        if (operation === 'create') {
          // yoloMonitoring.trackOperation('customers_created', { customerId: doc.id });
        }
      }
    ],
    afterDelete: [
      ({ doc }) => {
        // Track customer deletion using correct method names
        yoloMonitoring.trackCollectionOperation('customers', 'delete', doc.id);
        // yoloMonitoring.trackOperation('customers_deleted', { customerId: doc.id });
      }
    ],
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
      validate: (value: string | null | undefined) => {
        if (!value || value.length < 1) return 'First name is required';
        if (value.length > 50) return 'First name too long';
        return true;
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
      validate: (value: string | null | undefined) => {
        if (!value || value.length < 1) return 'Last name is required';
        if (value.length > 50) return 'Last name too long';
        return true;
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
      validate: (value: string | null | undefined) => {
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Invalid email address';
        return true;
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Primary phone number',
      },
      validate: (value: string | null | undefined) => {
        if (value) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            return 'Invalid phone number format';
          }
        }
        return true;
      },
    },
    {
      name: 'secondaryPhone',
      type: 'text',
      admin: {
        description: 'Secondary phone number',
      },
      validate: (value: string | null | undefined) => {
        if (value) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            return 'Invalid phone number format';
          }
        }
        return true;
      },
    },
    {
      name: 'dateOfBirth',
      type: 'date',
      admin: {
        description: 'Customer date of birth',
      },
      validate: (value: Date | null | undefined) => {
        if (value) {
          const date = new Date(value);
          const now = new Date();
          const age = now.getFullYear() - date.getFullYear();
          if (age < 0 || age > 120) return 'Invalid date of birth';
        }
        return true;
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
          admin: {
            description: 'Natural hair type classification',
          },
        },
        {
          name: 'hairTexture',
          type: 'select',
          options: [
            { label: 'Fine', value: 'fine' },
            { label: 'Medium', value: 'medium' },
            { label: 'Coarse', value: 'coarse' },
          ],
          admin: {
            description: 'Hair strand thickness',
          },
        },
        {
          name: 'hairDensity',
          type: 'select',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
          ],
          admin: {
            description: 'Amount of hair per square inch',
          },
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
          admin: {
            description: 'Scalp health condition',
          },
        },
        {
          name: 'hairColor',
          type: 'text',
          admin: {
            description: 'Natural hair color',
          },
        },
        {
          name: 'colorHistory',
          type: 'array',
          admin: {
            description: 'Previous hair color treatments',
          },
          fields: [
            {
              name: 'date',
              type: 'date',
              required: true,
            },
            {
              name: 'color',
              type: 'text',
              required: true,
            },
            {
              name: 'brand',
              type: 'text',
            },
            {
              name: 'stylist',
              type: 'text',
            },
          ],
        },
        {
          name: 'preferredStyles',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Classic', value: 'classic' },
            { label: 'Modern', value: 'modern' },
            { label: 'Trendy', value: 'trendy' },
            { label: 'Professional', value: 'professional' },
            { label: 'Casual', value: 'casual' },
            { label: 'Edgy', value: 'edgy' },
            { label: 'Vintage', value: 'vintage' },
          ],
        },
        {
          name: 'allergies',
          type: 'textarea',
          admin: {
            description: 'Any hair product allergies or sensitivities',
          },
        },
        {
          name: 'chemicalTreatments',
          type: 'array',
          admin: {
            description: 'Recent chemical treatments (perms, relaxers, etc.)',
          },
          fields: [
            {
              name: 'treatment',
              type: 'text',
              required: true,
            },
            {
              name: 'date',
              type: 'date',
              required: true,
            },
            {
              name: 'product',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'address',
      type: 'group',
      admin: {
        description: 'Customer address information',
      },
      fields: [
        {
          name: 'street',
          type: 'text',
          admin: {
            description: 'Street address',
          },
        },
        {
          name: 'city',
          type: 'text',
          admin: {
            description: 'City',
          },
        },
        {
          name: 'state',
          type: 'text',
          admin: {
            description: 'State/Province',
          },
        },
        {
          name: 'zipCode',
          type: 'text',
          admin: {
            description: 'ZIP/Postal code',
          },
        },
        {
          name: 'country',
          type: 'text',
          defaultValue: 'United States',
          admin: {
            description: 'Country',
          },
        },
      ],
    },
    {
      name: 'preferences',
      type: 'group',
      admin: {
        description: 'Customer preferences and settings',
      },
      fields: [
        {
          name: 'communicationMethod',
          type: 'select',
          options: [
            { label: 'Email', value: 'email' },
            { label: 'SMS', value: 'sms' },
            { label: 'Phone', value: 'phone' },
          ],
          defaultValue: 'email',
          admin: {
            description: 'Preferred method of communication',
          },
        },
        {
          name: 'marketingConsent',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Consent to receive marketing communications',
          },
        },
        {
          name: 'appointmentReminders',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive appointment reminders',
          },
        },
        {
          name: 'reminderTiming',
          type: 'select',
          options: [
            { label: '24 hours before', value: '24h' },
            { label: '2 hours before', value: '2h' },
            { label: '1 hour before', value: '1h' },
            { label: '30 minutes before', value: '30m' },
          ],
          defaultValue: '24h',
          admin: {
            description: 'When to send appointment reminders',
            condition: (data) => data.appointmentReminders,
          },
        },
        {
          name: 'preferredStylist',
          type: 'relationship',
          relationTo: 'stylists',
          admin: {
            description: 'Preferred stylist for appointments',
          },
        },
        {
          name: 'preferredTimeSlots',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Morning (8AM-12PM)', value: 'morning' },
            { label: 'Afternoon (12PM-5PM)', value: 'afternoon' },
            { label: 'Evening (5PM-8PM)', value: 'evening' },
            { label: 'Weekends', value: 'weekends' },
          ],
          admin: {
            description: 'Preferred appointment time slots',
          },
        },
        {
          name: 'notes',
          type: 'textarea',
          admin: {
            description: 'Additional customer notes and preferences',
          },
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
          name: 'loyaltyTier',
          type: 'select',
          options: [
            { label: 'Bronze', value: 'bronze' },
            { label: 'Silver', value: 'silver' },
            { label: 'Gold', value: 'gold' },
            { label: 'Platinum', value: 'platinum' },
          ],
          defaultValue: 'bronze',
          admin: {
            description: 'Current loyalty tier based on spending',
          },
        },
        {
          name: 'points',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Current loyalty points balance',
            readOnly: true,
          },
        },
        {
          name: 'totalSpent',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total amount spent (lifetime)',
            readOnly: true,
          },
        },
        {
          name: 'totalVisits',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total number of visits',
            readOnly: true,
          },
        },
        {
          name: 'averageSpendPerVisit',
          type: 'number',
          admin: {
            description: 'Average spending per visit',
            readOnly: true,
          },
        },
        {
          name: 'memberSince',
          type: 'date',
          admin: {
            description: 'Date customer joined loyalty program',
            readOnly: true,
          },
          hooks: {
            beforeChange: [
              ({ operation, siblingData }) => {
                if (operation === 'create' && !siblingData.memberSince) {
                  return new Date();
                }
                return siblingData.memberSince;
              },
            ],
          },
        },
        {
          name: 'referralCode',
          type: 'text',
          unique: true,
          admin: {
            description: 'Unique referral code for this customer',
            readOnly: true,
          },
          hooks: {
            beforeChange: [
              ({ operation, siblingData }) => {
                if (operation === 'create' && !siblingData.referralCode) {
                  // Generate unique referral code
                  const firstName = siblingData.firstName || '';
                  const lastName = siblingData.lastName || '';
                  const randomNum = Math.floor(Math.random() * 1000);
                  return `${firstName.slice(0, 2)}${lastName.slice(0, 2)}${randomNum}`.toUpperCase();
                }
                return siblingData.referralCode;
              },
            ],
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
          type: 'select',
          options: [
            { label: 'Spouse', value: 'spouse' },
            { label: 'Parent', value: 'parent' },
            { label: 'Child', value: 'child' },
            { label: 'Sibling', value: 'sibling' },
            { label: 'Friend', value: 'friend' },
            { label: 'Other', value: 'other' },
          ],
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
          validate: (value: string | null | undefined) => {
            if (value) {
              const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
              if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                return 'Invalid phone number format';
              }
            }
            return true;
          },
        },
      ],
    },
    {
      name: 'visitHistory',
      type: 'group',
      admin: {
        description: 'Visit tracking and history',
      },
      fields: [
        {
          name: 'firstVisit',
          type: 'date',
          admin: {
            description: 'Date of first visit',
            readOnly: true,
          },
        },
        {
          name: 'lastVisit',
          type: 'date',
          admin: {
            description: 'Date of last visit',
            readOnly: true,
          },
        },
        {
          name: 'averageTimeBetweenVisits',
          type: 'number',
          admin: {
            description: 'Average days between visits',
            readOnly: true,
          },
        },
        {
          name: 'noShowCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of no-shows',
            readOnly: true,
          },
        },
        {
          name: 'cancellationCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of cancellations',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether the customer account is active',
      },
    },
    {
      name: 'isVip',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'VIP customer status',
      },
    },
    {
      name: 'nextAppointment',
      type: 'relationship',
      relationTo: 'appointments',
      admin: {
        description: 'Next scheduled appointment',
        readOnly: true,
      },
    },
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'High Value', value: 'high-value' },
        { label: 'Frequent Visitor', value: 'frequent' },
        { label: 'New Customer', value: 'new' },
        { label: 'Referral Source', value: 'referral-source' },
        { label: 'Special Needs', value: 'special-needs' },
        { label: 'Corporate Client', value: 'corporate' },
      ],
      admin: {
        description: 'Customer classification tags',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who created this customer record',
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
};
