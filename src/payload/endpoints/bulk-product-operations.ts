import payload from 'payload';

export const bulkProductOperationsEndpoint = {
  path: '/bulk-product-operations',
  method: 'post',
  handler: async (req: any, res: any, next: any) => {
    try {
      const { payload: payloadInstance } = req;
      const { operation, productIds, data } = req.body;

      // Validate user permissions
      if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Validate required fields
      if (!operation || !productIds || !Array.isArray(productIds)) {
        return res.status(400).json({ 
          error: 'Missing required fields: operation, productIds' 
        });
      }

      const results = {
        success: [] as string[],
        failed: [] as { id: string; error: string }[],
        total: productIds.length,
      };

      // Process each product based on operation
      for (const productId of productIds) {
        try {
          switch (operation) {
            case 'updateStatus':
              await payloadInstance.update({
                collection: 'products',
                id: productId,
                data: { status: data.status },
              });
              results.success.push(productId);
              break;

            case 'updatePricing':
              const pricingData: any = {};
              if (data.basePrice !== undefined) pricingData['pricing.basePrice'] = data.basePrice;
              if (data.salePrice !== undefined) pricingData['pricing.salePrice'] = data.salePrice;
              
              await payloadInstance.update({
                collection: 'products',
                id: productId,
                data: pricingData,
              });
              results.success.push(productId);
              break;

            case 'adjustInventory':
              const currentProduct = await payloadInstance.findByID({
                collection: 'products',
                id: productId,
              });
              
              const newStockLevel = (currentProduct.inventory?.stockLevel || 0) + data.adjustment;
              if (newStockLevel < 0) {
                results.failed.push({ 
                  id: productId, 
                  error: 'Stock level cannot be negative' 
                });
                continue;
              }

              await payloadInstance.update({
                collection: 'products',
                id: productId,
                data: { 
                  'inventory.stockLevel': newStockLevel 
                },
              });
              results.success.push(productId);
              break;

            case 'addTags':
              const product = await payloadInstance.findByID({
                collection: 'products',
                id: productId,
              });
              
              const existingTags = product.tags?.map((t: any) => t.tag) || [];
              const newTags = data.tags.filter((tag: string) => !existingTags.includes(tag));
              
              if (newTags.length > 0) {
                const updatedTags = [
                  ...existingTags.map((tag: string) => ({ tag })),
                  ...newTags.map((tag: string) => ({ tag })),
                ];
                
                await payloadInstance.update({
                  collection: 'products',
                  id: productId,
                  data: { tags: updatedTags },
                });
              }
              results.success.push(productId);
              break;

            case 'removeTags':
              const productToUpdate = await payloadInstance.findByID({
                collection: 'products',
                id: productId,
              });
              
              const currentTags = productToUpdate.tags?.map((t: any) => t.tag) || [];
              const filteredTags = currentTags.filter((tag: string) => !data.tags.includes(tag));
              
              await payloadInstance.update({
                collection: 'products',
                id: productId,
                data: { 
                  tags: filteredTags.map((tag: string) => ({ tag }))
                },
              });
              results.success.push(productId);
              break;

            default:
              results.failed.push({ 
                id: productId, 
                error: `Unknown operation: ${operation}` 
              });
          }
        } catch (error) {
          results.failed.push({ 
            id: productId, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      return res.status(200).json({
        message: `Bulk operation completed. ${results.success.length} succeeded, ${results.failed.length} failed.`,
        results,
      });
    } catch (error) {
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  },
};
