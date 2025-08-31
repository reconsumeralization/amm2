import { getPayloadClient } from '@/payload';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
// import { uploadToBunny } from '../../../../utils/bunny';

export async function POST(req: Request) {
  const { imageId, style, width, formats, quality, tenantId } = await req.json();
  // @ts-ignore - Payload config type issue
  const payload = await getPayloadClient();

  // 1. Authentication Check: Get user from request headers
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized: No authentication token' }, { status: 401 });
  }
  // In real implementation, decode userId from auth token

  // Input validation
  if (!imageId || !style || !width || !formats || !quality || !tenantId) {
    return NextResponse.json({ error: 'Missing required fields: imageId, style, width, formats, quality, tenantId' }, { status: 400 });
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
    const settings = await payload.find({
      collection: 'settings',
      where: { tenant: { equals: tenantId } },
      limit: 1,
    });
    const config = settings.docs[0] || {};

    if (!config.barbershop?.simulator?.enabled) {
      return NextResponse.json({ error: 'Hair simulator is disabled in settings' }, { status: 403 });
    }
    const allowedStyles = config.barbershop.simulator.styles.map((s: any) => s.style);
    if (!allowedStyles.includes(style)) {
      return NextResponse.json({ error: 'Invalid style selected' }, { status: 400 });
    }

    const media = await payload.findByID({ collection: 'media', id: imageId });
    if (!media || !media.url) {
      return NextResponse.json({ error: 'Original media not found or URL is missing' }, { status: 404 });
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

        const fileName = `${media.filename.split('.')[0]}-${style}-${width}.${format}`;
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
    console.error('Error in hair-simulator API:', error);
    if (error.message.includes('Missing required fields') || error.message.includes('Invalid style') || error.message.includes('Width must be') || error.message.includes('Formats must be') || error.message.includes('Quality must be')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('Hair simulator is disabled')) {
      return NextResponse.json({ error: 'Hair simulator is disabled' }, { status: 403 });
    }
    if (error.message.includes('Original media not found')) {
      return NextResponse.json({ error: 'Original media not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to generate simulator preview due to an internal server error' }, { status: 500 });
  }
}