
import { NextResponse } from 'next/server';
import payload from 'payload';

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  try {
    await payload.create({
      collection: 'contacts',
      data: {
        name,
        email,
        message,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
