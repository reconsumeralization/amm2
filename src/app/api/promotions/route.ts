// src/app/api/promotions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload();
    const promotions = await payload.find({
      collection: 'promotions',
      limit: 100, // Add pagination later
    });
    return createSuccessResponse(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return createErrorResponse('Failed to fetch promotions', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 401);
    }

    const payload = await getPayload();
    const data = await req.json();
    const newPromotion = await payload.create({
      collection: 'promotions',
      data,
    });
    return createSuccessResponse(newPromotion, 201);
  } catch (error) {
    console.error('Error creating promotion:', error);
    return createErrorResponse('Failed to create promotion', 500);
  }
}