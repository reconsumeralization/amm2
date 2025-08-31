// src/app/api/media/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { createErrorResponse, createSuccessResponse, ERROR_CODES } from '@/lib/api-error-handler';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const mediaItem = await payload.findByID({
      collection: 'media',
      id: id,
    });
    if (!mediaItem) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }
    return NextResponse.json(mediaItem);
  } catch (error) {
    console.error(`Error fetching media item id:`, error);
    return NextResponse.json({ error: 'Failed to fetch media item' }, { status: 500 });
  }
}

// Note: Payload's file update is typically handled by its own REST API.
// This is a simplified example.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    const data = await req.json();
    const updatedMediaItem = await payload.update({
      collection: 'media',
      id: id,
      data,
    });
    return NextResponse.json(updatedMediaItem);
  } catch (error) {
    console.error(`Error updating media item id:`, error);
    return NextResponse.json({ error: 'Failed to update media item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
    await payload.delete({
      collection: 'media',
      id: id,
    });
    return NextResponse.json({ message: 'Media item deleted successfully' });
  } catch (error) {
    console.error(`Error deleting media item id:`, error);
    return NextResponse.json({ error: 'Failed to delete media item' }, { status: 500 });
  }
}
