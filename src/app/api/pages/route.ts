// src/app/api/pages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const pages = await payload.find({
      collection: 'pages',
      limit: 100, // Add pagination later
    });
    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const data = await req.json();
    const newPage = await payload.create({
      collection: 'pages',
      data,
    });
    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}
