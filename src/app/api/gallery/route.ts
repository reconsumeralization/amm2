import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
// Dynamic import for payload config

export async function GET() {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const galleryItems = await payload.find({
      collection: 'gallery',
      limit: 100,
    });
    return NextResponse.json(galleryItems);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const data = await req.json();
    const newGalleryItem = await payload.create({
      collection: 'gallery',
      data,
    });
    return NextResponse.json(newGalleryItem, { status: 201 });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json({ error: 'Failed to create gallery item' }, { status: 500 });
  }
}