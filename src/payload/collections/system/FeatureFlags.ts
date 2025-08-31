// src/payload/collections/FeatureFlags.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const FeatureFlags: CollectionConfig = withDefaultHooks({
  slug: 'feature-flags',
  admin: {
    useAsTitle: 'name',
    group: 'Admin',
    description: 'Manage feature toggles and rollout settings',
    defaultColumns: ['name', 'description', 'isEnabled', 'rolloutPercentage', 'targetAudience'],
    listSearchableFields: ['name', 'description', 'key'],
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
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Human-readable name for the feature',
      },
    },
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique key for the feature (used in code)',
      },
      validate: (value: any) => {
        if (!value) return true;
        // Validate key format (alphanumeric, underscore, dash)
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          return 'Key can only contain letters, numbers, underscores, and dashes';
        }
        return true;
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what this feature does',
        rows: 3,
      },
    },
    {
      name: 'isEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this feature is globally enabled',
      },
    },
    {
      name: 'rolloutStrategy',
      type: 'select',
      options: [
        { label: 'All Users', value: 'all' },
        { label: 'Percentage Rollout', value: 'percentage' },
        { label: 'Specific Users', value: 'users' },
        { label: 'User Segments', value: 'segments' },
        { label: 'Admin Only', value: 'admin' },
      ],
      defaultValue: 'all',
      admin: {
        description: 'How to rollout this feature',
      },
    },
    {
      name: 'rolloutPercentage',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 100,
      admin: {
        description: 'Percentage of users to enable for (0-100)',
        condition: (data: any) => data?.rolloutStrategy === 'percentage',
      },
    },
    {
      name: 'targetUsers',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Specific users to enable this feature for',
        condition: (data: any) => data?.rolloutStrategy === 'users',
      },
    },
    {
      name: 'targetSegments',
      type: 'relationship',
      relationTo: 'customer-tags',
      hasMany: true,
      admin: {
        description: 'Customer segments to enable this feature for',
        condition: (data: any) => data?.rolloutStrategy === 'segments',
      },
    },
    {
      name: 'conditions',
      type: 'group',
      admin: {
        description: 'Additional conditions for enabling this feature',
      },
      fields: [
        {
          name: 'minUserRole',
          type: 'select',
          options: [
            { label: 'Any User', value: 'user' },
            { label: 'Manager+', value: 'manager' },
            { label: 'Admin Only', value: 'admin' },
          ],
          defaultValue: 'user',
          admin: {
            description: 'Minimum user role required',
          },
        },
        {
          name: 'startDate',
          type: 'date',
          admin: {
            description: 'Feature activation start date',
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            description: 'Feature deactivation end date',
          },
        },
        {
          name: 'maxUsage',
          type: 'number',
          admin: {
            description: 'Maximum usage count for this feature',
          },
        },
        {
          name: 'environment',
          type: 'select',
          options: [
            { label: 'All Environments', value: 'all' },
            { label: 'Development Only', value: 'development' },
            { label: 'Staging Only', value: 'staging' },
            { label: 'Production Only', value: 'production' },
          ],
          defaultValue: 'all',
          admin: {
            description: 'Environment restrictions',
          },
        },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      admin: {
        description: 'Feature usage analytics',
        readOnly: true,
      },
      fields: [
        {
          name: 'usageCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total number of times this feature was used',
          },
        },
        {
          name: 'uniqueUsers',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of unique users who used this feature',
          },
        },
        {
          name: 'conversionRate',
          type: 'number',
          admin: {
            description: 'Conversion rate for this feature',
          },
        },
        {
          name: 'lastUsed',
          type: 'date',
          admin: {
            description: 'Last time this feature was used',
          },
        },
      ],
    },
    {
      name: 'dependencies',
      type: 'array',
      admin: {
        description: 'Other features that must be enabled for this feature to work',
      },
      fields: [
        {
          name: 'featureFlag',
          type: 'relationship',
          relationTo: 'feature-flags',
          required: true,
          admin: {
            description: 'Required feature flag',
          },
        },
        {
          name: 'requiredState',
          type: 'select',
          options: [
            { label: 'Must be Enabled', value: 'enabled' },
            { label: 'Must be Disabled', value: 'disabled' },
          ],
          defaultValue: 'enabled',
          admin: {
            description: 'Required state of the dependency',
          },
        },
      ],
    },
    {
      name: 'configuration',
      type: 'json',
      admin: {
        description: 'Additional configuration data for this feature',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who created this feature flag',
        readOnly: true,
      },
    },
    {
      name: 'lastModifiedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who last modified this feature flag',
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
        description: 'The tenant this feature flag belongs to',
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

        // Set created by and last modified by
        if (operation === 'create' && req.user) {
          data.createdBy = req.user.id;
        }
        if (req.user) {
          data.lastModifiedBy = req.user.id;
        }

        // Validate rollout percentage
        if (data.rolloutStrategy === 'percentage') {
          if (data.rolloutPercentage < 0 || data.rolloutPercentage > 100) {
            throw new Error('Rollout percentage must be between 0 and 100');
          }
        }

        // Check dependencies
        if (data.dependencies && data.dependencies.length > 0) {
          // This would need to be implemented to check if dependencies are met
          console.log('Feature has dependencies that need to be validated');
        }

        return data;
      },
    ],
    beforeDelete: [
      ({ data, req }: any) => {
        // Check for dependent features
        if (data.key) {
          // This would need to check if other features depend on this one
          console.log(`Checking dependencies for feature: ${data.key}`);
        }

        return data;
      },
    ],
  },
  timestamps: true,
});
