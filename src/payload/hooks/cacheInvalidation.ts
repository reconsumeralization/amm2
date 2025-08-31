// src/payload/hooks/cacheInvalidation.ts
import type { FieldHook } from 'payload';

export const cacheInvalidation: FieldHook = async ({ req, operation, data }: any) => {
  try {
    const collectionSlug = req?.collection?.slug || 'unknown';
    const docId = data?.id || 'unknown';

    console.log(`[CACHE] Invalidating cache for ${collectionSlug} ID: ${docId}`);

    // Example: Trigger CDN purge or Next.js ISR revalidation
    if (process.env.NODE_ENV === 'production') {
      // Vercel ISR revalidation
      if (collectionSlug === 'pages' || collectionSlug === 'blog-posts') {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.REVALIDATE_TOKEN}`,
            },
            body: JSON.stringify({
              collection: collectionSlug,
              id: docId,
              operation,
            }),
          });
        } catch (err) {
          console.error('ISR revalidation failed:', err);
        }
      }

      // CDN purge (example for Cloudflare)
      if (process.env.CLOUDFLARE_ZONE_ID && process.env.CLOUDFLARE_API_TOKEN) {
        try {
          await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              purge_everything: false,
              files: [`${process.env.NEXT_PUBLIC_SITE_URL}/${collectionSlug}/${docId}`],
            }),
          });
        } catch (err) {
          console.error('CDN purge failed:', err);
        }
      }
    }
  } catch (err) {
    console.error('Cache invalidation failed:', err);
  }
};
