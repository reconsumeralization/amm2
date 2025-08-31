// src/app/api/tags/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
// Dynamic import for payload config
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const tags = await payload.find({
      collection: 'tags',
      limit: 100, // Add pagination later
    });
    return createSuccessResponse(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return createErrorResponse('Failed to fetch tags', 'INTERNAL_SERVER_ERROR');
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const data = await req.json();
    const newTag = await payload.create({
      collection: 'tags',
      data,
    });
    return createSuccessResponse(newTag, 'CREATED');
  } catch (error) {
    console.error('Error creating tag:', error);
    return createErrorResponse('Failed to create tag', 'INTERNAL_SERVER_ERROR');
  }
}