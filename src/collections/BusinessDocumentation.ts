import { CollectionConfig } from 'payload';

export const BusinessDocumentation: CollectionConfig = {
  slug: 'business-documentation',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'textarea', required: true },
  ],
};
