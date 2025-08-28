import { getPayload } from 'payload';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const payload = await getPayload({ config: (await import('@/payload.config')).default });
  const { title, content } = await req.json();

  const doc = await payload.create({
    collection: 'business-documentation',
    data: { title, content },
  });

  return NextResponse.json(doc);
}
