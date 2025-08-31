import { getPayloadClient } from '@/payload';
import { NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function POST(req: Request) {
  // @ts-ignore - Payload config type issue
  const payload = await getPayloadClient();
  const data = await req.json();

  try {
    const schedule = await payload.create({
      collection: 'staff-schedules',
      data,
    });

    // Send email notification to affected staff member
    if (data.staffId) {
      try {
        const staffMember = await payload.findByID({
          collection: 'users',
          id: data.staffId,
        });

        if (staffMember?.email) {
          await emailService.sendStaffNotification(
            staffMember.email,
            staffMember.name || staffMember.email,
            'schedule_update',
            {
              scheduleDate: data.date || 'TBD',
              scheduleTime: data.time || 'TBD',
              shift: data.shift || 'Full Day',
              notes: data.notes || 'No additional notes',
              updatedBy: data.updatedBy || 'Admin'
            }
          );
          console.log('Schedule update notification sent to:', staffMember.email);
        }
      } catch (emailError) {
        console.error('Failed to send schedule update notification:', emailError);
        // Don't fail the schedule creation if email fails
      }
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Failed to create schedule:', error);
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  // @ts-ignore - Payload config type issue
  const payload = await getPayloadClient();
  const { id, ...data } = await req.json();

  try {
    const updatedSchedule = await payload.update({
      collection: 'staff-schedules',
      id,
      data,
    });

    // Send email notification for schedule updates
    if (data.staffId) {
      try {
        const staffMember = await payload.findByID({
          collection: 'users',
          id: data.staffId,
        });

        if (staffMember?.email) {
          await emailService.sendStaffNotification(
            staffMember.email,
            staffMember.name || staffMember.email,
            'schedule_update',
            {
              scheduleDate: data.date || 'TBD',
              scheduleTime: data.time || 'TBD',
              shift: data.shift || 'Full Day',
              notes: data.notes || 'Schedule updated',
              updatedBy: data.updatedBy || 'Admin',
              updateType: 'Modified'
            }
          );
          console.log('Schedule update notification sent to:', staffMember.email);
        }
      } catch (emailError) {
        console.error('Failed to send schedule update notification:', emailError);
      }
    }

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('Failed to update schedule:', error);
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}