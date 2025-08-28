import { CollectionConfig } from 'payload';

export const ClockRecords: CollectionConfig = {
  slug: 'clock-records',
  admin: {
    useAsTitle: 'timestamp',
    group: 'Admin',
    defaultColumns: ['staff', 'tenant', 'action', 'timestamp'],
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || { staff: { equals: req.user?.id } },
    create: ({ req }) => req.user?.role === 'staff',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'staff', type: 'relationship', relationTo: 'users', required: true, filterOptions: { role: { equals: 'staff' } } },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true },
    { name: 'action', type: 'select', options: ['clock-in', 'clock-out'], required: true },
    { name: 'timestamp', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
  ],
};