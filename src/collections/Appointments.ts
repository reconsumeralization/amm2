import { CollectionConfig } from 'payload';

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'user', 'tenant', 'date', 'service', 'status', 'paymentStatus'],
    group: 'Bookings',
  },
  access: {
    create: ({ req }) => !!req.user, // Only authenticated users
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      if (req.user.role === 'barber') return true // Barbers need to view appointments
      return { user: { equals: req.user.id } }
    },
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      return { user: { equals: req.user.id } }
    },
    delete: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      return { user: { equals: req.user.id } }
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true, defaultValue: 'Appointment' },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true },
    { name: 'date', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'service', type: 'text', required: true },
    { name: 'status', type: 'select', options: ['pending', 'confirmed', 'cancelled', 'rescheduled'], defaultValue: 'pending' },
    { name: 'paymentStatus', type: 'select', options: ['unpaid', 'paid', 'refunded'], defaultValue: 'unpaid' },
    { name: 'stripePaymentIntentId', type: 'text', admin: { readOnly: true } },
    { name: 'googleEventId', type: 'text', admin: { readOnly: true } },
    { name: 'notes', type: 'text' },
  ],
};