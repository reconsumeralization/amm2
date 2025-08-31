// src/app/api/customer-notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
import config from '../../../payload.config';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const data = await req.json();

    // Add author to the note data
    data.author = (session as any).user.id;

    const newNote = await payload.create({
      collection: 'customer-notes',
      data,
    });

    return createSuccessResponse(newNote, 'Note created successfully', 201);
  } catch (error) {
    console.error('Error creating customer note:', error);
    return createErrorResponse('Failed to create customer note', 'INTERNAL_SERVER_ERROR', 500);
  }
}
