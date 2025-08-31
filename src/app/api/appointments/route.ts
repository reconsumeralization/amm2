// src/app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenant') || searchParams.get('where[tenant][equals]');
    const userId = searchParams.get('user') || searchParams.get('where[user][equals]');
    const status = searchParams.get('status') || searchParams.get('where[status][equals]');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    console.log('Appointments API called with:', { tenantId, userId, status });

    // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();

    // Build query filters
    const where: any = {};

    if (tenantId) {
      where.tenant = { equals: tenantId };
    }

    if (userId) {
      where.user = { equals: userId };
    }

    if (status) {
      where.status = { equals: status };
    }

    // Check user permissions
    const userRole = (session as any).user?.role;
    if (userRole !== 'admin' && userRole !== 'manager') {
      // Regular users can only see their own appointments
      where.user = { equals: (session as any).user?.id };
    }

    const appointments = await payload.find({
      collection: 'appointments',
      where,
      limit,
      page,
      depth: 2, // Include related data
      sort: '-createdAt'
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    console.log('Creating new appointment:', data);

    // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();

    // Check user permissions for creating appointments
    const userRole = (session as any).user?.role;
    if (userRole !== 'admin' && userRole !== 'manager' && userRole !== 'stylist') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const newAppointment = await payload.create({
      collection: 'appointments',
      data: {
        ...data,
        createdBy: (session as any).user?.id,
      },
      depth: 2,
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
