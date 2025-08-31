
import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
  noStore();
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const stylists = await payload.find({
      collection: 'stylists',
      limit: 100, // Adjust limit as needed
    });
    return NextResponse.json(stylists.docs);
  } catch (error) {
    console.error('Error fetching stylists:', error);
    return NextResponse.json({ error: 'Failed to fetch stylists' }, { status: 500 });
  }
}
