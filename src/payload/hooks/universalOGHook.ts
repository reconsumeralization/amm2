// src/payload/hooks/universalOGHook.ts
import { generateProfessionalOGImage } from '../../utils/generateProfessionalOGImage';
import { ogTemplates, collectionColors } from '../../utils/ogTemplates';
import type { CollectionAfterChangeHook } from 'payload';

export const universalOGHook: CollectionAfterChangeHook = async ({ data, collection, req, operation }: any) => {
  // Only run if there's a title and this is a create/update operation
  if (!data.title || operation === 'delete') return data;

  try {
    // Create a safe file name
    const fileNameSafeTitle = data.title
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase()
      .slice(0, 50); // Limit length

    const dateStamp = new Date().toISOString().split('T')[0];
    const ogImageFileName = `${collection.slug}-${fileNameSafeTitle}-${dateStamp}.png`;

    // Extract excerpt: prefer explicit field, else first 150 chars of content
    let excerpt = '';
    if ('excerpt' in data && data.excerpt) {
      excerpt = data.excerpt;
    } else if ('content' in data && typeof data.content === 'string') {
      excerpt = data.content.slice(0, 150);
    } else if ('description' in data && data.description) {
      excerpt = data.description;
    }

    // Get category
    let category = '';
    if ('category' in data && data.category) {
      category = data.category;
    } else if ('eventType' in data && data.eventType) {
      category = data.eventType;
    } else if ('serviceType' in data && data.serviceType) {
      category = data.serviceType;
    }

    // Get category color based on collection
    const categoryColor = data.categoryColor || collectionColors[collection.slug] || collectionColors.default;

    // Get logo URL (can be customized per collection or global)
    const logoUrl = data.logoUrl || '/logo.svg';

    // Select template based on collection slug
    const template = (ogTemplates[collection.slug] || ogTemplates.default) as 'default' | 'blog' | 'product' | 'event' | 'service' | 'customer';

    console.log(`[OG] Generating ${template} for ${collection.slug}: ${data.title}`);

    const ogImageUrl = await generateProfessionalOGImage({
      title: data.title,
      excerpt,
      category: category || collection.slug,
      categoryColor,
      logoUrl,
      template,
      outputFileName: ogImageFileName,
      collectionSlug: collection.slug,
    });

    console.log(`[OG] Generated OG image: ${ogImageUrl}`);

    return {
      ...data,
      ogImage: ogImageUrl,
    };
  } catch (error) {
    console.error('[OG] Failed to generate OG image:', error);
    // Don't fail the entire operation if OG generation fails
    return data;
  }
};
