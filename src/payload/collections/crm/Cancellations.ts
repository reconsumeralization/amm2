import { CollectionConfig } from 'payload';

export const Cancellations: CollectionConfig = {
  slug: 'cancellations',
  labels: {
    singular: 'Cancellation',
    plural: 'Cancellations',
  },
  admin: {
    useAsTitle: 'id',
    group: 'Bookings',
    description: 'Track appointment cancellations and their resolutions',
    defaultColumns: ['appointment', 'requestedBy', 'reason', 'requestedAt', 'status'],
    listSearchableFields: ['appointment.bookingNumber', 'reason', 'requestedBy.email'],
  },
  access: {
    read: ({ req }): any => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      if (['manager', 'barber'].includes(req.user.role)) {
        return { tenant: { equals: req.user.tenant?.id } };
      }
      // Customers can only read their own cancellations
      return {
        tenant: { equals: req.user.tenant?.id },
        requestedBy: { equals: req.user.id }
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
      // Users can only update their own cancellations
      return {
        tenant: { equals: req.user.tenant?.id },
        requestedBy: { equals: req.user.id }
      };
    },
    delete: ({ req }): any => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      // Prevent deletion of processed cancellations for audit purposes
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

        // Auto-assign requestedBy for customer cancellations
        if (operation === 'create' && !data.requestedBy && req.user) {
          data.requestedBy = req.user.id;
        }

        // Set requested timestamp if not provided
        if (operation === 'create' && !data.requestedAt) {
          data.requestedAt = new Date().toISOString();
        }

        return data;
      },
    ],
    beforeChange: [
      async ({ data, operation, req }) => {
        if (!data) return data;

        if (operation === 'create') {
          console.log(`Creating cancellation request for appointment`);

          // Validate that appointment exists and is cancellable
          if (data.appointment && req.payload) {
            const appointment = await req.payload.findByID({
              collection: 'appointments',
              id: data.appointment
            });

            if (!appointment) {
              throw new Error('Appointment not found');
            }

            if (appointment.status === 'completed') {
              throw new Error('Cannot cancel a completed appointment');
            }

            if (appointment.status === 'cancelled') {
              throw new Error('Appointment is already cancelled');
            }

            // Auto-populate cancellation details from appointment
            if (!data.appointmentDetails) {
              data.appointmentDetails = {
                bookingNumber: appointment.bookingNumber,
                customer: appointment.user,
                service: appointment.service,
                appointmentDate: appointment.date,
                price: appointment.price
              };
            }
          }
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`Cancellation request created: ${doc.id}`);

          // TODO: Send notification to staff about cancellation request
          // TODO: Trigger refund process if applicable
        }

        if (operation === 'update' && doc.status === 'approved') {
          console.log(`Cancellation approved: ${doc.id}`);

          // Update the associated appointment status
          if (doc.appointment && req.payload) {
            await req.payload.update({
              collection: 'appointments',
              id: doc.appointment,
              data: {
                status: 'cancelled',
                cancellationReason: doc.reason,
                cancellationNotes: doc.notes,
                updatedAt: new Date().toISOString()
              }
            });
          }
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
        description: 'Business this cancellation belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'appointment',
      type: 'relationship',
      relationTo: 'appointments',
      required: true,
      index: true,
      filterOptions: ({ data }): any => {
        if (!data?.tenant) return false;
        return {
          tenant: { equals: data.tenant },
          status: { not_in: ['completed', 'cancelled'] }
        };
      },
      admin: {
        description: 'Appointment being cancelled',
      },
    },
    {
      name: 'appointmentDetails',
      type: 'group',
      admin: {
        description: 'Appointment details at time of cancellation',
        readOnly: true,
      },
      fields: [
        {
          name: 'bookingNumber',
          type: 'text',
          admin: {
            description: 'Original booking number',
          },
        },
        {
          name: 'customer',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'Customer who booked the appointment',
          },
        },
        {
          name: 'service',
          type: 'relationship',
          relationTo: 'services',
          admin: {
            description: 'Service that was booked',
          },
        },
        {
          name: 'appointmentDate',
          type: 'date',
          admin: {
            description: 'Original appointment date and time',
          },
        },
        {
          name: 'price',
          type: 'number',
          admin: {
            description: 'Appointment price in cents',
          },
        },
      ],
    },
    {
      name: 'requestedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        description: 'Who requested this cancellation',
      },
    },
    {
      name: 'requestedAt',
      type: 'date',
      required: true,
      admin: {
        description: 'When the cancellation was requested',
      },
    },
    {
      name: 'reason',
      type: 'select',
      required: true,
      options: [
        { label: 'Customer Request', value: 'customer_request' },
        { label: 'Emergency', value: 'emergency' },
        { label: 'Illness', value: 'illness' },
        { label: 'Schedule Conflict', value: 'schedule_conflict' },
        { label: 'Weather', value: 'weather' },
        { label: 'Transportation Issues', value: 'transportation' },
        { label: 'Staff Unavailable', value: 'staff_unavailable' },
        { label: 'Equipment Issues', value: 'equipment_issues' },
        { label: 'Business Closure', value: 'business_closure' },
        { label: 'Double Booking', value: 'double_booking' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Reason for the cancellation',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Additional details about the cancellation',
        rows: 3,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Processed', value: 'processed' },
      ],
      admin: {
        description: 'Current status of the cancellation request',
      },
    },
    {
      name: 'processedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Staff member who processed this cancellation',
        condition: (data) => data.status !== 'pending',
      },
    },
    {
      name: 'processedAt',
      type: 'date',
      admin: {
        description: 'When the cancellation was processed',
        condition: (data) => data.status !== 'pending',
      },
    },
    {
      name: 'refund',
      type: 'group',
      admin: {
        description: 'Refund information if applicable',
        condition: (data) => data.status === 'approved' || data.status === 'processed',
      },
      fields: [
        {
          name: 'refundAmount',
          type: 'number',
          min: 0,
          admin: {
            description: 'Refund amount in cents',
          },
        },
        {
          name: 'refundReason',
          type: 'select',
          options: [
            { label: 'Full Refund', value: 'full_refund' },
            { label: 'Partial Refund', value: 'partial_refund' },
            { label: 'No Refund', value: 'no_refund' },
            { label: 'Store Credit', value: 'store_credit' },
          ],
          admin: {
            description: 'Type of refund or credit',
          },
        },
        {
          name: 'refundProcessed',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether the refund has been processed',
          },
        },
        {
          name: 'refundTransaction',
          type: 'relationship',
          relationTo: 'transactions',
          admin: {
            description: 'Associated refund transaction',
          },
        },
      ],
    },
    {
      name: 'followUpRequired',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether follow-up with the customer is required',
      },
    },
    {
      name: 'followUpNotes',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Notes about follow-up actions taken',
        condition: (data) => data.followUpRequired,
        rows: 3,
      },
    },
    {
      name: 'impact',
      type: 'group',
      admin: {
        description: 'Business impact analysis',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'revenueImpact',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Revenue impact in cents',
          },
        },
        {
          name: 'rescheduled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether this was rescheduled rather than cancelled',
          },
        },
        {
          name: 'rescheduledTo',
          type: 'relationship',
          relationTo: 'appointments',
          admin: {
            description: 'New appointment if rescheduled',
            condition: (data) => data.rescheduled,
          },
        },
      ],
    },
  ],
  timestamps: true,
};
