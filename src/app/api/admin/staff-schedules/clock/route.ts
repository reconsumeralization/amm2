import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '../../../../../utils/email';

export async function POST(req: Request) {
  try {
    // Get user session for authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, tenantId, staffId } = await req.json();
    const payload = await getPayload({ config: (await import('../../../../../payload.config')).default });

    // Normalize action values from chatbot ('in', 'out') to API format ('clock-in', 'clock-out')
    let normalizedAction = action;
    if (action === 'in') {
      normalizedAction = 'clock-in';
    } else if (action === 'out') {
      normalizedAction = 'clock-out';
    }

    // Use provided staffId or fall back to authenticated user
    let userId = staffId;
    if (!userId) {
      userId = session.user.id;
    }

    // Input validation
    if (!normalizedAction || !tenantId || !userId) {
      return NextResponse.json({ error: 'Missing required fields: action, tenantId, and userId/staffId' }, { status: 400 });
    }
    if (!['clock-in', 'clock-out'].includes(normalizedAction)) {
      return NextResponse.json({ error: 'Invalid action. Must be "clock-in", "clock-out", "in", or "out"' }, { status: 400 });
    }

    // Main processing
    try {
    const settings = await payload.find({
      collection: 'settings',
      where: tenantId ? { tenant: { equals: tenantId } } : { tenant: { exists: false } },
      limit: 1,
    });
    const config = settings.docs[0] || {};

    if (!config.clock?.enabled) {
      return NextResponse.json({ error: 'Clock-in/out is disabled in settings' }, { status: 403 });
    }

    const user = await payload.findByID({ collection: 'users', id: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (user.role !== 'staff') {
      return NextResponse.json({ error: 'Forbidden: Only staff can clock in/out' }, { status: 403 });
    }

    // Validate shift duration and weekly hours
    if (normalizedAction === 'clock-out') {
      const lastClockIn = await payload.find({
        collection: 'clock-records',
        where: { staff: { equals: userId }, action: { equals: 'clock-in' } },
        sort: '-timestamp',
        limit: 1,
      });

      if (lastClockIn.docs.length === 0) {
        return NextResponse.json({ error: 'Cannot clock out without a prior clock-in record' }, { status: 400 });
      }

      const duration = (new Date().getTime() - new Date(lastClockIn.docs[0].timestamp).getTime()) / (1000 * 60 * 60);
      if (duration < config.clock.shiftRules.minShiftHours || duration > config.clock.shiftRules.maxShiftHours) {
        return NextResponse.json({ error: `Shift duration must be between ${config.clock.shiftRules.minShiftHours} and ${config.clock.shiftRules.maxShiftHours} hours` }, { status: 400 });
      }

      const weeklyHoursRes = await payload.find({
        collection: 'clock-records',
        where: { staff: { equals: userId }, timestamp: { greater_than: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString() } },
      });
      const weeklyHours = weeklyHoursRes.docs.reduce((sum: number, record: any) => {
        if (record.action === 'clock-in') {
          const clockOut = weeklyHoursRes.docs.find((r: any) => r.action === 'clock-out' && r.timestamp > record.timestamp);
          return sum + (clockOut ? (new Date(clockOut.timestamp).getTime() - new Date(record.timestamp).getTime()) / (1000 * 60 * 60) : 0);
        }
        return sum;
      }, 0);
      if (weeklyHours + duration > config.clock.shiftRules.maxWeeklyHours) {
        return NextResponse.json({ error: `Total weekly hours would exceed ${config.clock.shiftRules.maxWeeklyHours}` }, { status: 400 });
      }
    }

    const record = await payload.create({
      collection: 'clock-records',
      data: {
        staff: userId,
        tenant: tenantId,
        action: normalizedAction,
        timestamp: new Date().toISOString(),
      },
    });

    // Google Calendar sync
    if (config.clock.notifications.googleCalendarSync && config.googleCalendar.enabled) {
      try {
        if (!user.googleAccessToken) {
          console.warn(`User ${user.id} has no Google Access Token for calendar sync.`);
        } else {
          // Google Calendar integration is disabled to prevent build issues
          console.warn(`Google Calendar sync is disabled for user ${user.id} to prevent build issues.`);
        }
      } catch (calendarError) {
        console.error('Google Calendar sync failed:', calendarError);
        // Continue processing even if calendar sync fails
      }
    }

    // Notify admins
    if (config.clock.notifications.emailAdmins && config.email.enableNotifications) {
      try {
        const admins = await payload.find({ collection: 'users', where: { role: { equals: 'admin' } } });
        for (const admin of admins.docs) {
          await sendEmail({
            to: admin.email,
            subject: `Staff ${normalizedAction} Notification`,
            html: config.clock.notifications.emailTemplate
              .replace('{{staffName}}', user.name)
              .replace('{{action}}', normalizedAction === 'clock-in' ? 'clocked in' : 'clocked out')
              .replace('{{timestamp}}', new Date(record.timestamp).toLocaleString()) + config.email.signature,
          });
        }
      } catch (emailError) {
        console.error('Admin email notification failed:', emailError);
        // Continue processing even if email fails
      }
    }

      return NextResponse.json(record);
    } catch (error: any) {
    console.error('Error in clock API:', error);
    // Differentiate between validation errors and unexpected errors
    if (error.message && (
      error.message.includes('Missing required fields') ||
      error.message.includes('Invalid action') ||
      error.message.includes('Cannot clock out') ||
      error.message.includes('Shift duration') ||
      error.message.includes('Total weekly hours')
    )) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message && error.message.includes('User not found')) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (error.message && error.message.includes('Forbidden: Only staff can clock in/out')) {
      return NextResponse.json({ error: 'Forbidden: Only staff can clock in/out' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to record clock action due to an internal server error' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Unexpected error in clock API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}