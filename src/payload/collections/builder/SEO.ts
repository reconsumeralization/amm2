// src/payload/collections/BuilderSEO.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const SEO: CollectionConfig = withDefaultHooks({
  slug: 'builder-seo',
  admin: {
    useAsTitle: 'title',
    group: 'Visual Builder',
    description: 'Metadata for blocks/sections/pages - enhances Pages and BuilderPages SEO',
    defaultColumns: ['title', 'url', 'seoScore', 'lastAnalyzedAt', 'createdAt'],
    listSearchableFields: ['title', 'description', 'url'],
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
      name: 'itemType',
      type: 'select',
      options: [
        { label: 'Page', value: 'page' },
        { label: 'Section', value: 'section' },
        { label: 'Block', value: 'block' },
        { label: 'Template', value: 'template' },
      ],
      required: true,
      admin: {
        description: 'Type of item this SEO data belongs to',
      },
    },
    {
      name: 'itemId',
      type: 'text',
      required: true,
      admin: {
        description: 'ID of the item this SEO data belongs to',
      },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'URL of the page/section/block',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'SEO title (appears in search results)',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: {
        description: 'Meta description (appears in search results)',
        rows: 3,
      },
    },
    {
      name: 'keywords',
      type: 'array',
      admin: {
        description: 'Target keywords for SEO',
      },
      fields: [
        {
          name: 'keyword',
          type: 'text',
          required: true,
          admin: {
            description: 'Target keyword or phrase',
          },
        },
        {
          name: 'priority',
          type: 'select',
          options: [
            { label: 'High', value: 'high' },
            { label: 'Medium', value: 'medium' },
            { label: 'Low', value: 'low' },
          ],
          defaultValue: 'medium',
          admin: {
            description: 'Keyword priority',
          },
        },
        {
          name: 'searchVolume',
          type: 'number',
          admin: {
            description: 'Monthly search volume',
          },
        },
        {
          name: 'competition',
          type: 'select',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
          ],
          admin: {
            description: 'Keyword competition level',
          },
        },
      ],
    },
    {
      name: 'canonicalUrl',
      type: 'text',
      admin: {
        description: 'Canonical URL to avoid duplicate content issues',
      },
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Exclude from search engine indexing',
      },
    },
    {
      name: 'noFollow',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Tell search engines not to follow links',
      },
    },
    {
      name: 'openGraph',
      type: 'group',
      admin: {
        description: 'Open Graph metadata for social media sharing',
      },
      fields: [
        {
          name: 'ogTitle',
          type: 'text',
          admin: {
            description: 'Open Graph title',
          },
        },
        {
          name: 'ogDescription',
          type: 'textarea',
          admin: {
            description: 'Open Graph description',
            rows: 2,
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media' as any as any,
          admin: {
            description: 'Open Graph image (1200x630px recommended)',
          },
        },
        {
          name: 'ogType',
          type: 'select',
          options: [
            { label: 'Website', value: 'website' },
            { label: 'Article', value: 'article' },
            { label: 'Product', value: 'product' },
            { label: 'Profile', value: 'profile' },
          ],
          defaultValue: 'website',
          admin: {
            description: 'Open Graph object type',
          },
        },
        {
          name: 'ogSiteName',
          type: 'text',
          admin: {
            description: 'Open Graph site name',
          },
        },
      ],
    },
    {
      name: 'twitterCard',
      type: 'group',
      admin: {
        description: 'Twitter Card metadata',
      },
      fields: [
        {
          name: 'twitterCard',
          type: 'select',
          options: [
            { label: 'Summary', value: 'summary' },
            { label: 'Summary Large Image', value: 'summary_large_image' },
            { label: 'App', value: 'app' },
            { label: 'Player', value: 'player' },
          ],
          defaultValue: 'summary_large_image',
          admin: {
            description: 'Twitter Card type',
          },
        },
        {
          name: 'twitterTitle',
          type: 'text',
          admin: {
            description: 'Twitter Card title',
          },
        },
        {
          name: 'twitterDescription',
          type: 'textarea',
          admin: {
            description: 'Twitter Card description',
            rows: 2,
          },
        },
        {
          name: 'twitterImage',
          type: 'upload',
          relationTo: 'media' as any as any,
          admin: {
            description: 'Twitter Card image',
          },
        },
      ],
    },
    {
      name: 'structuredData',
      type: 'group',
      admin: {
        description: 'Structured data (JSON-LD) for rich snippets',
      },
      fields: [
        {
          name: 'schemaType',
          type: 'select',
          options: [
            { label: 'Article', value: 'article' },
            { label: 'Product', value: 'product' },
            { label: 'Event', value: 'event' },
            { label: 'Organization', value: 'organization' },
            { label: 'Person', value: 'person' },
            { label: 'WebPage', value: 'webpage' },
            { label: 'BreadcrumbList', value: 'breadcrumb' },
            { label: 'FAQPage', value: 'faq' },
            { label: 'HowTo', value: 'howto' },
            { label: 'Custom', value: 'custom' },
          ],
          admin: {
            description: 'Schema.org type',
          },
        },
        {
          name: 'jsonLd',
          type: 'textarea',
          admin: {
            description: 'JSON-LD structured data',
            rows: 10,
          },
        },
      ],
    },
    {
      name: 'seoScore',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description: 'Overall SEO score (0-100)',
        readOnly: true,
      },
    },
    {
      name: 'seoIssues',
      type: 'array',
      admin: {
        description: 'SEO issues found',
        readOnly: true,
      },
      fields: [
        {
          name: 'issue',
          type: 'text',
          admin: {
            description: 'SEO issue description',
          },
        },
        {
          name: 'severity',
          type: 'select',
          options: [
            { label: 'Critical', value: 'critical' },
            { label: 'Warning', value: 'warning' },
            { label: 'Info', value: 'info' },
          ],
          admin: {
            description: 'Issue severity',
          },
        },
        {
          name: 'suggestion',
          type: 'text',
          admin: {
            description: 'Suggested fix',
          },
        },
      ],
    },
    {
      name: 'lastAnalyzedAt',
      type: 'date',
      admin: {
        description: 'Last time SEO was analyzed',
        readOnly: true,
      },
    },

    {
      name: 'seoAnalysisResult',
      type: 'textarea',
      admin: {
        description: 'Latest SEO analysis result',
        readOnly: true,
        rows: 5,
      },
    },
    {
      name: 'internalLinks',
      type: 'array',
      admin: {
        description: 'Internal links found on this page',
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'Internal link URL',
          },
        },
        {
          name: 'anchorText',
          type: 'text',
          admin: {
            description: 'Link anchor text',
          },
        },
        {
          name: 'nofollow',
          type: 'checkbox',
          admin: {
            description: 'Whether link has nofollow attribute',
          },
        },
      ],
    },
    {
      name: 'externalLinks',
      type: 'array',
      admin: {
        description: 'External links found on this page',
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'External link URL',
          },
        },
        {
          name: 'anchorText',
          type: 'text',
          admin: {
            description: 'Link anchor text',
          },
        },
        {
          name: 'nofollow',
          type: 'checkbox',
          admin: {
            description: 'Whether link has nofollow attribute',
          },
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      admin: {
        description: 'Images found on this page with alt text analysis',
      },
      fields: [
        {
          name: 'src',
          type: 'text',
          admin: {
            description: 'Image source URL',
          },
        },
        {
          name: 'alt',
          type: 'text',
          admin: {
            description: 'Image alt text',
          },
        },
        {
          name: 'hasAlt',
          type: 'checkbox',
          admin: {
            description: 'Whether image has alt text',
          },
        },
        {
          name: 'altQuality',
          type: 'select',
          options: [
            { label: 'Good', value: 'good' },
            { label: 'Poor', value: 'poor' },
            { label: 'Missing', value: 'missing' },
          ],
          admin: {
            description: 'Quality of alt text',
          },
        },
      ],
    },
    {
      name: 'performance',
      type: 'group',
      admin: {
        description: 'Page performance metrics affecting SEO',
      },
      fields: [
        {
          name: 'pageSpeed',
          type: 'number',
          admin: {
            description: 'Page speed score (0-100)',
            readOnly: true,
          },
        },
        {
          name: 'mobileFriendly',
          type: 'checkbox',
          admin: {
            description: 'Whether page is mobile-friendly',
            readOnly: true,
          },
        },
        {
          name: 'coreWebVitals',
          type: 'group',
          admin: {
            description: 'Core Web Vitals scores',
          },
          fields: [
            {
              name: 'lcp',
              type: 'number',
              admin: {
                description: 'Largest Contentful Paint (ms)',
                readOnly: true,
              },
            },
            {
              name: 'fid',
              type: 'number',
              admin: {
                description: 'First Input Delay (ms)',
                readOnly: true,
              },
            },
            {
              name: 'cls',
              type: 'number',
              admin: {
                description: 'Cumulative Layout Shift',
                readOnly: true,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'competitorAnalysis',
      type: 'group',
      admin: {
        description: 'Competitor SEO analysis',
      },
      fields: [
        {
          name: 'competitors',
          type: 'array',
          admin: {
            description: 'Competitor URLs to analyze',
          },
          fields: [
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: {
                description: 'Competitor URL',
              },
            },
            {
              name: 'domainAuthority',
              type: 'number',
              admin: {
                description: 'Domain authority score',
                readOnly: true,
              },
            },
            {
              name: 'backlinks',
              type: 'number',
              admin: {
                description: 'Number of backlinks',
                readOnly: true,
              },
            },
          ],
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
