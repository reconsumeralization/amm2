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
      const user = req.user as any; // Type assertion for extended user properties
      if (user.role === 'admin') return true;
      if (['manager', 'barber'].includes(user.role)) {
        return { tenant: { equals: user.tenant?.id } };
      }
      // Customers can only read their own recurring appointments
      return {
        tenant: { equals: user.tenant?.id },
        customer: { equals: user.id }
      };
    },
    create: ({ req }): boolean => {
      if (!req.user) return false;
      const user = req.user as any; // Type assertion for extended user properties
      return ['admin', 'manager', 'barber', 'customer'].includes(user.role);
    },
    update: ({ req }): any => {
      if (!req.user) return false;
      const user = req.user as any; // Type assertion for extended user properties
      if (user.role === 'admin') return true;
      if (user.role === 'manager') {
        return { tenant: { equals: user.tenant?.id } };
      }
      // Customers can update their own recurring appointments
      return {
        tenant: { equals: user.tenant?.id },
        customer: { equals: user.id }
      };
    },
    delete: ({ req }): any => {
      if (!req.user) return false;
      const user = req.user as any; // Type assertion for extended user properties
      if (user.role === 'admin') return true;
      // Prevent deletion if there are active future occurrences
      return false;
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (!data) return data;

        // Auto-assign tenant for non-admin users
        if (operation === 'create' && !data.tenant && req.user) {
          const user = req.user as any; // Type assertion for extended user properties
          if (user.role !== 'admin') {
            data.tenant = user.tenant?.id;
          }
        }

        // Auto-assign customer for customer role
        if (operation === 'create' && !data.customer && req.user) {
          const user = req.user as any; // Type assertion for extended user properties
          if (user.role === 'customer') {
            data.customer = user.id;
          }
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

          // Create initial appointment instances based on pattern
          await createRecurringAppointmentInstances(doc, req.payload)
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        if (req.payload) {
          // Check for active future appointments in this series
          const activeAppointments = await req.payload.find({
            collection: 'appointments' as any,
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
      relationTo: 'tenants' as any,
      required: true,
      index: true,
      admin: {
        description: 'Business this recurring appointment belongs to',
        condition: (data, siblingData, { user }) => (user as any)?.role === 'admin',
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users' as any,
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
      relationTo: 'services' as any,
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
      relationTo: 'users' as any,
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
      relationTo: 'locations' as any,
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
      relationTo: 'users' as any,
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

/**
 * Create initial appointment instances for a recurring appointment
 */
async function createRecurringAppointmentInstances(recurringDoc: any, payload: any) {
  try {
    console.log('Creating recurring appointment instances for:', recurringDoc.title);

    const pattern = recurringDoc.pattern;
    const startDate = new Date(recurringDoc.startDate);
    const endDate = recurringDoc.endDate ? new Date(recurringDoc.endDate) : null;
    const maxInstances = 10; // Create up to 10 future appointments initially
    
    const appointments = [];
    let currentDate = new Date(startDate);
    let instanceCount = 0;

    while (instanceCount < maxInstances && (!endDate || currentDate <= endDate)) {
      // Skip past dates
      if (currentDate >= new Date()) {
        const appointmentData = {
          title: `${recurringDoc.title} - ${currentDate.toLocaleDateString()}`,
          user: recurringDoc.customer,
          service: recurringDoc.service,
          barber: recurringDoc.barber,
          date: currentDate.toISOString(),
          time: pattern.timeOfDay,
          duration: pattern.duration,
          status: 'confirmed',
          recurringAppointment: recurringDoc.id,
          tenant: recurringDoc.tenant,
          notes: `Automatically generated from recurring appointment: ${recurringDoc.title}`,
          isRecurring: true,
          createdAt: new Date(),
        };

        appointments.push(appointmentData);
        instanceCount++;
      }

      // Calculate next occurrence based on frequency
      currentDate = calculateNextRecurringDate(currentDate, pattern);
    }

    // Create all appointments in batch
    if (appointments.length > 0) {
      const createdAppointments = [];
      
      for (const appointmentData of appointments) {
        try {
          const created = await payload.create({
            collection: 'appointments' as any,
            data: appointmentData,
          });
          createdAppointments.push(created);
        } catch (error) {
          console.error('Failed to create appointment instance:', error);
          // Continue with other appointments even if one fails
        }
      }

      console.log(`Created ${createdAppointments.length} recurring appointment instances`);

      // Update the recurring appointment with next occurrence
      if (createdAppointments.length > 0) {
        await payload.update({
          collection: 'recurring-appointments' as any,
          id: recurringDoc.id,
          data: {
            nextOccurrence: createdAppointments[0].date,
            lastGenerated: new Date(),
            instancesCreated: createdAppointments.length
          }
        });
      }

      // Send confirmation email to customer if available
      try {
        if (recurringDoc.customer) {
          const customer = await payload.findByID({
            collection: 'users' as any,
            id: recurringDoc.customer,
          });

          if (customer?.email) {
            const { emailService } = await import('@/lib/email-service');
            await emailService.sendEmail({
              to: customer.email,
              subject: 'Recurring Appointments Created - ModernMen',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #28a745;">Recurring Appointments Created</h2>
                  <p>Hi ${customer.name || customer.email},</p>
                  <p>We've successfully set up your recurring appointments for "${recurringDoc.title}".</p>
                  <p><strong>${createdAppointments.length}</strong> appointments have been scheduled starting from ${startDate.toLocaleDateString()}.</p>
                  <p>You can view and manage your appointments through your customer portal or contact us if you need to make any changes.</p>
                  <p>Thank you for choosing ModernMen!</p>
                  <p>Best regards,<br>The ModernMen Team</p>
                </div>
              `,
              text: `Hi ${customer.name || customer.email},\n\nWe've successfully set up your recurring appointments for "${recurringDoc.title}".\n\n${createdAppointments.length} appointments have been scheduled starting from ${startDate.toLocaleDateString()}.\n\nYou can view and manage your appointments through your customer portal.\n\nThank you for choosing ModernMen!\n\nBest regards,\nThe ModernMen Team`
            });
            console.log('Recurring appointments confirmation email sent to:', customer.email);
          }
        }
      } catch (emailError) {
        console.error('Failed to send recurring appointments confirmation email:', emailError);
      }

      return createdAppointments;
    }

    return [];
  } catch (error) {
    console.error('Error creating recurring appointment instances:', error);
    throw error;
  }
}

/**
 * Calculate the next occurrence based on frequency pattern
 */
function calculateNextRecurringDate(currentDate: Date, pattern: any): Date {
  const nextDate = new Date(currentDate);

  switch (pattern.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'custom':
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        // For custom patterns with specific days of week
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDays = pattern.daysOfWeek.map((day: string) => dayNames.indexOf(day.toLowerCase()));
        
        // Find next occurrence of any specified day
        for (let i = 1; i <= 7; i++) {
          const checkDate = new Date(currentDate);
          checkDate.setDate(currentDate.getDate() + i);
          
          if (targetDays.includes(checkDate.getDay())) {
            return checkDate;
          }
        }
      } else {
        // Default to weekly if custom pattern is malformed
        nextDate.setDate(nextDate.getDate() + 7);
      }
      break;
    default:
      nextDate.setDate(nextDate.getDate() + 7); // Default to weekly
  }

  return nextDate;
}
