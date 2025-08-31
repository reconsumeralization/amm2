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
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Tax amount in cents',
            readOnly: true,
          },
        },
        {
          name: 'shipping',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Shipping cost in cents',
            readOnly: true,
          },
        },
        {
          name: 'discount',
          type: 'number',
          min: 0,
          defaultValue: 0,
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
            description: 'Total amount in cents',
            readOnly: true,
          },
        },
        {
          name: 'appliedPromotion',
          type: 'relationship',
          relationTo: 'promotions',
          admin: {
            description: 'Applied promotion/coupon',
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

        // Validate order items
        if (data.items && Array.isArray(data.items)) {
          for (const item of data.items) {
            if (!item.product || !item.quantity || item.quantity <= 0) {
              throw new Error('Invalid order item: missing product or invalid quantity');
            }
          }
        }

        // Check inventory availability for new orders
        if (operation === 'create' && data.items && Array.isArray(data.items) && req.payload) {
          for (const item of data.items) {
            try {
              const product = await req.payload.findByID({
                collection: 'products',
                id: item.product
              });

              if (product && product.stock !== undefined) {
                if ((product.stock - item.quantity) < 0) {
                  throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
                }
              }
            } catch (error) {
              console.error(`Error checking inventory for product ${item.product}:`, error);
            }
          }
        }

        // Auto-apply customer discounts or promotions
        if (operation === 'create' && data.customer && req.payload) {
          try {
            // Check for active promotions
            const promotions = await req.payload.find({
              collection: 'promotions',
              where: {
                status: { equals: 'active' },
                startDate: { less_than_equal: new Date().toISOString() },
                endDate: { greater_than_equal: new Date().toISOString() }
              }
            });

            if (promotions.totalDocs > 0) {
              // Apply best available discount
              const applicablePromo = promotions.docs[0]; // Simplified - take first active promotion
              if (applicablePromo.discountType === 'percentage') {
                data.pricing = {
                  ...data.pricing,
                  discount: (data.pricing?.subtotal || 0) * (applicablePromo.discountValue / 100),
                  appliedPromotion: applicablePromo.id
                };
              }
            }
          } catch (error) {
            console.error('Error applying promotions:', error);
          }
        }

        // Set tenant if not provided
        if (!data.tenant && req.user?.tenant) {
          data.tenant = req.user.tenant;
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, req, operation, previousDoc }) => {
        if (operation === 'create') {
          console.log(`New order created: ${doc.orderNumber}`)

          // Reduce inventory for order items
          if (doc.items && Array.isArray(doc.items) && req.payload) {
            for (const item of doc.items) {
              try {
                const product = await req.payload.findByID({
                  collection: 'products',
                  id: item.product
                });

                if (product && product.stock !== undefined) {
                  const newStock = Math.max(0, product.stock - item.quantity);
                  await req.payload.update({
                    collection: 'products',
                    id: item.product,
                    data: { stock: newStock }
                  });
                  console.log(`Reduced stock for ${product.name}: ${product.stock} → ${newStock}`);
                }
              } catch (error) {
                console.error(`Error updating inventory for product ${item.product}:`, error);
              }
            }
          }

          // Award loyalty points for purchase
          if (doc.customer && req.payload) {
            try {
              const loyaltyProgram = await req.payload.find({
                collection: 'loyalty-program',
                where: {
                  customer: { equals: doc.customer },
                  status: { equals: 'active' }
                }
              });

              if (loyaltyProgram.totalDocs > 0) {
                const loyaltyRecord = loyaltyProgram.docs[0];
                const purchasePoints = Math.floor((doc.pricing?.total || 0) / 10); // 1 point per $10 spent

                await req.payload.update({
                  collection: 'loyalty-program',
                  id: loyaltyRecord.id,
                  data: {
                    points: (loyaltyRecord.points || 0) + purchasePoints,
                    lastActivity: new Date(),
                    totalSpent: (loyaltyRecord.totalSpent || 0) + (doc.pricing?.total || 0),
                    orderCount: (loyaltyRecord.orderCount || 0) + 1
                  }
                });

                console.log(`Awarded ${purchasePoints} loyalty points for purchase`);
              }
            } catch (error) {
              console.error('Error awarding loyalty points:', error);
            }
          }

          // Send order confirmation email
          if (doc.customer && req.payload) {
            try {
              const customer = await req.payload.findByID({
                collection: 'users',
                id: doc.customer
              });

              if (customer?.email) {
                console.log(`Sending order confirmation to: ${customer.email}`);
                // TODO: Implement email service
                // await emailService.sendOrderConfirmation(customer.email, doc);
              }
            } catch (error) {
              console.error('Error sending order confirmation:', error);
            }
          }

          // Notify staff about new order
          try {
            const staffUsers = await req.payload.find({
              collection: 'users',
              where: {
                role: { in: ['admin', 'manager'] },
                tenant: { equals: doc.tenant }
              }
            });

            for (const staff of staffUsers.docs) {
              if (staff.email) {
                console.log(`Notifying staff ${staff.email} about new order ${doc.orderNumber}`);
                // TODO: Implement notification service
              }
            }
          } catch (error) {
            console.error('Error notifying staff:', error);
          }
        }

        if (operation === 'update' && previousDoc) {
          // Handle order status changes
          if (doc.status !== previousDoc.status) {
            console.log(`Order ${doc.orderNumber} status changed: ${previousDoc.status} → ${doc.status}`);

            if (doc.status === 'cancelled' && previousDoc.status !== 'cancelled') {
              // Restore inventory when order is cancelled
              if (doc.items && Array.isArray(doc.items) && req.payload) {
                for (const item of doc.items) {
                  try {
                    const product = await req.payload.findByID({
                      collection: 'products',
                      id: item.product
                    });

                    if (product && product.stock !== undefined) {
                      await req.payload.update({
                        collection: 'products',
                        id: item.product,
                        data: { stock: product.stock + item.quantity }
                      });
                      console.log(`Restored stock for ${product.name}: ${product.stock} → ${product.stock + item.quantity}`);
                    }
                  } catch (error) {
                    console.error(`Error restoring inventory for product ${item.product}:`, error);
                  }
                }
              }

              // Deduct loyalty points for cancellation
              if (doc.customer && req.payload) {
                try {
                  const loyaltyProgram = await req.payload.find({
                    collection: 'loyalty-program',
                    where: {
                      customer: { equals: doc.customer },
                      status: { equals: 'active' }
                    }
                  });

                  if (loyaltyProgram.totalDocs > 0) {
                    const loyaltyRecord = loyaltyProgram.docs[0];
                    const refundPoints = Math.floor((doc.pricing?.total || 0) / 20); // Half the points back

                    await req.payload.update({
                      collection: 'loyalty-program',
                      id: loyaltyRecord.id,
                      data: {
                        points: Math.max(0, (loyaltyRecord.points || 0) - refundPoints)
                      }
                    });

                    console.log(`Deducted ${refundPoints} points for order cancellation`);
                  }
                } catch (error) {
                  console.error('Error processing point refund:', error);
                }
              }
            }

            if (doc.status === 'shipped' && previousDoc.status !== 'shipped') {
              // Send shipping confirmation
              if (doc.customer && req.payload) {
                try {
                  const customer = await req.payload.findByID({
                    collection: 'users',
                    id: doc.customer
                  });

                  if (customer?.email) {
                    console.log(`Sending shipping confirmation to: ${customer.email}`);
                    // TODO: Implement shipping notification
                  }
                } catch (error) {
                  console.error('Error sending shipping notification:', error);
                }
              }
            }
          }
        }

        // Legacy hooks have been integrated into the main hook logic above
      },
    ],
  },
  access: {
    read: ({ req }: any): any => {
      if (!req.user) return false;
      
      // Super-admin has access to all orders
      if (req.user.role === 'super-admin') return true;
      
      // Admin/Manager: tenant-based access
      if (req.user.role === 'admin' || req.user.role === 'manager') {
        return req.user.tenant ? { tenant: { equals: req.user.tenant.id } } : false;
      }
      
      // Customer can only see their own orders
      return { customer: { equals: req.user.id } };
    },
    create: ({ req }: any): any => !!req.user,
    update: ({ req }: any): any => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      return { customer: { equals: req.user.id } }
    },
    delete: ({ req }: any): any => {
      if (!req.user) return false
      if (req.user.role === 'admin' || req.user.role === 'manager') return true
      return false // Customers cannot delete orders
    },
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

// Helper functions for order processing have been integrated into the main hooks above
