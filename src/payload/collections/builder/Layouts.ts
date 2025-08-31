// src/payload/collections/BuilderLayouts.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const Layouts: CollectionConfig = withDefaultHooks({
  slug: 'builder-layouts',
  admin: {
    useAsTitle: 'name',
    group: 'Visual Builder',
    description: 'Pre-defined row/grid/flex layouts for arranging blocks',
    defaultColumns: ['name', 'type', 'columns', 'isActive', 'createdAt'],
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
        description: 'Layout name for admin reference',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of this layout',
        rows: 2,
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Flexbox', value: 'flex' },
        { label: 'CSS Grid', value: 'css-grid' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'grid',
      required: true,
      admin: {
        description: 'Layout system type',
      },
    },
    {
      name: 'columns',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 12,
      admin: {
        description: 'Number of columns (for grid layouts)',
        condition: (data: any) => data?.type === 'grid',
      },
    },
    {
      name: 'gridSettings',
      type: 'group',
      admin: {
        condition: (data: any) => data?.type === 'grid' || data?.type === 'css-grid',
        description: 'Grid-specific settings',
      },
      fields: [
        {
          name: 'gap',
          type: 'text',
          defaultValue: '1rem',
          admin: {
            description: 'Gap between grid items',
          },
        },
        {
          name: 'justifyItems',
          type: 'select',
          options: [
            { label: 'Start', value: 'start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'end' },
            { label: 'Stretch', value: 'stretch' },
          ],
          defaultValue: 'stretch',
        },
        {
          name: 'alignItems',
          type: 'select',
          options: [
            { label: 'Start', value: 'start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'end' },
            { label: 'Stretch', value: 'stretch' },
          ],
          defaultValue: 'stretch',
        },
      ],
    },
    {
      name: 'flexSettings',
      type: 'group',
      admin: {
        condition: (data: any) => data?.type === 'flex',
        description: 'Flexbox-specific settings',
      },
      fields: [
        {
          name: 'direction',
          type: 'select',
          options: [
            { label: 'Row', value: 'row' },
            { label: 'Column', value: 'column' },
            { label: 'Row Reverse', value: 'row-reverse' },
            { label: 'Column Reverse', value: 'column-reverse' },
          ],
          defaultValue: 'row',
        },
        {
          name: 'justifyContent',
          type: 'select',
          options: [
            { label: 'Start', value: 'flex-start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'flex-end' },
            { label: 'Space Between', value: 'space-between' },
            { label: 'Space Around', value: 'space-around' },
            { label: 'Space Evenly', value: 'space-evenly' },
          ],
          defaultValue: 'flex-start',
        },
        {
          name: 'alignItems',
          type: 'select',
          options: [
            { label: 'Start', value: 'flex-start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'flex-end' },
            { label: 'Stretch', value: 'stretch' },
            { label: 'Baseline', value: 'baseline' },
          ],
          defaultValue: 'stretch',
        },
        {
          name: 'wrap',
          type: 'select',
          options: [
            { label: 'No Wrap', value: 'nowrap' },
            { label: 'Wrap', value: 'wrap' },
            { label: 'Wrap Reverse', value: 'wrap-reverse' },
          ],
          defaultValue: 'nowrap',
        },
      ],
    },
    {
      name: 'cssGridSettings',
      type: 'group',
      admin: {
        condition: (data: any) => data?.type === 'css-grid',
        description: 'CSS Grid-specific settings',
      },
      fields: [
        {
          name: 'gridTemplateColumns',
          type: 'text',
          admin: {
            description: 'CSS grid-template-columns value (e.g., "1fr 2fr", "repeat(3, 1fr)")',
          },
        },
        {
          name: 'gridTemplateRows',
          type: 'text',
          admin: {
            description: 'CSS grid-template-rows value',
          },
        },
        {
          name: 'gridGap',
          type: 'text',
          defaultValue: '1rem',
          admin: {
            description: 'CSS grid-gap value',
          },
        },
        {
          name: 'justifyItems',
          type: 'select',
          options: [
            { label: 'Start', value: 'start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'end' },
            { label: 'Stretch', value: 'stretch' },
          ],
          defaultValue: 'stretch',
        },
        {
          name: 'alignItems',
          type: 'select',
          options: [
            { label: 'Start', value: 'start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'end' },
            { label: 'Stretch', value: 'stretch' },
          ],
          defaultValue: 'stretch',
        },
      ],
    },
    {
      name: 'customCss',
      type: 'textarea',
      admin: {
        condition: (data: any) => data?.type === 'custom',
        description: 'Custom CSS for this layout',
        rows: 6,
      },
    },
    {
      name: 'previewImage',
      type: 'upload',
      relationTo: 'media' as any as any,
      admin: {
        description: 'Preview image showing how this layout looks',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this layout is available for use',
      },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this is the default layout',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Hero', value: 'hero' },
        { label: 'Content', value: 'content' },
        { label: 'Gallery', value: 'gallery' },
        { label: 'Footer', value: 'footer' },
        { label: 'Sidebar', value: 'sidebar' },
        { label: 'Custom', value: 'custom' },
      ],
      admin: {
        description: 'Layout category for organization',
      },
    },
    {
      name: 'responsive',
      type: 'group',
      admin: {
        description: 'Responsive behavior settings',
      },
      fields: [
        {
          name: 'mobileColumns',
          type: 'number',
          min: 1,
          max: 12,
          admin: {
            description: 'Number of columns on mobile',
          },
        },
        {
          name: 'tabletColumns',
          type: 'number',
          min: 1,
          max: 12,
          admin: {
            description: 'Number of columns on tablet',
          },
        },
        {
          name: 'desktopColumns',
          type: 'number',
          min: 1,
          max: 12,
          admin: {
            description: 'Number of columns on desktop',
          },
        },
        {
          name: 'mobileDirection',
          type: 'select',
          options: [
            { label: 'Row', value: 'row' },
            { label: 'Column', value: 'column' },
          ],
          admin: {
            description: 'Flex direction on mobile',
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
