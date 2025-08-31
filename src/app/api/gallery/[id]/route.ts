// src/app/api/gallery/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
// Dynamic import for payload config

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const galleryItem = await payload.findByID({
      collection: 'gallery',
      id: id,
    });
    if (!galleryItem) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }
    return NextResponse.json(galleryItem);
  } catch (error) {
    console.error(`Error fetching gallery item id:`, error);
    return NextResponse.json({ error: 'Failed to fetch gallery item' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const data = await req.json();
    const updatedGalleryItem = await payload.update({
      collection: 'gallery',
      id: id,
      data,
    });
    return NextResponse.json(updatedGalleryItem);
  } catch (error) {
    console.error(`Error updating gallery item id:`, error);
    return NextResponse.json({ error: 'Failed to update gallery item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    await payload.delete({
      collection: 'gallery',
      id: id,
    });
    return NextResponse.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error(`Error deleting gallery item id:`, error);
    return NextResponse.json({ error: 'Failed to delete gallery item' }, { status: 500 });
  }
}
