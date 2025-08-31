// src/payload/collections/BuilderAnimations.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const Animations: CollectionConfig = withDefaultHooks({
  slug: 'builder-animations',
  admin: {
    useAsTitle: 'name',
    group: 'Visual Builder',
    description: 'Store reusable animation presets that can be applied to blocks/sections',
    defaultColumns: ['name', 'type', 'duration', 'isActive', 'createdAt'],
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
        description: 'Animation name for admin reference',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what this animation does',
        rows: 2,
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Fade In', value: 'fade-in' },
        { label: 'Fade Out', value: 'fade-out' },
        { label: 'Slide In', value: 'slide-in' },
        { label: 'Slide Out', value: 'slide-out' },
        { label: 'Scale', value: 'scale' },
        { label: 'Rotate', value: 'rotate' },
        { label: 'Bounce', value: 'bounce' },
        { label: 'Pulse', value: 'pulse' },
        { label: 'Shake', value: 'shake' },
        { label: 'Flip', value: 'flip' },
        { label: 'Custom', value: 'custom' },
      ],
      required: true,
      admin: {
        description: 'Type of animation',
      },
    },
    {
      name: 'duration',
      type: 'text',
      defaultValue: '0.3s',
      admin: {
        description: 'Animation duration (e.g., 0.3s, 500ms)',
      },
    },
    {
      name: 'delay',
      type: 'text',
      defaultValue: '0s',
      admin: {
        description: 'Animation delay before starting (e.g., 0.2s, 200ms)',
      },
    },
    {
      name: 'timingFunction',
      type: 'select',
      options: [
        { label: 'Ease', value: 'ease' },
        { label: 'Ease In', value: 'ease-in' },
        { label: 'Ease Out', value: 'ease-out' },
        { label: 'Ease In Out', value: 'ease-in-out' },
        { label: 'Linear', value: 'linear' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'ease',
      admin: {
        description: 'CSS timing function for the animation',
      },
    },
    {
      name: 'customTimingFunction',
      type: 'text',
      admin: {
        condition: (data: any) => data?.timingFunction === 'custom',
        description: 'Custom cubic-bezier timing function',
      },
    },
    {
      name: 'direction',
      type: 'select',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Reverse', value: 'reverse' },
        { label: 'Alternate', value: 'alternate' },
        { label: 'Alternate Reverse', value: 'alternate-reverse' },
      ],
      defaultValue: 'normal',
      admin: {
        description: 'Animation direction',
      },
    },
    {
      name: 'iterationCount',
      type: 'select',
      options: [
        { label: 'Once', value: '1' },
        { label: 'Twice', value: '2' },
        { label: 'Three Times', value: '3' },
        { label: 'Infinite', value: 'infinite' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: '1',
      admin: {
        description: 'Number of times to repeat the animation',
      },
    },
    {
      name: 'customIterationCount',
      type: 'number',
      min: 1,
      admin: {
        condition: (data: any) => data?.iterationCount === 'custom',
        description: 'Custom iteration count',
      },
    },
    {
      name: 'fillMode',
      type: 'select',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Forwards', value: 'forwards' },
        { label: 'Backwards', value: 'backwards' },
        { label: 'Both', value: 'both' },
      ],
      defaultValue: 'none',
      admin: {
        description: 'Animation fill mode',
      },
    },
    {
      name: 'keyframes',
      type: 'group',
      admin: {
        condition: (data: any) => data?.type === 'custom',
        description: 'Custom keyframe definitions',
      },
      fields: [
        {
          name: 'css',
          type: 'textarea',
          admin: {
            description: 'Custom CSS keyframes definition',
            rows: 15,
          },
        },
        {
          name: 'animationName',
          type: 'text',
          admin: {
            description: 'Custom animation name (must match @keyframes name)',
          },
        },
      ],
    },
    {
      name: 'trigger',
      type: 'group',
      admin: {
        description: 'Animation trigger settings',
      },
      fields: [
        {
          name: 'triggerType',
          type: 'select',
          options: [
            { label: 'On Load', value: 'load' },
            { label: 'On Scroll', value: 'scroll' },
            { label: 'On Hover', value: 'hover' },
            { label: 'On Click', value: 'click' },
            { label: 'Manual', value: 'manual' },
          ],
          defaultValue: 'load',
          admin: {
            description: 'When to trigger the animation',
          },
        },
        {
          name: 'scrollOffset',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            condition: (data: any) => data?.trigger?.triggerType === 'scroll',
            description: 'Scroll offset percentage to trigger animation (0-100)',
          },
        },
        {
          name: 'triggerSelector',
          type: 'text',
          admin: {
            condition: (data: any) => ['hover', 'click'].includes(data?.trigger?.triggerType),
            description: 'CSS selector for trigger element',
          },
        },
      ],
    },
    {
      name: 'responsive',
      type: 'group',
      admin: {
        description: 'Responsive animation settings',
      },
      fields: [
        {
          name: 'disableOnMobile',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Disable animation on mobile devices',
          },
        },
        {
          name: 'disableOnTablet',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Disable animation on tablet devices',
          },
        },
        {
          name: 'mobileDuration',
          type: 'text',
          admin: {
            description: 'Duration on mobile devices',
          },
        },
        {
          name: 'tabletDuration',
          type: 'text',
          admin: {
            description: 'Duration on tablet devices',
          },
        },
      ],
    },
    {
      name: 'preview',
      type: 'group',
      admin: {
        description: 'Animation preview settings',
      },
      fields: [
        {
          name: 'previewElement',
          type: 'select',
          options: [
            { label: 'Button', value: 'button' },
            { label: 'Image', value: 'image' },
            { label: 'Text', value: 'text' },
            { label: 'Card', value: 'card' },
            { label: 'Custom', value: 'custom' },
          ],
          admin: {
            description: 'Element type to preview animation on',
          },
        },
        {
          name: 'previewHtml',
          type: 'textarea',
          admin: {
            condition: (data: any) => data?.preview?.previewElement === 'custom',
            description: 'Custom HTML for animation preview',
            rows: 8,
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this animation is available for use',
      },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this is the default animation',
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of times this animation is used',
        readOnly: true,
      },
    },
    {
      name: 'categories',
      type: 'array',
      admin: {
        description: 'Categories for organizing animations',
      },
      fields: [
        {
          name: 'category',
          type: 'text',
          required: true,
          admin: {
            description: 'Category name (e.g., "Entrance", "Attention", "Exit")',
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
