// src/payload/collections/BuilderConditionalRules.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';
import { withLexicalEditor } from '../../../payload/utils/withLexicalEditor';

export const ConditionalRules: CollectionConfig = withLexicalEditor(withDefaultHooks({
  slug: 'builder-conditional-rules',
  admin: {
    useAsTitle: 'name',
    group: 'Visual Builder',
    description: 'Rules for showing/hiding blocks or sections (e.g., only show promotion if active, or section based on user type)',
    defaultColumns: ['name', 'ruleType', 'isActive', 'priority', 'createdAt'],
    listSearchableFields: ['name', 'description', 'ruleType'],
  },
  access: {
    read: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true;
      return { createdBy: { equals: req.user.id } };
    },
    create: ({ req }: any) => {
      if (!req.user) return false;
      return ['admin', 'manager', 'editor'].includes((req.user as any)?.role);
    },
    update: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true;
      return { createdBy: { equals: req.user.id } };
    },
    delete: ({ req }: any) => {
      if (!req.user) return false;
      return (req.user as any)?.role === 'admin';
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Rule name for admin reference',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what this rule does',
        rows: 2,
      },
    },
    {
      name: 'ruleType',
      type: 'select',
      options: [
        { label: 'User-Based', value: 'user' },
        { label: 'Content-Based', value: 'content' },
        { label: 'Time-Based', value: 'time' },
        { label: 'Location-Based', value: 'location' },
        { label: 'Device-Based', value: 'device' },
        { label: 'Custom', value: 'custom' },
      ],
      required: true,
      admin: {
        description: 'Type of conditional rule',
      },
    },
    {
      name: 'action',
      type: 'select',
      options: [
        { label: 'Show', value: 'show' },
        { label: 'Hide', value: 'hide' },
        { label: 'Replace Content', value: 'replace' },
        { label: 'Modify Styling', value: 'style' },
        { label: 'Redirect', value: 'redirect' },
      ],
      defaultValue: 'show',
      required: true,
      admin: {
        description: 'Action to take when condition is met',
      },
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Rule priority (higher numbers take precedence)',
      },
    },
    {
      name: 'userConditions',
      type: 'group',
      admin: {
        condition: (data: any) => data?.ruleType === 'user',
        description: 'Conditions based on user properties',
      },
      fields: [
        {
          name: 'userRole',
          type: 'select',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Manager', value: 'manager' },
            { label: 'Editor', value: 'editor' },
            { label: 'User', value: 'user' },
            { label: 'Guest', value: 'guest' },
          ],
          admin: {
            description: 'Required user role',
          },
        },
        {
          name: 'userSegment',
          type: 'relationship',
          relationTo: 'customer-tags' as any as any,
          admin: {
            description: 'Required user segment/tag',
          },
        },
        {
          name: 'isLoggedIn',
          type: 'select',
          options: [
            { label: 'Must be logged in', value: 'true' },
            { label: 'Must be logged out', value: 'false' },
            { label: 'Any', value: 'any' },
          ],
          defaultValue: 'any',
          admin: {
            description: 'Login status requirement',
          },
        },
        {
          name: 'userId',
          type: 'relationship',
          relationTo: 'users' as any as any,
          admin: {
            description: 'Specific user (for personalized content)',
          },
        },
      ],
    },
    {
      name: 'contentConditions',
      type: 'group',
      admin: {
        condition: (data: any) => data?.ruleType === 'content',
        description: 'Conditions based on content properties',
      },
      fields: [
        {
          name: 'contentStatus',
          type: 'select',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
            { label: 'Archived', value: 'archived' },
          ],
          admin: {
            description: 'Required content status',
          },
        },
        {
          name: 'contentType',
          type: 'select',
          options: [
            { label: 'Page', value: 'page' },
            { label: 'Post', value: 'post' },
            { label: 'Product', value: 'product' },
            { label: 'Event', value: 'event' },
            { label: 'Service', value: 'service' },
          ],
          admin: {
            description: 'Required content type',
          },
        },
        {
          name: 'hasTag',
          type: 'relationship',
          relationTo: 'tags' as any as any,
          hasMany: true,
          admin: {
            description: 'Content must have these tags',
          },
        },
        {
          name: 'hasCategory',
          type: 'text',
          admin: {
            description: 'Content must have this category (text field)',
          },
        },
        {
          name: 'fieldCondition',
          type: 'group',
          admin: {
            description: 'Condition based on a specific field value',
          },
          fields: [
            {
              name: 'fieldName',
              type: 'text',
              admin: {
                description: 'Field name to check',
              },
            },
            {
              name: 'fieldValue',
              type: 'text',
              admin: {
                description: 'Required field value',
              },
            },
            {
              name: 'fieldOperator',
              type: 'select',
              options: [
                { label: 'Equals', value: 'equals' },
                { label: 'Not Equals', value: 'not_equals' },
                { label: 'Contains', value: 'contains' },
                { label: 'Greater Than', value: 'greater_than' },
                { label: 'Less Than', value: 'less_than' },
              ],
              defaultValue: 'equals',
            },
          ],
        },
      ],
    },
    {
      name: 'timeConditions',
      type: 'group',
      admin: {
        condition: (data: any) => data?.ruleType === 'time',
        description: 'Conditions based on time/date',
      },
      fields: [
        {
          name: 'startDate',
          type: 'date',
          admin: {
            description: 'Rule becomes active on this date',
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            description: 'Rule becomes inactive on this date',
          },
        },
        {
          name: 'daysOfWeek',
          type: 'select',
          options: [
            { label: 'Monday', value: 'monday' },
            { label: 'Tuesday', value: 'tuesday' },
            { label: 'Wednesday', value: 'wednesday' },
            { label: 'Thursday', value: 'thursday' },
            { label: 'Friday', value: 'friday' },
            { label: 'Saturday', value: 'saturday' },
            { label: 'Sunday', value: 'sunday' },
          ],
          hasMany: true,
          admin: {
            description: 'Days of the week when rule is active',
          },
        },
        {
          name: 'timeRange',
          type: 'group',
          admin: {
            description: 'Time range when rule is active',
          },
          fields: [
            {
              name: 'startTime',
              type: 'text',
              admin: {
                description: 'Start time (HH:MM format)',
              },
            },
            {
              name: 'endTime',
              type: 'text',
              admin: {
                description: 'End time (HH:MM format)',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'locationConditions',
      type: 'group',
      admin: {
        condition: (data: any) => data?.ruleType === 'location',
        description: 'Conditions based on user location',
      },
      fields: [
        {
          name: 'countries',
          type: 'array',
          admin: {
            description: 'Allowed countries',
          },
          fields: [
            {
              name: 'countryCode',
              type: 'text',
              required: true,
              admin: {
                description: 'ISO country code (e.g., US, CA, UK)',
              },
            },
            {
              name: 'countryName',
              type: 'text',
              admin: {
                description: 'Country name',
              },
            },
          ],
        },
        {
          name: 'regions',
          type: 'array',
          admin: {
            description: 'Allowed regions/states',
          },
          fields: [
            {
              name: 'regionCode',
              type: 'text',
              admin: {
                description: 'Region/state code',
              },
            },
            {
              name: 'regionName',
              type: 'text',
              admin: {
                description: 'Region/state name',
              },
            },
          ],
        },
        {
          name: 'cities',
          type: 'array',
          admin: {
            description: 'Allowed cities',
          },
          fields: [
            {
              name: 'cityName',
              type: 'text',
              required: true,
              admin: {
                description: 'City name',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'deviceConditions',
      type: 'group',
      admin: {
        condition: (data: any) => data?.ruleType === 'device',
        description: 'Conditions based on device type',
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
            description: 'Target device type',
          },
        },
        {
          name: 'browser',
          type: 'select',
          options: [
            { label: 'Chrome', value: 'chrome' },
            { label: 'Firefox', value: 'firefox' },
            { label: 'Safari', value: 'safari' },
            { label: 'Edge', value: 'edge' },
            { label: 'Other', value: 'other' },
          ],
          admin: {
            description: 'Target browser',
          },
        },
        {
          name: 'operatingSystem',
          type: 'select',
          options: [
            { label: 'Windows', value: 'windows' },
            { label: 'macOS', value: 'macos' },
            { label: 'Linux', value: 'linux' },
            { label: 'iOS', value: 'ios' },
            { label: 'Android', value: 'android' },
            { label: 'Other', value: 'other' },
          ],
          admin: {
            description: 'Target operating system',
          },
        },
      ],
    },
    {
      name: 'customCondition',
      type: 'textarea',
      admin: {
        condition: (data: any) => data?.ruleType === 'custom',
        description: 'Custom JavaScript condition (must return true/false)',
        rows: 8,
      },
    },
    {
      name: 'alternativeContent',
      type: 'group',
      admin: {
        condition: (data: any) => ['hide', 'replace'].includes(data?.action),
        description: 'Alternative content to show when condition is not met',
      },
      fields: [
        {
          name: 'content',
          type: 'richText',
          admin: {
            description: 'Alternative content',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media' as any as any,
          admin: {
            description: 'Alternative image',
          },
        },
        {
          name: 'redirectUrl',
          type: 'text',
          admin: {
            condition: (data: any) => data?.action === 'redirect',
            description: 'URL to redirect to',
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this rule is active',
      },
    },
    {
      name: 'isGlobal',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this rule applies globally',
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of times this rule has been triggered',
        readOnly: true,
      },
    },
    {
      name: 'lastTriggered',
      type: 'date',
      admin: {
        description: 'Last time this rule was triggered',
        readOnly: true,
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Tags for organizing rules',
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
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        readOnly: true,
        position: 'sidebar',
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

        // Update last triggered timestamp
        if (operation === 'read' && data.lastTriggered) {
          data.lastTriggered = new Date().toISOString();
        }

        return data;
      },
    ],
  },
  timestamps: true,
}));
