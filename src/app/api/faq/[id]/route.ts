// src/app/api/faq/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
// Dynamic import for payload config
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const faq = await payload.findByID({
      collection: 'faq',
      id: id,
    });
    if (!faq) {
      return createErrorResponse('FAQ not found', 'RESOURCE_NOT_FOUND');
    }
    return createSuccessResponse(faq);
  } catch (error) {
    console.error(`Error fetching FAQ id:`, error);
    return createErrorResponse('Failed to fetch FAQ', 'INTERNAL_SERVER_ERROR');
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const data = await req.json();
    const updatedFaq = await payload.update({
      collection: 'faq',
      id: id,
      data,
    });
    return createSuccessResponse(updatedFaq);
  } catch (error) {
    console.error(`Error updating FAQ id:`, error);
    return createErrorResponse('Failed to update FAQ', 'INTERNAL_SERVER_ERROR');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED');
    }

    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    await payload.delete({
      collection: 'faq',
      id: id,
    });
    return createSuccessResponse({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error(`Error deleting FAQ id:`, error);
    return createErrorResponse('Failed to delete FAQ', 'INTERNAL_SERVER_ERROR');
  }
}