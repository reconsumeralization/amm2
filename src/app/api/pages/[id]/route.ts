// src/app/api/pages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
import { createErrorResponse, createSuccessResponse, ERROR_CODES } from '@/lib/api-error-handler';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const page = await payload.findByID({
      collection: 'pages',
      id: id,
    });
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json(page);
  } catch (error) {
    console.error(`Error fetching page id:`, error);
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const data = await req.json();
    const updatedPage = await payload.update({
      collection: 'pages',
      id: id,
      data,
    });
    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error(`Error updating page id:`, error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    await payload.delete({
      collection: 'pages',
      id: id,
    });
    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error(`Error deleting page id:`, error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
