// src/app/api/locations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
// Dynamic import for payload config
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const location = await payload.findByID({
      collection: 'locations',
      id: params.id,
    });
    if (!location) {
      return createErrorResponse('Location not found', 'RESOURCE_NOT_FOUND');
    }
    return createSuccessResponse(location);
  } catch (error) {
    console.error(`Error fetching location ${params.id}:`, error);
    return createErrorResponse('Failed to fetch location', 'INTERNAL_SERVER_ERROR');
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const data = await req.json();
    const updatedLocation = await payload.update({
      collection: 'locations',
      id: params.id,
      data,
    });
    return createSuccessResponse(updatedLocation);
  } catch (error) {
    console.error(`Error updating location ${params.id}:`, error);
    return createErrorResponse('Failed to update location', 'INTERNAL_SERVER_ERROR');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    await payload.delete({
      collection: 'locations',
      id: params.id,
    });
    return createSuccessResponse({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error(`Error deleting location ${params.id}:`, error);
    return createErrorResponse('Failed to delete location', 'INTERNAL_SERVER_ERROR');
  }
}