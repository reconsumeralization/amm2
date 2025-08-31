// src/app/api/locations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
// Dynamic import for payload config
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const locations = await payload.find({
      collection: 'locations',
      limit: 100, // Add pagination later
    });
    return createSuccessResponse(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return createErrorResponse('Failed to fetch locations', 'INTERNAL_SERVER_ERROR');
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user || ((session as any).user.role !== 'admin' && (session as any).user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const data = await req.json();
    const newLocation = await payload.create({
      collection: 'locations',
      data,
    });
    return createSuccessResponse(newLocation, 'CREATED');
  } catch (error) {
    console.error('Error creating location:', error);
    return createErrorResponse('Failed to create location', 'INTERNAL_SERVER_ERROR');
  }
}