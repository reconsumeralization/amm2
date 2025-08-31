// src/payload/collections/EventTracking.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const EventTracking: CollectionConfig = withDefaultHooks({
  slug: 'event-tracking',
  admin: {
    useAsTitle: 'eventName',
    group: 'Analytics',
    description: 'Track user interactions and conversion events',
    defaultColumns: ['eventName', 'eventType', 'count', 'conversionValue', 'lastOccurred'],
    listSearchableFields: ['eventName', 'eventType', 'pageUrl'],
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
      name: 'eventName',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Name of the event being tracked',
      },
    },
    {
      name: 'eventType',
      type: 'select',
      options: [
        { label: 'Click', value: 'click' },
        { label: 'Form Submission', value: 'form_submit' },
        { label: 'Purchase', value: 'purchase' },
        { label: 'Sign Up', value: 'signup' },
        { label: 'Download', value: 'download' },
        { label: 'Video Play', value: 'video_play' },
        { label: 'Scroll', value: 'scroll' },
        { label: 'Time on Page', value: 'time_on_page' },
        { label: 'Custom', value: 'custom' },
      ],
      required: true,
      admin: {
        description: 'Type of event for categorization',
      },
    },
    {
      name: 'pageUrl',
      type: 'text',
      admin: {
        description: 'URL where the event occurred',
      },
    },
    {
      name: 'elementId',
      type: 'text',
      admin: {
        description: 'ID of the element that triggered the event',
      },
    },
    {
      name: 'elementSelector',
      type: 'text',
      admin: {
        description: 'CSS selector of the element',
      },
    },
    {
      name: 'count',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total number of times this event occurred',
        readOnly: true,
      },
    },
    {
      name: 'uniqueUsers',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of unique users who triggered this event',
        readOnly: true,
      },
    },
    {
      name: 'conversionValue',
      type: 'number',
      admin: {
        description: 'Monetary value of conversions from this event',
        readOnly: true,
      },
    },
    {
      name: 'conversionRate',
      type: 'number',
      admin: {
        description: 'Conversion rate percentage',
        readOnly: true,
      },
    },
    {
      name: 'eventData',
      type: 'json',
      admin: {
        description: 'Additional event-specific data',
      },
    },
    {
      name: 'userSegments',
      type: 'relationship',
      relationTo: 'customer-tags',
      hasMany: true,
      admin: {
        description: 'Customer segments that triggered this event',
      },
    },
    {
      name: 'attribution',
      type: 'group',
      admin: {
        description: 'Attribution data for marketing campaigns',
      },
      fields: [
        {
          name: 'campaignId',
          type: 'text',
          admin: {
            description: 'Marketing campaign ID',
          },
        },
        {
          name: 'campaignName',
          type: 'text',
          admin: {
            description: 'Marketing campaign name',
          },
        },
        {
          name: 'source',
          type: 'text',
          admin: {
            description: 'Traffic source (organic, paid, social, etc.)',
          },
        },
        {
          name: 'medium',
          type: 'text',
          admin: {
            description: 'Traffic medium (search, email, social, etc.)',
          },
        },
        {
          name: 'attributionWindow',
          type: 'number',
          admin: {
            description: 'Attribution window in days',
          },
        },
      ],
    },
    {
      name: 'goals',
      type: 'array',
      admin: {
        description: 'Conversion goals associated with this event',
      },
      fields: [
        {
          name: 'goalName',
          type: 'text',
          required: true,
          admin: {
            description: 'Name of the conversion goal',
          },
        },
        {
          name: 'goalType',
          type: 'select',
          options: [
            { label: 'Revenue', value: 'revenue' },
            { label: 'Lead', value: 'lead' },
            { label: 'Signup', value: 'signup' },
            { label: 'Download', value: 'download' },
            { label: 'Engagement', value: 'engagement' },
          ],
          required: true,
          admin: {
            description: 'Type of conversion goal',
          },
        },
        {
          name: 'goalValue',
          type: 'number',
          admin: {
            description: 'Value of the goal completion',
          },
        },
        {
          name: 'completions',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of goal completions from this event',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'funnel',
      type: 'group',
      admin: {
        description: 'Funnel analytics for multi-step processes',
      },
      fields: [
        {
          name: 'stepNumber',
          type: 'number',
          admin: {
            description: 'Step number in the conversion funnel',
          },
        },
        {
          name: 'funnelName',
          type: 'text',
          admin: {
            description: 'Name of the conversion funnel',
          },
        },
        {
          name: 'dropOffRate',
          type: 'number',
          admin: {
            description: 'Drop-off rate at this step',
            readOnly: true,
          },
        },
        {
          name: 'timeToComplete',
          type: 'number',
          admin: {
            description: 'Average time to complete this step',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'lastOccurred',
      type: 'date',
      admin: {
        description: 'Last time this event was tracked',
        readOnly: true,
      },
    },
    {
      name: 'firstOccurred',
      type: 'date',
      admin: {
        description: 'First time this event was tracked',
        readOnly: true,
      },
    },
    {
      name: 'deviceData',
      type: 'group',
      admin: {
        description: 'Device and browser information',
      },
      fields: [
        {
          name: 'deviceType',
          type: 'select',
          options: [
            { label: 'Desktop', value: 'desktop' },
            { label: 'Mobile', value: 'mobile' },
            { label: 'Tablet', value: 'tablet' },
          ],
          admin: {
            description: 'Type of device',
          },
        },
        {
          name: 'browser',
          type: 'text',
          admin: {
            description: 'Browser name',
          },
        },
        {
          name: 'operatingSystem',
          type: 'text',
          admin: {
            description: 'Operating system',
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
        description: 'The tenant this event tracking belongs to',
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

        // Set timestamps
        const now = new Date().toISOString();
        if (operation === 'create') {
          data.firstOccurred = now;
        }
        data.lastOccurred = now;

        // Calculate conversion rate
        if (data.count && data.count > 0 && data.uniqueUsers) {
          data.conversionRate = Math.round((data.uniqueUsers / data.count) * 100);
        }

        return data;
      },
    ],
  },
  timestamps: true,
});
