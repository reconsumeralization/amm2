import { getPayload } from 'payload';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sendEmail } from '../../../utils/email';

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get('X-Tenant-ID');
  const { content, barber, client } = await req.json();

  if (!tenantId || !content || !barber) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const { default: config } = await import('../../../payload.config');
    const payload = await getPayload({ config });
    const testimonial = await payload.create({
      collection: 'testimonials',
      data: { content, barber, client, tenant: tenantId, status: 'pending' },
    });

    // Notify admin for moderation
    const settings = await payload.find({
      collection: 'settings',
      where: { tenant: { equals: tenantId } },
      limit: 1,
    });
    if (settings.docs[0]?.email?.enabled) {
      await sendEmail({
        from: settings.docs[0].email.fromAddress,
        to: 'admin@modernmen.com',
        subject: 'New Testimonial Awaiting Moderation',
        html: `<p>New testimonial from ${client?.name || 'Anonymous'}: ${content}</p>${settings.docs[0].email.signature}`,
      });
    }

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: any) {
  const tenantId = req.headers.get('X-Tenant-ID');
  const { action } = await req.json();

  if (!tenantId || !params.id || !['like', 'approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const { default: config } = await import('../../../payload.config');
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