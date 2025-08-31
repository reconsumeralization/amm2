import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
import OpenAI from 'openai';
import sharp from 'sharp';
import config from '../../../../../payload.config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Valid formats for sharp
const VALID_FORMATS = ['jpeg', 'png', 'webp', 'avif', 'gif', 'tiff'] as const;
type ValidFormat = typeof VALID_FORMATS[number];

export async function POST(req: NextRequest) {
  try {
    const { imageId, prompt, userId, width, formats, quality, tenantId } = await req.json();

    if (!imageId || !prompt) {
      return NextResponse.json(
        { error: 'Image ID and prompt are required' },
        { status: 400 }
      );
    }

    // Get Payload instance
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();

    // Fetch the uploaded image
    const media = await payload.findByID({
      collection: 'media',
      id: imageId,
    });

    if (!media || !media.url) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Download the image for OpenAI
    const imageResponse = await fetch(media.url);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Create a blob URL for the image
    const blob = new Blob([imageBuffer]);
    const imageFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });

    // Generate the hair style preview using OpenAI
    const response = await openai.images.generate({
      prompt: `${prompt}. Professional barbershop quality, natural lighting, realistic result.`,
      n: 1,
      size: "1024x1024",
    });

    if (!response.data || !response.data[0]?.url) {
      throw new Error('Failed to generate image');
    }

    // Download the generated image and upload to our media collection
    const generatedImageResponse = await fetch(response.data[0].url);
    const generatedImageBuffer = await generatedImageResponse.arrayBuffer();
    const generatedImageBlob = new Blob([generatedImageBuffer]);
    const generatedImageFile = new File([generatedImageBlob], 'hair-preview.jpg', { type: 'image/jpeg' });

    // Upload to our media collection
    const formData = new FormData();
    formData.append('file', generatedImageFile);

    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/media`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${process.env.PAYLOAD_SECRET}`,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload generated image');
    }

    const uploadedMedia = await uploadResponse.json();

    // If responsive optimization is requested, generate optimized versions
    if (width && formats && quality) {
      const urls = await Promise.all(
        formats.map(async (format: string) => {
          // Validate format
          if (!VALID_FORMATS.includes(format as ValidFormat)) {
            throw new Error(`Invalid format: ${format}. Valid formats are: ${VALID_FORMATS.join(', ')}`);
          }

          const optimizedBuffer = await sharp(Buffer.from(generatedImageBuffer))
            .resize({ width, fit: 'inside', withoutEnlargement: true })
            .toFormat(format as ValidFormat, { quality })
            .toBuffer();

          // Upload to Bunny CDN
          const fileName = `${uploadedMedia.filename.split('.')[0]}-${prompt.replace(/\s+/g, '-')}-${width}.${format}`;
          const url = await uploadToBunny(optimizedBuffer, fileName, tenantId);
          return { format, url };
        })
      );

      // Log the consultation if userId is provided
      if (userId) {
        try {
          await payload.update({
            collection: 'users',
            id: userId,
            data: {
              consultations: {
                push: {
                  date: new Date().toISOString(),
                  recommendations: {
                    hairstyle: prompt.includes('hair') ? prompt : '',
                    beardStyle: prompt.includes('beard') ? prompt : '',
                  },
                  notes: `AI-generated preview for: ${prompt}`,
                },
              },
            },
          });
        } catch (error) {
          console.error('Failed to log consultation:', error);
        }
      }

      return NextResponse.json({ urls });
    }

    // Log the consultation if userId is provided
    if (userId) {
      try {
        await payload.update({
          collection: 'users',
          id: userId,
          data: {
            consultations: {
              push: {
                date: new Date().toISOString(),
                recommendations: {
                  hairstyle: prompt.includes('hair') ? prompt : '',
                  beardStyle: prompt.includes('beard') ? prompt : '',
                },
                notes: `AI-generated preview for: ${prompt}`,
              },
            },
          },
        });
      } catch (error) {
        console.error('Failed to log consultation:', error);
      }
    }

    return NextResponse.json({
      url: uploadedMedia.url,
      id: uploadedMedia.id,
    });

  } catch (error) {
    console.error('Hair simulator error:', error);
    return NextResponse.json(
      { error: 'Failed to generate hair preview' },
      { status: 500 }
    );
  }
}

async function uploadToBunny(buffer: Buffer, fileName: string, tenantId: string): Promise<string> {
  try {
    const response = await fetch(`https://${process.env.BUNNY_STORAGE_ZONE}.storage.bunnycdn.com/${tenantId}/${fileName}`, {
      method: 'PUT',
      headers: {
        'AccessKey': process.env.BUNNY_API_KEY!,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer as any,
    });

    if (!response.ok) {
      throw new Error(`Bunny CDN upload failed: ${response.statusText}`);
    }

    return `https://${process.env.BUNNY_STORAGE_ZONE}.b-cdn.net/${tenantId}/${fileName}`;
  } catch (error) {
    console.error('Bunny CDN upload failed:', error);
    throw new Error('Failed to upload to Bunny CDN');
  }
}
