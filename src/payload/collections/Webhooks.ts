import { CollectionConfig } from 'payload/types';

const Webhooks: CollectionConfig = {
  slug: 'webhooks',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
  ],
};

export default Webhooks;
