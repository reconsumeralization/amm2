// src/app/api/coupons/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
// Dynamic import for payload config
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user || ((session as any).user.role !== 'admin' && (session as any).user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const coupon = await payload.findByID({
      collection: 'coupons',
      id: id,
    });
    if (!coupon) {
      return createErrorResponse('Coupon not found', 'RESOURCE_NOT_FOUND');
    }
    return createSuccessResponse(coupon);
  } catch (error) {
    console.error(`Error fetching coupon ${await params.then(p => p.id)}:`, error);
    return createErrorResponse('Failed to fetch coupon', 'INTERNAL_SERVER_ERROR');
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user || ((session as any).user.role !== 'admin' && (session as any).user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const data = await req.json();
    const updatedCoupon = await payload.update({
      collection: 'coupons',
      id: id,
      data,
    });
    return createSuccessResponse(updatedCoupon);
  } catch (error) {
    console.error(`Error updating coupon ${await params.then(p => p.id)}:`, error);
    return createErrorResponse('Failed to update coupon', 'INTERNAL_SERVER_ERROR');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user || ((session as any).user.role !== 'admin' && (session as any).user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    await payload.delete({
      collection: 'coupons',
      id: id,
    });
    return createSuccessResponse({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error(`Error deleting coupon ${await params.then(p => p.id)}:`, error);
    return createErrorResponse('Failed to delete coupon', 'INTERNAL_SERVER_ERROR');
  }
}