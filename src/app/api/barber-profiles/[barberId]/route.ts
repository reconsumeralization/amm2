import { getPayload } from 'payload';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ barberId: string }> }) {
  const { barberId } = await params;
  const tenantId = req.headers.get('X-Tenant-ID');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
  }

  try {
    const payload = await getPayload({ config: (await import('@/payload.config')).default });
    const profile = await payload.findByID({
      collection: 'users',
      id: barberId,
      depth: 2,
    });

    // Check if profile belongs to tenant and is a barber
    if (!profile || profile.tenant !== tenantId || profile.role !== 'barber') {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
    }

    const testimonials = await payload.find({
      collection: 'testimonials',
      where: { barber: { equals: barberId }, tenant: { equals: tenantId }, status: { equals: 'approved' } },
    });

    return NextResponse.json({ ...profile, testimonials: testimonials.docs });
  } catch (error) {
    console.error('Error fetching barber profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}