import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  const payload = await getPayload({ config: (await import('@/payload.config')).default });
  const data = await req.json();

  try {
    const schedule = await payload.create({
      collection: 'staff-schedules',
      data,
    });

    // TODO: Implement email notification

    return NextResponse.json(schedule);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}