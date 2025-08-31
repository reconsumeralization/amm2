import { getPayloadClient } from '@/payload';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenantId = req.headers.get('X-Tenant-ID');
  const { action } = await req.json();

  if (!tenantId || !id || !['like', 'approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    if (action === 'like') {
      const testimonial = await payload.update({
        collection: 'testimonials',
        id: id,
        data: { likes: { increment: 1 } },
      });
      return NextResponse.json(testimonial);
    } else {
      const testimonial = await payload.update({
        collection: 'testimonials',
        id: id,
        data: { status: action === 'approve' ? 'approved' : 'rejected' },
      });
      return NextResponse.json(testimonial);
    }
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}