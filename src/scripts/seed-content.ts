import { getPayloadClient } from '@/payload';

async function seedCoupons() {
  try {
    const payload = await getPayloadClient();

    console.log('🌱 Seeding coupons...');

    // Get the first tenant for seeding
    const tenants = await payload.find({
      collection: 'tenants',
      limit: 1
    });

    if (tenants.docs.length === 0) {
      console.log('⚠️  No tenants found. Please seed tenants first.');
      return;
    }

    const tenant = tenants.docs[0];

    // Define coupon data
    const coupons = [
      {
        code: 'WELCOME10',
        name: 'Welcome Discount',
        description: '10% off your first service',
        discountType: 'percent' as const,
        amount: 10,
        startsAt: new Date().toISOString(),
        endsAt: null,
        maxUses: 100,
        maxUsesPerUser: 1,
        minimumPurchase: 0,
        active: true,
        customerEligibility: {
          firstTimeCustomersOnly: true
        }
      },
      {
        code: 'FLASH25',
        name: 'Flash Sale',
        description: '25% off all services today only',
        discountType: 'percent' as const,
        amount: 25,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        maxUses: 50,
        maxUsesPerUser: 1,
        minimumPurchase: 5000, // $50 minimum
        active: true
      },
      {
        code: 'LOYALTY20',
        name: 'Loyalty Reward',
        description: '$20 off for loyal customers',
        discountType: 'fixed' as const,
        amount: 2000, // $20 in cents
        currency: 'USD',
        startsAt: new Date().toISOString(),
        endsAt: null,
        maxUses: null,
        maxUsesPerUser: 3,
        minimumPurchase: 10000, // $100 minimum
        active: true,
        customerEligibility: {
          minimumLoyaltyPoints: 500
        }
      },
      {
        code: 'FREESHIP',
        name: 'Free Shipping',
        description: 'Free shipping on orders over $75',
        discountType: 'free_shipping' as const,
        amount: 0,
        startsAt: new Date().toISOString(),
        endsAt: null,
        maxUses: null,
        maxUsesPerUser: 5,
        minimumPurchase: 7500, // $75 minimum
        active: true
      },
      {
        code: 'HOLIDAY50',
        name: 'Holiday Special',
        description: 'Up to $50 off holiday services',
        discountType: 'fixed' as const,
        amount: 5000, // $50 in cents
        currency: 'USD',
        startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        maxUses: 200,
        maxUsesPerUser: 1,
        minimumPurchase: 20000, // $200 minimum
        maximumDiscount: 5000, // Max $50 discount
        active: false // Not active yet
      }
    ];

    // Create coupons
    for (const couponData of coupons) {
      try {
        // Check if coupon already exists
        const existingCoupon = await payload.find({
          collection: 'coupons',
          where: {
            code: { equals: couponData.code }
          },
          limit: 1
        });

        if (existingCoupon.docs.length > 0) {
          console.log(`⚠️  Coupon ${couponData.code} already exists, skipping...`);
          continue;
        }

        const coupon = await payload.create({
          collection: 'coupons',
          data: {
            ...couponData,
            tenant: tenant.id,
            uses: 0
          }
        });

        console.log(`✅ Created coupon: ${coupon.code} (${coupon.discountType}: ${coupon.amount}${coupon.discountType === 'percent' ? '%' : coupon.currency ? ` ${coupon.currency}` : ''})`);

      } catch (error) {
        console.error(`❌ Error creating coupon ${couponData.code}:`, error);
      }
    }

    console.log('🎉 Coupon seeding completed!');

    // Display summary
    const allCoupons = await payload.find({
      collection: 'coupons',
      where: {
        tenant: { equals: tenant.id }
      }
    });

    console.log(`\n📊 Coupon Summary:`);
    console.log(`Total coupons: ${allCoupons.totalDocs}`);
    console.log(`Active coupons: ${allCoupons.docs.filter((c: any) => c.active).length}`);
    console.log(`Inactive coupons: ${allCoupons.docs.filter((c: any) => !c.active).length}`);

  } catch (error) {
    console.error('❌ Error seeding coupons:', error);
  }
}

// Function to seed other content types (can be expanded)
async function seedContent() {
  console.log('🚀 Starting content seeding...');

  await seedCoupons();

  console.log('✅ Content seeding completed!');
}

// Run the seeding
if (require.main === module) {
  seedContent().finally(() => {
    console.log('🏁 Seeding process finished');
    process.exit(0);
  });
}

export { seedCoupons, seedContent };
