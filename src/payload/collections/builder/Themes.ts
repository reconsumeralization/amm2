// src/payload/collections/BuilderThemes.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const Themes: CollectionConfig = withDefaultHooks({
  slug: 'builder-themes',
  admin: {
    useAsTitle: 'name',
    group: 'Visual Builder',
    description: 'Define global styles like colors, fonts, spacing for the visual builder',
    defaultColumns: ['name', 'category', 'isActive', 'usageCount', 'createdAt'],
    listSearchableFields: ['name', 'description', 'category'],
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
        description: 'Theme name for admin reference',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of this theme',
        rows: 2,
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Business', value: 'business' },
        { label: 'Creative', value: 'creative' },
        { label: 'Minimal', value: 'minimal' },
        { label: 'Bold', value: 'bold' },
        { label: 'Elegant', value: 'elegant' },
        { label: 'Modern', value: 'modern' },
        { label: 'Custom', value: 'custom' },
      ],
      admin: {
        description: 'Theme category for organization',
      },
    },
    {
      name: 'colors',
      type: 'group',
      admin: {
        description: 'Color palette for the theme',
      },
      fields: [
        {
          name: 'primary',
          type: 'text',
          admin: {
            description: 'Primary brand color (hex, rgb, or color name)',
          },
        },
        {
          name: 'secondary',
          type: 'text',
          admin: {
            description: 'Secondary color',
          },
        },
        {
          name: 'accent',
          type: 'text',
          admin: {
            description: 'Accent color for highlights',
          },
        },
        {
          name: 'text',
          type: 'text',
          admin: {
            description: 'Primary text color',
          },
        },
        {
          name: 'textLight',
          type: 'text',
          admin: {
            description: 'Light text color for muted text',
          },
        },
        {
          name: 'background',
          type: 'text',
          admin: {
            description: 'Background color',
          },
        },
        {
          name: 'backgroundSecondary',
          type: 'text',
          admin: {
            description: 'Secondary background color',
          },
        },
        {
          name: 'border',
          type: 'text',
          admin: {
            description: 'Border color',
          },
        },
        {
          name: 'success',
          type: 'text',
          admin: {
            description: 'Success state color',
          },
        },
        {
          name: 'warning',
          type: 'text',
          admin: {
            description: 'Warning state color',
          },
        },
        {
          name: 'error',
          type: 'text',
          admin: {
            description: 'Error state color',
          },
        },
      ],
    },
    {
      name: 'typography',
      type: 'group',
      admin: {
        description: 'Typography settings',
      },
      fields: [
        {
          name: 'fontFamily',
          type: 'text',
          admin: {
            description: 'Primary font family (CSS font-family value)',
          },
        },
        {
          name: 'fontFamilyHeading',
          type: 'text',
          admin: {
            description: 'Heading font family',
          },
        },
        {
          name: 'fontSize',
          type: 'group',
          admin: {
            description: 'Font sizes for different text elements',
          },
          fields: [
            { name: 'xs', type: 'text', admin: { description: 'Extra small (e.g., 0.75rem)' } },
            { name: 'sm', type: 'text', admin: { description: 'Small (e.g., 0.875rem)' } },
            { name: 'base', type: 'text', admin: { description: 'Base (e.g., 1rem)' } },
            { name: 'lg', type: 'text', admin: { description: 'Large (e.g., 1.125rem)' } },
            { name: 'xl', type: 'text', admin: { description: 'Extra large (e.g., 1.25rem)' } },
            { name: '2xl', type: 'text', admin: { description: '2X large (e.g., 1.5rem)' } },
            { name: '3xl', type: 'text', admin: { description: '3X large (e.g., 1.875rem)' } },
            { name: '4xl', type: 'text', admin: { description: '4X large (e.g., 2.25rem)' } },
          ],
        },
        {
          name: 'fontWeight',
          type: 'group',
          admin: {
            description: 'Font weights for different text elements',
          },
          fields: [
            { name: 'light', type: 'text', admin: { description: 'Light weight (e.g., 300)' } },
            { name: 'normal', type: 'text', admin: { description: 'Normal weight (e.g., 400)' } },
            { name: 'medium', type: 'text', admin: { description: 'Medium weight (e.g., 500)' } },
            { name: 'semibold', type: 'text', admin: { description: 'Semibold weight (e.g., 600)' } },
            { name: 'bold', type: 'text', admin: { description: 'Bold weight (e.g., 700)' } },
          ],
        },
        {
          name: 'lineHeight',
          type: 'group',
          admin: {
            description: 'Line heights for different text elements',
          },
          fields: [
            { name: 'tight', type: 'text', admin: { description: 'Tight line height (e.g., 1.25)' } },
            { name: 'normal', type: 'text', admin: { description: 'Normal line height (e.g., 1.5)' } },
            { name: 'relaxed', type: 'text', admin: { description: 'Relaxed line height (e.g., 1.75)' } },
          ],
        },
      ],
    },
    {
      name: 'spacing',
      type: 'group',
      admin: {
        description: 'Spacing and sizing values',
      },
      fields: [
        {
          name: 'spacing',
          type: 'group',
          admin: {
            description: 'Spacing scale values',
          },
          fields: [
            { name: '1', type: 'text', admin: { description: 'Spacing 1 (e.g., 0.25rem)' } },
            { name: '2', type: 'text', admin: { description: 'Spacing 2 (e.g., 0.5rem)' } },
            { name: '3', type: 'text', admin: { description: 'Spacing 3 (e.g., 0.75rem)' } },
            { name: '4', type: 'text', admin: { description: 'Spacing 4 (e.g., 1rem)' } },
            { name: '5', type: 'text', admin: { description: 'Spacing 5 (e.g., 1.25rem)' } },
            { name: '6', type: 'text', admin: { description: 'Spacing 6 (e.g., 1.5rem)' } },
            { name: '8', type: 'text', admin: { description: 'Spacing 8 (e.g., 2rem)' } },
            { name: '10', type: 'text', admin: { description: 'Spacing 10 (e.g., 2.5rem)' } },
            { name: '12', type: 'text', admin: { description: 'Spacing 12 (e.g., 3rem)' } },
            { name: '16', type: 'text', admin: { description: 'Spacing 16 (e.g., 4rem)' } },
            { name: '20', type: 'text', admin: { description: 'Spacing 20 (e.g., 5rem)' } },
            { name: '24', type: 'text', admin: { description: 'Spacing 24 (e.g., 6rem)' } },
          ],
        },
        {
          name: 'borderRadius',
          type: 'group',
          admin: {
            description: 'Border radius values',
          },
          fields: [
            { name: 'none', type: 'text', admin: { description: 'No radius (e.g., 0)' } },
            { name: 'sm', type: 'text', admin: { description: 'Small radius (e.g., 0.125rem)' } },
            { name: 'md', type: 'text', admin: { description: 'Medium radius (e.g., 0.375rem)' } },
            { name: 'lg', type: 'text', admin: { description: 'Large radius (e.g., 0.5rem)' } },
            { name: 'xl', type: 'text', admin: { description: 'Extra large radius (e.g., 0.75rem)' } },
            { name: '2xl', type: 'text', admin: { description: '2X large radius (e.g., 1rem)' } },
            { name: 'full', type: 'text', admin: { description: 'Full radius (e.g., 9999px)' } },
          ],
        },
      ],
    },
    {
      name: 'shadows',
      type: 'group',
      admin: {
        description: 'Box shadow definitions',
      },
      fields: [
        {
          name: 'sm',
          type: 'text',
          admin: {
            description: 'Small shadow (CSS box-shadow value)',
          },
        },
        {
          name: 'md',
          type: 'text',
          admin: {
            description: 'Medium shadow',
          },
        },
        {
          name: 'lg',
          type: 'text',
          admin: {
            description: 'Large shadow',
          },
        },
        {
          name: 'xl',
          type: 'text',
          admin: {
            description: 'Extra large shadow',
          },
        },
      ],
    },
    {
      name: 'buttons',
      type: 'group',
      admin: {
        description: 'Button style definitions',
      },
      fields: [
        {
          name: 'primary',
          type: 'group',
          admin: {
            description: 'Primary button styles',
          },
          fields: [
            {
              name: 'backgroundColor',
              type: 'text',
              admin: {
                description: 'Background color',
              },
            },
            {
              name: 'textColor',
              type: 'text',
              admin: {
                description: 'Text color',
              },
            },
            {
              name: 'borderRadius',
              type: 'text',
              admin: {
                description: 'Border radius',
              },
            },
            {
              name: 'padding',
              type: 'text',
              admin: {
                description: 'Padding (CSS padding value)',
              },
            },
          ],
        },
        {
          name: 'secondary',
          type: 'group',
          admin: {
            description: 'Secondary button styles',
          },
          fields: [
            {
              name: 'backgroundColor',
              type: 'text',
              admin: {
                description: 'Background color',
              },
            },
            {
              name: 'textColor',
              type: 'text',
              admin: {
                description: 'Text color',
              },
            },
            {
              name: 'borderRadius',
              type: 'text',
              admin: {
                description: 'Border radius',
              },
            },
            {
              name: 'padding',
              type: 'text',
              admin: {
                description: 'Padding (CSS padding value)',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'previewImage',
      type: 'upload',
      relationTo: 'media' as any as any,
      admin: {
        description: 'Preview image showing how this theme looks',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this theme is available for use',
      },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this is the default theme',
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of pages using this theme',
        readOnly: true,
      },
    },
    {
      name: 'customCss',
      type: 'textarea',
      admin: {
        description: 'Custom CSS to include with this theme',
        rows: 10,
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

        return data;
      },
    ],
  },
  timestamps: true,
});
