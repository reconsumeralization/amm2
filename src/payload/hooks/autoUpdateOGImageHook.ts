// src/payload/hooks/autoUpdateOGImageHook.ts
import type { CollectionAfterChangeHook } from 'payload';
import { generateProfessionalOGImage } from '../../utils/generateProfessionalOGImage';
import * as path from 'path';
import * as fs from 'fs';

interface AutoUpdateOGHookOptions {
  titleField?: string;
  excerptField?: string;
  categoryField?: string;
  categoryColorField?: string;
  logoUrlField?: string;
  statusField?: string;
  publishedField?: string;
  cleanupOldImages?: boolean;
}

export const autoUpdateOGImageHook = (options: AutoUpdateOGHookOptions = {}): CollectionAfterChangeHook => {
  const {
    titleField = 'title',
    excerptField = 'excerpt',
    categoryField = 'category',
    categoryColorField = 'categoryColor',
    logoUrlField = 'logoUrl',
    statusField = 'status',
    publishedField = 'published',
    cleanupOldImages = true,
  } = options;

  return async ({ doc, req, operation, collection, previousDoc }) => {
    // Only run on create/update operations
    // Note: delete operations are handled separately

    try {
      // Check if document should have OG image generation
      const title = doc[titleField] || doc.name;
      if (!title || typeof title !== 'string') return doc;

      // Draft-aware: only generate for published content
      const isDraft = doc[statusField] === 'draft' || doc[publishedField] === false;
      const wasDraft = previousDoc?.[statusField] === 'draft' || previousDoc?.[publishedField] === false;

      // Only generate if:
      // 1. Content is published, OR
      // 2. Content is transitioning from draft to published
      if (isDraft && !wasDraft) return doc;

      // Check if regeneration is needed
      const needsRegeneration = shouldRegenerateOGImage(doc, previousDoc, {
        titleField,
        excerptField,
        categoryField,
        categoryColorField,
        logoUrlField,
      });

      if (!needsRegeneration && previousDoc?.ogImage) {
        return doc; // No changes needed
      }

      console.log(`[OG] ${needsRegeneration ? 'Regenerating' : 'Generating'} OG image for ${collection.slug}: ${title}`);

      // Extract field values
      const excerpt = doc[excerptField] || doc.description || doc.content?.substring(0, 150) || '';
      const category = doc[categoryField] || doc.eventType || doc.serviceType || '';
      const categoryColor = doc[categoryColorField] || getCategoryColor(category);
      const logoUrl = doc[logoUrlField] || '/logo.svg';

      // Create unique filename
      const safeTitle = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50);

      const timestamp = new Date().toISOString().split('T')[0];
      const outputFileName = `${collection.slug}-${doc.id}-${timestamp}.png`;

      // Generate the OG image
      const ogImageUrl = await generateProfessionalOGImage({
        title,
        excerpt: excerpt.toString(),
        category,
        categoryColor,
        logoUrl,
        template: getTemplateForCollection(collection.slug),
        outputFileName,
        collectionSlug: collection.slug,
      });

      console.log(`[OG] Generated: ${ogImageUrl}`);

      // Clean up old OG image if it exists and cleanup is enabled
      if (cleanupOldImages && previousDoc?.ogImage && req?.payload) {
        await cleanupOldOGImage(previousDoc.ogImage, req.payload);
      }

      return {
        ...doc,
        ogImage: ogImageUrl,
      };

    } catch (error) {
      console.error('[OG] Failed to generate/update OG image:', error);
      // Don't fail the entire operation if OG generation fails
      return doc;
    }
  };
};

// Check if OG image regeneration is needed
function shouldRegenerateOGImage(
  currentDoc: any,
  previousDoc: any,
  fields: {
    titleField: string;
    excerptField: string;
    categoryField: string;
    categoryColorField: string;
    logoUrlField: string;
  }
): boolean {
  // Always regenerate if no previous OG image exists
  if (!previousDoc?.ogImage) return true;

  // Check if key fields changed
  const fieldsToCheck = [
    fields.titleField,
    fields.excerptField,
    fields.categoryField,
    fields.categoryColorField,
    fields.logoUrlField,
    'name', // Alternative title field
    'description', // Alternative excerpt field
    'content', // Alternative excerpt field
    'eventType', // Alternative category field
    'serviceType', // Alternative category field
  ];

  for (const field of fieldsToCheck) {
    if (currentDoc[field] !== previousDoc[field]) {
      return true;
    }
  }

  return false;
}

// Clean up old OG image from filesystem and Payload Media
async function cleanupOldOGImage(oldOGImageUrl: string, payload: any) {
  try {
    // Extract filename from URL
    const filename = path.basename(oldOGImageUrl);

    // Try to find and delete from Payload Media
    const mediaDocs = await payload.find({
      collection: 'media' as any as any,
      where: {
        filename: {
          equals: filename,
        },
      },
      limit: 1,
    });

    if (mediaDocs.docs.length > 0) {
      await payload.delete({
        collection: 'media' as any as any,
        id: mediaDocs.docs[0].id,
      });
      console.log(`[OG] Cleaned up old Media entry: ${filename}`);
    }

    // Try to delete from filesystem
    const filePath = path.join(process.cwd(), 'public', oldOGImageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[OG] Cleaned up old file: ${filename}`);
    }

  } catch (error) {
    console.warn('[OG] Failed to cleanup old OG image:', error);
  }
}

// Get appropriate color for category
function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    'BarberShop': '#1a365d',
    'haircut': '#2d3748',
    'review': '#38a169',
    'sale': '#d69e2e',
    'guide': '#3182ce',
    'lifestyle': '#805ad5',
    'event': '#d53f8c',
    'service': '#38a169',
    'blog': '#2d3748',
    'product': '#4a5568',
    'customer': '#805ad5',
    'testimonial': '#d53f8c',
  };

  // Try exact match first
  if (colorMap[category.toLowerCase()]) {
    return colorMap[category.toLowerCase()];
  }

  // Try partial match
  for (const [key, color] of Object.entries(colorMap)) {
    if (category.toLowerCase().includes(key)) {
      return color;
    }
  }

  return '#1a202c'; // Default fallback
}

// Get appropriate template for collection
function getTemplateForCollection(slug: string): 'default' | 'blog' | 'product' | 'event' | 'service' | 'customer' {
  const templateMap: Record<string, 'default' | 'blog' | 'product' | 'event' | 'service' | 'customer'> = {
    // Blog/Content collections
    'blog-posts': 'blog',
    'pages': 'blog',
    'documentation': 'blog',
    'business-documentation': 'blog',

    // Product collections
    'products': 'product',
    'gift-cards': 'product',
    'service-packages': 'product',

    // Service collections
    'services': 'service',
    'appointments': 'service',

    // Event collections
    'events': 'event',
    'promotions': 'event',

    // Customer collections
    'customers': 'customer',
    'testimonials': 'customer',
    'reviews': 'customer',
  };

  return templateMap[slug] || 'default';
}
