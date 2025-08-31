// src/payload/utils/withSEOFields.ts
import type { CollectionConfig, Field } from 'payload';

export const seoFields: Field[] = [
  {
    name: 'metaTitle',
    type: 'text',
    label: 'Meta Title',
    admin: {
      description: 'Appears in search results & social previews (50–60 chars recommended)',
    },
    validate: (value: any) => {
      if (value && typeof value === 'string' && value.length > 60) {
        return 'Meta title should be 60 characters or less for optimal SEO';
      }
      return true;
    },
  },
  {
    name: 'metaDescription',
    type: 'textarea',
    label: 'Meta Description',
    admin: {
      description: 'Appears in search results & social previews (150–160 chars recommended)',
    },
    validate: (value: any) => {
      if (value && typeof value === 'string' && value.length > 160) {
        return 'Meta description should be 160 characters or less for optimal SEO';
      }
      return true;
    },
  },
  {
    name: 'ogImage',
    type: 'upload',
    relationTo: 'media',
    label: 'OG Image',
    admin: {
      description: 'Image used in link previews (1200x630px recommended)',
    },
  },
  {
    name: 'noIndex',
    type: 'checkbox',
    label: 'No Index',
    defaultValue: false,
    admin: {
      description: 'Check to exclude this page from search engine indexing',
    },
  },
  {
    name: 'canonicalUrl',
    type: 'text',
    label: 'Canonical URL',
    admin: {
      description: 'Canonical URL for this content (leave empty for auto-generation)',
    },
  },
];

/**
 * Automatically adds SEO fields if collection has a title field.
 */
export const withSEOFields = (collection: CollectionConfig): CollectionConfig => {
  // Only attach if there is a title field (heuristic for content)
  const fields = collection.fields || []
  const hasTitle = fields.some((f: any) => f.name === 'title')
  if (!hasTitle) return collection

  // Add only missing SEO fields to avoid DuplicateFieldName errors
  const existingNames = new Set((fields as any[]).map((f: any) => f.name))
  const additions = seoFields.filter((f) => !existingNames.has((f as any).name))
  if (additions.length === 0) return collection

  return {
    ...collection,
    fields: [...fields, ...additions],
  }
}
