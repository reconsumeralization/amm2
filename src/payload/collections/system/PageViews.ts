// src/payload/collections/PageViews.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const PageViews: CollectionConfig = withDefaultHooks({
  slug: 'page-views',
  admin: {
    useAsTitle: 'pageUrl',
    group: 'Analytics',
    description: 'Track page views and user engagement metrics',
    defaultColumns: ['pageUrl', 'pageTitle', 'viewCount', 'uniqueVisitors', 'avgSessionDuration'],
    listSearchableFields: ['pageUrl', 'pageTitle', 'referrer'],
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
      name: 'pageUrl',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'The URL of the page being tracked',
      },
    },
    {
      name: 'pageTitle',
      type: 'text',
      admin: {
        description: 'Title of the page',
      },
    },
    {
      name: 'pageType',
      type: 'select',
      options: [
        { label: 'Home Page', value: 'home' },
        { label: 'Product Page', value: 'product' },
        { label: 'Service Page', value: 'service' },
        { label: 'Blog Post', value: 'blog' },
        { label: 'About Page', value: 'about' },
        { label: 'Contact Page', value: 'contact' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Type of page for categorization',
      },
    },
    {
      name: 'viewCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total number of page views',
        readOnly: true,
      },
    },
    {
      name: 'uniqueVisitors',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of unique visitors',
        readOnly: true,
      },
    },
    {
      name: 'bounceRate',
      type: 'number',
      admin: {
        description: 'Bounce rate percentage',
        readOnly: true,
      },
    },
    {
      name: 'avgSessionDuration',
      type: 'number',
      admin: {
        description: 'Average session duration in seconds',
        readOnly: true,
      },
    },
    {
      name: 'exitRate',
      type: 'number',
      admin: {
        description: 'Exit rate percentage',
        readOnly: true,
      },
    },
    {
      name: 'deviceBreakdown',
      type: 'group',
      admin: {
        description: 'Traffic breakdown by device type',
      },
      fields: [
        {
          name: 'desktop',
          type: 'number',
          admin: {
            description: 'Desktop visitors percentage',
            readOnly: true,
          },
        },
        {
          name: 'mobile',
          type: 'number',
          admin: {
            description: 'Mobile visitors percentage',
            readOnly: true,
          },
        },
        {
          name: 'tablet',
          type: 'number',
          admin: {
            description: 'Tablet visitors percentage',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'topReferrers',
      type: 'array',
      admin: {
        description: 'Top referring sources',
        readOnly: true,
      },
      fields: [
        {
          name: 'source',
          type: 'text',
          admin: {
            description: 'Referring source URL or name',
          },
        },
        {
          name: 'count',
          type: 'number',
          admin: {
            description: 'Number of visits from this source',
          },
        },
        {
          name: 'percentage',
          type: 'number',
          admin: {
            description: 'Percentage of total traffic',
          },
        },
      ],
    },
    {
      name: 'geographicData',
      type: 'array',
      admin: {
        description: 'Traffic breakdown by location',
        readOnly: true,
      },
      fields: [
        {
          name: 'country',
          type: 'text',
          admin: {
            description: 'Country name',
          },
        },
        {
          name: 'region',
          type: 'text',
          admin: {
            description: 'Region/State',
          },
        },
        {
          name: 'count',
          type: 'number',
          admin: {
            description: 'Number of visits from this location',
          },
        },
      ],
    },
    {
      name: 'popularContent',
      type: 'array',
      admin: {
        description: 'Most viewed content on this page',
        readOnly: true,
      },
      fields: [
        {
          name: 'elementId',
          type: 'text',
          admin: {
            description: 'ID of the viewed element',
          },
        },
        {
          name: 'elementType',
          type: 'text',
          admin: {
            description: 'Type of element (button, link, image, etc.)',
          },
        },
        {
          name: 'viewCount',
          type: 'number',
          admin: {
            description: 'Number of views for this element',
          },
        },
      ],
    },
    {
      name: 'conversionMetrics',
      type: 'group',
      admin: {
        description: 'Conversion and goal tracking',
      },
      fields: [
        {
          name: 'goalCompletions',
          type: 'number',
          admin: {
            description: 'Number of goal completions',
            readOnly: true,
          },
        },
        {
          name: 'goalValue',
          type: 'number',
          admin: {
            description: 'Total value of goal completions',
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
      ],
    },
    {
      name: 'lastUpdated',
      type: 'date',
      admin: {
        description: 'Last time analytics were updated',
        readOnly: true,
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'The tenant this page analytics belongs to',
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

        // Update last updated timestamp
        data.lastUpdated = new Date().toISOString();

        // Calculate bounce rate
        if (data.viewCount && data.viewCount > 0 && data.uniqueVisitors) {
          // Simplified bounce rate calculation
          data.bounceRate = Math.round(((data.uniqueVisitors - (data.viewCount * 0.3)) / data.uniqueVisitors) * 100);
        }

        return data;
      },
    ],
  },
  timestamps: true,
});
