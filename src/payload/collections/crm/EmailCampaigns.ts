// src/payload/collections/EmailCampaigns.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const EmailCampaigns: CollectionConfig = withDefaultHooks({
  slug: 'email-campaigns',
  admin: {
    useAsTitle: 'subject',
    group: 'Marketing',
    description: 'Manage email campaigns and newsletters',
    defaultColumns: ['subject', 'status', 'sentAt', 'openRate', 'recipientCount'],
    listSearchableFields: ['subject', 'content', 'senderName'],
  },
  access: {
    read: ({ req }: any) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      if (req.user.role === 'manager') return true;
      return false;
    },
    create: ({ req }: any) => {
      if (!req.user) return false;
      return ['admin', 'manager'].includes(req.user.role);
    },
    update: ({ req }: any) => {
      if (!req.user) return false;
      if (req.user.role === 'admin') return true;
      if (req.user.role === 'manager') return true;
      return false;
    },
    delete: ({ req }: any) => {
      if (!req.user) return false;
      return req.user.role === 'admin';
    },
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: {
        description: 'Email subject line',
      },
    },
    {
      name: 'senderName',
      type: 'text',
      required: true,
      admin: {
        description: 'Name that appears as the sender',
      },
    },
    {
      name: 'senderEmail',
      type: 'email',
      required: true,
      admin: {
        description: 'Email address that appears as the sender',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Email content (HTML)',
      },
    },
    {
      name: 'campaignType',
      type: 'select',
      options: [
        { label: 'Newsletter', value: 'newsletter' },
        { label: 'Promotional', value: 'promotional' },
        { label: 'Transactional', value: 'transactional' },
        { label: 'Welcome', value: 'welcome' },
        { label: 'Re-engagement', value: 'reengagement' },
      ],
      defaultValue: 'newsletter',
      admin: {
        description: 'Type of email campaign',
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
        description: 'Current status of the campaign',
      },
    },
    {
      name: 'scheduledAt',
      type: 'date',
      admin: {
        description: 'When to send the campaign',
        condition: (data: any) => data?.status === 'scheduled',
      },
    },
    {
      name: 'sentAt',
      type: 'date',
      admin: {
        description: 'When the campaign was actually sent',
        readOnly: true,
      },
    },
    {
      name: 'recipientList',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Users who should receive this email',
      },
    },
    {
      name: 'recipientCount',
      type: 'number',
      admin: {
        description: 'Total number of recipients',
        readOnly: true,
      },
    },
    {
      name: 'segments',
      type: 'relationship',
      relationTo: 'customer-tags',
      hasMany: true,
      admin: {
        description: 'Customer segments to target',
      },
    },
    {
      name: 'analytics',
      type: 'group',
      admin: {
        description: 'Campaign performance metrics',
      },
      fields: [
        {
          name: 'sentCount',
          type: 'number',
          admin: {
            description: 'Number of emails successfully sent',
            readOnly: true,
          },
        },
        {
          name: 'deliveredCount',
          type: 'number',
          admin: {
            description: 'Number of emails delivered',
            readOnly: true,
          },
        },
        {
          name: 'openCount',
          type: 'number',
          admin: {
            description: 'Number of emails opened',
            readOnly: true,
          },
        },
        {
          name: 'clickCount',
          type: 'number',
          admin: {
            description: 'Number of link clicks',
            readOnly: true,
          },
        },
        {
          name: 'bounceCount',
          type: 'number',
          admin: {
            description: 'Number of bounced emails',
            readOnly: true,
          },
        },
        {
          name: 'unsubscribeCount',
          type: 'number',
          admin: {
            description: 'Number of unsubscribes',
            readOnly: true,
          },
        },
        {
          name: 'openRate',
          type: 'number',
          admin: {
            description: 'Open rate percentage',
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
    // Email template relationship temporarily disabled - email-templates collection needs to be created
    // {
    //   name: 'template',
    //   type: 'relationship',
    //   relationTo: 'email-templates',
    //   admin: {
    //     description: 'Email template to use',
    //   },
    // },
    {
      name: 'attachments',
      type: 'array',
      admin: {
        description: 'Files to attach to the email',
      },
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'filename',
          type: 'text',
          admin: {
            description: 'Display name for the attachment',
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
        description: 'The tenant this campaign belongs to',
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

        // Auto-set sender email if not provided
        if (operation === 'create' && !data.senderEmail && req.user) {
          data.senderEmail = req.user.email;
        }

        // Calculate recipient count
        if (data.recipientList) {
          data.recipientCount = data.recipientList.length;
        }

        // Calculate rates
        if (data.analytics) {
          const { sentCount, openCount, clickCount } = data.analytics;
          if (sentCount && sentCount > 0) {
            data.analytics.openRate = Math.round((openCount / sentCount) * 100);
            data.analytics.clickRate = Math.round((clickCount / sentCount) * 100);
          }
        }

        return data;
      },
    ],
    afterChange: [
      ({ doc, operation, req }: any) => {
        if (operation === 'update' && doc.status === 'sent') {
          console.log(`Email campaign "${doc.subject}" has been sent to ${doc.recipientCount} recipients`);
        }
      },
    ],
  },
  timestamps: true,
});
