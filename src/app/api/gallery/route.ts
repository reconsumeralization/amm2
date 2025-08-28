
import { NextResponse } from 'next/server';
import payload from 'payload';

export async function GET() {
  try {
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
