import { CollectionConfig } from 'payload';

export const RecurringAppointments: CollectionConfig = {
  slug: 'recurring-appointments',
  labels: {
    singular: 'Recurring Appointment',
    plural: 'Recurring Appointments',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Bookings',
    description: 'Manage recurring appointment series for customers',
    defaultColumns: ['title', 'customer', 'service', 'pattern', 'nextOccurrence', 'status'],
    listSearchableFields: ['title', 'customer.name', 'customer.email', 'service'],
  },
  access: {
    read: ({ req }): any => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      if (['manager', 'barber'].includes(req.user.role)) {
        return { tenant: { equals: req.user.tenant?.id } };
      }
      // Customers can only read their own recurring appointments
      return {
        tenant: { equals: req.user.tenant?.id },
        customer: { equals: req.user.id }
      };
    },
    create: ({ req }): boolean => {
      if (!req.user) return false;
      return ['admin', 'manager', 'barber', 'customer'].includes(req.user.role);
    },
    update: ({ req }): any => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      if (req.user.role === 'manager') {
        return { tenant: { equals: req.user.tenant?.id } };
      }
      // Customers can update their own recurring appointments
      return {
        tenant: { equals: req.user.tenant?.id },
        customer: { equals: req.user.id }
      };
    },
    delete: ({ req }): any => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      // Prevent deletion if there are active future occurrences
      return false;
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

        // Auto-assign customer for customer role
        if (operation === 'create' && !data.customer && req.user && req.user.role === 'customer') {
          data.customer = req.user.id;
        }

        // Generate title if not provided
        if (!data.title && data.service && data.customer) {
          data.title = `Recurring Appointment`;
        }

        return data;
      },
    ],
    beforeChange: [
      async ({ data, operation, req }) => {
        if (!data) return data;

        if (operation === 'create') {
          console.log(`Creating recurring appointment series: ${data.title}`);
        }

        // Calculate next occurrence based on pattern
        if (data.pattern && data.startDate) {
          data.nextOccurrence = calculateNextOccurrence(data.startDate, data.pattern);
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`Recurring appointment created: ${doc.title} (${doc.id})`);

          // TODO: Create initial appointment instances based on pattern
          // This would typically create the first few appointments in the series
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        if (req.payload) {
          // Check for active future appointments in this series
          const activeAppointments = await req.payload.find({
            collection: 'appointments',
            where: {
              recurringAppointment: { equals: id },
              date: { greater_than: new Date().toISOString() },
              status: { in: ['pending', 'confirmed'] }
            }
          });

          if (activeAppointments.totalDocs > 0) {
            throw new Error(`Cannot delete recurring appointment with ${activeAppointments.totalDocs} active future appointments. Please cancel the series instead.`);
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name for this recurring appointment series',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: {
        description: 'Business this recurring appointment belongs to',
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
        description: 'Customer who scheduled this recurring appointment',
      },
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
      filterOptions: ({ data }): any => {
        if (!data?.tenant) return false;
        return {
          tenant: { equals: data.tenant },
          isActive: { equals: true }
        };
      },
      admin: {
        description: 'Service being booked in this recurring series',
      },
    },
    {
      name: 'barber',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: ({ data }): any => {
        if (!data?.tenant) return false;
        return {
          role: { in: ['barber', 'manager'] },
          tenant: { equals: data.tenant },
          isActive: { equals: true }
        };
      },
      admin: {
        description: 'Preferred barber for this recurring series (optional)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        description: 'Current status of the recurring appointment series',
      },
    },
    {
      name: 'pattern',
      type: 'group',
      fields: [
        {
          name: 'frequency',
          type: 'select',
          required: true,
          options: [
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Bi-weekly', value: 'biweekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Custom', value: 'custom' },
          ],
          defaultValue: 'weekly',
          admin: {
            description: 'How often this appointment repeats',
          },
        },
        {
          name: 'interval',
          type: 'number',
          min: 1,
          max: 52,
          defaultValue: 1,
          admin: {
            description: 'Repeat every X periods (e.g., every 2 weeks)',
          },
        },
        {
          name: 'daysOfWeek',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Monday', value: 'monday' },
            { label: 'Tuesday', value: 'tuesday' },
            { label: 'Wednesday', value: 'wednesday' },
            { label: 'Thursday', value: 'thursday' },
            { label: 'Friday', value: 'friday' },
            { label: 'Saturday', value: 'saturday' },
            { label: 'Sunday', value: 'sunday' },
          ],
          admin: {
            description: 'Days of the week for weekly recurring appointments',
            condition: (data) => data.frequency === 'weekly' || data.frequency === 'biweekly',
          },
        },
        {
          name: 'timeOfDay',
          type: 'text',
          required: true,
          defaultValue: '09:00',
          admin: {
            description: 'Time of day (HH:MM format)',
          },
        },
        {
          name: 'duration',
          type: 'number',
          required: true,
          min: 15,
          max: 480,
          defaultValue: 60,
          admin: {
            description: 'Appointment duration in minutes',
            step: 15,
          },
        },
      ],
      admin: {
        description: 'Recurring pattern configuration',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        description: 'When this recurring series should start',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        description: 'When this recurring series should end (optional)',
      },
    },
    {
      name: 'nextOccurrence',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Next scheduled appointment date',
        position: 'sidebar',
      },
    },
    {
      name: 'maxOccurrences',
      type: 'number',
      min: 1,
      max: 365,
      admin: {
        description: 'Maximum number of appointments to create (optional limit)',
      },
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations',
      filterOptions: ({ data }): any => {
        if (!data?.tenant) return false;
        return {
          tenant: { equals: data.tenant },
          active: { equals: true }
        };
      },
      admin: {
        description: 'Preferred location for this recurring series',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Special instructions or preferences for this recurring series',
        rows: 3,
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        description: 'Who created this recurring appointment series',
        position: 'sidebar',
      },
    },
    {
      name: 'statistics',
      type: 'group',
      admin: {
        description: 'Tracking statistics for this recurring series',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'totalAppointments',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Total appointments created in this series',
          },
        },
        {
          name: 'completedAppointments',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Successfully completed appointments',
          },
        },
        {
          name: 'cancelledAppointments',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Cancelled appointments in this series',
          },
        },
        {
          name: 'noShowCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'No-show appointments',
          },
        },
      ],
    },
  ],
  timestamps: true,
};

// Helper function to calculate next occurrence
function calculateNextOccurrence(startDate: string, pattern: any): string {
  const start = new Date(startDate);
  const now = new Date();

  // Simple calculation - in production, you'd use a proper RRULE library
  if (pattern.frequency === 'weekly') {
    const daysOfWeek = pattern.daysOfWeek || [];
    if (daysOfWeek.length > 0) {
      // Find next occurrence of any specified day
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDays = daysOfWeek.map((day: string) => dayNames.indexOf(day.toLowerCase()));

      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(start);
        checkDate.setDate(start.getDate() + i);

        if (checkDate >= now && targetDays.includes(checkDate.getDay())) {
          return checkDate.toISOString().split('T')[0];
        }
      }
    }
  }

  // Default to next week if no pattern matches
  const nextWeek = new Date(start);
  nextWeek.setDate(start.getDate() + 7);
  return nextWeek.toISOString().split('T')[0];
}
