import { CollectionConfig } from 'payload';

export const TimeOffRequests: CollectionConfig = {
  slug: 'time-off-requests',
  labels: {
    singular: 'Time Off Request',
    plural: 'Time Off Requests',
  },
  admin: {
    useAsTitle: 'id',
    group: 'Staff',
    description: 'Manage employee time off requests and approvals',
    defaultColumns: ['employee', 'startDate', 'endDate', 'type', 'status', 'approvedBy'],
    listSearchableFields: ['employee.name', 'employee.email', 'type', 'notes'],
  },
  access: {
    read: ({ req }): any => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      if (req.user.role === 'manager') {
        return { tenant: { equals: req.user.tenant?.id } };
      }
      // Employees can only read their own requests
      return {
        tenant: { equals: req.user.tenant?.id },
        employee: { equals: req.user.id }
      };
    },
    create: ({ req }): boolean => {
      if (!req.user) return false;
      return ['admin', 'manager', 'barber'].includes(req.user.role);
    },
    update: ({ req }): any => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      if (req.user.role === 'manager') {
        return { tenant: { equals: req.user.tenant?.id } };
      }
      // Employees can update their own pending requests
      return {
        tenant: { equals: req.user.tenant?.id },
        employee: { equals: req.user.id },
        status: { equals: 'pending' }
      };
    },
    delete: ({ req }): any => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      // Prevent deletion of approved requests
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

        // Auto-assign employee for staff requests
        if (operation === 'create' && !data.employee && req.user && ['barber', 'manager'].includes(req.user.role)) {
          data.employee = req.user.id;
        }

        // Set submitted timestamp if not provided
        if (operation === 'create' && !data.submittedAt) {
          data.submittedAt = new Date().toISOString();
        }

        // Validate date range
        if (data.startDate && data.endDate && data.startDate > data.endDate) {
            throw new Error('Start date must be before or equal to end date');
        }

        // Validate dates are not in the past
        if (data.startDate && new Date(data.startDate) < new Date()) {
            throw new Error('Cannot request time off for past dates');
        }

        return data;
      },
    ],
    beforeChange: [
      async ({ data, operation, req }) => {
        if (!data) return data;

        if (operation === 'create') {
          console.log(`Creating time off request for employee`);

          // Calculate business days
          if (data.startDate && data.endDate) {
            data.businessDays = calculateBusinessDays(data.startDate, data.endDate);
          }
        }

        if (operation === 'update' && data.status === 'approved' && !data.approvedAt) {
          data.approvedAt = new Date().toISOString();
          if (req.user) {
            data.approvedBy = req.user.id;
          }
        }

        if (operation === 'update' && data.status === 'rejected' && !data.rejectedAt) {
          data.rejectedAt = new Date().toISOString();
          if (req.user) {
            data.rejectedBy = req.user.id;
          }
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req, previousDoc }) => {
        if (operation === 'create') {
          console.log(`Time off request created: ${doc.id}`);

          // Send notification to managers about new request
          try {
            const { emailService } = await import('@/lib/email-service');
            const payload = req.payload;
            
            // Get employee details
            const employee = await payload.findByID({
              collection: 'users',
              id: doc.employee
            });

            if (employee) {
              // Get all managers/admins in this tenant
              const managers = await payload.find({
                collection: 'users',
                where: {
                  and: [
                    { tenant: { equals: doc.tenant } },
                    { role: { in: ['admin', 'manager'] } },
                    { isActive: { equals: true } }
                  ]
                }
              });

              // Send notification to each manager
              for (const manager of managers.docs) {
                if (manager.email) {
                  await emailService.sendEmail({
                    to: manager.email,
                    subject: `New Time Off Request - ${employee.name || employee.email}`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #ffc107;">New Time Off Request</h2>
                        <p>Hi ${manager.name || manager.email},</p>
                        <p>A new time off request has been submitted and requires your attention.</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                          <h3>Request Details:</h3>
                          <p><strong>Employee:</strong> ${employee.name || employee.email}</p>
                          <p><strong>Type:</strong> ${doc.type?.replace('_', ' ')}</p>
                          <p><strong>Dates:</strong> ${new Date(doc.startDate).toLocaleDateString()} - ${new Date(doc.endDate).toLocaleDateString()}</p>
                          <p><strong>Business Days:</strong> ${doc.businessDays || 'N/A'}</p>
                          ${doc.notes ? `<p><strong>Notes:</strong> ${doc.notes}</p>` : ''}
                          ${doc.emergency ? '<p style="color: #dc3545;"><strong>⚠️ Emergency Request</strong></p>' : ''}
                        </div>
                        
                        <p>Please review and approve/reject this request in the admin panel.</p>
                        <p>Best regards,<br>ModernMen System</p>
                      </div>
                    `,
                    text: `New time off request from ${employee.name || employee.email} (${doc.type?.replace('_', ' ')}) for ${new Date(doc.startDate).toLocaleDateString()} - ${new Date(doc.endDate).toLocaleDateString()}. ${doc.businessDays || 'N/A'} business days. ${doc.notes ? 'Notes: ' + doc.notes : ''}`
                  });
                }
              }

              console.log(`Sent time off request notifications to ${managers.totalDocs} managers`);
            }

            // Check for scheduling conflicts
            const conflictingAppointments = await payload.find({
              collection: 'appointments',
              where: {
                and: [
                  { barber: { equals: doc.employee } },
                  { date: { greater_than_equal: doc.startDate } },
                  { date: { less_than_equal: doc.endDate } },
                  { status: { in: ['confirmed', 'pending'] } }
                ]
              }
            });

            if (conflictingAppointments.totalDocs > 0) {
              // Update the time off request with conflict information
              await payload.update({
                collection: 'time-off-requests',
                id: doc.id,
                data: {
                  impact: {
                    ...doc.impact,
                    conflictingAppointments: conflictingAppointments.totalDocs
                  }
                }
              });

              console.log(`Found ${conflictingAppointments.totalDocs} conflicting appointments for time off request ${doc.id}`);
            }

          } catch (error) {
            console.error('Error handling new time off request:', error);
          }
        }

        if (operation === 'update' && doc.status === 'approved' && previousDoc?.status !== 'approved') {
          console.log(`Time off request approved: ${doc.id}`);

          try {
            const { emailService } = await import('@/lib/email-service');
            const payload = req.payload;
            
            // Get employee details
            const employee = await payload.findByID({
              collection: 'users',
              id: doc.employee
            });

            if (employee) {
              // Send confirmation email to employee
              if (employee.email) {
                await emailService.sendEmail({
                  to: employee.email,
                  subject: 'Time Off Request Approved - ModernMen',
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #28a745;">Time Off Request Approved</h2>
                      <p>Hi ${employee.name || employee.email},</p>
                      <p>Great news! Your time off request has been approved.</p>
                      
                      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3>Approved Time Off:</h3>
                        <p><strong>Type:</strong> ${doc.type?.replace('_', ' ')}</p>
                        <p><strong>Dates:</strong> ${new Date(doc.startDate).toLocaleDateString()} - ${new Date(doc.endDate).toLocaleDateString()}</p>
                        <p><strong>Business Days:</strong> ${doc.businessDays || 'N/A'}</p>
                        ${doc.partialDay ? `<p><strong>Partial Day:</strong> ${doc.partialDayDetails?.startTime} - ${doc.partialDayDetails?.endTime}</p>` : ''}
                      </div>
                      
                      <p>Please make sure to coordinate with your team for any coverage needed during your absence.</p>
                      <p>Enjoy your time off!</p>
                      <p>Best regards,<br>The ModernMen Team</p>
                    </div>
                  `,
                  text: `Your time off request has been approved for ${new Date(doc.startDate).toLocaleDateString()} - ${new Date(doc.endDate).toLocaleDateString()} (${doc.businessDays || 'N/A'} business days). Please coordinate with your team for coverage.`
                });
              }

              // Update employee availability - create unavailable periods
              try {
                const currentDate = new Date(doc.startDate);
                const endDate = new Date(doc.endDate);
                
                while (currentDate <= endDate) {
                  // Skip weekends unless it's a full day request
                  const dayOfWeek = currentDate.getDay();
                  if (dayOfWeek !== 0 && dayOfWeek !== 6 || !doc.partialDay) {
                    
                    const availabilityData: any = {
                      employee: doc.employee,
                      date: currentDate.toISOString().split('T')[0],
                      available: false,
                      reason: `Time off: ${doc.type?.replace('_', ' ')}`,
                      timeOffRequestId: doc.id
                    };

                    if (doc.partialDay && doc.partialDayDetails) {
                      availabilityData.partiallyAvailable = true;
                      availabilityData.unavailableStart = doc.partialDayDetails.startTime;
                      availabilityData.unavailableEnd = doc.partialDayDetails.endTime;
                    }

                    await payload.create({
                      collection: 'staff-availability',
                      data: availabilityData
                    });
                  }
                  currentDate.setDate(currentDate.getDate() + 1);
                }

                console.log(`Updated availability for employee ${doc.employee} from ${doc.startDate} to ${doc.endDate}`);
              } catch (availabilityError) {
                console.error('Error updating employee availability:', availabilityError);
              }

              // Update conflicting appointments - notify customers and attempt rescheduling
              const conflictingAppointments = await payload.find({
                collection: 'appointments',
                where: {
                  and: [
                    { barber: { equals: doc.employee } },
                    { date: { greater_than_equal: doc.startDate } },
                    { date: { less_than_equal: doc.endDate } },
                    { status: { in: ['confirmed', 'pending'] } }
                  ]
                }
              });

              if (conflictingAppointments.totalDocs > 0) {
                const { resourceManagementService } = await import('@/lib/resource-management');
                
                await resourceManagementService.handleDeactivatedResource(
                  'staff',
                  doc.employee,
                  `Staff member on approved time off (${doc.type?.replace('_', ' ')})`
                );

                console.log(`Handled ${conflictingAppointments.totalDocs} conflicting appointments for approved time off`);
              }
            }

          } catch (error) {
            console.error('Error handling approved time off request:', error);
          }
        }

        if (operation === 'update' && doc.status === 'rejected' && previousDoc?.status !== 'rejected') {
          console.log(`Time off request rejected: ${doc.id}`);

          try {
            const { emailService } = await import('@/lib/email-service');
            const payload = req.payload;
            
            // Get employee details
            const employee = await payload.findByID({
              collection: 'users',
              id: doc.employee
            });

            // Get approver details
            const approver = doc.rejectedBy ? await payload.findByID({
              collection: 'users',
              id: doc.rejectedBy
            }) : null;

            if (employee && employee.email) {
              // Send rejection notification to employee
              await emailService.sendEmail({
                to: employee.email,
                subject: 'Time Off Request Rejected - ModernMen',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc3545;">Time Off Request Rejected</h2>
                    <p>Hi ${employee.name || employee.email},</p>
                    <p>Unfortunately, your time off request has been rejected.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                      <h3>Request Details:</h3>
                      <p><strong>Type:</strong> ${doc.type?.replace('_', ' ')}</p>
                      <p><strong>Dates:</strong> ${new Date(doc.startDate).toLocaleDateString()} - ${new Date(doc.endDate).toLocaleDateString()}</p>
                      <p><strong>Business Days:</strong> ${doc.businessDays || 'N/A'}</p>
                      ${doc.rejectionReason ? `<p><strong>Reason for Rejection:</strong> ${doc.rejectionReason}</p>` : ''}
                      ${approver ? `<p><strong>Rejected by:</strong> ${approver.name || approver.email}</p>` : ''}
                    </div>
                    
                    <p>If you have questions about this decision or would like to discuss alternative dates, please speak with your manager.</p>
                    <p>Best regards,<br>The ModernMen Team</p>
                  </div>
                `,
                text: `Your time off request for ${new Date(doc.startDate).toLocaleDateString()} - ${new Date(doc.endDate).toLocaleDateString()} has been rejected. ${doc.rejectionReason ? 'Reason: ' + doc.rejectionReason : ''} Please speak with your manager if you have questions.`
              });

              console.log(`Sent rejection notification to employee: ${employee.email}`);
            }

          } catch (error) {
            console.error('Error handling rejected time off request:', error);
          }
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        if (req.payload) {
          // Check if request is approved and in the future
          const request = await req.payload.findByID({
            collection: 'time-off-requests',
            id
          });

          if (request?.status === 'approved') {
            const endDate = new Date(request.endDate);
            if (endDate > new Date()) {
              throw new Error('Cannot delete approved future time off requests. Please cancel instead.');
            }
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
        description: 'Business this time off request belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'employee',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      filterOptions: ({ data }): any => {
        if (!data?.tenant) return false;
        return {
          tenant: { equals: data.tenant },
          role: { in: ['barber', 'manager'] },
          isActive: { equals: true }
        };
      },
      admin: {
        description: 'Employee requesting time off',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Vacation', value: 'vacation' },
        { label: 'Sick Leave', value: 'sick_leave' },
        { label: 'Personal Day', value: 'personal_day' },
        { label: 'Family Emergency', value: 'family_emergency' },
        { label: 'Medical Appointment', value: 'medical_appointment' },
        { label: 'Professional Development', value: 'professional_development' },
        { label: 'Maternity/Paternity', value: 'maternity_paternity' },
        { label: 'Bereavement', value: 'bereavement' },
        { label: 'Jury Duty', value: 'jury_duty' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Type of time off requested',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        description: 'First day of time off',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
      admin: {
        description: 'Last day of time off',
      },
    },
    {
      name: 'businessDays',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Number of business days requested',
        position: 'sidebar',
      },
    },
    {
      name: 'partialDay',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Is this a partial day request?',
      },
    },
    {
      name: 'partialDayDetails',
      type: 'group',
      admin: {
        description: 'Partial day schedule details',
        condition: (data) => data.partialDay,
      },
      fields: [
        {
          name: 'startTime',
          type: 'text',
          admin: {
            description: 'Start time (HH:MM)',
          },
        },
        {
          name: 'endTime',
          type: 'text',
          admin: {
            description: 'End time (HH:MM)',
          },
        },
        {
          name: 'hoursRequested',
          type: 'number',
          min: 0.5,
          max: 8,
          admin: {
            description: 'Number of hours requested',
            step: 0.5,
          },
        },
      ],
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
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        description: 'Current status of the time off request',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      required: true,
      admin: {
        description: 'When the request was submitted',
      },
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Manager who approved this request',
        condition: (data) => data.status === 'approved',
      },
    },
    {
      name: 'approvedAt',
      type: 'date',
      admin: {
        description: 'When the request was approved',
        condition: (data) => data.status === 'approved',
      },
    },
    {
      name: 'rejectedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Manager who rejected this request',
        condition: (data) => data.status === 'rejected',
      },
    },
    {
      name: 'rejectedAt',
      type: 'date',
      admin: {
        description: 'When the request was rejected',
        condition: (data) => data.status === 'rejected',
      },
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
      maxLength: 500,
      admin: {
        description: 'Reason for rejection',
        condition: (data) => data.status === 'rejected',
        rows: 3,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Additional notes or justification for the request',
        rows: 3,
      },
    },
    {
      name: 'emergency',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Is this an emergency time off request?',
      },
    },
    {
      name: 'attachments',
      type: 'array',
      admin: {
        description: 'Supporting documents (doctor notes, etc.)',
      },
      fields: [
        {
          name: 'document',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          admin: {
            description: 'Description of this document',
          },
        },
      ],
    },
    {
      name: 'impact',
      type: 'group',
      admin: {
        description: 'Scheduling impact assessment',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'conflictingAppointments',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Number of appointments that would be affected',
          },
        },
        {
          name: 'alternativeStaff',
          type: 'relationship',
          relationTo: 'users',
          hasMany: true,
          admin: {
            description: 'Alternative staff who could cover',
          },
        },
        {
          name: 'coverageNotes',
          type: 'textarea',
          maxLength: 500,
          admin: {
            description: 'Notes about coverage arrangements',
            rows: 2,
          },
        },
      ],
    },
  ],
  timestamps: true,
};

// Helper function to calculate business days between two dates
function calculateBusinessDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let businessDays = 0;

  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    // Monday = 1, Tuesday = 2, ..., Friday = 5, Saturday = 6, Sunday = 0
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
}
