// src/payload/collections/Redirects.ts
import type { CollectionConfig, AccessResult } from 'payload'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: {
    useAsTitle: 'from',
    group: 'SEO & Admin',
    description: 'Manage URL redirects for SEO and content migration',
    defaultColumns: ['from', 'to', 'status', 'active', 'updatedAt'],
    listSearchableFields: ['from', 'to'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager'].includes((req.user as any)?.role)
    },
    create: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager'].includes((req.user as any)?.role)
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager'].includes((req.user as any)?.role)
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false
      return (req.user as any)?.role === 'admin'
    },
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user && (req.user as any)?.role !== 'admin') {
          data.tenant = (req.user as any)?.tenant?.id
        }

        // Validate URL formats
        if (data.from) {
          // Ensure from URL starts with /
          if (!data.from.startsWith('/')) {
            data.from = '/' + data.from
          }
          // Remove trailing slash unless it's just /
          if (data.from !== '/' && data.from.endsWith('/')) {
            data.from = data.from.slice(0, -1)
          }
        }

        if (data.to) {
          // Validate that 'to' is a valid URL or relative path
          if (!data.to.startsWith('/') && !data.to.startsWith('http')) {
            throw new Error('Redirect destination must be a relative path (starting with /) or absolute URL')
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req, previousDoc }) => {
        if (operation === 'create') {
          console.log(`New redirect created: ${doc.from} → ${doc.to} (${doc.status})`)
        }

        if (operation === 'update') {
          console.log(`Redirect updated: ${doc.from} → ${doc.to} (${doc.status})`)
        }

        // Clear redirect cache when redirects are created, updated, or status changes
        if (operation === 'create' || operation === 'update') {
          try {
            await clearRedirectCache(doc, previousDoc);
            console.log(`Cleared redirect cache for: ${doc.from}`);
          } catch (error) {
            console.error('Error clearing redirect cache:', error);
          }
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        try {
          await clearRedirectCache(doc);
          console.log(`Cleared redirect cache after deletion: ${doc.from}`);
        } catch (error) {
          console.error('Error clearing redirect cache after deletion:', error);
        }
      },
    ],
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Source URL path (e.g., /old-page)',
        placeholder: '/old-page-url',
      },
      validate: (value: any) => {
        if (!value) return 'From URL is required'
        if (!value.startsWith('/')) return 'From URL must start with /'
        if (value.includes(' ')) return 'From URL cannot contain spaces'
        return true
      },
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Destination URL (absolute or relative path)',
        placeholder: '/new-page-url or https://example.com/new-url',
      },
      validate: (value: any) => {
        if (!value) return 'To URL is required'
        if (!value.startsWith('/') && !value.startsWith('http')) {
          return 'To URL must be a relative path (starting with /) or absolute URL'
        }
        return true
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: '301 - Permanent Redirect', value: '301' },
        { label: '302 - Temporary Redirect', value: '302' },
        { label: '307 - Temporary Redirect (POST)', value: '307' },
        { label: '308 - Permanent Redirect (POST)', value: '308' },
      ],
      defaultValue: '301',
      required: true,
      admin: {
        description: 'HTTP redirect status code',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: {
        description: 'Enable this redirect',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      index: true,
      admin: {
        description: 'Tenant this redirect belongs to',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 200,
      admin: {
        description: 'Optional description of why this redirect exists',
        placeholder: 'Reason for redirect (e.g., page moved, URL cleanup)',
      },
    },
    {
      name: 'hits',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Number of times this redirect has been used',
        readOnly: true,
      },
    },
    {
      name: 'lastHit',
      type: 'date',
      admin: {
        description: 'Last time this redirect was accessed',
        readOnly: true,
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        description: 'User who created this redirect',
        readOnly: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this redirect',
      },
    },
  ],
  timestamps: true,
  indexes: [
    { fields: ['from'] },
    { fields: ['active', 'tenant'] },
    { fields: ['hits'] },
  ],
}

/**
 * Clear redirect cache for updated/created/deleted redirects
 */
