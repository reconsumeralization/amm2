// src/app/api/og-regenerate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { universalOGHook } from '../../../payload/hooks/universalOGHook';
import payload from '../../../payload';

export async function POST(req: NextRequest) {
  try {
    const { collection, id } = await req.json();

    if (!collection || !id) {
      return NextResponse.json(
        { error: 'Collection and ID are required' },
        { status: 400 }
      );
    }

    // Get the document
    const result = await payload.find({
      collection,
      where: { id: { equals: id } },
      limit: 1,
    });
    const doc = result.docs[0];

    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Regenerate OG image using the universal hook
    const updatedDoc = await universalOGHook({
      data: { ...doc, regenerateOGImage: true },
      collection: { slug: collection, config: {} } as any,
      req: {} as any,
      operation: 'update',
    });

    // Update the document with the new OG image
    const result = await payload.update({
      collection,
      where: { id: { equals: id } },
      data: {
        ogImage: updatedDoc.ogImage,
      },
    });

    return NextResponse.json({
      success: true,
      ogImage: updatedDoc.ogImage,
      message: 'OG image regenerated successfully',
    });
  } catch (error) {
    console.error('Error regenerating OG image:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate OG image' },
      { status: 500 }
    );
  }
}

// GET endpoint to preview OG image generation
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const collection = searchParams.get('collection');
  const title = searchParams.get('title');
  const excerpt = searchParams.get('excerpt');

  if (!collection || !title) {
    return NextResponse.json(
      { error: 'Collection and title are required' },
      { status: 400 }
    );
  }

  try {
    // Generate a preview OG image
    const previewDoc = await universalOGHook({
      data: {
        title,
        excerpt: excerpt || '',
        regenerateOGImage: true,
      },
      collection: { slug: collection, config: {} } as any,
      req: {} as any,
      operation: 'create',
    });

    return NextResponse.json({
      ogImage: previewDoc.ogImage,
      message: 'OG image preview generated',
    });
  } catch (error) {
    console.error('Error generating OG preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate OG preview' },
      { status: 500 }
    );
  }
}
