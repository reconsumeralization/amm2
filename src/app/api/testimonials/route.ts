import { getPayloadClient } from '@/payload';
import { NextResponse } from 'next/server';
import { sendEmail } from '../../../utils/email';

export async function POST(req: Request) {
  const tenantId = req.headers.get('X-Tenant-ID');
  const { content, barber, client } = await req.json();

  if (!tenantId || !content || !barber) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
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