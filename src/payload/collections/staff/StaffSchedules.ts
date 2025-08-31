import type { CollectionConfig } from 'payload'

export const StaffSchedules: CollectionConfig = {
  slug: 'staff-schedules',
  admin: {
    useAsTitle: 'staff',
    group: 'Bookings',
    defaultColumns: ['staff', 'tenant', 'startTime', 'endTime', 'available', 'status'],
    description: 'Manage staff working schedules and availability',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      return { staff: { equals: req.user.id } }
    },
    create: ({ req }) => {
      if (!req.user) return false
      return req.user.role === 'admin' || req.user.role === 'manager'
    },
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      return { staff: { equals: req.user.id } }
    },
    delete: ({ req }) => {
      if (!req.user) return false
      return req.user.role === 'admin' || req.user.role === 'manager'
    },
  },
  fields: [
    {
      name: 'staff',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      filterOptions: { role: { equals: 'staff' } },
      admin: {
        description: 'Staff member assigned to this schedule',
      }
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'Tenant this schedule belongs to',
      }
    },
    {
      name: 'startTime',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'When the shift begins',
      }
    },
    {
      name: 'endTime',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'When the shift ends',
      }
    },
    {
      name: 'available',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this time slot is available for appointments',
      }
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'scheduled',
      admin: {
        description: 'Current status of this schedule',
      }
    },
    {
      name: 'breakTime',
      type: 'group',
      admin: {
        description: 'Break time during the shift',
      },
      fields: [
        {
          name: 'startBreak',
          type: 'date',
          admin: {
            date: { pickerAppearance: 'timeOnly' },
            description: 'When the break starts',
          }
        },
        {
          name: 'endBreak',
          type: 'date',
          admin: {
            date: { pickerAppearance: 'timeOnly' },
            description: 'When the break ends',
          }
        },
      ]
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes or special instructions',
        rows: 3,
      }
    },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: {
        description: 'Services this staff member can perform during this shift',
      }
    },
    {
      name: 'maxAppointments',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 50,
      admin: {
        description: 'Maximum number of appointments for this shift',
      }
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'Specific location or room for this shift (optional)',
      }
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Validate that end time is after start time
        if (data.startTime && data.endTime) {
          const start = new Date(data.startTime);
          const end = new Date(data.endTime);

          if (start >= end) {
            throw new Error('End time must be after start time');
          }

          // Validate reasonable shift duration (max 12 hours)
          const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          if (durationHours > 12) {
            throw new Error('Shift duration cannot exceed 12 hours');
          }
        }

        // Set default status if not provided
        if (operation === 'create' && !data.status) {
          data.status = 'scheduled';
        }

        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user?.tenant?.id) {
          data.tenant = req.user.tenant.id
        }

        return data;
      }
    ],
    afterChange: [
      ({ doc, operation, req }) => {
        // Could add notification logic here
        console.log(`Schedule ${operation}d:`, doc.id);
      }
    ]
  },
  indexes: [
    {
      fields: ['staff', 'startTime'],
    },
    {
      fields: ['tenant', 'startTime'],
    },
    {
      fields: ['status'],
    },
  ],
  timestamps: true,
};
