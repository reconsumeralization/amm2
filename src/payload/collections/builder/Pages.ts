// src/payload/collections/BuilderPages.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const Pages: CollectionConfig = withDefaultHooks({
  slug: 'builder-pages',
  admin: {
    useAsTitle: 'title',
    group: 'Visual Builder',
    description: 'Full pages created in the visual builder',
    defaultColumns: ['title', 'slug', 'status', 'template', 'createdAt'],
    listSearchableFields: ['title', 'slug', 'description'],
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
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Page title displayed in admin',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug for the page',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Page description for SEO and admin reference',
        rows: 3,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        description: 'Publication status of the page',
      },
    },
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'builder-templates' as any as any,
      admin: {
        description: 'Template used to create this page',
      },
    },
    {
      name: 'sections',
      type: 'relationship',
      relationTo: 'builder-sections' as any as any,
      hasMany: true,
      admin: {
        description: 'Sections that make up this page',
      },
    },
    {
      name: 'layout',
      type: 'relationship',
      relationTo: 'builder-layouts' as any as any,
      admin: {
        description: 'Layout used for this page',
      },
    },
    {
      name: 'theme',
      type: 'relationship',
      relationTo: 'builder-themes' as any as any,
      admin: {
        description: 'Theme applied to this page',
      },
    },
    {
      name: 'seo',
      type: 'group',
      admin: {
        description: 'SEO settings for this page',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: {
            description: 'Meta title for SEO',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: {
            description: 'Meta description for SEO',
          },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          admin: {
            description: 'Canonical URL for this page',
          },
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Exclude from search engines',
          },
        },
      ],
    },
    {
      name: 'pageType',
      type: 'select',
      options: [
        { label: 'Landing Page', value: 'landing' },
        { label: 'About Page', value: 'about' },
        { label: 'Contact Page', value: 'contact' },
        { label: 'Service Page', value: 'service' },
        { label: 'Product Page', value: 'product' },
        { label: 'Blog Page', value: 'blog' },
        { label: 'Custom', value: 'custom' },
      ],
      admin: {
        description: 'Type of page for categorization',
      },
    },
    {
      name: 'conditionalRules',
      type: 'relationship',
      relationTo: 'builder-conditional-rules' as any as any,
      hasMany: true,
      admin: {
        description: 'Conditional rules that affect this page',
      },
    },
    {
      name: 'dynamicData',
      type: 'relationship',
      relationTo: 'builder-dynamic-data' as any as any,
      hasMany: true,
      admin: {
        description: 'Dynamic data sources for this page',
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
