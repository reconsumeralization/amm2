// src/payload/collections/MaintenanceRequests.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const MaintenanceRequests: CollectionConfig = withDefaultHooks({
  slug: 'maintenance-requests',
  admin: {
    useAsTitle: 'title',
    group: 'Operations',
    description: 'Manage maintenance requests and operational tasks',
    defaultColumns: ['title', 'priority', 'status', 'assignedTo', 'dueDate', 'createdAt'],
    listSearchableFields: ['title', 'description', 'requestType'],
  },
  access: {
    read: ({ req }: any) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      if (req.user.role === 'manager') return true;
      // Users can only view their own requests
      return { requestedBy: { equals: req.user.id } };
    },
    create: ({ req }: any) => {
      if (!req.user) return false;
      return ['admin', 'manager', 'user'].includes(req.user.role);
    },
    update: ({ req }: any) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      if (req.user.role === 'manager') return true;
      // Users can only update their own requests
      return { requestedBy: { equals: req.user.id } };
    },
    delete: ({ req }: any) => {
      if (!req.user) return false;
      return req.user.role === 'admin';
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Brief title describing the maintenance request',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Detailed description of the issue or request',
        rows: 4,
      },
    },
    {
      name: 'requestType',
      type: 'select',
      options: [
        { label: 'Equipment Repair', value: 'equipment_repair' },
        { label: 'Facility Maintenance', value: 'facility_maintenance' },
        { label: 'Software Issue', value: 'software_issue' },
        { label: 'Service Update', value: 'service_update' },
        { label: 'Inventory Issue', value: 'inventory_issue' },
        { label: 'Safety Concern', value: 'safety_concern' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
      admin: {
        description: 'Type of maintenance request',
      },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
        { label: 'Emergency', value: 'emergency' },
      ],
      defaultValue: 'medium',
      admin: {
        description: 'Priority level of the request',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'On Hold', value: 'on_hold' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Closed', value: 'closed' },
      ],
      defaultValue: 'open',
      admin: {
        description: 'Current status of the request',
      },
    },
    {
      name: 'requestedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who created this request',
      },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User assigned to handle this request',
        condition: (data: any) => ['admin', 'manager'].includes(data?.assignedTo?.role),
      },
    },
    {
      name: 'dueDate',
      type: 'date',
      admin: {
        description: 'Target completion date',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        description: 'When the request was completed',
        readOnly: true,
      },
    },
    {
      name: 'estimatedHours',
      type: 'number',
      admin: {
        description: 'Estimated hours to complete',
      },
    },
    {
      name: 'actualHours',
      type: 'number',
      admin: {
        description: 'Actual hours spent',
      },
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations',
      admin: {
        description: 'Location where the maintenance is needed',
      },
    },
    {
      name: 'equipment',
      type: 'relationship',
      relationTo: 'resources',
      admin: {
        description: 'Specific equipment that needs maintenance',
        condition: (data: any) => data?.requestType === 'equipment_repair',
      },
    },
    {
      name: 'costEstimate',
      type: 'number',
      admin: {
        description: 'Estimated cost in cents',
      },
    },
    {
      name: 'actualCost',
      type: 'number',
      admin: {
        description: 'Actual cost incurred in cents',
      },
    },
    {
      name: 'partsUsed',
      type: 'array',
      admin: {
        description: 'Parts or materials used',
      },
      fields: [
        {
          name: 'part',
          type: 'text',
          required: true,
          admin: {
            description: 'Part name or description',
          },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          admin: {
            description: 'Quantity used',
          },
        },
        {
          name: 'cost',
          type: 'number',
          admin: {
            description: 'Cost of this part in cents',
          },
        },
      ],
    },
    {
      name: 'photos',
      type: 'array',
      admin: {
        description: 'Photos of the issue or completed work',
      },
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          admin: {
            description: 'Description of the photo',
          },
        },
        {
          name: 'takenAt',
          type: 'select',
          options: [
            { label: 'Before Work', value: 'before' },
            { label: 'During Work', value: 'during' },
            { label: 'After Work', value: 'after' },
          ],
          required: true,
        },
      ],
    },
    {
      name: 'comments',
      type: 'array',
      admin: {
        description: 'Comments and updates on the request',
        readOnly: true,
      },
      fields: [
        {
          name: 'comment',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Comment text',
          },
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          admin: {
            description: 'Comment author',
          },
        },
        {
          name: 'timestamp',
          type: 'date',
          required: true,
          admin: {
            description: 'When the comment was made',
          },
        },
        {
          name: 'isInternal',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether this is an internal comment',
          },
        },
      ],
    },
    {
      name: 'satisfactionRating',
      type: 'select',
      options: [
        { label: 'Very Dissatisfied', value: '1' },
        { label: 'Dissatisfied', value: '2' },
        { label: 'Neutral', value: '3' },
        { label: 'Satisfied', value: '4' },
        { label: 'Very Satisfied', value: '5' },
      ],
      admin: {
        description: 'Customer satisfaction rating',
        condition: (data: any) => data?.status === 'completed',
      },
    },
    {
      name: 'recurring',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this is a recurring maintenance task',
      },
    },
    {
      name: 'recurrence',
      type: 'group',
      admin: {
        description: 'Recurrence settings',
        condition: (data: any) => data?.recurring === true,
      },
      fields: [
        {
          name: 'frequency',
          type: 'select',
          options: [
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Quarterly', value: 'quarterly' },
            { label: 'Yearly', value: 'yearly' },
          ],
          required: true,
          admin: {
            description: 'How often this maintenance should recur',
          },
        },
        {
          name: 'nextDueDate',
          type: 'date',
          admin: {
            description: 'Next scheduled maintenance date',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'The tenant this maintenance request belongs to',
        condition: (data: any, siblingData: any, { user }: any) => user?.role === 'admin',
      },
      hooks: {
        beforeChange: [
          ({ req, value }: any) => {
            if (!value && req.user && req.user.role !== 'admin') {
              return req.user.tenant?.id;
            }
            return value;
          },
        ],
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req }: any) => {
        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user && req.user.role !== 'admin') {
          data.tenant = req.user.tenant?.id;
        }

        // Auto-set requested by
        if (operation === 'create' && req.user && !data.requestedBy) {
          data.requestedBy = req.user.id;
        }

        // Set completed timestamp
        if (data.status === 'completed' && !data.completedAt) {
          data.completedAt = new Date().toISOString();
        }

        // Calculate next due date for recurring tasks
        if (data.recurring && data.recurrence) {
          const now = new Date();
          const nextDate = new Date(now);

          switch (data.recurrence.frequency) {
            case 'daily':
              nextDate.setDate(now.getDate() + 1);
              break;
            case 'weekly':
              nextDate.setDate(now.getDate() + 7);
              break;
            case 'monthly':
              nextDate.setMonth(now.getMonth() + 1);
              break;
            case 'quarterly':
              nextDate.setMonth(now.getMonth() + 3);
              break;
            case 'yearly':
              nextDate.setFullYear(now.getFullYear() + 1);
              break;
          }

          data.recurrence.nextDueDate = nextDate.toISOString();
        }

        return data;
      },
    ],
    afterChange: [
      ({ doc, operation, req }: any) => {
        if (operation === 'update') {
          if (doc.status === 'completed') {
            console.log(`Maintenance request "${doc.title}" has been completed`);
          }
          if (doc.status === 'in_progress' && doc.assignedTo) {
            console.log(`Maintenance request "${doc.title}" assigned to ${doc.assignedTo.name}`);
          }
        }
      },
    ],
  },
  timestamps: true,
});
