// src/payload/utils/withSlugField.ts
import type { CollectionConfig, Field } from 'payload';
import { slugGenerator } from '../hooks';

export const slugField: Field = {
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'URL-friendly identifier (auto-generated from title)',
  },
  hooks: {
    beforeValidate: [slugGenerator],
  },
};

/**
 * Automatically adds a slug field if a `title` field exists.
 */
export const withSlugField = (collection: CollectionConfig): CollectionConfig => {
  const hasTitle = collection.fields?.some((f: any) => f.name === 'title');
  const hasSlug = collection.fields?.some((f: any) => f.name === 'slug');

  if (hasTitle && !hasSlug) {
    return {
      ...collection,
      fields: [...(collection.fields || []), slugField],
    };
  }

  return collection;
};
