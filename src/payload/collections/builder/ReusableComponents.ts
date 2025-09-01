// src/payload/collections/BuilderReusableComponents.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';
import { withLexicalEditor } from '../../../payload/utils/withLexicalEditor';

export const ReusableComponents: CollectionConfig = withLexicalEditor(withDefaultHooks({
  slug: 'builder-reusable-components',
  admin: {
    useAsTitle: 'name',
    group: 'Visual Builder',
    description: 'Blocks reused across multiple pages (CTA, banners, cards)',
    defaultColumns: ['name', 'type', 'usageCount', 'isActive', 'createdAt'],
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
        description: 'Component name for admin reference',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of this reusable component',
        rows: 2,
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Call to Action', value: 'cta' },
        { label: 'Banner', value: 'banner' },
        { label: 'Card', value: 'card' },
        { label: 'Hero Section', value: 'hero' },
        { label: 'Testimonial', value: 'testimonial' },
        { label: 'Form', value: 'form' },
        { label: 'Gallery', value: 'gallery' },
        { label: 'Pricing', value: 'pricing' },
        { label: 'Social Proof', value: 'social-proof' },
        { label: 'Newsletter Signup', value: 'newsletter' },
        { label: 'Footer', value: 'footer' },
        { label: 'Header', value: 'header' },
        { label: 'Custom', value: 'custom' },
      ],
      required: true,
      admin: {
        description: 'Type of reusable component',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Marketing', value: 'marketing' },
        { label: 'Content', value: 'content' },
        { label: 'Navigation', value: 'navigation' },
        { label: 'Conversion', value: 'conversion' },
        { label: 'Social', value: 'social' },
        { label: 'Utility', value: 'utility' },
        { label: 'Custom', value: 'custom' },
      ],
      admin: {
        description: 'Category for organizing components',
      },
    },
    {
      name: 'previewImage',
      type: 'upload',
      relationTo: 'media' as any as any,
      admin: {
        description: 'Preview image showing how this component looks',
      },
    },
    {
      name: 'content',
      type: 'group',
      admin: {
        description: 'Content configuration for this component',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Component title',
          },
        },
        {
          name: 'subtitle',
          type: 'text',
          admin: {
            description: 'Component subtitle',
          },
        },
        {
          name: 'description',
          type: 'richText',
          admin: {
            description: 'Component description/content',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media' as any as any,
          admin: {
            description: 'Main image for the component',
          },
        },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media' as any as any,
          admin: {
            description: 'Background image',
          },
        },
      ],
    },
    {
      name: 'actions',
      type: 'group',
      admin: {
        description: 'Action buttons/links configuration',
      },
      fields: [
        {
          name: 'primaryAction',
          type: 'group',
          admin: {
            description: 'Primary call-to-action',
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              admin: {
                description: 'Button text',
              },
            },
            {
              name: 'url',
              type: 'text',
              admin: {
                description: 'Button URL',
              },
            },
            {
              name: 'style',
              type: 'select',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Outline', value: 'outline' },
                { label: 'Link', value: 'link' },
              ],
              defaultValue: 'primary',
            },
          ],
        },
        {
          name: 'secondaryAction',
          type: 'group',
          admin: {
            description: 'Secondary action',
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              admin: {
                description: 'Button text',
              },
            },
            {
              name: 'url',
              type: 'text',
              admin: {
                description: 'Button URL',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'styling',
      type: 'group',
      admin: {
        description: 'Visual styling configuration',
      },
      fields: [
        {
          name: 'theme',
          type: 'relationship',
          relationTo: 'builder-themes' as any as any,
          admin: {
            description: 'Theme to apply to this component',
          },
        },
        {
          name: 'customCss',
          type: 'textarea',
          admin: {
            description: 'Custom CSS for this component',
            rows: 8,
          },
        },
        {
          name: 'customClasses',
          type: 'text',
          admin: {
            description: 'Custom CSS classes',
          },
        },
      ],
    },
    {
      name: 'layout',
      type: 'relationship',
      relationTo: 'builder-layouts' as any as any,
      admin: {
        description: 'Layout to use for this component',
      },
    },
    {
      name: 'animation',
      type: 'relationship',
      relationTo: 'builder-animations' as any as any,
      admin: {
        description: 'Animation to apply to this component',
      },
    },
    {
      name: 'dynamicData',
      type: 'relationship',
      relationTo: 'builder-dynamic-data' as any as any,
      admin: {
        description: 'Dynamic data source for this component',
      },
    },
    {
      name: 'conditionalRules',
      type: 'relationship',
      relationTo: 'builder-conditional-rules' as any as any,
      hasMany: true,
      admin: {
        description: 'Conditional rules that affect this component',
      },
    },
    {
      name: 'variations',
      type: 'array',
      admin: {
        description: 'Different variations of this component',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Variation name',
          },
        },
        {
          name: 'description',
          type: 'text',
          admin: {
            description: 'Variation description',
          },
        },
        {
          name: 'previewImage',
          type: 'upload',
          relationTo: 'media' as any as any,
          admin: {
            description: 'Preview image for this variation',
          },
        },
        {
          name: 'settings',
          type: 'json',
          admin: {
            description: 'Variation-specific settings',
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this component is available for use',
      },
    },
    {
      name: 'isGlobal',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this component can be used across all tenants',
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of times this component is used',
        readOnly: true,
      },
    },
    {
      name: 'lastUsed',
      type: 'date',
      admin: {
        description: 'Last time this component was used',
        readOnly: true,
      },
    },
    {
      name: 'usedInPages',
      type: 'relationship',
      relationTo: 'builder-pages' as any as any,
      hasMany: true,
      admin: {
        description: 'Pages where this component is used',
        readOnly: true,
      },
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
      name: 'documentation',
      type: 'group',
      admin: {
        description: 'Documentation and usage instructions',
      },
      fields: [
        {
          name: 'usageInstructions',
          type: 'richText',
          admin: {
            description: 'Instructions for using this component',
          },
        },
        {
          name: 'customizationNotes',
          type: 'textarea',
          admin: {
            description: 'Notes about customizing this component',
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

        // Update last used timestamp
        if (operation === 'read' && data.lastUsed) {
          data.lastUsed = new Date().toISOString();
        }

        return data;
      },
    ],
  },
  timestamps: true,
}));
