// src/app/api/coupons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
// Dynamic import for payload config
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const coupons = await payload.find({
      collection: 'coupons',
      limit: 100, // Add pagination later
    });
    return createSuccessResponse(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return createErrorResponse('Failed to fetch coupons', 'INTERNAL_SERVER_ERROR');
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const data = await req.json();
    const newCoupon = await payload.create({
      collection: 'coupons',
      data,
    });
    return createSuccessResponse(newCoupon, 'CREATED');
  } catch (error) {
    console.error('Error creating coupon:', error);
    return createErrorResponse('Failed to create coupon', 'INTERNAL_SERVER_ERROR');
  }
}