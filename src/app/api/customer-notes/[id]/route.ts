// src/app/api/customer-notes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const payload = await getPayload();
    const data = await req.json();

    // TODO: Add authorization check to ensure only the author or an admin can edit

    const updatedNote = await payload.update({
      collection: 'customer-notes',
      id: params.id,
      data,
    });

    return createSuccessResponse(updatedNote);
  } catch (error) {
    console.error(`Error updating customer note ${params.id}:`, error);
    return createErrorResponse('Failed to update customer note', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const payload = await getPayload();

    // TODO: Add authorization check to ensure only the author or an admin can delete

    await payload.delete({
      collection: 'customer-notes',
      id: params.id,
    });

    return createSuccessResponse({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error(`Error deleting customer note ${params.id}:`, error);
    return createErrorResponse('Failed to delete customer note', 500);
  }
}
