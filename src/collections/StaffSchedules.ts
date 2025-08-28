import { CollectionConfig } from 'payload';

export const StaffSchedules: CollectionConfig = {
  slug: 'staff-schedules',
  admin: {
    useAsTitle: 'staff',
    group: 'Bookings',
    defaultColumns: ['staff', 'tenant', 'startTime', 'endTime', 'available'],
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || { staff: { equals: req.user?.id } },
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin' || { staff: { equals: req.user?.id } },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'staff', type: 'relationship', relationTo: 'users', required: true, filterOptions: { role: { equals: 'staff' } } },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true },
    { name: 'startTime', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'endTime', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'available', type: 'checkbox', defaultValue: true },
    { name: 'notes', type: 'text' },
  ],
};