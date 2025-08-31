// src/app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
// Dynamic import for payload config

export async function GET(req: NextRequest) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const appointments = await payload.find({
      collection: 'appointments',
      limit: 100, // Add pagination later
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const data = await req.json();
    const newAppointment = await payload.create({
      collection: 'appointments',
      data,
    });
    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
