import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = req.headers.get('X-Tenant-ID') || searchParams.get('tenantId');
  const slug = searchParams.get('slug');

  if (!tenantId || !slug) {
    return NextResponse.json(
      { error: 'Tenant ID and slug are required' }, 
      { status: 400 }
    );
  }

  try {
    const payload = await getPayload({ config: (await import('@/payload.config')).default });
    const content = await payload.find({
      collection: 'content',
      where: { 
        tenant: { equals: tenantId }, 
        slug: { equals: slug },
        status: { equals: 'published' }
      },
      limit: 1,
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, tenantId, content, status = 'draft' } = body;

    if (!title || !slug || !tenantId || !content) {
      return NextResponse.json(
        { error: 'Title, slug, tenantId, and content are required' }, 
        { status: 400 }
      );
    }

    const payload = await getPayload({ config: (await import('@/payload.config')).default });
    const result = await payload.create({
      collection: 'content',
      data: {
        title,
        slug,
        tenant: tenantId,
        content,
        status,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const tenantId = req.headers.get('X-Tenant-ID');
  
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Content ID required' }, { status: 400 });
    }

    const payload = await getPayload({ config: (await import('@/payload.config')).default });
    
    const content = await payload.update({
      collection: 'content',
      id,
      data: {
        ...data,
        tenant: tenantId,
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const tenantId = req.headers.get('X-Tenant-ID');
  
  if (!id || !tenantId) {
    return NextResponse.json({ error: 'Content ID and Tenant ID required' }, { status: 400 });
  }

  try {
    const payload = await getPayload({ config: (await import('@/payload.config')).default });
    
    await payload.delete({
      collection: 'content',
      id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

