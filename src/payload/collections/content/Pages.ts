// src/payload/collections/Pages.ts
import type { CollectionConfig, AccessResult, Where } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Content Management',
    description: 'Manage editable pages and landing pages',
    defaultColumns: ['title', 'slug', 'published', 'updatedAt'],
    listSearchableFields: ['title', 'slug', 'content'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }): AccessResult => {
      if (!req.user) {
        // Public can read published pages
        return {
          published: { equals: true }
        } as Where
      }
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      // Staff can read pages for their tenant
      return {
        tenant: { equals: req.user.tenant?.id || null }
      } as Where
    },
    create: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager'].includes(req.user.role)
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      if (req.user.role === 'manager') {
        return {
          tenant: { equals: req.user.tenant?.id }
        } as Where
      }
      return false
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false
      return req.user.role === 'admin'
    },
  },
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user && req.user.role !== 'admin') {
          data.tenant = req.user.tenant?.id
        }

        // Auto-generate slug from title if not provided
        if (operation === 'create' && data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }

        // Auto-set published date when publishing
        if (data.published && !data.publishedAt) {
          data.publishedAt = new Date()
        }

        // Auto-generate SEO meta title from title if not provided
        if (data.title && !data.seo?.metaTitle) {
          if (!data.seo) data.seo = {}
          data.seo.metaTitle = data.title.length > 60 ? data.title.substring(0, 57) + '...' : data.title
        }

        // Auto-generate meta description from content if not provided
        if (data.content && !data.seo?.metaDescription) {
          if (!data.seo) data.seo = {}
          // Extract text content and create description
          const textContent = typeof data.content === 'string'
            ? data.content.replace(/<[^>]*>/g, '').substring(0, 160)
            : 'Page content'
          data.seo.metaDescription = textContent + (textContent.length >= 160 ? '...' : '')
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`New page created: ${doc.title} (${doc.slug})`)
        }

        if (operation === 'update') {
          console.log(`Page updated: ${doc.title} (${doc.slug})`)
        }

        // TODO: Trigger sitemap regeneration
        // TODO: Clear page cache if using caching layer
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 100,
      index: true,
      admin: {
        description: 'Page title for display and SEO',
        placeholder: 'Enter page title...',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL slug (auto-generated from title)',
        placeholder: 'url-friendly-slug',
      },
      validate: (value: any) => {
        if (value && typeof value === 'string') {
          if (!/^[a-z0-9-]+$/.test(value)) {
            return 'Slug can only contain lowercase letters, numbers, and hyphens'
          }
          if (value.length < 3) {
            return 'Slug must be at least 3 characters long'
          }
        }
        return true
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      maxLength: 200,
      admin: {
        description: 'Optional subtitle for the page',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: {
        description: 'Tenant this page belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Hero image for the page',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 300,
      admin: {
        description: 'Brief summary of the page content',
        placeholder: 'Brief description for previews...',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Main page content',
      },
    },
    {
      name: 'pageType',
      type: 'select',
      options: [
        { label: 'Landing Page', value: 'landing' },
        { label: 'About Page', value: 'about' },
        { label: 'Services Page', value: 'services' },
        { label: 'Contact Page', value: 'contact' },
        { label: 'Gallery Page', value: 'gallery' },
        { label: 'Blog Landing', value: 'blog' },
        { label: 'Custom Page', value: 'custom' },
      ],
      defaultValue: 'custom',
      required: true,
      admin: {
        description: 'Type of page for organization and templating',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Publish this page to make it visible to visitors',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
      admin: {
        description: 'Date when the page was/will be published',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this page prominently',
      },
    },
    {
      name: 'showInNavigation',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Include this page in the main navigation menu',
      },
    },
    {
      name: 'navigationOrder',
      type: 'number',
      min: 0,
      admin: {
        description: 'Order in navigation menu (lower numbers appear first)',
        condition: (data) => data?.showInNavigation,
      },
    },
    {
      name: 'parentPage',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        description: 'Parent page for hierarchical navigation',
      },
    },
    {
      name: 'tags',
      type: 'array',
      maxRows: 10,
      admin: {
        description: 'Tags for categorization and filtering',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          maxLength: 50,
          validate: (value: any) => {
            if (!value) return 'Tag is required'
            if (value.length > 50) return 'Tag too long (max 50 characters)'
            return true
          },
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO Settings',
      admin: {
        description: 'Search engine optimization settings',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          maxLength: 60,
          admin: {
            description: 'Title that appears in search results (max 60 characters)',
            placeholder: 'SEO-optimized title...',
          },
          validate: (value: any) => {
            if (value && typeof value === 'string' && value.length > 60) {
              return 'Meta title should be 60 characters or less for optimal SEO'
            }
            return true
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
          admin: {
            description: 'Description that appears in search results (max 160 characters)',
            placeholder: 'Compelling meta description...',
          },
          validate: (value: any) => {
            if (value && typeof value === 'string') {
              if (value.length > 160) {
                return 'Meta description should be 160 characters or less'
              }
              if (value.length < 120) {
                return 'Meta description should be at least 120 characters for better SEO'
              }
            }
            return true
          },
        },
        {
          name: 'metaImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Image for social media sharing (1200x630px recommended)',
          },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          admin: {
            description: 'Canonical URL if this content exists elsewhere',
            placeholder: 'https://example.com/canonical-url',
          },
          validate: (value: any) => {
            if (value && typeof value === 'string') {
              try {
                new URL(value)
                return true
              } catch {
                return 'Please enter a valid URL'
              }
            }
            return true
          },
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Prevent search engines from indexing this page',
          },
        },
        {
          name: 'structuredData',
          type: 'json',
          admin: {
            description: 'Custom structured data (JSON-LD) for this page',
          },
        },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      label: 'Analytics',
      admin: {
        description: 'Page performance analytics',
        readOnly: true,
      },
      fields: [
        {
          name: 'views',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of times this page has been viewed',
            readOnly: true,
          },
        },
        {
          name: 'uniqueViews',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of unique visitors to this page',
            readOnly: true,
          },
        },
        {
          name: 'averageTimeOnPage',
          type: 'number',
          admin: {
            description: 'Average time spent on this page (seconds)',
            readOnly: true,
          },
        },
        {
          name: 'bounceRate',
          type: 'number',
          admin: {
            description: 'Bounce rate percentage for this page',
            readOnly: true,
          },
        },
        {
          name: 'lastAnalyticsUpdate',
          type: 'date',
          admin: {
            description: 'Last time analytics were updated',
            readOnly: true,
          },
        },
      ],
    },
  ],
  timestamps: true,
  indexes: [
    { fields: ['tenant', 'published'] },
    { fields: ['slug'] },
    { fields: ['pageType', 'published'] },
    { fields: ['showInNavigation', 'navigationOrder'] },
    { fields: ['tags.tag'] },
  ],
}
