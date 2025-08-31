import type { CollectionConfig, AccessResult, Where } from 'payload'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: {
    singular: 'Blog Post',
    plural: 'Blog Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'category', 'published', 'publishedAt', 'views', 'tenant'],
    group: 'Content',
    description: 'Manage blog posts and articles for your website',
    listSearchableFields: ['title', 'excerpt', 'content', 'tags.tag', 'seo.keywords.keyword'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }): AccessResult => {
      // Public can read published posts, authenticated users can read based on tenant
      if (!req.user) {
        return {
          published: { equals: true },
          isPublic: { equals: true }
        } as Where
      }
      if ((req.user as any)?.role === 'admin') return true
      return {
        or: [
          {
            published: { equals: true },
            isPublic: { equals: true }
          },
          { tenant: { equals: (req.user as any)?.tenant?.id } }
        ]
      } as Where
    },
    create: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager', 'barber'].includes((req.user as any)?.role)
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false
      if ((req.user as any)?.role === 'admin') return true
      return {
        or: [
          { author: { equals: req.user.id } },
          {
            tenant: { equals: (req.user as any)?.tenant?.id }
          }
        ]
      } as Where
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false
      if ((req.user as any)?.role === 'admin') return true
      if ((req.user as any)?.role === 'manager') {
        return { tenant: { equals: (req.user as any)?.tenant?.id } } as Where
      }
      return false
    },
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-set tenant for non-admin users
        if (operation === 'create' && !data.tenant && req.user && (req.user as any)?.role !== 'admin') {
          data.tenant = (req.user as any)?.tenant?.id
        }

        // Auto-set author on create if not specified
        if (operation === 'create' && !data.author && req.user) {
          data.author = req.user.id
        }

        // Auto-set publishedAt when publishing
        if (data.published && !data.publishedAt) {
          data.publishedAt = new Date()
        }

        // Auto-generate reading time based on content
        if (data.content && !data.readingTime) {
          const wordCount = data.content.toString().split(/\s+/).length
          data.readingTime = Math.ceil(wordCount / 200) // Average reading speed
        }

        // Auto-generate SEO meta title from title if not provided
        if (data.title && !data.seo?.metaTitle) {
          if (!data.seo) data.seo = {}
          data.seo.metaTitle = data.title.length > 60 ? data.title.substring(0, 57) + '...' : data.title
        }

        // Auto-generate meta description from excerpt if not provided
        if (data.excerpt && !data.seo?.metaDescription) {
          if (!data.seo) data.seo = {}
          data.seo.metaDescription = data.excerpt.length > 160 ? data.excerpt.substring(0, 157) + '...' : data.excerpt
        }

        // Auto-generate slug from title if not provided
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create' && doc.published) {
          // TODO: Send notifications, update sitemap, trigger webhooks
          console.log(`New blog post published: ${doc.title}`)
        }
        if (operation === 'update' && doc.published) {
          // TODO: Update search index, clear cache
          console.log(`Blog post updated: ${doc.title}`)
        }
      },
    ],
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      admin: {
        condition: (data, siblingData, { user }) => user?.role === 'admin',
        description: 'The tenant this blog post belongs to',
      },
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 100,
      index: true,
      admin: {
        placeholder: 'Enter blog post title...',
        description: 'The main title of your blog post (max 100 characters)',
      },
      validate: (value: any) => {
        if (value && typeof value === 'string' && value.length < 10) {
          return 'Title must be at least 10 characters long'
        }
        return true
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL slug, e.g. "how-to-cut-hair"',
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
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 300,
      admin: {
        description: 'Brief summary of the blog post (used in previews and meta description)',
        placeholder: 'Write a compelling excerpt...',
      },
      validate: (value: any) => {
        if (value && typeof value === 'string' && value.length < 50) {
          return 'Excerpt should be at least 50 characters for better SEO'
        }
        return true
      },
    },
    {
      name: 'hero',
      type: 'upload',
      relationTo: 'media' as any as any,
      admin: {
        description: 'Featured image for the blog post (recommended: 1200x630px)',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Main content of the blog post',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users' as any as any,
      required: true,
      index: true,
      filterOptions: ({ data }) => {
        if (data?.tenant) {
          return {
            and: [
              { role: { in: ['admin', 'manager', 'barber'] } },
              { tenant: { equals: data.tenant } }
            ]
          } as Where
        }
        return { role: { in: ['admin', 'manager', 'barber'] } } as Where
      },
      admin: {
        description: 'Select the author of this blog post',
      },
    },
    {
      name: 'tags',
      type: 'array',
      maxRows: 10,
      admin: {
        description: 'Add relevant tags for categorization and SEO',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          maxLength: 50,
          validate: (value: any) => {
            if (value && typeof value === 'string' && value.length < 2) {
              return 'Tag must be at least 2 characters long'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Hair Care', value: 'hair-care' },
        { label: 'Styling Tips', value: 'styling-tips' },
        { label: 'Trends', value: 'trends' },
        { label: 'Product Reviews', value: 'product-reviews' },
        { label: 'Tutorials', value: 'tutorials' },
        { label: 'Industry News', value: 'industry-news' },
        { label: 'Business Tips', value: 'business-tips' },
        { label: 'Client Stories', value: 'client-stories' },
        { label: 'BarberShop Management', value: 'BarberShop-management' },
        { label: 'Health & Safety', value: 'health-safety' },
      ],
      admin: {
        description: 'Select a category for this blog post',
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      min: 1,
      max: 60,
      admin: {
        description: 'Estimated reading time in minutes (auto-calculated if left empty)',
        step: 1,
      },
    },
    {
      name: 'difficulty',
      type: 'select',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
        { label: 'Professional', value: 'professional' },
      ],
      admin: {
        description: 'Difficulty level for tutorials and how-to posts',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Mark as featured post (appears prominently on homepage)',
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Make this post visible to all users (not just tenant members)',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Publish this blog post to make it visible to readers',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
      admin: {
        description: 'Date when the blog post was/will be published',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'scheduledFor',
      type: 'date',
      admin: {
        description: 'Schedule this post to be published at a future date',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        condition: (data) => !data.published,
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'Date when this post should be automatically unpublished',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Number of times this post has been viewed',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'likes',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Number of likes this post has received',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'shares',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Number of times this post has been shared',
        readOnly: true,
        position: 'sidebar',
      },
    },
    // Comments relationship temporarily disabled - comments collection needs to be created
    // {
    //   name: 'comments',
    //   type: 'relationship',
    //   relationTo: 'comments' as any as any,
    //   hasMany: true,
    //   admin: {
    //     description: 'Comments on this blog post',
    //     readOnly: true,
    //     position: 'sidebar',
    //   },
    // },
    {
      name: 'relatedPosts',
      type: 'relationship',
      relationTo: 'blog-posts' as any as any,
      hasMany: true,
      maxRows: 5,
      filterOptions: ({ id, data }) => {
        if (data?.tenant) {
          return {
            and: [
              { id: { not_equals: id } },
              { published: { equals: true } },
              { tenant: { equals: data.tenant } }
            ]
          } as Where
        }
        return {
          and: [
            { id: { not_equals: id } },
            { published: { equals: true } }
          ]
        } as Where
      },
      admin: {
        description: 'Select related blog posts to show at the end of this post',
      },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      defaultValue: 'normal',
      admin: {
        description: 'Editorial priority for this post',
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Review', value: 'review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      admin: {
        description: 'Editorial status of this post',
        position: 'sidebar',
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO Settings',
      admin: {
        description: 'Search engine optimization settings',
        position: 'sidebar',
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
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media' as any as any,
          admin: {
            description: 'Image for social media sharing (1200x630px recommended)',
          },
        },
        {
          name: 'keywords',
          type: 'array',
          maxRows: 10,
          admin: {
            description: 'SEO keywords for this blog post (focus on 3-5 main keywords)',
          },
          fields: [
            {
              name: 'keyword',
              type: 'text',
              required: true,
              maxLength: 50,
              validate: (value: any) => {
                if (value && typeof value === 'string' && value.length < 2) {
                  return 'Keyword must be at least 2 characters long'
                }
                return true
              },
            },
          ],
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          admin: {
            description: 'Canonical URL if this content exists elsewhere',
            placeholder: 'https://example.com/original-post',
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
            description: 'Prevent search engines from indexing this post',
          },
        },
        {
          name: 'structuredData',
          type: 'json',
          admin: {
            description: 'Custom structured data (JSON-LD) for this post',
          },
        },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      label: 'Analytics',
      admin: {
        description: 'Post performance analytics',
        position: 'sidebar',
        readOnly: true,
      },
      fields: [
        {
          name: 'avgTimeOnPage',
          type: 'number',
          admin: {
            description: 'Average time spent reading this post (seconds)',
            readOnly: true,
          },
        },
        {
          name: 'bounceRate',
          type: 'number',
          admin: {
            description: 'Bounce rate percentage for this post',
            readOnly: true,
          },
        },
        {
          name: 'socialShares',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total number of social media shares',
            readOnly: true,
          },
        },
        {
          name: 'conversionRate',
          type: 'number',
          admin: {
            description: 'Conversion rate percentage for this post',
            readOnly: true,
          },
        },
        {
          name: 'topReferrers',
          type: 'array',
          admin: {
            description: 'Top traffic sources for this post',
            readOnly: true,
          },
          fields: [
            {
              name: 'source',
              type: 'text',
            },
            {
              name: 'visits',
              type: 'number',
            },
          ],
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
    {
      name: 'workflow',
      type: 'group',
      label: 'Editorial Workflow',
      admin: {
        description: 'Editorial workflow and review process',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'assignedEditor',
          type: 'relationship',
          relationTo: 'users' as any as any,
          filterOptions: ({ data }) => {
            if (data?.tenant) {
              return {
                and: [
                  { role: { in: ['admin', 'manager'] } },
                  { tenant: { equals: data.tenant } }
                ]
              } as Where
            }
            return { role: { in: ['admin', 'manager'] } } as Where
          },
          admin: {
            description: 'Editor assigned to review this post',
          },
        },
        {
          name: 'reviewNotes',
          type: 'textarea',
          admin: {
            description: 'Notes from the editorial review process',
          },
        },
        {
          name: 'approvedAt',
          type: 'date',
          admin: {
            description: 'Date when this post was approved for publication',
            readOnly: true,
          },
        },
        {
          name: 'approvedBy',
          type: 'relationship',
          relationTo: 'users' as any as any,
          admin: {
            description: 'User who approved this post',
            readOnly: true,
          },
        },
      ],
    },
  ],
  timestamps: true,
  versions: {
    drafts: {
      autosave: {
        interval: 2000, // Auto-save every 2 seconds
      },
    },
    maxPerDoc: 20,
  },
}
