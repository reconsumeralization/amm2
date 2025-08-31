
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { unstable_noStore as noStore } from 'next/cache';


export async function GET() {
  noStore();
  try {
    const payload = await getPayload({ config: (await import('../../../payload.config')).default });
    const services = await payload.find({
      collection: 'services',
      limit: 100, // Adjust limit as needed
    });
    return NextResponse.json(services.docs);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: (await import('../../../payload.config')).default });
    const data = await req.json();
    const newService = await payload.create({
      collection: 'services',
      data,
    });
    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}

