// src/app/api/promotions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse, ERROR_CODES } from '@/lib/api-error-handler';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config: (await import('../../../payload.config')).default });
    const promotion = await payload.findByID({
      collection: 'promotions',
      id: id,
    });
    if (!promotion) {
      return createErrorResponse('Promotion not found', ERROR_CODES.RESOURCE_NOT_FOUND, 404);
    }
    return createSuccessResponse(promotion);
  } catch (error) {
    console.error(`Error fetching promotion id:`, error);
    return createErrorResponse('Failed to fetch promotion', ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);
    }

    const payload = await getPayload({ config: (await import('../../../payload.config')).default });
    const data = await req.json();
    const updatedPromotion = await payload.update({
      collection: 'promotions',
      id: id,
      data,
    });
    return createSuccessResponse(updatedPromotion);
  } catch (error) {
    console.error(`Error updating promotion id:`, error);
    return createErrorResponse('Failed to update promotion', ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);
    }

    const payload = await getPayload({ config: (await import('../../../payload.config')).default });
    await payload.delete({
      collection: 'promotions',
      id: id,
    });
    return createSuccessResponse({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error(`Error deleting promotion id:`, error);
    return createErrorResponse('Failed to delete promotion', ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
  }
}