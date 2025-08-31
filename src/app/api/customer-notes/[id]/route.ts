// src/app/api/customer-notes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
import config from '../../../../payload.config';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const data = await req.json();

    // TODO: Add authorization check to ensure only the author or an admin can edit

    const updatedNote = await payload.update({
      collection: 'customer-notes',
      id: id,
      data,
    });

    return createSuccessResponse(updatedNote);
  } catch (error) {
    console.error(`Error updating customer note ${await params.then(p => p.id)}:`, error);
    return createErrorResponse('Failed to update customer note', 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();

    // TODO: Add authorization check to ensure only the author or an admin can delete

    await payload.delete({
      collection: 'customer-notes',
      id: id,
    });

    return createSuccessResponse({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error(`Error deleting customer note ${await params.then(p => p.id)}:`, error);
    return createErrorResponse('Failed to delete customer note', 'INTERNAL_SERVER_ERROR', 500);
  }
}
