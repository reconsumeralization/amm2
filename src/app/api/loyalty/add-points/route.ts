import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
// Config will be imported dynamically to avoid issues

export async function POST(req: NextRequest) {
  try {
    const { customerId, points, reason, tenantId } = await req.json();

    if (!customerId || !points || points <= 0) {
      return NextResponse.json(
        { error: 'Invalid customer ID or points' },
        { status: 400 }
      );
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();

    // Get customer
    const customer = await payload.findByID({
      collection: 'customers',
      id: customerId,
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get settings for loyalty configuration
    const settings = await getSettings(tenantId);
    const loyaltyConfig = settings.barbershop?.loyalty;

    if (!loyaltyConfig) {
      return NextResponse.json(
        { error: 'Loyalty program not configured' },
        { status: 400 }
      );
    }

    // Calculate new points
    const currentPoints = customer.loyaltyPoints || 0;
    const newPoints = currentPoints + points;

    // Update customer points
    await payload.update({
      collection: 'customers',
      id: customerId,
      data: {
        loyaltyPoints: newPoints,
        loyaltyHistory: {
          push: {
            points: points,
            reason: reason,
            date: new Date().toISOString(),
            previousTotal: currentPoints,
            newTotal: newPoints,
          },
        },
      },
    });

    // Check if customer should be upgraded to a new tier
    const newTier = calculateTier(newPoints, loyaltyConfig.tiers);
    
    if (newTier && newTier.name !== customer.loyaltyTier) {
      await payload.update({
        collection: 'customers',
        id: customerId,
        data: {
          loyaltyTier: newTier.name,
          loyaltyTierUpdatedAt: new Date().toISOString(),
        },
      });

      // Send tier upgrade notification
      await sendTierUpgradeEmail(customer, newTier, tenantId);
    }

    // Send points earned notification
    await sendPointsEarnedEmail(customer, points, reason, newPoints, tenantId);

    return NextResponse.json({
      success: true,
      customerId,
      pointsAdded: points,
      newTotal: newPoints,
      tier: newTier?.name || customer.loyaltyTier,
    });
  } catch (error) {
    console.error('Error adding loyalty points:', error);
    return NextResponse.json(
      { error: 'Failed to add loyalty points' },
      { status: 500 }
    );
  }
}

function calculateTier(points: number, tiers: any[]): any | null {
  if (!tiers || tiers.length === 0) return null;

  // Sort tiers by minimum points (descending)
  const sortedTiers = [...tiers].sort((a, b) => b.minPoints - a.minPoints);

  // Find the highest tier the customer qualifies for
  for (const tier of sortedTiers) {
    if (points >= tier.minPoints) {
      return tier;
    }
  }

  return null;
}

async function sendTierUpgradeEmail(customer: any, newTier: any, tenantId?: string) {
  try {
    const settings = await getSettings(tenantId);
    
    if (!settings.notifications?.email?.enabled) {
      return;
    }

    const emailData = {
      to: customer.email,
      subject: `Congratulations! You've reached ${newTier.name} tier`,
      template: settings.notifications.email.templates?.loyaltyPoints || 
        '<h2>Congratulations!</h2><p>You\'ve been upgraded to {{tier}} tier!</p>',
      data: {
        customerName: customer.name,
        tier: newTier.name,
        benefits: newTier.benefits,
        multiplier: newTier.multiplier,
      },
    };

    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });
  } catch (error) {
    console.error('Error sending tier upgrade email:', error);
  }
}

async function sendPointsEarnedEmail(customer: any, points: number, reason: string, total: number, tenantId?: string) {
  try {
    const settings = await getSettings(tenantId);
    
    if (!settings.notifications?.email?.enabled) {
      return;
    }

    const emailData = {
      to: customer.email,
      subject: 'Loyalty Points Earned - ModernMen Barbershop',
      template: settings.notifications.email.templates?.loyaltyPoints || 
        '<h2>Loyalty Points Earned</h2><p>You earned {{points}} points! Your total is now {{total}}.</p>',
      data: {
        customerName: customer.name,
        points: points,
        reason: reason,
        total: total,
      },
    };

    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });
  } catch (error) {
    console.error('Error sending points earned email:', error);
  }
}

async function getSettings(tenantId?: string): Promise<any> {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    
    let settings;
    if (tenantId) {
      settings = await payload.find({
        collection: 'settings',
        where: { tenant: { equals: tenantId } },
        limit: 1,
      });
    } else {
      settings = await payload.find({
        collection: 'settings',
        where: { tenant: { exists: false } },
        limit: 1,
      });
    }

    return settings.docs[0] || {};
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {};
  }
}
