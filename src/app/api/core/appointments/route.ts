import { NextResponse } from 'next/server';
import { getPayload } from 'payload';


export async function GET(req: Request) {
  try {
    const payload = await getPayload({
      config: await import('../../../../payload.config').then(m => m.default),
    });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let where: any = {};
    
    if (userId) {
      where.user = { equals: userId };
    }
    
    if (status) {
      where.status = { equals: status };
    }

    const appointments = await payload.find({
      collection: 'appointments',
      where,
      sort: '-date',
      limit: 50,
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const payload = await getPayload({ config: (await import('../../../../payload.config')).default });
  const data = await req.json();

  try {
    const appointment = await payload.create({
      collection: 'appointments',
      data,
    });

    // Fetch the service description
    const serviceDoc = await payload.find({
      collection: 'business-documentation',
      where: {
        title: {
          equals: data.service,
        },
      },
    });

    const serviceContent = serviceDoc.docs.length > 0 ? serviceDoc.docs[0].content : '';

    // TODO: Implement email notification

    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const payload = await getPayload({
      config: await import('../../../../payload.config').then(m => m.default),
    });

    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const appointment = await payload.update({
      collection: 'appointments',
      id,
      data: updateData,
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const payload = await getPayload({
      config: await import('../../../../payload.config').then(m => m.default),
    });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    await payload.delete({
      collection: 'appointments',
      id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}