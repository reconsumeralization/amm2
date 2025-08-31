// src/app/api/faq/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
// Dynamic import for payload config
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse, ERROR_CODES } from '@/lib/api-error-handler';

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const faqs = await payload.find({
      collection: 'faq',
      limit: 100, // Add pagination later
    });
    return createSuccessResponse(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return createErrorResponse('Failed to fetch FAQs', ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return createErrorResponse('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);
    }

    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const data = await req.json();
    const newFaq = await payload.create({
      collection: 'faq',
      data,
    });
    return createSuccessResponse(newFaq, 'FAQ created successfully', 201);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return createErrorResponse('Failed to create FAQ', ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
  }
}