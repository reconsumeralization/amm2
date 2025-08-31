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
      async ({ doc, operation, req, previousDoc }) => {
        if (operation === 'create') {
          console.log(`New page created: ${doc.title} (${doc.slug})`)
        }

        if (operation === 'update') {
          console.log(`Page updated: ${doc.title} (${doc.slug})`)
        }

        // Trigger sitemap regeneration and clear page cache
        try {
          await handlePageCacheAndSitemap(doc, operation, previousDoc);
        } catch (error) {
          console.error('Error handling page cache and sitemap:', error);
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        try {
          await handlePageCacheAndSitemap(doc, 'delete');
          console.log(`Cleared cache and updated sitemap after deleting page: ${doc.slug}`);
        } catch (error) {
          console.error('Error handling page deletion cache and sitemap:', error);
        }
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

/**
 * Handle page cache clearing and sitemap regeneration
 */
async function handlePageCacheAndSitemap(doc: any, operation: string, previousDoc?: any) {
  try {
    // Import Next.js cache functions
    const { revalidatePath, revalidateTag } = await import('next/cache');
    
    // Collect all paths that need cache clearing
    const pathsToClear = [`/${doc.slug}`];
    
    // If slug changed, clear the old path too
    if (previousDoc && previousDoc.slug !== doc.slug) {
      pathsToClear.push(`/${previousDoc.slug}`);
    }
    
    // Add common paths that might be affected by page changes
    if (doc.showInNavigation || previousDoc?.showInNavigation) {
      pathsToClear.push('/', '/sitemap.xml');
    }
    
    // Clear Next.js cache for affected paths
    for (const path of pathsToClear) {
      try {
        revalidatePath(path);
        console.log(`Revalidated Next.js cache for path: ${path}`);
      } catch (revalidateError) {
        console.error(`Error revalidating path ${path}:`, revalidateError);
      }
    }
    
    // Clear cache tags
    const tagsToRevalidate = [
      'pages',
      `page-${doc.slug}`,
      `tenant-${doc.tenant}`,
      `page-type-${doc.pageType}`
    ];
    
    if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
      tagsToRevalidate.push(`page-${previousDoc.slug}`);
    }
    
    for (const tag of tagsToRevalidate) {
      try {
        revalidateTag(tag);
        console.log(`Revalidated cache tag: ${tag}`);
      } catch (tagError) {
        console.error(`Error revalidating tag ${tag}:`, tagError);
      }
    }
    
    // Trigger sitemap regeneration if page is published or navigation changed
    if (doc.published || previousDoc?.published || doc.showInNavigation !== previousDoc?.showInNavigation) {
      try {
        await triggerSitemapRegeneration();
      } catch (sitemapError) {
        console.error('Error triggering sitemap regeneration:', sitemapError);
      }
    }
    
    // Clear additional caches if available
    try {
      await clearPageCacheExtended(pathsToClear, doc);
    } catch (extendedError) {
      console.error('Error clearing extended cache:', extendedError);
    }
    
  } catch (error) {
    console.error('Error in handlePageCacheAndSitemap:', error);
    throw error;
  }
}

/**
 * Trigger sitemap regeneration
 */
async function triggerSitemapRegeneration() {
  try {
    const webhookSecret = process.env.PAYLOAD_WEBHOOK_SECRET || 'dev-webhook-secret';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/sitemap/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${webhookSecret}`
      },
      body: JSON.stringify({
        collection: 'pages',
        operation: 'sitemap_regeneration',
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      console.log('Successfully triggered sitemap regeneration');
    } else {
      console.error('Failed to trigger sitemap regeneration:', await response.text());
    }
  } catch (error) {
    console.error('Error triggering sitemap regeneration:', error);
  }
}

/**
 * Clear extended caches (Redis, CDN, etc.)
 */
async function clearPageCacheExtended(paths: string[], doc: any) {
  // Clear Redis cache if available
  try {
    await clearRedisCacheForPages(paths, doc);
  } catch (redisError) {
    console.error('Error clearing Redis cache for pages:', redisError);
  }
  
  // Clear CDN cache if available
  try {
    await clearCDNCacheForPages(paths, doc);
  } catch (cdnError) {
    console.error('Error clearing CDN cache for pages:', cdnError);
  }
}

/**
 * Clear Redis cache for pages
 */
async function clearRedisCacheForPages(paths: string[], doc: any) {
  try {
    const redisKey = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
    if (!redisKey) {
      return; // No Redis configured
    }
    
    let redisClient;
    try {
      const { Redis } = await import('@upstash/redis');
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
    } catch (importError) {
      return; // Redis client not available
    }
    
    if (redisClient) {
      const cacheKeys = [
        ...paths.map(path => `page:${path}`),
        `pages:tenant:${doc.tenant}`,
        `pages:type:${doc.pageType}`,
        `navigation:${doc.tenant}`,
        'sitemap:pages',
      ];
      
      for (const key of cacheKeys) {
        try {
          await redisClient.del(key);
          console.log(`Cleared Redis cache key: ${key}`);
        } catch (delError) {
          console.error(`Error deleting Redis key ${key}:`, delError);
        }
      }
    }
  } catch (error) {
    console.error('Error in Redis cache clearing for pages:', error);
  }
}

/**
 * Clear CDN cache for pages
 */
async function clearCDNCacheForPages(paths: string[], doc: any) {
  try {
    const cdnProvider = process.env.CDN_PROVIDER;
    
    if (!cdnProvider) {
      return; // No CDN configured
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://modernmen.ca';
    const fullUrls = paths.map(path => `${baseUrl}${path}`);
    
    // Add additional URLs that might be affected
    fullUrls.push(`${baseUrl}/sitemap.xml`);
    if (doc.showInNavigation) {
      fullUrls.push(`${baseUrl}/`); // Homepage might have navigation
    }
    
    switch (cdnProvider.toLowerCase()) {
      case 'cloudflare':
        await purgeCloudflarePages(fullUrls);
        break;
        
      case 'aws':
      case 'cloudfront':
        await purgeCloudFrontPages(fullUrls);
        break;
        
      case 'vercel':
        await purgeVercelPages(fullUrls);
        break;
        
      default:
        console.log(`Unknown CDN provider: ${cdnProvider}`);
    }
    
  } catch (error) {
    console.error('Error in CDN cache purging for pages:', error);
  }
}

/**
 * Purge Cloudflare cache for pages
 */
async function purgeCloudflarePages(urls: string[]) {
  try {
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    
    if (!zoneId || !apiToken) {
      return; // Cloudflare not configured
    }
    
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: urls
      })
    });
    
    if (response.ok) {
      console.log(`Successfully purged Cloudflare cache for ${urls.length} page URLs`);
    } else {
      console.error('Failed to purge Cloudflare cache for pages:', await response.text());
    }
    
  } catch (error) {
    console.error('Error purging Cloudflare cache for pages:', error);
  }
}

/**
 * Purge CloudFront cache for pages
 */
async function purgeCloudFrontPages(urls: string[]) {
  // CloudFront invalidation would require AWS SDK
  console.log('CloudFront cache purging for pages not implemented yet');
}

/**
 * Purge Vercel cache for pages
 */
async function purgeVercelPages(urls: string[]) {
  // Vercel purging would require Vercel API
  console.log('Vercel cache purging for pages not implemented yet');
}
