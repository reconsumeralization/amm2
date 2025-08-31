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
      relationTo: 'customers' as any as any,
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
          relationTo: 'products' as any as any,
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
          relationTo: 'promotions' as any as any,
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
      relationTo: 'tenants' as any as any,
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
                collection: 'products' as any as any,
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
              collection: 'promotions' as any as any,
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
          data.tenant = (req.user as any)?.tenant;
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
                  collection: 'products' as any as any,
                  id: item.product
                });

                if (product && product.stock !== undefined) {
                  const newStock = Math.max(0, product.stock - item.quantity);
                  await req.payload.update({
                    collection: 'products' as any as any,
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
                collection: 'loyalty-program' as any as any,
                where: {
                  customer: { equals: doc.customer },
                  status: { equals: 'active' }
                }
              });

              if (loyaltyProgram.totalDocs > 0) {
                const loyaltyRecord = loyaltyProgram.docs[0];
                const purchasePoints = Math.floor((doc.pricing?.total || 0) / 10); // 1 point per $10 spent

                await req.payload.update({
                  collection: 'loyalty-program' as any as any,
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
                collection: 'users' as any as any,
                id: doc.customer
              });

              if (customer?.email) {
                console.log(`Sending order confirmation to: ${(customer as any)?.email}`);
                
                try {
                  const { emailService } = await import('@/lib/email-service');
                  await emailService.sendEmail({
                    to: (customer as any)?.email,
                    subject: `Order Confirmation #${doc.orderNumber} - ModernMen`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #28a745;">Order Confirmed!</h2>
                        <p>Hi ${customer.name || (customer as any)?.email},</p>
                        <p>Thank you for your order! We've received your purchase and it's being processed.</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                          <h3>Order Details:</h3>
                          <p><strong>Order Number:</strong> #${doc.orderNumber}</p>
                          <p><strong>Status:</strong> ${doc.status}</p>
                          <p><strong>Order Date:</strong> ${new Date(doc.createdAt).toLocaleDateString()}</p>
                          
                          <h4>Items Ordered:</h4>
                          ${doc.items?.map((item: any) => `
                            <div style="border-left: 3px solid #28a745; padding-left: 15px; margin: 10px 0;">
                              <p><strong>Item:</strong> ${item.product?.name || 'Product'}</p>
                              ${item.variant ? `<p><strong>Variant:</strong> ${item.variant}</p>` : ''}
                              <p><strong>Quantity:</strong> ${item.quantity}</p>
                              <p><strong>Price:</strong> $${((item.totalPrice || 0) / 100).toFixed(2)}</p>
                            </div>
                          `).join('') || ''}
                          
                          <div style="border-top: 1px solid #dee2e6; padding-top: 15px; margin-top: 15px;">
                            <p><strong>Subtotal:</strong> $${((doc.pricing?.subtotal || 0) / 100).toFixed(2)}</p>
                            ${doc.pricing?.tax ? `<p><strong>Tax:</strong> $${(doc.pricing.tax / 100).toFixed(2)}</p>` : ''}
                            ${doc.pricing?.shipping ? `<p><strong>Shipping:</strong> $${(doc.pricing.shipping / 100).toFixed(2)}</p>` : ''}
                            <p style="font-size: 18px;"><strong>Total:</strong> $${((doc.pricing?.total || 0) / 100).toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                          <h4>What's Next?</h4>
                          <p>We'll send you another email when your order ships with tracking information.</p>
                          <p>If you have any questions, please contact our customer service team.</p>
                        </div>
                        
                        <p>Thank you for shopping with ModernMen!</p>
                        <p>Best regards,<br>The ModernMen Team</p>
                      </div>
                    `,
                    text: `Order Confirmed! Hi ${customer.name || (customer as any)?.email}, Your order #${doc.orderNumber} for $${((doc.pricing?.total || 0) / 100).toFixed(2)} has been confirmed. We'll notify you when it ships. Thank you for shopping with ModernMen!`
                  });
                  
                  console.log(`Successfully sent order confirmation to: ${(customer as any)?.email}`);
                } catch (emailError) {
                  console.error('Error sending order confirmation email:', emailError);
                }
              }
            } catch (error) {
              console.error('Error sending order confirmation:', error);
            }
          }

          // Notify staff about new order
          try {
            const staffUsers = await req.payload.find({
              collection: 'users' as any as any,
              where: {
                role: { in: ['admin', 'manager'] },
                tenant: { equals: doc.tenant }
              }
            });

            for (const staff of staffUsers.docs) {
              if (staff.email) {
                console.log(`Notifying staff ${staff.email} about new order ${doc.orderNumber}`);
                
                try {
                  const { emailService } = await import('@/lib/email-service');
                  await emailService.sendEmail({
                    to: staff.email,
                    subject: `New Order #${doc.orderNumber} - ModernMen`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #17a2b8;">New Order Received</h2>
                        <p>Hi ${staff.name || staff.email},</p>
                        <p>A new order has been placed and requires processing.</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                          <h3>Order Summary:</h3>
                          <p><strong>Order Number:</strong> #${doc.orderNumber}</p>
                          <p><strong>Customer:</strong> ${doc.customer?.name || doc.customer?.email || 'N/A'}</p>
                          <p><strong>Status:</strong> ${doc.status}</p>
                          <p><strong>Total:</strong> $${((doc.pricing?.total || 0) / 100).toFixed(2)}</p>
                          <p><strong>Items:</strong> ${doc.items?.length || 0} item(s)</p>
                          <p><strong>Order Date:</strong> ${new Date(doc.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                        <p>Please process this order in the admin dashboard.</p>
                        <p>Best regards,<br>ModernMen System</p>
                      </div>
                    `,
                    text: `New order #${doc.orderNumber} from ${doc.customer?.name || doc.customer?.email || 'customer'} for $${((doc.pricing?.total || 0) / 100).toFixed(2)}. Status: ${doc.status}. Please process in admin dashboard.`
                  });
                  
                  console.log(`Successfully sent order notification to staff: ${staff.email}`);
                } catch (emailError) {
                  console.error(`Error sending order notification to ${staff.email}:`, emailError);
                }
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
                      collection: 'products' as any as any,
                      id: item.product
                    });

                    if (product && product.stock !== undefined) {
                      await req.payload.update({
                        collection: 'products' as any as any,
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
                    collection: 'loyalty-program' as any as any,
                    where: {
                      customer: { equals: doc.customer },
                      status: { equals: 'active' }
                    }
                  });

                  if (loyaltyProgram.totalDocs > 0) {
                    const loyaltyRecord = loyaltyProgram.docs[0];
                    const refundPoints = Math.floor((doc.pricing?.total || 0) / 20); // Half the points back

                    await req.payload.update({
                      collection: 'loyalty-program' as any as any,
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
                    collection: 'users' as any as any,
                    id: doc.customer
                  });

                  if (customer?.email) {
                    console.log(`Sending shipping confirmation to: ${(customer as any)?.email}`);
                    
                    try {
                      const { emailService } = await import('@/lib/email-service');
                      await emailService.sendEmail({
                        to: (customer as any)?.email,
                        subject: `Your Order #${doc.orderNumber} Has Shipped! - ModernMen`,
                        html: `
                          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #ffc107;">Your Order Has Shipped!</h2>
                            <p>Hi ${customer.name || (customer as any)?.email},</p>
                            <p>Great news! Your order is on its way to you.</p>
                            
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                              <h3>Shipping Details:</h3>
                              <p><strong>Order Number:</strong> #${doc.orderNumber}</p>
                              <p><strong>Shipped Date:</strong> ${new Date().toLocaleDateString()}</p>
                              <p><strong>Total:</strong> $${((doc.pricing?.total || 0) / 100).toFixed(2)}</p>
                              ${doc.shipping?.trackingNumber ? `<p><strong>Tracking Number:</strong> ${doc.shipping.trackingNumber}</p>` : ''}
                              ${doc.shipping?.carrier ? `<p><strong>Carrier:</strong> ${doc.shipping.carrier}</p>` : ''}
                              ${doc.shipping?.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(doc.shipping.estimatedDelivery).toLocaleDateString()}</p>` : ''}
                            </div>
                            
                            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                              <h4>Track Your Package:</h4>
                              ${doc.shipping?.trackingNumber ? `
                                <p>You can track your package using the tracking number above on the carrier's website.</p>
                                ${doc.shipping?.trackingUrl ? `<p><a href="${doc.shipping.trackingUrl}" style="color: #007bff;">Click here to track your package</a></p>` : ''}
                              ` : '<p>You will receive tracking information once your package is picked up by the carrier.</p>'}
                            </div>
                            
                            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                              <h4>Delivery Information:</h4>
                              <p>Please ensure someone is available to receive your package. If you're not available, the carrier may leave a delivery notice with instructions for pickup or redelivery.</p>
                            </div>
                            
                            <p>Thank you for your business! We hope you love your purchase.</p>
                            <p>If you have any questions about your shipment, please contact our customer service team.</p>
                            <p>Best regards,<br>The ModernMen Team</p>
                          </div>
                        `,
                        text: `Your order #${doc.orderNumber} has shipped! ${doc.shipping?.trackingNumber ? 'Tracking number: ' + doc.shipping.trackingNumber + '. ' : ''}${doc.shipping?.estimatedDelivery ? 'Estimated delivery: ' + new Date(doc.shipping.estimatedDelivery).toLocaleDateString() + '. ' : ''}Thank you for your business!`
                      });
                      
                      console.log(`Successfully sent shipping confirmation to: ${(customer as any)?.email}`);
                    } catch (emailError) {
                      console.error('Error sending shipping confirmation email:', emailError);
                    }
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
      if ((req.user as any)?.role === 'super-admin') return true;
      
      // Admin/Manager: tenant-based access
      if ((req.user as any)?.role === 'admin' || (req.user as any)?.role === 'manager') {
        return (req.user as any)?.tenant ? { tenant: { equals: (req.user as any)?.tenant.id } } : false;
      }
      
      // Customer can only see their own orders
      return { customer: { equals: req.user.id } };
    },
    create: ({ req }: any): any => !!req.user,
    update: ({ req }: any): any => {
      if (!req.user) return false
      if ((req.user as any)?.role === 'admin' || (req.user as any)?.role === 'manager') return true
      return { customer: { equals: req.user.id } }
    },
    delete: ({ req }: any): any => {
      if (!req.user) return false
      if ((req.user as any)?.role === 'admin' || (req.user as any)?.role === 'manager') return true
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
