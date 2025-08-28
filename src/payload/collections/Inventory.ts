import { CollectionConfig, AccessArgs } from 'payload'

export const Inventory: CollectionConfig = {
  slug: 'inventory',
  admin: {
    useAsTitle: 'name',
    description: 'Product inventory and stock management',
    group: 'Business',
    defaultColumns: ['name', 'category', 'currentStock', 'lowStockThreshold', 'unitCost'],
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
      name: 'sku',
      type: 'text',
      unique: true,
      admin: {
        description: 'Stock Keeping Unit (unique identifier)',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Hair Color', value: 'hair-color' },
        { label: 'Styling Products', value: 'styling' },
        { label: 'Treatment Products', value: 'treatment' },
        { label: 'Tools & Equipment', value: 'tools' },
        { label: 'Shampoos & Cleansers', value: 'shampoo' },
        { label: 'Conditioners', value: 'conditioner' },
        { label: 'Accessories', value: 'accessories' },
        { label: 'Disposables', value: 'disposables' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'brand',
      type: 'text',
      admin: {
        description: 'Product brand or manufacturer',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Product description and usage instructions',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Product image',
      },
    },
    {
      name: 'pricing',
      type: 'group',
      admin: {
        description: 'Cost and pricing information',
      },
      fields: [
        {
          name: 'unitCost',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Cost per unit (in cents)',
            step: 1,
          },
        },
        {
          name: 'retailPrice',
          type: 'number',
          min: 0,
          admin: {
            description: 'Retail price for customer sales (in cents)',
            step: 100,
          },
        },
        {
          name: 'markupPercentage',
          type: 'number',
          min: 0,
          admin: {
            description: 'Markup percentage (auto-calculated)',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'inventory',
      type: 'group',
      admin: {
        description: 'Stock management',
      },
      fields: [
        {
          name: 'currentStock',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Current stock level',
          },
        },
        {
          name: 'unit',
          type: 'select',
          required: true,
          options: [
            { label: 'Pieces', value: 'pieces' },
            { label: 'Milliliters (ml)', value: 'ml' },
            { label: 'Ounces (oz)', value: 'oz' },
            { label: 'Grams (g)', value: 'g' },
            { label: 'Kilograms (kg)', value: 'kg' },
            { label: 'Boxes', value: 'boxes' },
            { label: 'Bottles', value: 'bottles' },
            { label: 'Tubes', value: 'tubes' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'lowStockThreshold',
          type: 'number',
          defaultValue: 5,
          min: 0,
          admin: {
            description: 'Low stock alert threshold',
          },
        },
        {
          name: 'reorderPoint',
          type: 'number',
          min: 0,
          admin: {
            description: 'Reorder point level',
          },
        },
        {
          name: 'idealStock',
          type: 'number',
          min: 0,
          admin: {
            description: 'Ideal stock level to maintain',
          },
        },
        {
          name: 'stockStatus',
          type: 'select',
          admin: {
            description: 'Current stock status (auto-calculated)',
            readOnly: true,
          },
          options: [
            { label: 'In Stock', value: 'in-stock' },
            { label: 'Low Stock', value: 'low-stock' },
            { label: 'Out of Stock', value: 'out-of-stock' },
            { label: 'Overstock', value: 'overstock' },
          ],
        },
      ],
    },
    {
      name: 'suppliers',
      type: 'array',
      admin: {
        description: 'Supplier information',
      },
      fields: [
        {
          name: 'supplier',
          type: 'text',
          required: true,
        },
        {
          name: 'supplierCode',
          type: 'text',
          admin: {
            description: 'Supplier product code',
          },
        },
        {
          name: 'contact',
          type: 'text',
          admin: {
            description: 'Supplier contact information',
          },
        },
        {
          name: 'leadTime',
          type: 'number',
          min: 1,
          admin: {
            description: 'Lead time in days',
          },
        },
        {
          name: 'minimumOrder',
          type: 'number',
          min: 1,
          admin: {
            description: 'Minimum order quantity',
          },
        },
        {
          name: 'isPrimary',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Primary supplier for this product',
          },
        },
      ],
    },
    {
      name: 'usage',
      type: 'group',
      admin: {
        description: 'Usage tracking and analytics',
      },
      fields: [
        {
          name: 'monthlyUsage',
          type: 'number',
          admin: {
            description: 'Average monthly usage',
            readOnly: true,
          },
        },
        {
          name: 'usageRate',
          type: 'select',
          admin: {
            description: 'Usage rate (auto-calculated)',
            readOnly: true,
          },
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Very High', value: 'very-high' },
          ],
        },
        {
          name: 'lastUsed',
          type: 'date',
          admin: {
            description: 'Last usage date',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: {
        description: 'Services that use this product',
      },
    },
    {
      name: 'alerts',
      type: 'group',
      admin: {
        description: 'Alert settings',
      },
      fields: [
        {
          name: 'lowStockAlert',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Enable low stock email alerts',
          },
        },
        {
          name: 'outOfStockAlert',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Enable out of stock alerts',
          },
        },
        {
          name: 'expirationAlert',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable expiration date alerts',
          },
        },
      ],
    },
    {
      name: 'expiration',
      type: 'group',
      admin: {
        description: 'Expiration and shelf life',
      },
      fields: [
        {
          name: 'hasExpiration',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'shelfLife',
          type: 'number',
          min: 1,
          admin: {
            description: 'Shelf life in days',
            condition: (data) => data.hasExpiration,
          },
        },
        {
          name: 'batchNumber',
          type: 'text',
          admin: {
            description: 'Current batch number',
            condition: (data) => data.hasExpiration,
          },
        },
        {
          name: 'expiryDate',
          type: 'date',
          admin: {
            description: 'Expiration date',
            condition: (data) => data.hasExpiration,
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Active product',
        position: 'sidebar',
      },
    },
    {
      name: 'requiresPrescription',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Requires prescription or special certification',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }: { data: any }) => {
        // Calculate markup percentage
        if (data.pricing?.unitCost && data.pricing?.retailPrice) {
          const markup = ((data.pricing.retailPrice - data.pricing.unitCost) / data.pricing.unitCost) * 100
          data.pricing.markupPercentage = Math.round(markup)
        }

        // Determine stock status
        if (data.inventory?.currentStock !== undefined) {
          const stock = data.inventory.currentStock
          const threshold = data.inventory.lowStockThreshold || 5
          const ideal = data.inventory.idealStock

          if (stock === 0) {
            data.inventory.stockStatus = 'out-of-stock'
          } else if (stock <= threshold) {
            data.inventory.stockStatus = 'low-stock'
          } else if (ideal && stock > ideal * 1.2) {
            data.inventory.stockStatus = 'overstock'
          } else {
            data.inventory.stockStatus = 'in-stock'
          }
        }

        // Calculate expiry date if shelf life is set
        if (data.expiration?.hasExpiration && data.expiration?.shelfLife && data.updatedAt) {
          const expiryDate = new Date(data.updatedAt)
          expiryDate.setDate(expiryDate.getDate() + data.expiration.shelfLife)
          data.expiration.expiryDate = expiryDate
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }: { doc: any; req: any; operation: any }) => {
        if (operation === 'create' || operation === 'update') {
          // Send alerts if needed
          if (doc.inventory?.stockStatus === 'low-stock' && doc.alerts?.lowStockAlert) {
            console.log(`Low stock alert: ${doc.name} (${doc.currentStock} remaining)`)
          }
          if (doc.inventory?.stockStatus === 'out-of-stock' && doc.alerts?.outOfStockAlert) {
            console.log(`Out of stock alert: ${doc.name}`)
          }
        }
      },
    ],
  },
  access: {
    read: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      return true // All authenticated users can read inventory
    },
    create: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      return user.role === 'admin' || user.role === 'manager'
    },
    update: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      return user.role === 'admin' || user.role === 'manager'
    },
    delete: ({ req }: AccessArgs) => {
      const user = req.user
      if (!user) return false
      return user.role === 'admin'
    },
  },
  timestamps: true,
}
