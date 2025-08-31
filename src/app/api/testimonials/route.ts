import { getPayload } from 'payload';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
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

    // Optionally notify admin (best-effort)
    try {
      const settings = await payload.find({
        collection: 'settings',
        where: { tenant: { equals: tenantId } },
        limit: 1,
      });
      if (settings.docs[0]?.email?.enabled) {
        await sendEmail({
          to: 'admin@modernmen.com',
          subject: 'New Testimonial Awaiting Moderation',
          html: `<p>New testimonial from ${client?.name || 'Anonymous'}: ${content}</p>${settings.docs[0].email.signature}`,
        });
      }
    } catch {}

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  noStore();
  try {
    const payload = await getPayload({ config: (await import('../../payload.config')).default });
    const testimonials = await payload.find({
      collection: 'testimonials',
      limit: 100,
    });
    return NextResponse.json(testimonials.docs);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}