async function clearRedirectCache(doc: any, previousDoc?: any) {
  try {
    // Import Next.js cache revalidation functions
    const { revalidatePath, revalidateTag } = await import('next/cache');
    
    // Clear specific redirect paths
    const pathsToClear = [doc.from];
    
    // If this was an update and the 'from' path changed, clear the old path too
    if (previousDoc && previousDoc.from !== doc.from) {
      pathsToClear.push(previousDoc.from);
    }
    
    // Clear Next.js cache for each path
    for (const path of pathsToClear) {
      try {
        revalidatePath(path);
        console.log(`Revalidated Next.js cache for path: ${path}`);
      } catch (revalidateError) {
        console.error(`Error revalidating path ${path}:`, revalidateError);
      }
    }
    
    // Clear redirect-specific cache tags
    try {
      revalidateTag('redirects');
      revalidateTag(`redirect-${doc.tenant}`);
      console.log(`Cleared redirect cache tags`);
    } catch (tagError) {
      console.error('Error clearing redirect cache tags:', tagError);
    }
    
    // If using Redis or other caching layer, clear those caches too
    try {
      await clearRedisCacheIfAvailable(pathsToClear);
    } catch (redisError) {
      console.error('Error clearing Redis cache:', redisError);
    }
    
    // Trigger CDN cache purging if configured
    try {
      await purgeCDNCacheIfAvailable(pathsToClear);
    } catch (cdnError) {
      console.error('Error purging CDN cache:', cdnError);
    }
    
  } catch (error) {
    console.error('Error in clearRedirectCache:', error);
    throw error;
  }
}

/**
 * Clear Redis cache if available
 */
async function clearRedisCacheIfAvailable(paths: string[]) {
  try {
    // Check if Redis client is available
    const redisKey = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
    if (!redisKey) {
      console.log('No Redis configuration found, skipping Redis cache clear');
      return;
    }
    
    // Import Redis client if available
    let redisClient;
    try {
      const { Redis } = await import('@upstash/redis');
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
    } catch (importError) {
      console.log('Redis client not available, skipping Redis cache clear');
      return;
    }
    
    if (redisClient) {
      // Clear redirect cache keys
      const cacheKeys = paths.map(path => `redirect:${path}`);
      cacheKeys.push('redirects:all');
      
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
    console.error('Error in Redis cache clearing:', error);
  }
}

/**
 * Purge CDN cache if available
 */
async function purgeCDNCacheIfAvailable(paths: string[]) {
  try {
    const cdnProvider = process.env.CDN_PROVIDER;
    
    if (!cdnProvider) {
      console.log('No CDN provider configured, skipping CDN purge');
      return;
    }
    
    switch (cdnProvider.toLowerCase()) {
      case 'cloudflare':
        await purgeCloudflareCache(paths);
        break;
        
      case 'aws':
      case 'cloudfront':
        await purgeCloudFrontCache(paths);
        break;
        
      case 'vercel':
        await purgeVercelCache(paths);
        break;
        
      default:
        console.log(`Unknown CDN provider: ${cdnProvider}`);
    }
    
  } catch (error) {
    console.error('Error in CDN cache purging:', error);
  }
}

/**
 * Purge Cloudflare cache
 */
async function purgeCloudflareCache(paths: string[]) {
  try {
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    
    if (!zoneId || !apiToken) {
      console.log('Cloudflare credentials not found, skipping purge');
      return;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://modernmen.ca';
    const fullUrls = paths.map(path => `${baseUrl}${path}`);
    
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: fullUrls
      })
    });
    
    if (response.ok) {
      console.log(`Successfully purged Cloudflare cache for ${fullUrls.length} URLs`);
    } else {
      console.error('Failed to purge Cloudflare cache:', await response.text());
    }
    
  } catch (error) {
    console.error('Error purging Cloudflare cache:', error);
  }
}

/**
 * Purge CloudFront cache
 */
async function purgeCloudFrontCache(paths: string[]) {
  try {
    // CloudFront invalidation would require AWS SDK
    console.log('CloudFront cache purging not implemented yet');
  } catch (error) {
    console.error('Error purging CloudFront cache:', error);
  }
}

/**
 * Purge Vercel cache
 */
async function purgeVercelCache(paths: string[]) {
  try {
    // Vercel purging would require Vercel API
    console.log('Vercel cache purging not implemented yet');
  } catch (error) {
    console.error('Error purging Vercel cache:', error);
  }
}
