// src/payload/hooks/searchIndex.ts
import type { FieldHook } from 'payload';

export const searchIndex: FieldHook = async ({ req, operation, data }: any) => {
  try {
    const collectionSlug = req?.collection?.slug || 'unknown';
    const docId = data?.id;

    console.log(`[SEARCH] ${operation === 'delete' ? 'Removing from' : 'Updating'} search index for ${collectionSlug} ID: ${docId}`);

    // Skip indexing for certain collections
    const skipCollections = ['audit-logs', 'webhook-logs', 'media'];
    if (skipCollections.includes(collectionSlug)) {
      return;
    }

    if (operation === 'delete') {
      // Remove from search index
      await removeFromSearchIndex(collectionSlug, docId);
    } else {
      // Add/update in search index
      await updateSearchIndex(collectionSlug, data);
    }
  } catch (err) {
    console.error('Search indexing failed:', err);
  }
};

async function updateSearchIndex(collection: string, data: any) {
  // Example implementations for different search providers

  if (process.env.MEILISEARCH_HOST && process.env.MEILISEARCH_API_KEY) {
    // Meilisearch implementation
    try {
      const response = await fetch(`${process.env.MEILISEARCH_HOST}/indexes/${collection}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MEILISEARCH_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([data]),
      });

      if (!response.ok) {
        throw new Error(`Meilisearch error: ${response.status}`);
      }
    } catch (err) {
      console.error('Meilisearch indexing failed:', err);
    }
  }

  if (process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_ADMIN_API_KEY) {
    // Algolia implementation
    try {
      const response = await fetch(`https://${process.env.ALGOLIA_APP_ID}.algolia.net/1/indexes/${collection}/batch`, {
        method: 'POST',
        headers: {
          'X-Algolia-API-Key': process.env.ALGOLIA_ADMIN_API_KEY,
          'X-Algolia-Application-Id': process.env.ALGOLIA_APP_ID,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            action: 'addObject',
            body: {
              ...data,
              objectID: data.id,
            },
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Algolia error: ${response.status}`);
      }
    } catch (err) {
      console.error('Algolia indexing failed:', err);
    }
  }
}

async function removeFromSearchIndex(collection: string, docId: string) {
  // Remove from search indices
  if (process.env.MEILISEARCH_HOST && process.env.MEILISEARCH_API_KEY) {
    try {
      await fetch(`${process.env.MEILISEARCH_HOST}/indexes/${collection}/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.MEILISEARCH_API_KEY}`,
        },
      });
    } catch (err) {
      console.error('Meilisearch removal failed:', err);
    }
  }

  if (process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_ADMIN_API_KEY) {
    try {
      await fetch(`https://${process.env.ALGOLIA_APP_ID}.algolia.net/1/indexes/${collection}/batch`, {
        method: 'POST',
        headers: {
          'X-Algolia-API-Key': process.env.ALGOLIA_ADMIN_API_KEY,
          'X-Algolia-Application-Id': process.env.ALGOLIA_APP_ID,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            action: 'deleteObject',
            body: {
              objectID: docId,
            },
          }],
        }),
      });
    } catch (err) {
      console.error('Algolia removal failed:', err);
    }
  }
}
