import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get specific schedule
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await getPayload({ config: await import('../../../../../../payload.config') });
    const { id } = params;

    const schedule = await payload.findByID({
      collection: 'staff-schedules',
      id,
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Check access permissions
    if (session.user.role !== 'admin' && session.user.role !== 'manager' && schedule.staff !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(schedule);
  } catch (error: any) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({
      error: error.message || 'Failed to fetch schedule'
    }, { status: 500 });
  }
}

// PUT - Update schedule
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await getPayload({ config: await import('../../../../../../payload.config') });
    const { id } = params;
    const data = await req.json();

    // Get existing schedule
    const existingSchedule = await payload.findByID({
      collection: 'staff-schedules',
      id,
    });

    if (!existingSchedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Check permissions
    if (session.user.role !== 'admin' && session.user.role !== 'manager' && existingSchedule.staff !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate time logic if times are being updated
    if (data.startTime || data.endTime) {
      const startTime = new Date(data.startTime || existingSchedule.startTime);
      const endTime = new Date(data.endTime || existingSchedule.endTime);

      if (startTime >= endTime) {
        return NextResponse.json({
          error: 'Start time must be before end time'
        }, { status: 400 });
      }
    }

    // Check for conflicts if times are being updated
    if (data.startTime || data.endTime) {
      const startTime = data.startTime || existingSchedule.startTime;
      const endTime = data.endTime || existingSchedule.endTime;

      const conflictingSchedules = await payload.find({
        collection: 'staff-schedules',
        where: {
          and: [
            { id: { not_equals: id } },
            { staff: { equals: existingSchedule.staff } },
            {
              or: [
                {
                  and: [
                    { startTime: { less_than_or_equal: startTime } },
                    { endTime: { greater_than: startTime } }
                  ]
                },
                {
                  and: [
                    { startTime: { less_than: endTime } },
                    { endTime: { greater_than_or_equal: endTime } }
                  ]
                }
              ]
            }
          ]
        }
      });

      if (conflictingSchedules.totalDocs > 0) {
        return NextResponse.json({
          error: 'Updated schedule conflicts with existing schedule'
        }, { status: 409 });
      }
    }

    const updatedSchedule = await payload.update({
      collection: 'staff-schedules',
      id,
      data,
    });

    return NextResponse.json(updatedSchedule);
  } catch (error: any) {
    console.error('Error updating schedule:', error);
    return NextResponse.json({
      error: error.message || 'Failed to update schedule'
    }, { status: 500 });
  }
}

// DELETE - Delete schedule
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await getPayload({ config: await import('../../../../../../payload.config') });
    const { id } = params;

    // Get existing schedule
    const existingSchedule = await payload.findByID({
      collection: 'staff-schedules',
      id,
    });

    if (!existingSchedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Check permissions
    if (session.user.role !== 'admin' && session.user.role !== 'manager' && existingSchedule.staff !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await payload.delete({
      collection: 'staff-schedules',
      id,
    });

    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({
      error: error.message || 'Failed to delete schedule'
    }, { status: 500 });
  }
}
