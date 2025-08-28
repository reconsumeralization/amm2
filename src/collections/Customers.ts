import { CollectionConfig } from 'payload'
import { customerSchemas } from '../lib/validation'
import { yoloMonitoring } from '../lib/monitoring'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'fullName',
    description: 'Client database and profiles',
    group: 'Customers',
    defaultColumns: ['fullName', 'email', 'phone', 'loyaltyTier', 'totalSpent'],
  },
  
  // Add access control
  access: {
    create: ({ req }) => !!req.user, // Only authenticated users
    read: ({ req }) => req.user?.role === 'admin' || { createdBy: { equals: req.user?.id } },
    update: ({ req }) => req.user?.role === 'admin' || { createdBy: { equals: req.user?.id } },
    delete: ({ req }) => req.user?.role === 'admin' || { createdBy: { equals: req.user?.id } },
  },

  // Add hooks for validation and monitoring
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Validate data using Zod schema
        const schema = operation === 'create' ? customerSchemas.create : customerSchemas.update;
        const result = schema.safeParse(data);
        if (!result.success) {
          throw new Error(`Validation failed: ${result.error.message}`);
        }
      }
    ],
    afterChange: [
      ({ doc, operation }) => {
        // Track customer operations
        yoloMonitoring.trackPayloadOperation('customers', operation, doc.createdBy);
        
        // Track business metrics
        if (operation === 'create') {
          yoloMonitoring.trackBusinessMetric('customers_created', 1, 'customers');
        }
      }
    ],
    afterDelete: [
      ({ doc }) => {
        // Track customer deletion
        yoloMonitoring.trackPayloadOperation('customers', 'delete', doc.createdBy);
        yoloMonitoring.trackBusinessMetric('customers_deleted', 1, 'customers');
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
      validate: (value) => {
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
      validate: (value) => {
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
      validate: (value) => {
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
      validate: (value) => {
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
      validate: (value) => {
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
      validate: (value) => {
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
        },
        {
          name: 'hairTexture',
          type: 'select',
          options: [
            { label: 'Fine', value: 'fine' },
            { label: 'Medium', value: 'medium' },
            { label: 'Coarse', value: 'coarse' },
          ],
        },
        {
          name: 'hairColor',
          type: 'text',
          admin: {
            description: 'Natural hair color',
          },
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
          ],
        },
        {
          name: 'allergies',
          type: 'textarea',
          admin: {
            description: 'Any hair product allergies or sensitivities',
          },
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
          name: 'preferredStylist',
          type: 'relationship',
          relationTo: 'stylists',
          admin: {
            description: 'Preferred stylist for appointments',
          },
        },
        {
          name: 'notes',
          type: 'textarea',
          admin: {
            description: 'Additional customer notes',
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
        },
        {
          name: 'points',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Current loyalty points',
            readOnly: true,
          },
        },
        {
          name: 'totalSpent',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total amount spent',
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
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether the customer account is active',
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
      name: 'nextAppointment',
      type: 'relationship',
      relationTo: 'appointments',
      admin: {
        description: 'Next scheduled appointment',
        readOnly: true,
      },
    },
  ],
};