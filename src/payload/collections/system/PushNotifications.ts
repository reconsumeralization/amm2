// src/payload/collections/PushNotifications.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const PushNotifications: CollectionConfig = withDefaultHooks({
  slug: 'push-notifications',
  admin: {
    useAsTitle: 'title',
    group: 'Marketing',
    description: 'Manage push notifications for mobile and web',
    defaultColumns: ['title', 'status', 'scheduledAt', 'sentAt', 'recipientCount'],
    listSearchableFields: ['title', 'message', 'targetAudience'],
  },
  access: {
    read: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true;
      return false;
    },
    create: ({ req }: any) => {
      if (!req.user) return false;
      return ['admin', 'manager'].includes((req.user as any)?.role);
    },
    update: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true;
      return false;
    },
    delete: ({ req }: any) => {
      if (!req.user) return false;
      return (req.user as any)?.role === 'admin';
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Notification title (60 characters max)',
      },
      validate: (value: any) => {
        if (value && value.length > 60) {
          return 'Title must be 60 characters or less';
        }
        return true;
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Notification message (160 characters max)',
        rows: 3,
      },
      validate: (value: any) => {
        if (value && value.length > 160) {
          return 'Message must be 160 characters or less';
        }
        return true;
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        description: 'URL to open when notification is tapped',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media' as any as any,
      admin: {
        description: 'Icon image for the notification (optional)',
      },
    },
    {
      name: 'notificationType',
      type: 'select',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
        { label: 'Promotion', value: 'promotion' },
        { label: 'Update', value: 'update' },
      ],
      defaultValue: 'info',
      admin: {
        description: 'Type of notification for styling',
      },
    },
    {
      name: 'targetPlatform',
      type: 'select',
      options: [
        { label: 'Web Only', value: 'web' },
        { label: 'Mobile Only', value: 'mobile' },
        { label: 'Both', value: 'both' },
      ],
      defaultValue: 'both',
      admin: {
        description: 'Platform to send notification to',
      },
    },
    {
      name: 'targetAudience',
      type: 'select',
      options: [
        { label: 'All Users', value: 'all' },
        { label: 'Active Users', value: 'active' },
        { label: 'Inactive Users', value: 'inactive' },
        { label: 'Premium Users', value: 'premium' },
        { label: 'Specific Users', value: 'specific' },
      ],
      defaultValue: 'all',
      admin: {
        description: 'Who should receive this notification',
      },
    },
    {
      name: 'specificUsers',
      type: 'relationship',
      relationTo: 'users' as any as any,
      hasMany: true,
      admin: {
        description: 'Specific users to send to',
        condition: (data: any) => data?.targetAudience === 'specific',
      },
    },
    {
      name: 'segments',
      type: 'relationship',
      relationTo: 'customer-tags' as any as any,
      hasMany: true,
      admin: {
        description: 'Customer segments to target',
        condition: (data: any) => data?.targetAudience !== 'specific',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Sending', value: 'sending' },
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'draft',
      admin: {
        description: 'Current status of the notification',
      },
    },
    {
      name: 'scheduledAt',
      type: 'date',
      admin: {
        description: 'When to send the notification',
        condition: (data: any) => data?.status === 'scheduled',
      },
    },
    {
      name: 'sentAt',
      type: 'date',
      admin: {
        description: 'When the notification was actually sent',
        readOnly: true,
      },
    },
    {
      name: 'ttl',
      type: 'number',
      defaultValue: 3600,
      admin: {
        description: 'Time to live in seconds (how long to keep in notification center)',
      },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      defaultValue: 'normal',
      admin: {
        description: 'Notification priority level',
      },
    },
    {
      name: 'analytics',
      type: 'group',
      admin: {
        description: 'Notification performance metrics',
      },
      fields: [
        {
          name: 'sentCount',
          type: 'number',
          admin: {
            description: 'Number of notifications sent',
            readOnly: true,
          },
        },
        {
          name: 'deliveredCount',
          type: 'number',
          admin: {
            description: 'Number of notifications delivered',
            readOnly: true,
          },
        },
        {
          name: 'clickedCount',
          type: 'number',
          admin: {
            description: 'Number of notifications clicked',
            readOnly: true,
          },
        },
        {
          name: 'dismissedCount',
          type: 'number',
          admin: {
            description: 'Number of notifications dismissed',
            readOnly: true,
          },
        },
        {
          name: 'clickRate',
          type: 'number',
          admin: {
            description: 'Click rate percentage',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'actions',
      type: 'array',
      admin: {
        description: 'Custom actions for the notification',
      },
      fields: [
        {
          name: 'action',
          type: 'text',
          required: true,
          admin: {
            description: 'Action identifier',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'Action button text',
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'URL for the action',
          },
        },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      admin: {
        position: 'sidebar',
        description: 'The tenant this notification belongs to',
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

        // Calculate click rate
        if (data.analytics) {
          const { sentCount, clickedCount } = data.analytics;
          if (sentCount && sentCount > 0) {
            data.analytics.clickRate = Math.round((clickedCount / sentCount) * 100);
          }
        }

        return data;
      },
    ],
    afterChange: [
      ({ doc, operation, req }: any) => {
        if (operation === 'update' && doc.status === 'sent') {
          console.log(`Push notification "${doc.title}" has been sent to ${doc.analytics?.sentCount || 0} recipients`);
        }
      },
    ],
  },
  timestamps: true,
});
