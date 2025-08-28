import payload from 'payload';

export const productAnalyticsEndpoint = {
  path: '/product-analytics',
  method: 'get',
  handler: async (req: any, res: any, next: any) => {
    try {
      const { payload: payloadInstance } = req;
      const { startDate, endDate, category, limit = 10 } = req.query;

      // Validate user permissions
      if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Build query
      const query: any = {
        status: { equals: 'active' },
      };

      if (startDate && endDate) {
        query.createdAt = {
          greater_than_equal: startDate,
          less_than_equal: endDate,
        };
      }

      if (category) {
        query.category = { equals: category };
      }

      // Get products with analytics
      const products = await payloadInstance.find({
        collection: 'products',
        where: query,
        limit: parseInt(limit as string),
        sort: '-createdAt',
      });

      // Calculate analytics
      const analytics = {
        totalProducts: products.totalDocs,
        categories: {} as Record<string, number>,
        averagePrice: 0,
        totalValue: 0,
        lowStockItems: 0,
        topProducts: [] as any[],
      };

      let totalPrice = 0;
      const categoryCount: Record<string, number> = {};

      products.docs.forEach((product: any) => {
        // Category count
        const category = product.category || 'uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + 1;

        // Price calculations
        const price = product.pricing?.basePrice || 0;
        totalPrice += price;

        // Low stock check
        if (product.inventory?.stockLevel <= (product.inventory?.lowStockThreshold || 5)) {
          analytics.lowStockItems++;
        }

        // Top products (by stock level or price)
        analytics.topProducts.push({
          id: product.id,
          name: product.name,
          category: product.category,
          price: price,
          stockLevel: product.inventory?.stockLevel || 0,
          salesCount: product.analytics?.salesCount || 0,
        });
      });

      analytics.categories = categoryCount;
      analytics.averagePrice = products.totalDocs > 0 ? totalPrice / products.totalDocs : 0;
      analytics.totalValue = totalPrice;

      // Sort top products by sales count
      analytics.topProducts.sort((a, b) => b.salesCount - a.salesCount);

      return res.status(200).json({
        success: true,
        data: analytics,
        query: { startDate, endDate, category, limit },
      });
    } catch (error) {
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  },
};
