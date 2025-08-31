// src/payload/collections/BuilderDynamicData.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const DynamicData: CollectionConfig = withDefaultHooks({
  slug: 'builder-dynamic-data',
  admin: {
    useAsTitle: 'name',
    group: 'Visual Builder',
    description: 'Reference external collections dynamically to populate blocks automatically',
    defaultColumns: ['name', 'sourceCollection', 'queryType', 'isActive', 'createdAt'],
    listSearchableFields: ['name', 'description', 'sourceCollection'],
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
        description: 'Data source name for admin reference',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what data this source provides',
        rows: 2,
      },
    },
    {
      name: 'sourceCollection',
      type: 'select',
      options: [
        { label: 'Products', value: 'products' },
        { label: 'Blog Posts', value: 'blog-posts' },
        { label: 'Testimonials', value: 'testimonials' },
        { label: 'Events', value: 'events' },
        { label: 'Services', value: 'services' },
        { label: 'Team Members', value: 'team' },
        { label: 'Pages', value: 'pages' },
        { label: 'Customers', value: 'customers' },
        { label: 'Categories', value: 'categories' },
        { label: 'Tags', value: 'tags' },
        { label: 'Media', value: 'media' },
        { label: 'Custom', value: 'custom' },
      ],
      required: true,
      admin: {
        description: 'Collection to pull data from',
      },
    },
    {
      name: 'queryType',
      type: 'select',
      options: [
        { label: 'All Records', value: 'all' },
        { label: 'Filtered Records', value: 'filtered' },
        { label: 'Single Record', value: 'single' },
        { label: 'Latest Records', value: 'latest' },
        { label: 'Featured Records', value: 'featured' },
        { label: 'Random Records', value: 'random' },
        { label: 'Related Records', value: 'related' },
        { label: 'Custom Query', value: 'custom' },
      ],
      defaultValue: 'all',
      required: true,
      admin: {
        description: 'Type of query to perform',
      },
    },
    {
      name: 'filters',
      type: 'group',
      admin: {
        condition: (data: any) => ['filtered', 'single', 'featured'].includes(data?.queryType),
        description: 'Filters to apply to the data query',
      },
      fields: [
        {
          name: 'whereConditions',
          type: 'array',
          admin: {
            description: 'Where conditions for filtering records',
          },
          fields: [
            {
              name: 'field',
              type: 'text',
              required: true,
              admin: {
                description: 'Field name to filter on',
              },
            },
            {
              name: 'operator',
              type: 'select',
              options: [
                { label: 'Equals', value: 'equals' },
                { label: 'Not Equals', value: 'not_equals' },
                { label: 'Greater Than', value: 'greater_than' },
                { label: 'Less Than', value: 'less_than' },
                { label: 'Greater Than Or Equal', value: 'greater_than_equal' },
                { label: 'Less Than Or Equal', value: 'less_than_equal' },
                { label: 'Like', value: 'like' },
                { label: 'In', value: 'in' },
                { label: 'Not In', value: 'not_in' },
                { label: 'Exists', value: 'exists' },
              ],
              defaultValue: 'equals',
              required: true,
              admin: {
                description: 'Comparison operator',
              },
            },
            {
              name: 'value',
              type: 'text',
              admin: {
                description: 'Value to compare against',
              },
            },
          ],
        },
        {
          name: 'tagFilter',
          type: 'relationship',
          relationTo: 'tags' as any as any,
          hasMany: true,
          admin: {
            description: 'Filter by tags',
          },
        },
        {
          name: 'categoryFilter',
          type: 'text',
          admin: {
            description: 'Filter by category (text field)',
          },
        },
        {
          name: 'statusFilter',
          type: 'select',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
            { label: 'Archived', value: 'archived' },
          ],
          admin: {
            description: 'Filter by status',
          },
        },
      ],
    },
    {
      name: 'singleRecord',
      type: 'relationship',
      relationTo: 'products' as any as any, // This will be dynamically set based on sourceCollection
      admin: {
        condition: (data: any) => data?.queryType === 'single',
        description: 'Specific record to display',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 100,
      admin: {
        condition: (data: any) => ['all', 'filtered', 'latest', 'random', 'related'].includes(data?.queryType),
        description: 'Maximum number of records to return',
      },
    },
    {
      name: 'offset',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        condition: (data: any) => ['all', 'filtered', 'latest', 'random', 'related'].includes(data?.queryType),
        description: 'Number of records to skip',
      },
    },
    {
      name: 'sort',
      type: 'group',
      admin: {
        condition: (data: any) => ['all', 'filtered', 'latest', 'random'].includes(data?.queryType),
        description: 'Sorting configuration',
      },
      fields: [
        {
          name: 'sortField',
          type: 'text',
          admin: {
            description: 'Field to sort by',
          },
        },
        {
          name: 'sortOrder',
          type: 'select',
          options: [
            { label: 'Ascending', value: 'asc' },
            { label: 'Descending', value: 'desc' },
          ],
          defaultValue: 'desc',
          admin: {
            description: 'Sort direction',
          },
        },
      ],
    },
    {
      name: 'displayFields',
      type: 'array',
      admin: {
        description: 'Fields to include in the data output',
      },
      fields: [
        {
          name: 'field',
          type: 'text',
          required: true,
          admin: {
            description: 'Field name to include',
          },
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Display label for this field',
          },
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Image', value: 'image' },
            { label: 'URL', value: 'url' },
            { label: 'Date', value: 'date' },
            { label: 'Number', value: 'number' },
            { label: 'Boolean', value: 'boolean' },
          ],
          defaultValue: 'text',
          admin: {
            description: 'Field data type',
          },
        },
      ],
    },
    {
      name: 'customQuery',
      type: 'textarea',
      admin: {
        condition: (data: any) => data?.queryType === 'custom',
        description: 'Custom query configuration (JSON)',
        rows: 8,
      },
    },
    {
      name: 'caching',
      type: 'group',
      admin: {
        description: 'Caching configuration for performance',
      },
      fields: [
        {
          name: 'cacheEnabled',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Enable caching for this data source',
          },
        },
        {
          name: 'cacheDuration',
          type: 'number',
          defaultValue: 300, // 5 minutes
          admin: {
            condition: (data: any) => data?.caching?.cacheEnabled,
            description: 'Cache duration in seconds',
          },
        },
        {
          name: 'cacheKey',
          type: 'text',
          admin: {
            condition: (data: any) => data?.caching?.cacheEnabled,
            description: 'Custom cache key (auto-generated if empty)',
          },
        },
      ],
    },
    {
      name: 'transformations',
      type: 'group',
      admin: {
        description: 'Data transformation settings',
      },
      fields: [
        {
          name: 'transformEnabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable data transformations',
          },
        },
        {
          name: 'transformScript',
          type: 'textarea',
          admin: {
            condition: (data: any) => data?.transformations?.transformEnabled,
            description: 'JavaScript code to transform the data',
            rows: 10,
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this data source is active',
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of times this data source is used',
        readOnly: true,
      },
    },
    {
      name: 'lastQueried',
      type: 'date',
      admin: {
        description: 'Last time this data source was queried',
        readOnly: true,
      },
    },
    {
      name: 'preview',
      type: 'textarea',
      admin: {
        description: 'Preview of the data structure (auto-updated)',
        rows: 8,
        readOnly: true,
      },
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

        // Update last queried timestamp
        if (operation === 'read') {
          data.lastQueried = new Date().toISOString();
        }

        return data;
      },
    ],
  },
  timestamps: true,
});
