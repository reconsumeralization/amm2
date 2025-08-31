// src/app/api/customer-notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const payload = await getPayload();
    const data = await req.json();

    // Add author to the note data
    data.author = session.user.id;

    const newNote = await payload.create({
      collection: 'customer-notes',
      data,
    });

    return createSuccessResponse(newNote, 201);
  } catch (error) {
    console.error('Error creating customer note:', error);
    return createErrorResponse('Failed to create customer note', 500);
  }
}
