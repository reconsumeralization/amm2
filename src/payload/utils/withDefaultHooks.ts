// src/payload/utils/withDefaultHooks.ts
import type { CollectionConfig, CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';

/**
 * Collection-level audit log hook
 */
const collectionAuditLog: CollectionAfterChangeHook = async ({ doc, req, operation, collection }) => {
  try {
    const userId = req?.user?.id || 'system';
    const collectionSlug = collection?.slug || 'unknown';

    await req.payload.create({
      collection: 'audit-logs' as any as any,
      data: {
        user: userId,
        collection: collectionSlug,
        operation,
        docId: doc.id,
        timestamp: new Date(),
      },
    });
  } catch (err) {
    req.payload.logger?.error('Failed to write audit log:', err);
  }
};

/**
 * Collection-level cache invalidation hook
 */
const collectionCacheInvalidation: CollectionAfterChangeHook = async ({ req, operation, doc, collection }) => {
  try {
    const collectionSlug = collection?.slug || 'unknown';
    const docId = doc?.id;

    console.log(`[CACHE] Invalidating cache for ${collectionSlug} ID: ${docId}`);
    // Add your cache invalidation logic here (CDN purge, ISR revalidation, etc.)
  } catch (err) {
    req.payload.logger?.error('Cache invalidation failed:', err);
  }
};

/**
 * Collection-level search indexing hook
 */
const collectionSearchIndex: CollectionAfterChangeHook = async ({ req, operation, doc, collection }) => {
  try {
    const collectionSlug = collection?.slug || 'unknown';
    const docId = doc?.id;

    console.log(`[SEARCH] Updating search index for ${collectionSlug} ID: ${docId}`);
    // Add your search indexing logic here (Meilisearch, Algolia, etc.)
  } catch (err) {
    req.payload.logger?.error('Search indexing failed:', err);
  }
};

/**
 * Collection-level delete audit hook
 */
const collectionDeleteAuditLog: CollectionAfterDeleteHook = async ({ doc, req, collection }) => {
  try {
    const userId = req?.user?.id || 'system';
    const collectionSlug = collection?.slug || 'unknown';

    await req.payload.create({
      collection: 'audit-logs' as any as any,
      data: {
        user: userId,
        collection: collectionSlug,
        operation: 'delete',
        docId: doc.id,
        timestamp: new Date(),
      },
    });
  } catch (err) {
    req.payload.logger?.error('Failed to write delete audit log:', err);
  }
};

/**
 * Collection-level delete cache invalidation hook
 */
const collectionDeleteCacheInvalidation: CollectionAfterDeleteHook = async ({ req, doc, collection }) => {
  try {
    const collectionSlug = collection?.slug || 'unknown';
    const docId = doc?.id;

    console.log(`[CACHE] Invalidating cache for deleted ${collectionSlug} ID: ${docId}`);
    // Add your cache invalidation logic here
  } catch (err) {
    req.payload.logger?.error('Delete cache invalidation failed:', err);
  }
};

/**
 * Wraps a collection config to inject global hooks
 * without overwriting its own hooks.
 */
export const withDefaultHooks = (collection: CollectionConfig): CollectionConfig => {
  const userHooks = collection.hooks || {};

  return {
    ...collection,
    hooks: {
      ...userHooks,
      afterChange: [
        ...(userHooks.afterChange || []),
        collectionAuditLog,
        collectionCacheInvalidation,
        collectionSearchIndex,
      ],
      afterDelete: [
        ...(userHooks.afterDelete || []),
        collectionDeleteAuditLog,
        collectionDeleteCacheInvalidation,
      ],
    },
  };
};
