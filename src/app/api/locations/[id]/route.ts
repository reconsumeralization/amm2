// src/app/api/locations/[id]/route.ts
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
    const location = await payload.findByID({
      collection: 'locations',
      id: id,
    });
    if (!location) {
      return createErrorResponse('Location not found', 'RESOURCE_NOT_FOUND');
    }
    return createSuccessResponse(location);
  } catch (error) {
    console.error(`Error fetching location id:`, error);
    return createErrorResponse('Failed to fetch location', 'INTERNAL_SERVER_ERROR');
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
    const updatedLocation = await payload.update({
      collection: 'locations',
      id: id,
      data,
    });
    return createSuccessResponse(updatedLocation);
  } catch (error) {
    console.error(`Error updating location id:`, error);
    return createErrorResponse('Failed to update location', 'INTERNAL_SERVER_ERROR');
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
      collection: 'locations',
      id: id,
    });
    return createSuccessResponse({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error(`Error deleting location id:`, error);
    return createErrorResponse('Failed to delete location', 'INTERNAL_SERVER_ERROR');
  }
}