import { CollectionConfig } from 'payload';

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  admin: {
    useAsTitle: 'appointmentTitle',
    defaultColumns: ['appointmentTitle', 'customer', 'stylist', 'dateTime', 'service', 'status'],
    group: 'Appointments',
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    create: ({ req }) => !!req.user,
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      return { customer: { equals: req.user.id } }
    },
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      return { customer: { equals: req.user.id } }
    },
    delete: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      return { customer: { equals: req.user.id } }
    },
  },
  indexes: [
    { fields: ['dateTime', 'status'] },
    { fields: ['stylist', 'dateTime'] },
  ],
  fields: [
    { name: 'appointmentTitle', type: 'text', required: true, defaultValue: 'Appointment' },
    { name: 'customer', type: 'relationship', relationTo: 'customers', required: true },
    { name: 'stylist', type: 'relationship', relationTo: 'stylists', required: true },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true },
    { name: 'dateTime', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'service', type: 'text', required: true },
    { 
      name: 'status', 
      type: 'select', 
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ], 
      defaultValue: 'pending' 
    },
    { name: 'paymentStatus', type: 'select', options: ['unpaid', 'paid', 'refunded'], defaultValue: 'unpaid' },
    { name: 'stripePaymentIntentId', type: 'text', admin: { readOnly: true } },
    { name: 'googleEventId', type: 'text', admin: { readOnly: true } },
    { name: 'notes', type: 'text' },
  ],
};