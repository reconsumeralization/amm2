// src/payload/collections/BuilderPublishQueue.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const PublishQueue: CollectionConfig = withDefaultHooks({
  slug: 'builder-publish-queue',
  admin: {
    useAsTitle: 'itemName',
    group: 'Visual Builder',
    description: 'Queue for pages/blocks to publish - helps manage staging → production workflows',
    defaultColumns: ['itemName', 'itemType', 'status', 'scheduledAt', 'priority', 'createdAt'],
    listSearchableFields: ['itemName', 'description', 'requestedBy'],
  },
  access: {
    read: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true;
      // Users can only view their own publish requests
      return { requestedBy: { equals: req.user.id } };
    },
    create: ({ req }: any) => {
      if (!req.user) return false;
      return ['admin', 'manager', 'editor'].includes((req.user as any)?.role);
    },
    update: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true;
      // Users can only update their own requests
      return { requestedBy: { equals: req.user.id } };
    },
    delete: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      // Users can only delete their own pending requests
      return { requestedBy: { equals: req.user.id } };
    },
  },
  fields: [
    {
      name: 'itemType',
      type: 'select',
      options: [
        { label: 'Page', value: 'page' },
        { label: 'Section', value: 'section' },
        { label: 'Block', value: 'block' },
        { label: 'Template', value: 'template' },
        { label: 'Theme', value: 'theme' },
        { label: 'Global Style', value: 'global-style' },
        { label: 'Reusable Component', value: 'reusable-component' },
      ],
      required: true,
      admin: {
        description: 'Type of item to publish',
      },
    },
    {
      name: 'itemId',
      type: 'text',
      required: true,
      admin: {
        description: 'ID of the item to publish',
      },
    },
    {
      name: 'itemName',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name of the item',
      },
    },
    {
      name: 'itemSlug',
      type: 'text',
      admin: {
        description: 'Slug of the item (for pages)',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Processing', value: 'processing' },
        { label: 'Published', value: 'published' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'pending',
      required: true,
      admin: {
        description: 'Current status in the publish queue',
      },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
      defaultValue: 'normal',
      admin: {
        description: 'Priority level for publishing',
      },
    },
    {
      name: 'scheduledAt',
      type: 'date',
      admin: {
        description: 'When to publish this item',
      },
    },
    {
      name: 'requestedBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      required: true,
      admin: {
        description: 'User who requested this publish',
      },
      hooks: {
        beforeChange: [
          ({ req, operation, value }: any) => {
            if (operation === 'create' && !value) {
              return req.user?.id;
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        description: 'User who approved this publish',
        readOnly: true,
      },
    },
    {
      name: 'approvedAt',
      type: 'date',
      admin: {
        description: 'When this publish was approved',
        readOnly: true,
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description: 'When this item was actually published',
        readOnly: true,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what is being published',
        rows: 3,
      },
    },
    {
      name: 'changes',
      type: 'array',
      admin: {
        description: 'List of changes included in this publish',
      },
      fields: [
        {
          name: 'changeType',
          type: 'select',
          options: [
            { label: 'New', value: 'new' },
            { label: 'Updated', value: 'updated' },
            { label: 'Deleted', value: 'deleted' },
            { label: 'Moved', value: 'moved' },
          ],
          defaultValue: 'updated',
          admin: {
            description: 'Type of change',
          },
        },
        {
          name: 'description',
          type: 'text',
          required: true,
          admin: {
            description: 'Description of the change',
          },
        },
        {
          name: 'affectedItems',
          type: 'text',
          admin: {
            description: 'Items affected by this change',
          },
        },
      ],
    },
    {
      name: 'dependencies',
      type: 'array',
      admin: {
        description: 'Other items that must be published first',
      },
      fields: [
        {
          name: 'itemType',
          type: 'select',
          options: [
            { label: 'Page', value: 'page' },
            { label: 'Section', value: 'section' },
            { label: 'Block', value: 'block' },
            { label: 'Template', value: 'template' },
            { label: 'Theme', value: 'theme' },
          ],
          required: true,
          admin: {
            description: 'Type of dependent item',
          },
        },
        {
          name: 'itemId',
          type: 'text',
          required: true,
          admin: {
            description: 'ID of dependent item',
          },
        },
        {
          name: 'itemName',
          type: 'text',
          required: true,
          admin: {
            description: 'Name of dependent item',
          },
        },
      ],
    },
    {
      name: 'reviewRequired',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this publish requires review',
      },
    },
    {
      name: 'reviewComments',
      type: 'textarea',
      admin: {
        condition: (data: any) => data?.reviewRequired === true,
        description: 'Comments from the review process',
        rows: 3,
      },
    },
    {
      name: 'rollbackAvailable',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this publish can be rolled back',
      },
    },
    {
      name: 'rollbackSnapshot',
      type: 'json',
      admin: {
        condition: (data: any) => data?.rollbackAvailable === true,
        description: 'Snapshot for rollback purposes',
      },
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      admin: {
        condition: (data: any) => data?.status === 'failed',
        description: 'Error message if publish failed',
        rows: 3,
      },
    },
    {
      name: 'retryCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of retry attempts',
        readOnly: true,
      },
    },
    {
      name: 'maxRetries',
      type: 'number',
      defaultValue: 3,
      admin: {
        description: 'Maximum number of retry attempts',
      },
    },
    {
      name: 'estimatedPublishTime',
      type: 'number',
      admin: {
        description: 'Estimated time to publish in minutes',
      },
    },
    {
      name: 'actualPublishTime',
      type: 'number',
      admin: {
        description: 'Actual time taken to publish in minutes',
        readOnly: true,
      },
    },
    {
      name: 'targetEnvironment',
      type: 'select',
      options: [
        { label: 'Staging', value: 'staging' },
        { label: 'Production', value: 'production' },
        { label: 'Development', value: 'development' },
      ],
      defaultValue: 'production',
      admin: {
        description: 'Target environment for this publish',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Tags for organizing publish requests',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          admin: {
            description: 'Tag name',
          },
        },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata about this publish request',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      admin: {
        position: 'sidebar',
        condition: (data: any, siblingData: any, { user }: any) => user?.role === 'admin',
      },
      hooks: {
        beforeChange: [
          ({ req, value }: any) => {
            if (!value && req.user && (req.user as any)?.role !== 'admin') {
              return (req.user as any)?.tenant?.id;
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
        if (!data.tenant && req.user && (req.user as any)?.role !== 'admin') {
          data.tenant = (req.user as any)?.tenant?.id;
        }

        // Set requested by if not provided
        if (operation === 'create' && !data.requestedBy) {
          data.requestedBy = req.user?.id;
        }

        // Set approved by when status changes to approved
        if (data.status === 'approved' && !data.approvedBy && req.user) {
          data.approvedBy = req.user.id;
          data.approvedAt = new Date().toISOString();
        }

        // Set published timestamp when status changes to published
        if (data.status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString();
        }

        return data;
      },
    ],
  },
  timestamps: true,
});
