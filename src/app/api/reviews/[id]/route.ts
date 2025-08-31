// src/app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
// Dynamic import for payload config
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const review = await payload.findByID({
      collection: 'reviews',
      id: id,
    });
    if (!review) {
      return createErrorResponse('Review not found', 'RESOURCE_NOT_FOUND');
    }
    return createSuccessResponse(review);
  } catch (error) {
    console.error(`Error fetching review id:`, error);
    return createErrorResponse('Failed to fetch review', 'INTERNAL_SERVER_ERROR');
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const review = await payload.findByID({
        collection: 'reviews',
        id: id,
    });

    if (!review) {
        return createErrorResponse('Review not found', 'RESOURCE_NOT_FOUND');
    }

    if (review.user.id !== (session as any).user.id && (session as any).user.role !== 'admin' && (session as any).user.role !== 'manager') {
        return createErrorResponse('Forbidden', 'FORBIDDEN');
    }

    const data = await req.json();
    const updatedReview = await payload.update({
      collection: 'reviews',
      id: id,
      data,
    });
    return createSuccessResponse(updatedReview);
  } catch (error) {
    console.error(`Error updating review id:`, error);
    return createErrorResponse('Failed to update review', 'INTERNAL_SERVER_ERROR');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const review = await payload.findByID({
        collection: 'reviews',
        id: id,
    });

    if (!review) {
        return createErrorResponse('Review not found', 'RESOURCE_NOT_FOUND');
    }

    if (review.user.id !== (session as any).user.id && (session as any).user.role !== 'admin' && (session as any).user.role !== 'manager') {
        return createErrorResponse('Forbidden', 'FORBIDDEN');
    }

    await payload.delete({
      collection: 'reviews',
      id: id,
    });
    return createSuccessResponse({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(`Error deleting review id:`, error);
    return createErrorResponse('Failed to delete review', 'INTERNAL_SERVER_ERROR');
  }
}