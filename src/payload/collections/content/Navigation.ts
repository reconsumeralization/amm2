import { CollectionConfig } from 'payload';

const Navigation: CollectionConfig = {
  slug: 'navigation',
  admin: {
    useAsTitle: 'name',
    description: 'Site navigation menu items',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Navigation menu name (e.g., "Main Menu")',
      },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      admin: {
        description: 'Navigation menu items',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Display text for the menu item',
          },
        },
        {
          name: 'href',
          type: 'text',
          required: true,
          admin: {
            description: 'URL or path for the menu item',
          },
        },
        {
          name: 'internal',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Is this an internal link?',
          },
        },
        {
          name: 'order',
          type: 'number',
          admin: {
            description: 'Display order (lower numbers appear first)',
          },
        },
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show this menu item',
          },
        },
      ],
    },
  ],
  timestamps: true,
};

export { Navigation };
