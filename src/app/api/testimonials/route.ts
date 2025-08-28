
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
  noStore();
  try {
    const payload = await getPayload();
    const testimonials = await payload.find({
      collection: 'testimonials',
      limit: 100, // Adjust limit as needed
    });
    return NextResponse.json(testimonials.docs);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}
