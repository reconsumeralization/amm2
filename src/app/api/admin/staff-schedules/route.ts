import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Create new schedule
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await getPayload({ config: await import('../../../../payload.config') });
    const data = await req.json();

    // Validate required fields
    if (!data.staff || !data.startTime || !data.endTime || !data.tenant) {
      return NextResponse.json({
        error: 'Missing required fields: staff, startTime, endTime, tenant'
      }, { status: 400 });
    }

    // Validate time logic
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (startTime >= endTime) {
      return NextResponse.json({
        error: 'Start time must be before end time'
      }, { status: 400 });
    }

    // Check for overlapping schedules
    const existingSchedules = await payload.find({
      collection: 'staff-schedules',
      where: {
        and: [
          { staff: { equals: data.staff } },
          {
            or: [
              {
                and: [
                  { startTime: { less_than_or_equal: data.startTime } },
                  { endTime: { greater_than: data.startTime } }
                ]
              },
              {
                and: [
                  { startTime: { less_than: data.endTime } },
                  { endTime: { greater_than_or_equal: data.endTime } }
                ]
              }
            ]
          }
        ]
      }
    });

    if (existingSchedules.totalDocs > 0) {
      return NextResponse.json({
        error: 'Schedule conflicts with existing schedule for this staff member'
      }, { status: 409 });
    }

    const schedule = await payload.create({
      collection: 'staff-schedules',
      data: {
        ...data,
        available: data.available !== undefined ? data.available : true,
        notes: data.notes || '',
      },
    });

    // TODO: Implement email notification to staff member

    return NextResponse.json(schedule);
  } catch (error: any) {
    console.error('Error creating schedule:', error);
    return NextResponse.json({
      error: error.message || 'Failed to create schedule'
    }, { status: 500 });
  }
}

// GET - List schedules with filtering
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await getPayload({ config: await import('../../../../payload.config') });
    const { searchParams } = new URL(req.url);

    // Build query based on user role and filters
    let where: any = {};

    // Filter by staff if user is not admin/manager
    if (session.user.role !== 'admin' && session.user.role !== 'manager') {
      where.staff = { equals: session.user.id };
    }

    // Apply filters from query params
    const staff = searchParams.get('staff');
    const tenant = searchParams.get('tenant');
    const available = searchParams.get('available');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (staff) where.staff = { equals: staff };
    if (tenant) where.tenant = { equals: tenant };
    if (available !== null) where.available = { equals: available === 'true' };

    // Date filtering
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      where.and = where.and || [];
      where.and.push({
        startTime: { greater_than_or_equal: targetDate.toISOString() },
        endTime: { less_than: nextDay.toISOString() }
      });
    }

    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.startTime = { greater_than_or_equal: new Date(startDate).toISOString() };
      if (endDate) dateFilter.endTime = { less_than_or_equal: new Date(endDate).toISOString() };

      where.and = where.and || [];
      where.and.push(dateFilter);
    }

    const schedules = await payload.find({
      collection: 'staff-schedules',
      where,
      sort: searchParams.get('sort') || 'startTime',
      limit: parseInt(searchParams.get('limit') || '50'),
      page: parseInt(searchParams.get('page') || '1'),
    });

    return NextResponse.json(schedules);
  } catch (error: any) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({
      error: error.message || 'Failed to fetch schedules'
    }, { status: 500 });
  }
}