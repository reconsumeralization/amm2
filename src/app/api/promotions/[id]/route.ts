// src/app/api/promotions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload();
    const promotion = await payload.findByID({
      collection: 'promotions',
      id: params.id,
    });
    if (!promotion) {
      return createErrorResponse('Promotion not found', 404);
    }
    return createSuccessResponse(promotion);
  } catch (error) {
    console.error(`Error fetching promotion ${params.id}:`, error);
    return createErrorResponse('Failed to fetch promotion', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 401);
    }

    const payload = await getPayload();
    const data = await req.json();
    const updatedPromotion = await payload.update({
      collection: 'promotions',
      id: params.id,
      data,
    });
    return createSuccessResponse(updatedPromotion);
  } catch (error) {
    console.error(`Error updating promotion ${params.id}:`, error);
    return createErrorResponse('Failed to update promotion', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 401);
    }

    const payload = await getPayload();
    await payload.delete({
      collection: 'promotions',
      id: params.id,
    });
    return createSuccessResponse({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error(`Error deleting promotion ${params.id}:`, error);
    return createErrorResponse('Failed to delete promotion', 500);
  }
}