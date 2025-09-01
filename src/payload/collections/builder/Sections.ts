import { CollectionConfig } from 'payload/types'

const Sections: CollectionConfig = {
  slug: 'sections',
  admin: {
    useAsTitle: 'name',
    group: 'Builder'
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'editor',
    delete: ({ req }) => req.user?.role === 'admin'
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true
    },
    {
      name: 'description',
      type: 'textarea'
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Hero', value: 'hero' },
        { label: 'Content', value: 'content' },
        { label: 'Gallery', value: 'gallery' },
        { label: 'Testimonials', value: 'testimonials' },
        { label: 'Contact', value: 'contact' },
        { label: 'Pricing', value: 'pricing' },
        { label: 'Features', value: 'features' },
        { label: 'Team', value: 'team' },
        { label: 'FAQ', value: 'faq' },
        { label: 'Stats', value: 'stats' },
        { label: 'Custom', value: 'custom' }
      ]
    },
    {
      name: 'layout',
      type: 'relationship',
      relationTo: 'layouts'
    },
    {
      name: 'blocks',
      type: 'array',
      label: 'Section Blocks',
      fields: [
        {
          name: 'block',
          type: 'relationship',
          relationTo: 'blocks',
          required: true
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0
        },
        {
          name: 'settings',
          type: 'json'
        },
        {
          name: 'conditions',
          type: 'json',
          label: 'Display Conditions'
        }
      ]
    },
    {
      name: 'content',
      type: 'json'
    },
    {
      name: 'settings',
      type: 'json'
    },
    {
      name: 'styles',
      type: 'json'
    },
    {
      name: 'background',
      type: 'group',
      label: 'Background Settings',
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'color',
          options: [
            { label: 'Color', value: 'color' },
            { label: 'Image', value: 'image' },
            { label: 'Gradient', value: 'gradient' },
            { label: 'Video', value: 'video' }
          ]
        },
        {
          name: 'color',
          type: 'text',
          admin: {
            condition: (data) => data?.background?.type === 'color'
          }
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (data) => data?.background?.type === 'image'
          }
        },
        {
          name: 'gradient',
          type: 'json',
          admin: {
            condition: (data) => data?.background?.type === 'gradient'
          }
        },
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (data) => data?.background?.type === 'video'
          }
        }
      ]
    },
    {
      name: 'spacing',
      type: 'json',
      label: 'Spacing Configuration'
    },
    {
      name: 'animations',
      type: 'array',
      label: 'Section Animations',
      fields: [
        {
          name: 'animation',
          type: 'relationship',
          relationTo: 'animations'
        },
        {
          name: 'trigger',
          type: 'select',
          defaultValue: 'scroll',
          options: [
            { label: 'On Scroll', value: 'scroll' },
            { label: 'On Load', value: 'load' },
            { label: 'On Hover', value: 'hover' },
            { label: 'On Click', value: 'click' }
          ]
        },
        {
          name: 'delay',
          type: 'number',
          defaultValue: 0,
          min: 0
        }
      ]
    },
    {
      name: 'isReusable',
      type: 'checkbox',
      defaultValue: false,
      label: 'Reusable Section'
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true
    },
    {
      name: 'version',
      type: 'text',
      defaultValue: '1.0.0'
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Section Preview'
    }
  ]
}

export { Sections }
