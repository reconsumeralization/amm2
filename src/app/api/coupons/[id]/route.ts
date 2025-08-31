// src/app/api/coupons/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
// Dynamic import for payload config
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const coupon = await payload.findByID({
      collection: 'coupons',
      id: params.id,
    });
    if (!coupon) {
      return createErrorResponse('Coupon not found', 'RESOURCE_NOT_FOUND');
    }
    return createSuccessResponse(coupon);
  } catch (error) {
    console.error(`Error fetching coupon ${params.id}:`, error);
    return createErrorResponse('Failed to fetch coupon', 'INTERNAL_SERVER_ERROR');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const data = await req.json();
    const updatedCoupon = await payload.update({
      collection: 'coupons',
      id: params.id,
      data,
    });
    return createSuccessResponse(updatedCoupon);
  } catch (error) {
    console.error(`Error updating coupon ${params.id}:`, error);
    return createErrorResponse('Failed to update coupon', 'INTERNAL_SERVER_ERROR');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    await payload.delete({
      collection: 'coupons',
      id: params.id,
    });
    return createSuccessResponse({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error(`Error deleting coupon ${params.id}:`, error);
    return createErrorResponse('Failed to delete coupon', 'INTERNAL_SERVER_ERROR');
  }
}