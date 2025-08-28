import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
// import { uploadToBunny } from '../../../utils/bunny';

export async function POST(req: Request) {
  const { mediaId, width, formats, quality, tenantId } = await req.json();
  const payload = await getPayload({ config: (await import('@/payload.config')).default });

  // 1. Authentication Check: Ensure user is logged in
  // if (!req.user) { // Assuming req.user is populated by Payload's auth middleware
  //   return NextResponse.json({ error: 'Unauthorized: User not authenticated' }, { status: 401 });
  // }
  // const userId = req.user.id; // Not directly used in this API call, but available if needed for context/logging

  // Input validation
  if (!mediaId || !width || !formats || !quality || !tenantId) {
    return NextResponse.json({ error: 'Missing required fields: mediaId, width, formats, quality, tenantId' }, { status: 400 });
  }
  if (typeof width !== 'number' || width <= 0) {
    return NextResponse.json({ error: 'Width must be a positive number' }, { status: 400 });
  }
  if (!Array.isArray(formats) || formats.length === 0) {
    return NextResponse.json({ error: 'Formats must be a non-empty array' }, { status: 400 });
  }
  if (typeof quality !== 'number' || quality < 1 || quality > 100) {
    return NextResponse.json({ error: 'Quality must be a number between 1 and 100' }, { status: 400 });
  }

  try {
    const media = await payload.findByID({ collection: 'media', id: mediaId });
    if (!media || !media.url) {
      return NextResponse.json({ error: 'Media not found or URL is missing' }, { status: 404 });
    }

    let originalBuffer: Buffer;
    try {
      const response = await fetch(media.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch original image: ${response.statusText}`);
      }
      originalBuffer = Buffer.from(await response.arrayBuffer());
    } catch (fetchError) {
      console.error('Failed to fetch original image:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch original image for processing' }, { status: 500 });
    }

    const urls = await Promise.all(
      formats.map(async (format: string) => {
        let optimizedBuffer: Buffer;
        try {
          optimizedBuffer = await sharp(originalBuffer)
            .resize({ width, fit: 'inside', withoutEnlargement: true })
            .toFormat(format as any, { quality })
            .toBuffer();
        } catch (sharpError) {
          console.error(`Sharp processing failed for format ${format}:`, sharpError);
          throw new Error(`Image processing failed for format ${format}`);
        }

        const fileName = `${media.filename.split('.')[0]}-${width}.${format}`;
        let uploadedUrl: string;
        try {
          // uploadedUrl = await uploadToBunny(optimizedBuffer, fileName, tenantId);
          uploadedUrl = `https://example.com/${fileName}`; // Placeholder URL
        } catch (bunnyError) {
          console.error('Bunny CDN upload failed:', bunnyError);
          throw new Error('Failed to upload optimized image to CDN');
        }
        return { format, url: uploadedUrl };
      })
    );

    return NextResponse.json({ urls });
  } catch (error: any) {
    console.error('Error in image-optimize API:', error);
    if (error.message.includes('Missing required fields') || error.message.includes('Width must be') || error.message.includes('Formats must be') || error.message.includes('Quality must be')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('Media not found')) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to optimize image due to an internal server error' }, { status: 500 });
  }
}