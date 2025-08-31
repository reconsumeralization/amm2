import { CollectionConfig } from 'payload';

export const Resources: CollectionConfig = {
  slug: 'resources',
  labels: {
    singular: 'Resource',
    plural: 'Resources',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Commerce',
    description: 'Manage bookable resources (chairs, rooms, equipment)',
    defaultColumns: ['name', 'type', 'location', 'capacity', 'bookable', 'active'],
    listSearchableFields: ['name', 'type', 'location.name'],
  },
  access: {
    read: ({ req }): any => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if (['manager', 'barber'].includes((req.user as any)?.role)) {
        return { tenant: { equals: (req.user as any)?.tenant?.id } };
      }
      // Customers can read resources for their tenant (for booking purposes)
      return {
        tenant: { equals: (req.user as any)?.tenant?.id },
        active: { equals: true },
        bookable: { equals: true }
      };
    },
    create: ({ req }): boolean => {
      if (!req.user) return false;
      return ['admin', 'manager'].includes((req.user as any)?.role);
    },
    update: ({ req }): any => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') {
        return { tenant: { equals: (req.user as any)?.tenant?.id } };
      }
      return false;
    },
    delete: ({ req }): any => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      // Prevent deletion if resource has upcoming bookings
      return false;
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (!data) return data;

        // Auto-assign tenant for non-admin users
        if (operation === 'create' && !data.tenant && req.user && (req.user as any)?.role !== 'admin') {
          data.tenant = (req.user as any)?.tenant?.id;
        }

        // Validate capacity based on type
        if (data.type && data.capacity) {
          const capacityLimits = {
            chair: { min: 1, max: 1 },
            room: { min: 1, max: 50 },
            equipment: { min: 1, max: 10 },
            station: { min: 1, max: 5 }
          };

          const limits = capacityLimits[data.type as keyof typeof capacityLimits];
          if (limits && (data.capacity < limits.min || data.capacity > limits.max)) {
            throw new Error(`Capacity for ${data.type} must be between ${limits.min} and ${limits.max}`);
          }
        }

        return data;
      },
    ],
    beforeChange: [
      async ({ data, operation, req }) => {
        if (!data) return data;

        if (operation === 'create') {
          console.log(`Creating new resource: ${data.name} (${data.type})`);
        }

        if (operation === 'update') {
          console.log(`Updating resource: ${data.name}`);
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`Resource created: ${doc.name} (${doc.id})`);
        }

        if (operation === 'update' && doc.active === false) {
          console.log(`Resource deactivated: ${doc.name}`);
          
          // Handle existing appointments for deactivated resources
          try {
            const { resourceManagementService } = await import('@/lib/resource-management');
            
            // Determine resource type for handling
            let resourceType: 'staff' | 'room' | 'equipment' = 'equipment';
            if (doc.type === 'chair' || doc.type === 'station') {
              resourceType = 'staff'; // Treat chairs/stations as staff resources
            } else if (doc.type === 'room') {
              resourceType = 'room';
            } else if (doc.type === 'equipment') {
              resourceType = 'equipment';
            }
            
            await resourceManagementService.handleDeactivatedResource(
              resourceType,
              doc.id,
              `Resource "${doc.name}" has been deactivated`
            );
            
            console.log(`Successfully handled appointments for deactivated resource: ${doc.name}`);
          } catch (error) {
            console.error('Error handling appointments for deactivated resource:', error);
          }
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        if (req.payload) {
          // Check for upcoming appointments using this resource
          const upcomingAppointments = await req.payload.find({
            collection: 'appointments' as any as any,
            where: {
              resource: { equals: id },
              date: { greater_than: new Date().toISOString() },
              status: { in: ['pending', 'confirmed'] }
            }
          });

          if (upcomingAppointments.totalDocs > 0) {
            throw new Error(`Cannot delete resource with ${upcomingAppointments.totalDocs} upcoming appointments. Please reschedule or cancel all appointments first.`);
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name for this resource',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      index: true,
      admin: {
        description: 'Business this resource belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations' as any as any,
      required: true,
      index: true,
      filterOptions: ({ data }): any => {
        if (!data?.tenant) return false;
        return {
          tenant: { equals: data.tenant },
          active: { equals: true }
        };
      },
      admin: {
        description: 'Location where this resource is available',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Chair/Station', value: 'chair' },
        { label: 'Room', value: 'room' },
        { label: 'Equipment', value: 'equipment' },
        { label: 'Service Station', value: 'station' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Type of resource',
      },
    },
    {
      name: 'capacity',
      type: 'number',
      required: true,
      min: 1,
      max: 50,
      defaultValue: 1,
      admin: {
        description: 'Maximum number of people/services this resource can handle simultaneously',
        step: 1,
      },
    },
    {
      name: 'bookable',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      admin: {
        description: 'Can this resource be booked for appointments?',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      admin: {
        description: 'Is this resource currently active and available?',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 500,
      admin: {
        description: 'Detailed description of this resource',
        rows: 3,
      },
    },
    {
      name: 'specifications',
      type: 'group',
      fields: [
        {
          name: 'brand',
          type: 'text',
          admin: {
            description: 'Brand/manufacturer',
          },
        },
        {
          name: 'model',
          type: 'text',
          admin: {
            description: 'Model number or name',
          },
        },
        {
          name: 'serialNumber',
          type: 'text',
          admin: {
            description: 'Serial number for tracking',
          },
        },
        {
          name: 'purchaseDate',
          type: 'date',
          admin: {
            description: 'When this resource was purchased',
          },
        },
        {
          name: 'warrantyExpiry',
          type: 'date',
          admin: {
            description: 'Warranty expiration date',
          },
        },
        {
          name: 'maintenanceSchedule',
          type: 'select',
          options: [
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Quarterly', value: 'quarterly' },
            { label: 'Annually', value: 'annually' },
            { label: 'As needed', value: 'as_needed' },
          ],
          admin: {
            description: 'How often this resource needs maintenance',
          },
        },
      ],
      admin: {
        description: 'Technical specifications and maintenance info',
      },
    },
    {
      name: 'availability',
      type: 'group',
      fields: [
        {
          name: 'operatingHours',
          type: 'group',
          fields: [
            {
              name: 'startTime',
              type: 'text',
              defaultValue: '9:00 AM',
              admin: {
                description: 'Default start time for this resource',
              },
            },
            {
              name: 'endTime',
              type: 'text',
              defaultValue: '5:00 PM',
              admin: {
                description: 'Default end time for this resource',
              },
            },
          ],
          admin: {
            description: 'Default operating hours for this resource',
          },
        },
        {
          name: 'blockedDates',
          type: 'array',
          admin: {
            description: 'Dates when this resource is unavailable',
          },
          fields: [
            {
              name: 'date',
              type: 'date',
              required: true,
            },
            {
              name: 'reason',
              type: 'text',
              admin: {
                description: 'Reason for unavailability',
              },
            },
            {
              name: 'recurring',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Does this block repeat annually?',
              },
            },
          ],
        },
        {
          name: 'maintenanceWindows',
          type: 'array',
          admin: {
            description: 'Scheduled maintenance windows',
          },
          fields: [
            {
              name: 'startDate',
              type: 'date',
              required: true,
            },
            {
              name: 'endDate',
              type: 'date',
              required: true,
            },
            {
              name: 'description',
              type: 'text',
              admin: {
                description: 'Maintenance description',
              },
            },
          ],
        },
      ],
      admin: {
        description: 'Availability and scheduling constraints',
      },
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'baseRate',
          type: 'number',
          min: 0,
          admin: {
            description: 'Base hourly rate for this resource (in cents)',
            step: 1,
          },
        },
        {
          name: 'overtimeRate',
          type: 'number',
          min: 0,
          admin: {
            description: 'Overtime hourly rate (in cents)',
            step: 1,
          },
        },
        {
          name: 'peakRate',
          type: 'number',
          min: 0,
          admin: {
            description: 'Peak hours rate (in cents)',
            step: 1,
          },
        },
        {
          name: 'peakHours',
          type: 'array',
          admin: {
            description: 'Peak pricing hours',
          },
          fields: [
            {
              name: 'day',
              type: 'select',
              required: true,
              options: [
                { label: 'Monday', value: 'monday' },
                { label: 'Tuesday', value: 'tuesday' },
                { label: 'Wednesday', value: 'wednesday' },
                { label: 'Thursday', value: 'thursday' },
                { label: 'Friday', value: 'friday' },
                { label: 'Saturday', value: 'saturday' },
                { label: 'Sunday', value: 'sunday' },
              ],
            },
            {
              name: 'startTime',
              type: 'text',
              required: true,
              admin: {
                description: 'Peak start time (e.g., 4:00 PM)',
              },
            },
            {
              name: 'endTime',
              type: 'text',
              required: true,
              admin: {
                description: 'Peak end time (e.g., 6:00 PM)',
              },
            },
          ],
        },
      ],
      admin: {
        description: 'Pricing configuration for resource usage',
      },
    },
    {
      name: 'assignedStaff',
      type: 'relationship',
      relationTo: 'users' as any as any,
      hasMany: true,
      filterOptions: ({ data }): any => {
        if (!data?.tenant) return false;
        return {
          role: { in: ['barber', 'manager'] },
          tenant: { equals: data.tenant },
          isActive: { equals: true }
        };
      },
      admin: {
        description: 'Staff members who can use this resource',
      },
    },
    {
      name: 'supportedServices',
      type: 'relationship',
      relationTo: 'services' as any as any,
      hasMany: true,
      filterOptions: ({ data }): any => {
        if (!data?.tenant) return false;
        return {
          tenant: { equals: data.tenant },
          isActive: { equals: true }
        };
      },
      admin: {
        description: 'Services that can be performed using this resource',
      },
    },
    {
      name: 'images',
      type: 'array',
      admin: {
        description: 'Photos of this resource',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media' as any as any,
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          admin: {
            description: 'Alt text for accessibility',
          },
        },
        {
          name: 'caption',
          type: 'text',
          admin: {
            description: 'Image caption',
          },
        },
        {
          name: 'isPrimary',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Primary image for this resource',
          },
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Internal notes about this resource',
        rows: 3,
      },
    },
    {
      name: 'lastMaintenance',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Last maintenance date',
        position: 'sidebar',
      },
    },
    {
      name: 'nextMaintenance',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Next scheduled maintenance',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
};
