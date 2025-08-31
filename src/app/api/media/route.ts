// src/app/api/media/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler';

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: (await import('../../../payload.config')).default });
    const media = await payload.find({
      collection: 'media',
      limit: 100, // Add pagination later
    });
    return NextResponse.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

// Note: Payload's file upload is typically handled by its own REST API.
// This is a simplified example of how you might create a media document.
// For actual file uploads, you would likely use a multipart/form-data request
// to the Payload API endpoint for the media collection.
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: (await import('../../../payload.config')).default });
    const data = await req.json(); // This would need to contain the file data in a specific format
    const newMedia = await payload.create({
      collection: 'media',
      data,
    });
    return NextResponse.json(newMedia, { status: 201 });
  } catch (error) {
    console.error('Error creating media:', error);
    return NextResponse.json({ error: 'Failed to create media' }, { status: 500 });
  }
}
