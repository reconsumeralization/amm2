// src/payload/collections/BuilderBlocks.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';
import { withLexicalEditor } from '../../../payload/utils/withLexicalEditor';

export const Blocks: CollectionConfig = withLexicalEditor(withDefaultHooks({
  slug: 'builder-blocks',
  admin: {
    useAsTitle: 'name',
    group: 'Visual Builder',
    description: 'Individual blocks/components (text, image, gallery, CTA, forms, products, etc.)',
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
        description: 'Block name for admin reference',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of this block',
        rows: 2,
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Image', value: 'image' },
        { label: 'Gallery', value: 'gallery' },
        { label: 'Video', value: 'video' },
        { label: 'CTA Button', value: 'cta' },
        { label: 'Form', value: 'form' },
        { label: 'Products', value: 'products' },
        { label: 'Blog Posts', value: 'blog_posts' },
        { label: 'Testimonials', value: 'testimonials' },
        { label: 'Events', value: 'events' },
        { label: 'Services', value: 'services' },
        { label: 'Team Members', value: 'team' },
        { label: 'Contact Info', value: 'contact' },
        { label: 'Social Links', value: 'social' },
        { label: 'Map', value: 'map' },
        { label: 'Custom HTML', value: 'html' },
        { label: 'Dynamic Content', value: 'dynamic' },
      ],
      required: true,
      admin: {
        description: 'Type of block component',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order within section (lower numbers appear first)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this block is active',
      },
    },
    {
      name: 'content',
      type: 'group',
      admin: {
        description: 'Content configuration based on block type',
      },
      fields: [
        {
          name: 'text',
          type: 'richText',
          admin: {
            condition: (data: any) => data?.type === 'text',
            description: 'Rich text content',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media' as any as any,
          admin: {
            condition: (data: any) => data?.type === 'image',
            description: 'Image file',
          },
        },
        {
          name: 'images',
          type: 'upload',
          relationTo: 'media' as any as any,
          hasMany: true,
          admin: {
            condition: (data: any) => data?.type === 'gallery',
            description: 'Gallery images',
          },
        },
        {
          name: 'videoUrl',
          type: 'text',
          admin: {
            condition: (data: any) => data?.type === 'video',
            description: 'Video URL (YouTube, Vimeo, etc.)',
          },
        },
        {
          name: 'ctaButton',
          type: 'group',
          admin: {
            condition: (data: any) => data?.type === 'cta',
            description: 'Call-to-action button settings',
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
              admin: {
                description: 'Button text',
              },
            },
            {
              name: 'url',
              type: 'text',
              required: true,
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
              ],
              defaultValue: 'primary',
            },
            {
              name: 'size',
              type: 'select',
              options: [
                { label: 'Small', value: 'small' },
                { label: 'Medium', value: 'medium' },
                { label: 'Large', value: 'large' },
              ],
              defaultValue: 'medium',
            },
          ],
        },
        {
          name: 'form',
          type: 'relationship',
          relationTo: 'forms' as any as any,
          admin: {
            condition: (data: any) => data?.type === 'form',
            description: 'Form to embed',
          },
        },
        {
          name: 'dynamicData',
          type: 'relationship',
          relationTo: 'builder-dynamic-data' as any as any,
          admin: {
            condition: (data: any) => ['products', 'blog_posts', 'testimonials', 'events', 'services', 'team', 'dynamic'].includes(data?.type),
            description: 'Dynamic data source',
          },
        },
        {
          name: 'customHtml',
          type: 'textarea',
          admin: {
            condition: (data: any) => data?.type === 'html',
            description: 'Custom HTML content',
          },
        },
      ],
    },
    {
      name: 'styling',
      type: 'group',
      admin: {
        description: 'Visual styling for this block',
      },
      fields: [
        {
          name: 'width',
          type: 'select',
          options: [
            { label: 'Full Width', value: 'full' },
            { label: 'Half Width', value: 'half' },
            { label: 'Third Width', value: 'third' },
            { label: 'Quarter Width', value: 'quarter' },
            { label: 'Auto', value: 'auto' },
          ],
          defaultValue: 'full',
        },
        {
          name: 'alignment',
          type: 'select',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
          defaultValue: 'left',
        },
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
            description: 'Border radius (e.g., 4px, 50%)',
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
      name: 'spacing',
      type: 'group',
      admin: {
        description: 'Spacing settings',
      },
      fields: [
        {
          name: 'margin',
          type: 'group',
          fields: [
            { name: 'top', type: 'text', admin: { description: 'Top margin' } },
            { name: 'right', type: 'text', admin: { description: 'Right margin' } },
            { name: 'bottom', type: 'text', admin: { description: 'Bottom margin' } },
            { name: 'left', type: 'text', admin: { description: 'Left margin' } },
          ],
        },
        {
          name: 'padding',
          type: 'group',
          fields: [
            { name: 'top', type: 'text', admin: { description: 'Top padding' } },
            { name: 'right', type: 'text', admin: { description: 'Right padding' } },
            { name: 'bottom', type: 'text', admin: { description: 'Bottom padding' } },
            { name: 'left', type: 'text', admin: { description: 'Left padding' } },
          ],
        },
      ],
    },
    {
      name: 'animation',
      type: 'relationship',
      relationTo: 'builder-animations' as any as any,
      admin: {
        description: 'Animation applied to this block',
      },
    },
    {
      name: 'conditionalRules',
      type: 'relationship',
      relationTo: 'builder-conditional-rules' as any as any,
      hasMany: true,
      admin: {
        description: 'Conditional rules that affect this block',
      },
    },
    {
      name: 'reusableComponent',
      type: 'relationship',
      relationTo: 'builder-reusable-components' as any as any,
      admin: {
        description: 'Reusable component to use for this block',
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
}));
