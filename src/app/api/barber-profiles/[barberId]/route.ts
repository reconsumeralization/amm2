import { getPayload } from 'payload';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: any) {
  const tenantId = req.headers.get('X-Tenant-ID');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  try {
    const { default: config } = await import('../../../../payload.config');
    const payload = await getPayload({ config });
    const profile = await payload.findByID({
      collection: 'users',
      id: params.barberId,
      depth: 2,
      where: { tenant: { equals: tenantId }, role: { equals: 'barber' } },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
    }

    const testimonials = await payload.find({
      collection: 'testimonials',
      where: { barber: { equals: params.barberId }, tenant: { equals: tenantId }, status: { equals: 'approved' } },
    });

    return NextResponse.json({ ...profile, testimonials: testimonials.docs });
  } catch (error) {
    console.error('Error fetching barber profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}