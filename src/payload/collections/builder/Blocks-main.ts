import { CollectionConfig } from 'payload/types'

const Blocks: CollectionConfig = {
  slug: 'blocks',
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
        { label: 'Text', value: 'text' },
        { label: 'Image', value: 'image' },
        { label: 'Gallery', value: 'gallery' },
        { label: 'Video', value: 'video' },
        { label: 'CTA', value: 'cta' },
        { label: 'Testimonials', value: 'testimonials' },
        { label: 'Contact Form', value: 'contact-form' },
        { label: 'Pricing', value: 'pricing' },
        { label: 'Features', value: 'features' },
        { label: 'Team', value: 'team' },
        { label: 'FAQ', value: 'faq' },
        { label: 'Stats', value: 'stats' }
      ]
    },
    {
      name: 'content',
      type: 'json',
      required: true
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
      name: 'isReusable',
      type: 'checkbox',
      defaultValue: false,
      label: 'Reusable Block'
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Layout', value: 'layout' },
        { label: 'Content', value: 'content' },
        { label: 'Media', value: 'media' },
        { label: 'Interactive', value: 'interactive' },
        { label: 'Commerce', value: 'commerce' }
      ]
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text'
        }
      ]
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media'
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
      name: 'lastModified',
      type: 'date',
      defaultValue: () => new Date()
    }
  ]
}

export { Blocks }
