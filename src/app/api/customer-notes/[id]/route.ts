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

    // Get the existing note to check authorization
    const existingNote = await payload.findByID({
      collection: 'customer-notes',
      id: id,
    });

    if (!existingNote) {
      return createErrorResponse('Customer note not found', 'NOT_FOUND', 404);
    }

    // Authorization check: only the author or an admin can edit
    const userId = (session as any).user.id;
    const userRole = (session as any).user.role;
    const isAuthor = existingNote.author === userId || existingNote.authorId === userId;
    const isAdmin = ['admin', 'system_admin', 'salon_owner', 'BarberShop_owner'].includes(userRole);

    if (!isAuthor && !isAdmin) {
      return createErrorResponse(
        'Insufficient permissions to edit this note',
        'FORBIDDEN',
        403
      );
    }

    const updatedNote = await payload.update({
      collection: 'customer-notes',
      id: id,
      data: {
        ...data,
        updatedAt: new Date(),
        updatedBy: userId
      },
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

    // Get the existing note to check authorization
    const existingNote = await payload.findByID({
      collection: 'customer-notes',
      id: id,
    });

    if (!existingNote) {
      return createErrorResponse('Customer note not found', 'NOT_FOUND', 404);
    }

    // Authorization check: only the author or an admin can delete
    const userId = (session as any).user.id;
    const userRole = (session as any).user.role;
    const isAuthor = existingNote.author === userId || existingNote.authorId === userId;
    const isAdmin = ['admin', 'system_admin', 'salon_owner', 'BarberShop_owner'].includes(userRole);

    if (!isAuthor && !isAdmin) {
      return createErrorResponse(
        'Insufficient permissions to delete this note',
        'FORBIDDEN',
        403
      );
    }

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
