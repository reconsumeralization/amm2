// src/payload/collections/BuilderGlobalStyles.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const GlobalStyles: CollectionConfig = withDefaultHooks({
  slug: 'builder-global-styles',
  admin: {
    useAsTitle: 'name',
    group: 'Visual Builder',
    description: 'Store global CSS or SCSS overrides for the visual builder',
    defaultColumns: ['name', 'type', 'isActive', 'priority', 'createdAt'],
    listSearchableFields: ['name', 'description', 'type'],
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
      return ['admin', 'manager'].includes((req.user as any)?.role);
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
        description: 'Style name for admin reference',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what this global style does',
        rows: 2,
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'CSS', value: 'css' },
        { label: 'SCSS/SASS', value: 'scss' },
        { label: 'Less', value: 'less' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'css',
      required: true,
      admin: {
        description: 'Type of stylesheet',
      },
    },
    {
      name: 'code',
      type: 'textarea',
      required: true,
      admin: {
        description: 'CSS/SCSS code content',
        rows: 20,

      },
    },
    {
      name: 'scope',
      type: 'select',
      options: [
        { label: 'Global', value: 'global' },
        { label: 'Page Level', value: 'page' },
        { label: 'Component Level', value: 'component' },
        { label: 'Theme Override', value: 'theme' },
      ],
      defaultValue: 'global',
      admin: {
        description: 'Scope where this style should be applied',
      },
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
      min: -100,
      max: 100,
      admin: {
        description: 'Loading priority (-100 to 100, higher numbers load later)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this style is active',
      },
    },
    {
      name: 'isCritical',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this is critical CSS that should be inlined',
      },
    },
    {
      name: 'mediaQuery',
      type: 'text',
      admin: {
        description: 'CSS media query for responsive styles (e.g., "@media (max-width: 768px)")',
      },
    },
    {
      name: 'dependencies',
      type: 'array',
      admin: {
        description: 'Other global styles this one depends on',
      },
      fields: [
        {
          name: 'style',
          type: 'relationship',
          relationTo: 'builder-global-styles' as any as any,
          required: true,
          admin: {
            description: 'Required style dependency',
          },
        },
        {
          name: 'loadOrder',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Load order relative to this style',
          },
        },
      ],
    },
    {
      name: 'variables',
      type: 'group',
      admin: {
        description: 'CSS custom properties/variables defined by this style',
      },
      fields: [
        {
          name: 'cssVariables',
          type: 'array',
          admin: {
            description: 'CSS custom properties this style defines',
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: {
                description: 'Variable name (e.g., --primary-color)',
              },
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              admin: {
                description: 'Variable value (e.g., #007bff)',
              },
            },
            {
              name: 'description',
              type: 'text',
              admin: {
                description: 'Description of what this variable controls',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'selectors',
      type: 'group',
      admin: {
        description: 'CSS selectors and rules defined by this style',
      },
      fields: [
        {
          name: 'targetSelectors',
          type: 'array',
          admin: {
            description: 'CSS selectors this style targets',
          },
          fields: [
            {
              name: 'selector',
              type: 'text',
              required: true,
              admin: {
                description: 'CSS selector (e.g., .hero-section, .btn-primary)',
              },
            },
            {
              name: 'description',
              type: 'text',
              admin: {
                description: 'Description of what this selector targets',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'frameworkIntegration',
      type: 'group',
      admin: {
        description: 'Framework-specific integration settings',
      },
      fields: [
        {
          name: 'tailwindConfig',
          type: 'textarea',
          admin: {
            condition: (data: any) => data?.type === 'css',
            description: 'Tailwind CSS configuration overrides',
            rows: 8,
          },
        },
        {
          name: 'bootstrapOverrides',
          type: 'textarea',
          admin: {
            condition: (data: any) => data?.type === 'css',
            description: 'Bootstrap CSS overrides',
            rows: 8,
          },
        },
      ],
    },
    {
      name: 'performance',
      type: 'group',
      admin: {
        description: 'Performance optimization settings',
      },
      fields: [
        {
          name: 'minify',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Whether to minify this CSS',
          },
        },
        {
          name: 'sourceMap',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Generate source maps for debugging',
          },
        },
        {
          name: 'cacheBusting',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Add cache-busting parameters to URL',
          },
        },
      ],
    },
    {
      name: 'testing',
      type: 'group',
      admin: {
        description: 'Testing and validation settings',
      },
      fields: [
        {
          name: 'validateSyntax',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Validate CSS syntax before saving',
          },
        },
        {
          name: 'checkConflicts',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Check for CSS rule conflicts',
          },
        },
        {
          name: 'previewMode',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable preview mode for testing styles',
          },
        },
      ],
    },
    {
      name: 'categories',
      type: 'array',
      admin: {
        description: 'Categories for organizing global styles',
      },
      fields: [
        {
          name: 'category',
          type: 'text',
          required: true,
          admin: {
            description: 'Category name (e.g., "Typography", "Layout", "Components")',
          },
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Tags for searching and filtering',
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

        return data;
      },
    ],
  },
  timestamps: true,
});
