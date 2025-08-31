// src/app/api/appointments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
// Dynamic import for payload config

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const appointment = await payload.findByID({
      collection: 'appointments',
      id: params.id,
    });
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json(appointment);
  } catch (error) {
    console.error(`Error fetching appointment ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    const data = await req.json();
    const updatedAppointment = await payload.update({
      collection: 'appointments',
      id: params.id,
      data,
    });
    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error(`Error updating appointment ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });
    await payload.delete({
      collection: 'appointments',
      id: params.id,
    });
    return NextResponse.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error(`Error deleting appointment ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
