import { CollectionConfig } from 'payload/types'

const SEO: CollectionConfig = {
  slug: 'seo',
  admin: {
    useAsTitle: 'title',
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
      name: 'title',
      type: 'text',
      required: true,
      label: 'SEO Title'
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Meta Description'
    },
    {
      name: 'keywords',
      type: 'text',
      label: 'Meta Keywords'
    },
    {
      name: 'canonical',
      type: 'text',
      label: 'Canonical URL'
    },
    {
      name: 'robots',
      type: 'select',
      defaultValue: 'index,follow',
      options: [
        { label: 'Index, Follow', value: 'index,follow' },
        { label: 'Index, No Follow', value: 'index,nofollow' },
        { label: 'No Index, Follow', value: 'noindex,follow' },
        { label: 'No Index, No Follow', value: 'noindex,nofollow' }
      ]
    },
    {
      name: 'openGraph',
      type: 'group',
      label: 'Open Graph',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'OG Title'
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'OG Description'
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'OG Image'
        },
        {
          name: 'type',
          type: 'select',
          defaultValue: 'website',
          options: [
            { label: 'Website', value: 'website' },
            { label: 'Article', value: 'article' },
            { label: 'Product', value: 'product' },
            { label: 'Profile', value: 'profile' }
          ]
        }
      ]
    },
    {
      name: 'twitter',
      type: 'group',
      label: 'Twitter Card',
      fields: [
        {
          name: 'card',
          type: 'select',
          defaultValue: 'summary_large_image',
          options: [
            { label: 'Summary', value: 'summary' },
            { label: 'Summary Large Image', value: 'summary_large_image' },
            { label: 'App', value: 'app' },
            { label: 'Player', value: 'player' }
          ]
        },
        {
          name: 'title',
          type: 'text',
          label: 'Twitter Title'
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Twitter Description'
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Twitter Image'
        },
        {
          name: 'site',
          type: 'text',
          label: 'Twitter Site (@username)'
        },
        {
          name: 'creator',
          type: 'text',
          label: 'Twitter Creator (@username)'
        }
      ]
    },
    {
      name: 'structuredData',
      type: 'json',
      label: 'Structured Data (JSON-LD)'
    },
    {
      name: 'analytics',
      type: 'group',
      label: 'Analytics',
      fields: [
        {
          name: 'googleAnalytics',
          type: 'text',
          label: 'Google Analytics ID'
        },
        {
          name: 'facebookPixel',
          type: 'text',
          label: 'Facebook Pixel ID'
        },
        {
          name: 'customTracking',
          type: 'json',
          label: 'Custom Tracking Codes'
        }
      ]
    },
    {
      name: 'localization',
      type: 'group',
      label: 'Localization',
      fields: [
        {
          name: 'language',
          type: 'text',
          defaultValue: 'en',
          label: 'Language Code'
        },
        {
          name: 'region',
          type: 'text',
          label: 'Region Code'
        },
        {
          name: 'alternates',
          type: 'array',
          label: 'Alternate Language Versions',
          fields: [
            {
              name: 'language',
              type: 'text',
              required: true
            },
            {
              name: 'url',
              type: 'text',
              required: true
            }
          ]
        }
      ]
    },
    {
      name: 'performance',
      type: 'group',
      label: 'Performance Settings',
      fields: [
        {
          name: 'preload',
          type: 'json',
          label: 'Preload Resources'
        },
        {
          name: 'dnsPrefetch',
          type: 'array',
          label: 'DNS Prefetch',
          fields: [
            {
              name: 'domain',
              type: 'text',
              required: true
            }
          ]
        }
      ]
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true
    },
    {
      name: 'lastUpdated',
      type: 'date',
      defaultValue: () => new Date()
    }
  ]
}

export { SEO }
