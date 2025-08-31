
import { NextResponse } from 'next/server';
import payload from 'payload';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
  }

  try {
    const loyaltyProgram = await payload.find({
      collection: 'loyalty-program',
      where: {
        customer: {
          equals: customerId,
        },
      },
    });
    return NextResponse.json(loyaltyProgram);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { customerId, activity, points } = await req.json();

  try {
    const loyaltyProgram = await payload.find({
      collection: 'loyalty-program',
      where: {
        customer: {
          equals: customerId,
        },
      },
    });

    if (loyaltyProgram.docs.length > 0) {
      const existingProgram = loyaltyProgram.docs[0];
      const updatedProgram = await payload.update({
        collection: 'loyalty-program',
        id: existingProgram.id,
        data: {
          points: existingProgram.points + points,
          history: [
            ...existingProgram.history,
            {
              date: new Date(),
              activity,
              points,
            },
          ],
        },
      });
      return NextResponse.json(updatedProgram);
    } else {
      const newProgram = await payload.create({
        collection: 'loyalty-program',
        data: {
          customer: customerId,
          points,
          history: [
            {
              date: new Date(),
              activity,
              points,
            },
          ],
        },
      });
      return NextResponse.json(newProgram);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
