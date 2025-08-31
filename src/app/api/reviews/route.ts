// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
// Dynamic import for payload config
import config from '../../../../payload.config';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const reviews = await payload.find({
      collection: 'reviews',
      limit: 100, // Add pagination later
    });
    return createSuccessResponse(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return createErrorResponse('Failed to fetch reviews', 'INTERNAL_SERVER_ERROR');
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const data = await req.json();
    
    // Add user to review data
    data.user = (session as any).user.id;

    const newReview = await payload.create({
      collection: 'reviews',
      data,
    });
    return createSuccessResponse(newReview, 'CREATED');
  } catch (error) {
    console.error('Error creating review:', error);
    return createErrorResponse('Failed to create review', 'INTERNAL_SERVER_ERROR');
  }
}