// src/app/api/media/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload();
    const mediaItem = await payload.findByID({
      collection: 'media',
      id: params.id,
    });
    if (!mediaItem) {
      return NextResponse.json({ error: 'Media item not found' }, { status: 404 });
    }
    return NextResponse.json(mediaItem);
  } catch (error) {
    console.error(`Error fetching media item ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch media item' }, { status: 500 });
  }
}

// Note: Payload's file update is typically handled by its own REST API.
// This is a simplified example.
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload();
    const data = await req.json();
    const updatedMediaItem = await payload.update({
      collection: 'media',
      id: params.id,
      data,
    });
    return NextResponse.json(updatedMediaItem);
  } catch (error) {
    console.error(`Error updating media item ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update media item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload();
    await payload.delete({
      collection: 'media',
      id: params.id,
    });
    return NextResponse.json({ message: 'Media item deleted successfully' });
  } catch (error) {
    console.error(`Error deleting media item ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete media item' }, { status: 500 });
  }
}
