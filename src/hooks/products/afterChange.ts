import payload from 'payload';

export const productAfterChangeHook = async ({
  doc,
  req,
  operation
}: {
  doc: any;
  req: any;
  operation: any;
}) => {
  try {
    // Update product analytics
    if (operation === 'create' || operation === 'update') {
      const analytics = {
        lastUpdated: new Date(),
        updateCount: (doc.analytics?.updateCount || 0) + 1,
        salesCount: doc.analytics?.salesCount || 0,
        viewCount: doc.analytics?.viewCount || 0,
      };

      await payload.update({
        collection: 'products',
        id: doc.id,
        data: { analytics },
      });
    }

    // Log the operation
    console.log(`Product ${operation}: ${doc.name} (ID: ${doc.id})`);
  } catch (error) {
    console.error('Product afterChange hook error:', error);
  }
};
