
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
  noStore();
  try {
    const payload = await getPayload();
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
