// src/app/api/testimonials/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '../../../../../payload.config';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config });
    const testimonial = await payload.findByID({
      collection: 'testimonials',
      id: params.id,
    });
    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }
    return NextResponse.json(testimonial);
  } catch (error) {
    console.error(`Error fetching testimonial ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch testimonial' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config });
    const data = await req.json();
    const updatedTestimonial = await payload.update({
      collection: 'testimonials',
      id: params.id,
      data,
    });
    return NextResponse.json(updatedTestimonial);
  } catch (error) {
    console.error(`Error updating testimonial ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config });
    await payload.delete({
      collection: 'testimonials',
      id: params.id,
    });
    return NextResponse.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error(`Error deleting testimonial ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const tenantId = req.headers.get('X-Tenant-ID');
  const { action } = await req.json();

  if (!tenantId || !params.id || !['like', 'approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const payload = await getPayload({ config });
    if (action === 'like') {
      const testimonial = await payload.update({
        collection: 'testimonials',
        id: params.id,
        data: { likes: { increment: 1 } },
      });
      return NextResponse.json(testimonial);
    } else {
      const testimonial = await payload.update({
        collection: 'testimonials',
        id: params.id,
        data: { status: action === 'approve' ? 'approved' : 'rejected' },
      });
      return NextResponse.json(testimonial);
    }
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}