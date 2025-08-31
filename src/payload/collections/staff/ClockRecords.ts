import type { CollectionConfig, AccessResult, AccessArgs, FilterOptionsProps, Where } from 'payload'

export const ClockRecords: CollectionConfig = {
  slug: 'clock-records',
  labels: {
    singular: 'Clock Record',
    plural: 'Clock Records',
  },
  admin: {
    useAsTitle: 'timestamp',
    defaultColumns: ['staff', 'tenant', 'action', 'timestamp', 'duration'],
    group: 'Staff Management',
    description: 'Track staff clock-in and clock-out times',
    listSearchableFields: ['staff.name', 'staff.email', 'notes'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }: AccessArgs): AccessResult => {
      if (!req.user) return false
      if ((req.user as any)?.role === 'admin') return true
      if ((req.user as any)?.role === 'manager') {
        return { tenant: { equals: (req.user as any)?.tenant?.id } } as Where
      }
      // Staff can only view their own records
      return { staff: { equals: req.user.id } } as Where
    },
    create: ({ req }: AccessArgs): boolean => {
      if (!req.user) return false
      return ['admin', 'manager', 'barber'].includes((req.user as any)?.role)
    },
    update: ({ req }: AccessArgs): boolean => {
      if (!req.user) return false
      return ['admin', 'manager'].includes((req.user as any)?.role)
    },
    delete: ({ req }: AccessArgs): boolean => {
      if (!req.user) return false
      return ['admin', 'manager'].includes((req.user as any)?.role)
    },
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-set tenant for non-admin users
        if (operation === 'create' && !data.tenant && req.user && (req.user as any)?.role !== 'admin') {
          data.tenant = (req.user as any)?.tenant?.id
        }

        // Auto-set staff if not provided (for self clock-in)
        if (operation === 'create' && !data.staff && req.user && (req.user as any)?.role === 'barber') {
          data.staff = req.user.id
        }

        // Auto-set timestamp if not provided
        if (operation === 'create' && !data.timestamp) {
          data.timestamp = new Date()
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'staff',
      type: 'relationship',
      relationTo: 'users' as any as any,
      required: true,
      filterOptions: ({ data }: FilterOptionsProps): Where | false => {
        if (!data?.tenant) return false
        return {
          and: [
            { role: { in: ['barber', 'manager'] } },
            { tenant: { equals: data.tenant } }
          ]
        }
      },
      admin: {
        description: 'The staff member clocking in/out',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      admin: {
        description: 'The business location',
      },
    },
    {
      name: 'action',
      type: 'select',
      options: [
        { label: 'Clock In', value: 'clock-in' },
        { label: 'Clock Out', value: 'clock-out' },
        { label: 'Break Start', value: 'break-start' },
        { label: 'Break End', value: 'break-end' },
      ],
      required: true,
      index: true,
      admin: {
        description: 'The type of clock action',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the action occurred',
      },
    },
    {
      name: 'duration',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Duration in minutes (calculated for clock-out records)',
        step: 1,
      },
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'latitude',
          type: 'number',
          admin: {
            description: 'GPS latitude for location verification',
          },
        },
        {
          name: 'longitude',
          type: 'number',
          admin: {
            description: 'GPS longitude for location verification',
          },
        },
        {
          name: 'address',
          type: 'text',
          admin: {
            description: 'Approximate address where clock action occurred',
          },
        },
      ],
      admin: {
        description: 'Location data for verification',
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Optional notes about this clock record',
        rows: 3,
      },
    },
    {
      name: 'isManualEntry',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this was manually entered by management',
        position: 'sidebar',
      },
    },
    {
      name: 'manualEntryReason',
      type: 'text',
      admin: {
        condition: (data) => data.isManualEntry,
        description: 'Reason for manual entry',
      },
    },
  ],
}
