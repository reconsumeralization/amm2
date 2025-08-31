import { CollectionConfig } from 'payload';

export const Locations: CollectionConfig = {
  slug: 'locations',
  labels: {
    singular: 'Location',
    plural: 'Locations',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Commerce',
    description: 'Manage business locations and branches',
    defaultColumns: ['name', 'address', 'timezone', 'active'],
    listSearchableFields: ['name', 'address.street', 'address.city', 'phone'],
  },
  access: {
    read: ({ req }): any => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if (['manager', 'barber'].includes((req.user as any)?.role)) {
        return { tenant: { equals: (req.user as any)?.tenant?.id } };
      }
      // Customers can read locations for their tenant
      return { tenant: { equals: (req.user as any)?.tenant?.id } };
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
      // Prevent deletion if location has active resources or appointments
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

        // Validate timezone
        if (data.timezone) {
          const validTimezones = [
            'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
            'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney'
          ];
          if (!validTimezones.includes(data.timezone)) {
            throw new Error('Invalid timezone selected');
          }
        }

        return data;
      },
    ],
    beforeChange: [
      async ({ data, operation, req }) => {
        if (!data) return data;

        if (operation === 'create') {
          console.log(`Creating new location: ${data.name}`);
        }

        if (operation === 'update') {
          console.log(`Updating location: ${data.name}`);
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`Location created: ${doc.name} (${doc.id})`);
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        if (req.payload) {
          // Check for active resources at this location
          const activeResources = await req.payload.find({
            collection: 'resources' as any as any,
            where: {
              location: { equals: id },
              active: { equals: true }
            }
          });

          if (activeResources.totalDocs > 0) {
            throw new Error(`Cannot delete location with ${activeResources.totalDocs} active resources. Please deactivate all resources first.`);
          }

          // Check for upcoming appointments at this location
          const upcomingAppointments = await req.payload.find({
            collection: 'appointments' as any as any,
            where: {
              tenant: { equals: req.user?.tenant?.id },
              date: { greater_than: new Date().toISOString() },
              status: { in: ['pending', 'confirmed'] }
            }
          });

          if (upcomingAppointments.totalDocs > 0) {
            throw new Error(`Cannot delete location with ${upcomingAppointments.totalDocs} upcoming appointments. Please reschedule or cancel all appointments first.`);
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
      unique: true,
      admin: {
        description: 'Display name for this location',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier',
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.name && !data?.slug) {
              data.slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            }
          },
        ],
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      index: true,
      admin: {
        description: 'Business this location belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      admin: {
        description: 'Is this location currently active?',
      },
    },
    {
      name: 'timezone',
      type: 'select',
      required: true,
      defaultValue: 'America/New_York',
      options: [
        { label: 'Eastern Time', value: 'America/New_York' },
        { label: 'Central Time', value: 'America/Chicago' },
        { label: 'Mountain Time', value: 'America/Denver' },
        { label: 'Pacific Time', value: 'America/Los_Angeles' },
        { label: 'London', value: 'Europe/London' },
        { label: 'Paris', value: 'Europe/Paris' },
        { label: 'Tokyo', value: 'Asia/Tokyo' },
        { label: 'Sydney', value: 'Australia/Sydney' },
      ],
      admin: {
        description: 'Timezone for this location',
      },
    },
    {
      name: 'address',
      type: 'group',
      required: true,
      fields: [
        {
          name: 'street',
          type: 'text',
          required: true,
          admin: {
            description: 'Street address',
          },
        },
        {
          name: 'city',
          type: 'text',
          required: true,
          admin: {
            description: 'City',
          },
        },
        {
          name: 'state',
          type: 'text',
          required: true,
          admin: {
            description: 'State/Province',
          },
        },
        {
          name: 'zipCode',
          type: 'text',
          required: true,
          admin: {
            description: 'ZIP/Postal Code',
          },
        },
        {
          name: 'country',
          type: 'text',
          required: true,
          defaultValue: 'United States',
          admin: {
            description: 'Country',
          },
        },
      ],
      admin: {
        description: 'Physical address of this location',
      },
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        {
          name: 'phone',
          type: 'text',
          admin: {
            description: 'Primary phone number',
          },
        },
        {
          name: 'email',
          type: 'email',
          admin: {
            description: 'Contact email for this location',
          },
        },
        {
          name: 'manager',
          type: 'relationship',
          relationTo: 'users' as any as any,
          filterOptions: ({ data }): any => {
            if (!data?.tenant) return false;
            return {
              role: { in: ['admin', 'manager'] },
              tenant: { equals: data.tenant },
              isActive: { equals: true }
            };
          },
          admin: {
            description: 'Location manager',
          },
        },
      ],
      admin: {
        description: 'Contact information for this location',
      },
    },
    {
      name: 'openingHours',
      type: 'group',
      fields: [
        {
          name: 'days',
          type: 'array',
          required: true,
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
              name: 'openTime',
              type: 'text',
              required: true,
              defaultValue: '9:00 AM',
              admin: {
                description: 'Opening time (e.g., 9:00 AM)',
              },
            },
            {
              name: 'closeTime',
              type: 'text',
              required: true,
              defaultValue: '5:00 PM',
              admin: {
                description: 'Closing time (e.g., 5:00 PM)',
              },
            },
            {
              name: 'isOpen',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Is the location open on this day?',
              },
            },
          ],
        },
        {
          name: 'holidays',
          type: 'array',
          admin: {
            description: 'Special dates when this location is closed',
          },
          fields: [
            {
              name: 'date',
              type: 'date',
              required: true,
            },
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: {
                description: 'Holiday name (e.g., Christmas Day)',
              },
            },
            {
              name: 'recurring',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Does this holiday repeat annually?',
              },
            },
          ],
        },
        {
          name: 'specialHours',
          type: 'array',
          admin: {
            description: 'Special hours for specific dates',
          },
          fields: [
            {
              name: 'date',
              type: 'date',
              required: true,
            },
            {
              name: 'openTime',
              type: 'text',
              admin: {
                description: 'Special opening time',
              },
            },
            {
              name: 'closeTime',
              type: 'text',
              admin: {
                description: 'Special closing time',
              },
            },
            {
              name: 'isClosed',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Is the location closed on this date?',
              },
            },
            {
              name: 'reason',
              type: 'text',
              admin: {
                description: 'Reason for special hours',
              },
            },
          ],
        },
      ],
      admin: {
        description: 'Operating hours and special schedules',
      },
    },
    {
      name: 'capacity',
      type: 'group',
      fields: [
        {
          name: 'maxDailyAppointments',
          type: 'number',
          min: 1,
          max: 100,
          admin: {
            description: 'Maximum appointments per day',
          },
        },
        {
          name: 'maxConcurrentServices',
          type: 'number',
          min: 1,
          max: 20,
          admin: {
            description: 'Maximum services that can run concurrently',
          },
        },
        {
          name: 'bufferTime',
          type: 'number',
          min: 0,
          max: 120,
          defaultValue: 15,
          admin: {
            description: 'Buffer time between appointments (minutes)',
          },
        },
      ],
      admin: {
        description: 'Capacity and scheduling limits',
      },
    },
    {
      name: 'facilities',
      type: 'group',
      fields: [
        {
          name: 'parking',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Parking available?',
          },
        },
        {
          name: 'wifi',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'WiFi available?',
          },
        },
        {
          name: 'waitingArea',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Waiting area available?',
          },
        },
        {
          name: 'restrooms',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Restrooms available?',
          },
        },
        {
          name: 'accessibility',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Wheelchair accessible?',
          },
        },
      ],
      admin: {
        description: 'Available facilities and amenities',
      },
    },
    {
      name: 'images',
      type: 'array',
      admin: {
        description: 'Location photos and images',
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
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Featured image for this location',
          },
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Internal notes about this location',
        rows: 3,
      },
    },
  ],
  timestamps: true,
};
