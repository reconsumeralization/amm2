import { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  admin: {
    group: 'Content',
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    { name: 'caption', type: 'text' },
  ],
};