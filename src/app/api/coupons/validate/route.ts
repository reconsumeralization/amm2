import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
import config from '../../../../payload.config';

export async function POST(request: NextRequest) {
  try {
    const { code, tenantId } = await request.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    // Initialize Payload
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();

    // Find the coupon
    const result = await payload.find({
      collection: 'coupons',
      where: {
        and: [
          { code: { equals: code.toUpperCase() } },
          { active: { equals: true } },
          // Filter by tenant if provided
          ...(tenantId ? [{ tenant: { equals: tenantId } }] : [])
        ]
      },
      limit: 1,
    });

    const coupon = result.docs?.[0];

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon not found or inactive'
      });
    }

    const now = new Date();
    const startsAt = coupon.startsAt ? new Date(coupon.startsAt) : null;
    const endsAt = coupon.endsAt ? new Date(coupon.endsAt) : null;

    // Check if coupon is within valid date range
    const notStarted = startsAt && now < startsAt;
    const expired = endsAt && now > endsAt;

    if (notStarted) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon is not yet active',
        coupon: {
          code: coupon.code,
          startsAt: coupon.startsAt
        }
      });
    }

    if (expired) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon has expired',
        coupon: {
          code: coupon.code,
          endsAt: coupon.endsAt
        }
      });
    }

    // Check usage limits
    const maxUsesReached = coupon.maxUses && coupon.uses >= coupon.maxUses;

    if (maxUsesReached) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon usage limit reached',
        coupon: {
          code: coupon.code,
          uses: coupon.uses,
          maxUses: coupon.maxUses
        }
      });
    }

    // Return valid coupon with discount details
    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        amount: coupon.amount,
        currency: coupon.currency,
        minimumPurchase: coupon.minimumPurchase,
        maximumDiscount: coupon.maximumDiscount,
        description: coupon.description,
        uses: coupon.uses,
        maxUses: coupon.maxUses,
        startsAt: coupon.startsAt,
        endsAt: coupon.endsAt
      }
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support GET for simple validation (for links/emails)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const tenantId = searchParams.get('tenantId');

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    // Reuse the POST logic
    const mockRequest = {
      json: async () => ({ code, tenantId })
    } as any;

    // This is a bit of a hack, but it works for this simple case
    const response = await POST(mockRequest);
    return response;

  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
