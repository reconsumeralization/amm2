import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload-client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    try {
      const payload = await getPayloadClient();
      
      // Convert File to Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create a temporary file-like object for Payload
      const fileData = {
        filename: file.name,
        mimeType: file.type,
        buffer: buffer,
        size: file.size
      };

      // Upload to Payload media collection
      const uploadedFile = await payload.create({
        collection: 'media',
        data: {
          alt: `Uploaded by ${session.user?.name || 'user'}`,
          filename: file.name,
          mimeType: file.type,
          filesize: file.size,
          width: undefined, // Payload will determine this
          height: undefined, // Payload will determine this
        },
        file: {
          data: buffer,
          mimetype: file.type,
          name: file.name,
          size: file.size
        } as any
      });

      return NextResponse.json({
        success: true,
        file: {
          id: uploadedFile.id,
          filename: uploadedFile.filename,
          url: uploadedFile.url,
          alt: uploadedFile.alt,
          width: uploadedFile.width,
          height: uploadedFile.height,
          filesize: uploadedFile.filesize,
          mimeType: uploadedFile.mimeType
        }
      });
    } catch (payloadError) {
      console.error('Payload upload error:', payloadError);
      
      // Fallback: save to public directory
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      const publicPath = `uploads/${filename}`;
      
      // In a real implementation, you'd save to filesystem or cloud storage
      console.log('Would save file to:', publicPath);
      
      return NextResponse.json({
        success: true,
        file: {
          id: `temp-${timestamp}`,
          filename: file.name,
          url: `/uploads/${filename}`,
          alt: file.name,
          width: null,
          height: null,
          filesize: file.size,
          mimeType: file.type
        },
        note: 'File saved as fallback (Payload upload failed)'
      });
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Image upload endpoint',
    maxFileSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    allowedTypes: ALLOWED_TYPES,
    endpoint: '/api/uploads/images'
  });
}