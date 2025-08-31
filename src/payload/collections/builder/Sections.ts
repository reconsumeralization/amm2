// src/payload/collections/BuilderSections.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const Sections: CollectionConfig = withDefaultHooks({
  slug: 'builder-sections',
  admin: {
    useAsTitle: 'name',
    group: 'Visual Builder',
    description: 'Logical sections of a page (header, footer, feature section, hero, etc.)',
    defaultColumns: ['name', 'type', 'order', 'isActive', 'createdAt'],
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
        description: 'Section name for admin reference',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of this section',
        rows: 2,
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Header', value: 'header' },
        { label: 'Hero', value: 'hero' },
        { label: 'Features', value: 'features' },
        { label: 'Content', value: 'content' },
        { label: 'Gallery', value: 'gallery' },
        { label: 'Testimonials', value: 'testimonials' },
        { label: 'CTA', value: 'cta' },
        { label: 'Footer', value: 'footer' },
        { label: 'Sidebar', value: 'sidebar' },
        { label: 'Custom', value: 'custom' },
      ],
      required: true,
      admin: {
        description: 'Type of section',
      },
    },
    {
      name: 'blocks',
      type: 'relationship',
      relationTo: 'builder-blocks' as any as any,
      hasMany: true,
      admin: {
        description: 'Blocks that make up this section',
      },
    },
    {
      name: 'layout',
      type: 'relationship',
      relationTo: 'builder-layouts' as any as any,
      admin: {
        description: 'Layout used for this section',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order (lower numbers appear first)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this section is active',
      },
    },
    {
      name: 'isFullWidth',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this section spans the full width',
      },
    },
    {
      name: 'backgroundColor',
      type: 'text',
      admin: {
        description: 'Background color (hex, rgb, or CSS color name)',
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media' as any as any,
      admin: {
        description: 'Background image for this section',
      },
    },
    {
      name: 'padding',
      type: 'group',
      admin: {
        description: 'Padding settings for this section',
      },
      fields: [
        {
          name: 'top',
          type: 'text',
          admin: {
            description: 'Top padding (e.g., 2rem, 20px)',
          },
        },
        {
          name: 'right',
          type: 'text',
          admin: {
            description: 'Right padding',
          },
        },
        {
          name: 'bottom',
          type: 'text',
          admin: {
            description: 'Bottom padding',
          },
        },
        {
          name: 'left',
          type: 'text',
          admin: {
            description: 'Left padding',
          },
        },
      ],
    },
    {
      name: 'margin',
      type: 'group',
      admin: {
        description: 'Margin settings for this section',
      },
      fields: [
        {
          name: 'top',
          type: 'text',
          admin: {
            description: 'Top margin',
          },
        },
        {
          name: 'bottom',
          type: 'text',
          admin: {
            description: 'Bottom margin',
          },
        },
      ],
    },
    {
      name: 'animation',
      type: 'relationship',
      relationTo: 'builder-animations' as any as any,
      admin: {
        description: 'Animation applied to this section',
      },
    },
    {
      name: 'conditionalRules',
      type: 'relationship',
      relationTo: 'builder-conditional-rules' as any as any,
      hasMany: true,
      admin: {
        description: 'Conditional rules that affect this section',
      },
    },
    {
      name: 'reusableComponent',
      type: 'relationship',
      relationTo: 'builder-reusable-components' as any as any,
      admin: {
        description: 'Reusable component to use for this section',
      },
    },
    {
      name: 'customClasses',
      type: 'text',
      admin: {
        description: 'Custom CSS classes to apply',
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
