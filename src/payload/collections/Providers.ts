import { CollectionConfig } from 'payload/types';

const Providers: CollectionConfig = {
  slug: 'providers',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
};

export default Providers;
