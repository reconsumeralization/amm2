import { CollectionConfig } from 'payload';

export const CustomerNotes: CollectionConfig = {
  slug: 'customer-notes',
  labels: {
    singular: 'Customer Note',
    plural: 'Customer Notes',
  },
  admin: {
    useAsTitle: 'customer',
    group: 'CRM',
    description: 'Internal notes and observations about customers',
    defaultColumns: ['customer', 'author', 'note', 'visibility', 'createdAt'],
    listSearchableFields: ['customer.name', 'customer.email', 'note', 'author.name'],
  },
  access: {
    read: ({ req }): any => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      if (['manager', 'barber'].includes(req.user.role)) {
        return { tenant: { equals: req.user.tenant?.id } };
      }
      // Customers can only read their own public notes
      return {
        tenant: { equals: req.user.tenant?.id },
        customer: { equals: req.user.id },
        visibility: { equals: 'public' }
      };
    },
    create: ({ req }): boolean => {
      if (!req.user) return false;
      return ['admin', 'manager', 'barber'].includes(req.user.role);
    },
    update: ({ req }): any => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      // Users can only update their own notes
      return {
        tenant: { equals: req.user.tenant?.id },
        author: { equals: req.user.id }
      };
    },
    delete: ({ req }): any => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      // Users can only delete their own notes
      return {
        tenant: { equals: req.user.tenant?.id },
        author: { equals: req.user.id }
      };
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (!data) return data;

        // Auto-assign tenant for non-admin users
        if (operation === 'create' && !data.tenant && req.user && req.user.role !== 'admin') {
          data.tenant = req.user.tenant?.id;
        }

        // Auto-assign author for staff notes
        if (operation === 'create' && !data.author && req.user && ['admin', 'manager', 'barber'].includes(req.user.role)) {
          data.author = req.user.id;
        }

        return data;
      },
    ],
    beforeChange: [
      ({ data, operation, req }) => {
        if (!data) return data;

        if (operation === 'create') {
          console.log(`Creating customer note for customer`);
        }

        return data;
      },
    ],
    afterChange: [
      ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`Customer note created: ${doc.id} for customer`);

          // TODO: Send notification if urgent note
          // TODO: Update customer profile with latest note timestamp
        }
      },
    ],
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: {
        description: 'Business this note belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      filterOptions: ({ data }): any => {
        if (!data?.tenant) return false;
        return {
          tenant: { equals: data.tenant },
          role: { equals: 'customer' }
        };
      },
      admin: {
        description: 'Customer this note is about',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      filterOptions: ({ data }): any => {
        if (!data?.tenant) return false;
        return {
          tenant: { equals: data.tenant },
          role: { in: ['admin', 'manager', 'barber'] }
        };
      },
      admin: {
        description: 'Staff member who wrote this note',
      },
    },
    {
      name: 'note',
      type: 'textarea',
      required: true,
      maxLength: 2000,
      admin: {
        description: 'The note content',
        rows: 4,
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Service Preferences', value: 'service_preferences' },
        { label: 'Allergies & Sensitivities', value: 'allergies_sensitivities' },
        { label: 'Behavior', value: 'behavior' },
        { label: 'VIP Status', value: 'vip_status' },
        { label: 'Complaints', value: 'complaints' },
        { label: 'Compliments', value: 'compliments' },
        { label: 'Payment Issues', value: 'payment_issues' },
        { label: 'No-Show History', value: 'no_show_history' },
        { label: 'Referral', value: 'referral' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'general',
      admin: {
        description: 'Category for organizing notes',
      },
    },
    {
      name: 'visibility',
      type: 'select',
      required: true,
      options: [
        { label: 'Private', value: 'private' },
        { label: 'Staff Only', value: 'staff_only' },
        { label: 'Public', value: 'public' },
      ],
      defaultValue: 'staff_only',
      admin: {
        description: 'Who can see this note',
      },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      defaultValue: 'normal',
      admin: {
        description: 'Priority level of this note',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Additional tags for searching and filtering',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          maxLength: 50,
          admin: {
            description: 'Tag for this note',
          },
        },
      ],
      maxRows: 10,
    },
    {
      name: 'relatedAppointment',
      type: 'relationship',
      relationTo: 'appointments',
      admin: {
        description: 'Appointment this note relates to (optional)',
      },
    },
    {
      name: 'relatedService',
      type: 'relationship',
      relationTo: 'services',
      admin: {
        description: 'Service this note relates to (optional)',
      },
    },
    {
      name: 'followUpRequired',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Does this note require follow-up action?',
      },
    },
    {
      name: 'followUpDate',
      type: 'date',
      admin: {
        description: 'When follow-up should occur',
        condition: (data) => data.followUpRequired,
      },
    },
    {
      name: 'followUpCompleted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Has follow-up been completed?',
        condition: (data) => data.followUpRequired,
      },
    },
    {
      name: 'followUpNotes',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Notes about follow-up actions',
        condition: (data) => data.followUpRequired,
        rows: 3,
      },
    },
    {
      name: 'attachments',
      type: 'array',
      admin: {
        description: 'Files attached to this note (photos, documents, etc.)',
      },
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          admin: {
            description: 'Description of this attachment',
          },
        },
      ],
      maxRows: 5,
    },
    {
      name: 'reminder',
      type: 'group',
      admin: {
        description: 'Reminder settings for this note',
      },
      fields: [
        {
          name: 'setReminder',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Set a reminder for this note?',
          },
        },
        {
          name: 'reminderDate',
          type: 'date',
          admin: {
            description: 'When to show reminder',
            condition: (data) => data.setReminder,
          },
        },
        {
          name: 'reminderMessage',
          type: 'text',
          maxLength: 200,
          admin: {
            description: 'Custom reminder message',
            condition: (data) => data.setReminder,
          },
        },
        {
          name: 'reminderSent',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Has reminder been sent?',
            condition: (data) => data.setReminder,
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'metadata',
      type: 'group',
      admin: {
        description: 'Additional metadata',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'ipAddress',
          type: 'text',
          admin: {
            description: 'IP address when note was created',
            readOnly: true,
          },
        },
        {
          name: 'userAgent',
          type: 'text',
          admin: {
            description: 'Browser/device info',
            readOnly: true,
          },
        },
        {
          name: 'edited',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Has this note been edited?',
            readOnly: true,
          },
        },
        {
          name: 'editHistory',
          type: 'array',
          admin: {
            description: 'History of edits',
            readOnly: true,
          },
          fields: [
            {
              name: 'editedAt',
              type: 'date',
              required: true,
            },
            {
              name: 'editedBy',
              type: 'relationship',
              relationTo: 'users',
              required: true,
            },
            {
              name: 'previousNote',
              type: 'textarea',
              maxLength: 2000,
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
};
