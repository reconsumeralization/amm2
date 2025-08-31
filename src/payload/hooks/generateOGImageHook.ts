// src/payload/hooks/generateOGImageHook.ts
import { CollectionAfterChangeHook } from 'payload';
import { generateProfessionalOGImage } from '../../utils/generateProfessionalOGImage';

interface OGHookOptions {
  titleField?: string;
  excerptField?: string;
  categoryField?: string;
  categoryColorField?: string;
  logoUrlField?: string;
  template?: 'default' | 'blog' | 'product' | 'event' | 'service' | 'customer';
}

export const generateOGImageHook = (options: OGHookOptions = {}): CollectionAfterChangeHook => {
  return async ({ doc, req, operation, collection }) => {
    // Only run on create/update operations
    // Note: delete operations are handled separately

    // Skip if no title field or title is empty
    const titleField = options.titleField || 'title';
    const title = doc[titleField];
    if (!title || typeof title !== 'string') return doc;

    try {
      console.log(`[OG] Generating image for ${collection.slug}: ${title}`);

      // Extract field values with fallbacks
      const excerpt = options.excerptField ? doc[options.excerptField] : '';
      const category = options.categoryField ? doc[options.categoryField] : '';
      const categoryColor = options.categoryColorField ? doc[options.categoryColorField] : '#1a1a1a';
      const logoUrl = options.logoUrlField ? doc[options.logoUrlField] : '/logo.svg';

      // Determine template based on collection or explicit option
      const template = options.template || getTemplateForCollection(collection.slug);

      // Generate unique filename
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
        excerpt: excerpt || '',
        category: category || '',
        categoryColor,
        logoUrl,
        template,
        outputFileName,
        collectionSlug: collection.slug,
      });

      console.log(`[OG] Generated: ${ogImageUrl}`);

      // Update the document with the OG image URL
      const updatedDoc = await req.payload.update({
        collection: collection.slug,
        id: doc.id,
        data: {
          ogImage: ogImageUrl,
        },
        req,
      });

      return updatedDoc;

    } catch (error) {
      console.error('[OG] Failed to generate OG image:', error);
      // Don't fail the entire operation if OG generation fails
      return doc;
    }
  };
};

// Auto-determine template based on collection slug
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

// Pre-configured hooks for common collection types
export const blogOGHook = () => generateOGImageHook({
  titleField: 'title',
  excerptField: 'excerpt',
  categoryField: 'category',
  template: 'blog',
});

export const productOGHook = () => generateOGImageHook({
  titleField: 'title',
  excerptField: 'description',
  categoryField: 'category',
  template: 'product',
});

export const serviceOGHook = () => generateOGImageHook({
  titleField: 'title',
  excerptField: 'description',
  categoryField: 'category',
  template: 'service',
});

export const eventOGHook = () => generateOGImageHook({
  titleField: 'title',
  excerptField: 'description',
  categoryField: 'eventType',
  template: 'event',
});

export const customerOGHook = () => generateOGImageHook({
  titleField: 'name',
  excerptField: 'review',
  categoryField: 'rating',
  template: 'customer',
});
