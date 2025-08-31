// src/app/api/promotions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse, ERROR_CODES } from '@/lib/api-error-handler';

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayloadClient();
    const promotions = await payload.find({
      collection: 'promotions',
      limit: 100, // Add pagination later
    });
    return createSuccessResponse(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return createErrorResponse('Failed to fetch promotions', ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user || ((session as any).user.role !== 'admin' && (session as any).user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);
    }

    const payload = await getPayloadClient();
    const data = await req.json();
    const newPromotion = await payload.create({
      collection: 'promotions',
      data,
    });
    return createSuccessResponse(newPromotion, 'Promotion created successfully', 201);
  } catch (error) {
    console.error('Error creating promotion:', error);
    return createErrorResponse('Failed to create promotion', ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
  }
}