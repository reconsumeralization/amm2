import { getPayloadClient } from '@/payload';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // @ts-ignore - Payload config type issue
  const payload = await getPayloadClient();
  const { title, content } = await req.json();

  const doc = await payload.create({
    collection: 'business-documentation',
    data: { title, content },
  });

  return NextResponse.json(doc);
}
