import { CollectionConfig } from 'payload';
import { productAfterChangeHook } from '../hooks/products/afterChange';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    description: 'Retail products and grooming supplies',
    defaultColumns: ['name', 'category', 'price', 'stockLevel', 'isActive'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Product name',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version of the name',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Detailed product description',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      maxLength: 200,
      admin: {
        description: 'Brief product summary (max 200 characters)',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Hair Care', value: 'hair-care' },
        { label: 'Beard Care', value: 'beard-care' },
        { label: 'Styling Products', value: 'styling' },
        { label: 'Tools & Equipment', value: 'tools' },
        { label: 'Gift Sets', value: 'gift-sets' },
        { label: 'Accessories', value: 'accessories' },
        { label: 'Skincare', value: 'skincare' },
        { label: 'Fragrances', value: 'fragrances' },
      ],
      admin: {
        description: 'Product category',
      },
    },
    {
      name: 'brand',
      type: 'text',
      admin: {
        description: 'Product brand or manufacturer',
      },
    },
    {
      name: 'sku',
      type: 'text',
      unique: true,
      admin: {
        description: 'Stock Keeping Unit (unique identifier)',
      },
    },
    {
      name: 'images',
      type: 'array',
      admin: {
        description: 'Product images (first image is primary)',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'altText',
          type: 'text',
          admin: {
            description: 'Alt text for accessibility',
          },
        },
        {
          name: 'isPrimary',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Mark as primary image',
          },
        },
      ],
    },
    {
      name: 'pricing',
      type: 'group',
      admin: {
        description: 'Pricing information',
      },
      fields: [
        {
          name: 'basePrice',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Base price in cents',
            step: 100,
          },
        },
        {
          name: 'salePrice',
          type: 'number',
          min: 0,
          admin: {
            description: 'Sale price in cents (if on sale)',
            step: 100,
          },
        },
        {
          name: 'costPrice',
          type: 'number',
          min: 0,
          admin: {
            description: 'Cost price in cents (for profit calculation)',
            step: 100,
          },
        },
        {
          name: 'currency',
          type: 'select',
          defaultValue: 'CAD',
          options: [
            { label: 'Canadian Dollar', value: 'CAD' },
            { label: 'US Dollar', value: 'USD' },
            { label: 'Euro', value: 'EUR' },
          ],
        },
      ],
    },
    {
      name: 'inventory',
      type: 'group',
      admin: {
        description: 'Inventory management',
      },
      fields: [
        {
          name: 'stockLevel',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Current stock level',
          },
        },
        {
          name: 'lowStockThreshold',
          type: 'number',
          defaultValue: 5,
          min: 0,
          admin: {
            description: 'Alert when stock falls below this level',
          },
        },
        {
          name: 'maxStock',
          type: 'number',
          min: 0,
          admin: {
            description: 'Maximum stock level',
          },
        },
        {
          name: 'trackInventory',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Track inventory levels',
          },
        },
      ],
    },
    {
      name: 'variants',
      type: 'array',
      admin: {
        description: 'Product variants (size, color, etc.)',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Variant name (e.g., "Large", "Blue")',
          },
        },
        {
          name: 'sku',
          type: 'text',
          admin: {
            description: 'Variant-specific SKU',
          },
        },
        {
          name: 'price',
          type: 'number',
          min: 0,
          admin: {
            description: 'Variant-specific price in cents',
            step: 100,
          },
        },
        {
          name: 'stockLevel',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Variant stock level',
          },
        },
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Enable/disable this variant',
          },
        },
      ],
    },
    {
      name: 'specifications',
      type: 'array',
      admin: {
        description: 'Product specifications',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Specification name (e.g., "Size", "Weight")',
          },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: {
            description: 'Specification value',
          },
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Product tags for search and filtering',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      admin: {
        description: 'SEO settings',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          maxLength: 60,
          admin: {
            description: 'SEO title (50-60 characters)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
          admin: {
            description: 'SEO description (150-160 characters)',
          },
        },
        {
          name: 'keywords',
          type: 'array',
          fields: [
            {
              name: 'keyword',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        description: 'Product status',
        position: 'sidebar',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Enable/disable product',
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this product',
        position: 'sidebar',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Generate slug if not provided
        if (!data.slug && data.name) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }

        // Ensure prices are in cents
        if (data.pricing?.basePrice && data.pricing.basePrice < 100) {
          data.pricing.basePrice = Math.round(data.pricing.basePrice * 100);
        }
        if (data.pricing?.salePrice && data.pricing.salePrice < 100) {
          data.pricing.salePrice = Math.round(data.pricing.salePrice * 100);
        }
        if (data.pricing?.costPrice && data.pricing.costPrice < 100) {
          data.pricing.costPrice = Math.round(data.pricing.costPrice * 100);
        }

        // Ensure variant prices are in cents
        if (data.variants) {
          data.variants = data.variants.map((variant: any) => {
            if (variant.price && variant.price < 100) {
              variant.price = Math.round(variant.price * 100);
            }
            return variant;
          });
        }

        // Auto-generate SKU if not provided
        if (!data.sku && data.name) {
          const prefix = data.category?.toUpperCase().replace('-', '') || 'PROD';
          const timestamp = Date.now().toString().slice(-6);
          data.sku = `${prefix}-${timestamp}`;
        }

        // Set tenant if not provided
        if (!data.tenant && req.user?.tenant) {
          data.tenant = req.user.tenant;
        }

        return data;
      },
    ],
    afterChange: [productAfterChangeHook],
    beforeDelete: [
      async ({ id, req }) => {
        // Check if product can be deleted (no active orders, etc.)
        try {
          // Add validation logic here
          console.log(`Deleting product: ${id}`);
        } catch (error) {
          throw new Error('Cannot delete product with active orders');
        }
      },
    ],
  },
  access: {
    read: () => true, // Public read access
    create: ({ req }) => {
      return req.user?.role === 'admin' || req.user?.role === 'manager';
    },
    update: ({ req }) => {
      return req.user?.role === 'admin' || req.user?.role === 'manager';
    },
    delete: ({ req }) => {
      return req.user?.role === 'admin';
    },
  },
  indexes: [
    {
      fields: ['name', 'category', 'brand'],
    },
    {
      fields: ['sku'],
      unique: true,
    },
    {
      fields: ['slug'],
      unique: true,
    },
    {
      fields: ['tenant', 'status'],
    },
  ],
  timestamps: true,
};