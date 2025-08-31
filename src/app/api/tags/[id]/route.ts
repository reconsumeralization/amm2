// src/app/api/tags/[id]/route.ts
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
    const tag = await payload.findByID({
      collection: 'tags',
      id: id,
    });
    if (!tag) {
      return createErrorResponse('Tag not found', 'RESOURCE_NOT_FOUND');
    }
    return createSuccessResponse(tag);
  } catch (error) {
    console.error(`Error fetching tag id:`, error);
    return createErrorResponse('Failed to fetch tag', 'INTERNAL_SERVER_ERROR');
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
    const updatedTag = await payload.update({
      collection: 'tags',
      id: id,
      data,
    });
    return createSuccessResponse(updatedTag);
  } catch (error) {
    console.error(`Error updating tag id:`, error);
    return createErrorResponse('Failed to update tag', 'INTERNAL_SERVER_ERROR');
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
      collection: 'tags',
      id: id,
    });
    return createSuccessResponse({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error(`Error deleting tag id:`, error);
    return createErrorResponse('Failed to delete tag', 'INTERNAL_SERVER_ERROR');
  }
}