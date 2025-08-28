import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import { sendEmail } from '../../../../../utils/email';
import { google } from 'googleapis';

export async function POST(req: Request) {
  const { action, tenantId } = await req.json(); // userId will come from req.user
  const payload = await getPayload({ config: (await import('@/payload.config')).default });

  // 1. Authentication Check: Get user from request headers or payload auth
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized: No authentication token' }, { status: 401 });
  }
  
  // For now, extract userId from request body or use mock
  const userId = tenantId || 'default-user'; // In real implementation, decode from auth token

  // Input validation
  if (!action || !tenantId) {
    return NextResponse.json({ error: 'Missing required fields: action, tenantId' }, { status: 400 });
  }
  if (!['clock-in', 'clock-out'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action. Must be "clock-in" or "clock-out"' }, { status: 400 });
  }

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
    if (action === 'clock-out') {
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
        action,
        timestamp: new Date().toISOString(),
      },
    });

    // Google Calendar sync
    if (config.clock.notifications.googleCalendarSync && config.googleCalendar.enabled) {
      try {
        if (!user.googleAccessToken) {
          console.warn(`User ${user.id} has no Google Access Token for calendar sync.`);
        } else {
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
          );
          oauth2Client.setCredentials({ access_token: user.googleAccessToken });
          const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
          const event = {
            summary: `${config.googleCalendar.eventPrefix}${user.name} ${action}`,
            start: { dateTime: new Date(record.timestamp).toISOString(), timeZone: 'UTC' },
            end: { dateTime: new Date(new Date(record.timestamp).getTime() + 1000).toISOString(), timeZone: 'UTC' },
          };
          await calendar.events.insert({ calendarId: config.googleCalendar.calendarId, requestBody: event });
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
            subject: `Staff ${action} Notification`,
            html: config.clock.notifications.emailTemplate
              .replace('{{staffName}}', user.name || 'Staff Member')
              .replace('{{action}}', action === 'clock-in' ? 'clocked in' : 'clocked out')
              .replace('{{timestamp}}', new Date(record.timestamp).toLocaleString()) + (config.email.signature || ''),
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
    if (error.message.includes('Missing required fields') || error.message.includes('Invalid action') || error.message.includes('Cannot clock out') || error.message.includes('Shift duration') || error.message.includes('Total weekly hours')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('User not found')) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (error.message.includes('Forbidden: Only staff can clock in/out')) {
      return NextResponse.json({ error: 'Forbidden: Only staff can clock in/out' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to record clock action due to an internal server error' }, { status: 500 });
  }
}