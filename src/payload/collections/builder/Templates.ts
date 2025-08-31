// src/payload/collections/BuilderTemplates.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const Templates: CollectionConfig = withDefaultHooks({
  slug: 'builder-templates',
  admin: {
    useAsTitle: 'name',
    group: 'Visual Builder',
    description: 'Reusable page templates that combine sections, layouts, and blocks',
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
        description: 'Template name for admin reference',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what this template is for',
        rows: 3,
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Landing Page', value: 'landing' },
        { label: 'About Page', value: 'about' },
        { label: 'Contact Page', value: 'contact' },
        { label: 'Service Page', value: 'service' },
        { label: 'Product Page', value: 'product' },
        { label: 'Blog Page', value: 'blog' },
        { label: 'Portfolio', value: 'portfolio' },
        { label: 'Custom', value: 'custom' },
      ],
      admin: {
        description: 'Template category for organization',
      },
    },
    {
      name: 'previewImage',
      type: 'upload',
      relationTo: 'media' as any as any,
      admin: {
        description: 'Preview image showing how this template looks',
      },
    },
    {
      name: 'sections',
      type: 'relationship',
      relationTo: 'builder-sections' as any as any,
      hasMany: true,
      admin: {
        description: 'Sections that make up this template',
      },
    },
    {
      name: 'defaultLayout',
      type: 'relationship',
      relationTo: 'builder-layouts' as any as any,
      admin: {
        description: 'Default layout for this template',
      },
    },
    {
      name: 'defaultTheme',
      type: 'relationship',
      relationTo: 'builder-themes' as any as any,
      admin: {
        description: 'Default theme for this template',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this template is available for use',
      },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this is the default template for its category',
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of pages using this template',
        readOnly: true,
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Tags for organizing templates',
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
      name: 'defaultBlocks',
      type: 'array',
      admin: {
        description: 'Default blocks to include in new pages created from this template',
      },
      fields: [
        {
          name: 'section',
          type: 'relationship',
          relationTo: 'builder-sections' as any as any,
          required: true,
          admin: {
            description: 'Section to add this block to',
          },
        },
        {
          name: 'block',
          type: 'relationship',
          relationTo: 'builder-blocks' as any as any,
          required: true,
          admin: {
            description: 'Block to include',
          },
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Display order within the section',
          },
        },
      ],
    },
    {
      name: 'seoDefaults',
      type: 'group',
      admin: {
        description: 'Default SEO settings for pages created from this template',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: {
            description: 'Default meta title template',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: {
            description: 'Default meta description template',
          },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          admin: {
            description: 'Default canonical URL template',
          },
        },
      ],
    },
    {
      name: 'customCss',
      type: 'textarea',
      admin: {
        description: 'Custom CSS applied to pages using this template',
        rows: 6,
      },
    },
    {
      name: 'customJs',
      type: 'textarea',
      admin: {
        description: 'Custom JavaScript applied to pages using this template',
        rows: 6,
      },
    },
    {
      name: 'responsiveSettings',
      type: 'group',
      admin: {
        description: 'Default responsive behavior settings',
      },
      fields: [
        {
          name: 'mobileLayout',
          type: 'relationship',
          relationTo: 'builder-layouts' as any as any,
          admin: {
            description: 'Layout to use on mobile devices',
          },
        },
        {
          name: 'tabletLayout',
          type: 'relationship',
          relationTo: 'builder-layouts' as any as any,
          admin: {
            description: 'Layout to use on tablet devices',
          },
        },
        {
          name: 'desktopLayout',
          type: 'relationship',
          relationTo: 'builder-layouts' as any as any,
          admin: {
            description: 'Layout to use on desktop devices',
          },
        },
      ],
    },
    {
      name: 'pages',
      type: 'relationship',
      relationTo: 'builder-pages' as any as any,
      hasMany: true,
      admin: {
        description: 'Pages that use this template',
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

        return data;
      },
    ],
  },
  timestamps: true,
});
