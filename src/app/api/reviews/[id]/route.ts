// src/app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
// Dynamic import for payload config
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const review = await payload.findByID({
      collection: 'reviews',
      id: params.id,
    });
    if (!review) {
      return createErrorResponse('Review not found', 'RESOURCE_NOT_FOUND');
    }
    return createSuccessResponse(review);
  } catch (error) {
    console.error(`Error fetching review ${params.id}:`, error);
    return createErrorResponse('Failed to fetch review', 'INTERNAL_SERVER_ERROR');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const review = await payload.findByID({
        collection: 'reviews',
        id: params.id,
    });

    if (!review) {
        return createErrorResponse('Review not found', 'RESOURCE_NOT_FOUND');
    }

    if (review.user.id !== session.user.id && session.user.role !== 'admin' && session.user.role !== 'manager') {
        return createErrorResponse('Forbidden', 'FORBIDDEN');
    }

    const data = await req.json();
    const updatedReview = await payload.update({
      collection: 'reviews',
      id: params.id,
      data,
    });
    return createSuccessResponse(updatedReview);
  } catch (error) {
    console.error(`Error updating review ${params.id}:`, error);
    return createErrorResponse('Failed to update review', 'INTERNAL_SERVER_ERROR');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const review = await payload.findByID({
        collection: 'reviews',
        id: params.id,
    });

    if (!review) {
        return createErrorResponse('Review not found', 'RESOURCE_NOT_FOUND');
    }

    if (review.user.id !== session.user.id && session.user.role !== 'admin' && session.user.role !== 'manager') {
        return createErrorResponse('Forbidden', 'FORBIDDEN');
    }

    await payload.delete({
      collection: 'reviews',
      id: params.id,
    });
    return createSuccessResponse({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(`Error deleting review ${params.id}:`, error);
    return createErrorResponse('Failed to delete review', 'INTERNAL_SERVER_ERROR');
  }
}