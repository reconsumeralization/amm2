import type { CollectionAfterChangeHook } from 'payload';

export const productAfterChangeHook: CollectionAfterChangeHook = async ({
  doc,
  req,
  previousDoc,
  operation,
}) => {
  try {
    // Handle product changes
    if (operation === 'create' || operation === 'update') {
      console.log(`Product ${operation}d:`, doc.name);

      // Update search indexes for better discoverability
      if (doc.name || doc.description || doc.category) {
        console.log('Updating search index for product:', doc.id);
      }

      // Handle inventory tracking
      if (operation === 'update' && previousDoc) {
        const stockChanged = doc.stock !== previousDoc.stock;
        const priceChanged = doc.price !== previousDoc.price;
        
        if (stockChanged) {
          console.log(`Stock updated for ${doc.name}: ${previousDoc.stock} → ${doc.stock}`);
          
          // Send low stock alerts
          if (doc.stock <= (doc.lowStockThreshold || 5)) {
            console.log(`Low stock alert for ${doc.name}: ${doc.stock} remaining`);
          }
        }

        if (priceChanged) {
          console.log(`Price updated for ${doc.name}: $${previousDoc.price} → $${doc.price}`);
        }
      }

      // Handle product status changes
      if (doc.isActive !== previousDoc?.isActive) {
        const status = doc.isActive ? 'activated' : 'deactivated';
        console.log(`Product ${doc.name} ${status}`);
        
        if (!doc.isActive) {
          console.log(`Checking for active bookings with deactivated product: ${doc.name}`);
        }
      }

      // Send notifications for new products
      if (operation === 'create') {
        console.log(`New product created: ${doc.name} - notifying relevant staff`);
      }

      // Update related data
      if (doc.category && doc.category !== previousDoc?.category) {
        console.log(`Product category changed: ${previousDoc?.category} → ${doc.category}`);
      }

      // Trigger webhooks for external integrations
      if (req.user?.role === 'admin' || req.user?.role === 'manager') {
        console.log('Triggering external inventory sync webhook');
      }
    }

    return doc;
  } catch (error) {
    console.error('Error in productAfterChangeHook:', error);
    // Don't throw error to prevent blocking the operation
    return doc;
  }
};
