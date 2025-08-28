import { CollectionConfig } from 'payload';

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    group: 'E-commerce',
    description: 'Customer orders and transactions',
    defaultColumns: ['orderNumber', 'customer', 'total', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique order identifier',
        readOnly: true,
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      admin: {
        description: 'Customer who placed the order',
      },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      admin: {
        description: 'Order items',
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'variant',
          type: 'text',
          admin: {
            description: 'Product variant (if applicable)',
          },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 1,
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Price per unit in cents',
            readOnly: true,
          },
        },
        {
          name: 'totalPrice',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Total price for this item in cents',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'pricing',
      type: 'group',
      admin: {
        description: 'Order pricing breakdown',
      },
      fields: [
        {
          name: 'subtotal',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Subtotal in cents',
            readOnly: true,
          },
        },
        {
          name: 'tax',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Tax amount in cents',
            readOnly: true,
          },
        },
        {
          name: 'shipping',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Shipping cost in cents',
            readOnly: true,
          },
        },
        {
          name: 'discount',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Discount amount in cents',
            readOnly: true,
          },
        },
        {
          name: 'total',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: 'Total order amount in cents',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'shipping',
      type: 'group',
      admin: {
        description: 'Shipping information',
      },
      fields: [
        {
          name: 'address',
          type: 'group',
          fields: [
            {
              name: 'firstName',
              type: 'text',
              required: true,
            },
            {
              name: 'lastName',
              type: 'text',
              required: true,
            },
            {
              name: 'company',
              type: 'text',
            },
            {
              name: 'address1',
              type: 'text',
              required: true,
            },
            {
              name: 'address2',
              type: 'text',
            },
            {
              name: 'city',
              type: 'text',
              required: true,
            },
            {
              name: 'state',
              type: 'text',
              required: true,
            },
            {
              name: 'postalCode',
              type: 'text',
              required: true,
            },
            {
              name: 'country',
              type: 'select',
              defaultValue: 'CA',
              options: [
                { label: 'Canada', value: 'CA' },
                { label: 'United States', value: 'US' },
              ],
            },
            {
              name: 'phone',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'method',
          type: 'select',
          defaultValue: 'standard',
          options: [
            { label: 'Standard Shipping', value: 'standard' },
            { label: 'Express Shipping', value: 'express' },
            { label: 'Pickup', value: 'pickup' },
          ],
        },
        {
          name: 'trackingNumber',
          type: 'text',
          admin: {
            description: 'Shipping tracking number',
          },
        },
        {
          name: 'shippedAt',
          type: 'date',
          admin: {
            description: 'Date when order was shipped',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
      ],
    },
    {
      name: 'payment',
      type: 'group',
      admin: {
        description: 'Payment information',
      },
      fields: [
        {
          name: 'method',
          type: 'select',
          required: true,
          options: [
            { label: 'Credit Card', value: 'credit_card' },
            { label: 'Debit Card', value: 'debit_card' },
            { label: 'PayPal', value: 'paypal' },
            { label: 'Cash', value: 'cash' },
            { label: 'Gift Card', value: 'gift_card' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Paid', value: 'paid' },
            { label: 'Failed', value: 'failed' },
            { label: 'Refunded', value: 'refunded' },
            { label: 'Partially Refunded', value: 'partially_refunded' },
          ],
        },
        {
          name: 'transactionId',
          type: 'text',
          admin: {
            description: 'Payment processor transaction ID',
          },
        },
        {
          name: 'paidAt',
          type: 'date',
          admin: {
            description: 'Date when payment was received',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
      admin: {
        description: 'Order status',
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this order',
      },
    },
    {
      name: 'customerNotes',
      type: 'textarea',
      admin: {
        description: 'Notes from the customer',
      },
    },
    {
      name: 'loyaltyPoints',
      type: 'group',
      admin: {
        description: 'Loyalty points earned/spent',
      },
      fields: [
        {
          name: 'earned',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Points earned from this order',
            readOnly: true,
          },
        },
        {
          name: 'spent',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Points spent on this order',
            readOnly: true,
          },
        },
      ],
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
        // Generate order number if creating
        if (operation === 'create' && !data.orderNumber) {
          const timestamp = Date.now().toString().slice(-8);
          const random = Math.random().toString(36).substring(2, 6).toUpperCase();
          data.orderNumber = `ORD-${timestamp}-${random}`;
        }

        // Calculate pricing if items changed
        if (data.items && Array.isArray(data.items)) {
          const subtotal = data.items.reduce((sum: number, item: any) => {
            return sum + (item.totalPrice || 0);
          }, 0);

          data.pricing = {
            ...data.pricing,
            subtotal,
            total: subtotal + (data.pricing?.tax || 0) + (data.pricing?.shipping || 0) - (data.pricing?.discount || 0),
          };
        }

        // Set tenant if not provided
        if (!data.tenant && req.user?.tenant) {
          data.tenant = req.user.tenant;
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        // Update inventory
        await updateInventory(doc, operation);
        
        // Update customer loyalty points
        await updateLoyaltyPoints(doc, req);
        
        // Send order notifications
        await sendOrderNotifications(doc, operation, req);
        
        // Update analytics
        await updateOrderAnalytics(doc, operation);
      },
    ],
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      return { customer: { equals: req.user?.id } };
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  indexes: [
    {
      fields: ['orderNumber'],
      unique: true,
    },
    {
      fields: ['customer', 'createdAt'],
    },
    {
      fields: ['status', 'createdAt'],
    },
    {
      fields: ['tenant', 'status'],
    },
  ],
  timestamps: true,
};

async function updateInventory(doc: any, operation: string) {
  try {
    if (operation === 'create' && doc.items) {
      for (const item of doc.items) {
        // Decrease product inventory
        // This would be implemented based on your inventory management system
        console.log(`Updating inventory for product ${item.product}: -${item.quantity}`);
      }
    }
  } catch (error) {
    console.error('Inventory update failed:', error);
  }
}

async function updateLoyaltyPoints(doc: any, req: any) {
  try {
    if (doc.loyaltyPoints?.earned > 0) {
      // Add points to customer's loyalty account
      // await req.payload.update({
      //   collection: 'customers',
      //   id: doc.customer,
      //   data: {
      //     'loyalty.points': { increment: doc.loyaltyPoints.earned }
      //   },
      // });
    }
  } catch (error) {
    console.error('Loyalty points update failed:', error);
  }
}

async function sendOrderNotifications(doc: any, operation: string, req: any) {
  try {
    // Send order confirmation email
    if (operation === 'create') {
      // await sendOrderConfirmationEmail(doc);
    }
    
    // Send status update notifications
    if (operation === 'update') {
      // await sendStatusUpdateNotification(doc);
    }
  } catch (error) {
    console.error('Order notifications failed:', error);
  }
}

async function updateOrderAnalytics(doc: any, operation: string) {
  try {
    // Update order analytics and reporting
    // This would integrate with your analytics system
    console.log(`Order analytics updated for order: ${doc.orderNumber}`);
  } catch (error) {
    console.error('Order analytics update failed:', error);
  }
}
