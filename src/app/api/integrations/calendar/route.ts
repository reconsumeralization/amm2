import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '../../../../payload.config';

export async function POST(req: Request) {
  try {
    const { date, title, userId, appointmentId, recurrence, action = 'create' } = await req.json();
    
    // Validate required fields
    if (!userId || !date || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, date, title' },
        { status: 400 }
      );
    }

    if ((action === 'update' || action === 'delete') && !appointmentId) {
      return NextResponse.json(
        { error: 'appointmentId is required for update/delete actions' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });
    const user = await payload.findByID({ collection: 'users', id: userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.googleAccessToken) {
      return NextResponse.json(
        { error: 'User has no Google access token. Please reconnect Google Calendar.' },
        { status: 400 }
      );
    }

    // Get calendar settings
    const settings = await payload.find({
      collection: 'settings',
      where: user.tenant ? { tenant: { equals: user.tenant } } : { tenant: { exists: false } },
      limit: 1,
    });

    const calendarConfig = settings.docs[0]?.googleCalendar;

    if (!calendarConfig?.enabled) {
      return NextResponse.json(
        { error: 'Google Calendar integration is not enabled' },
        { status: 400 }
      );
    }

    // Dynamically import Google APIs
    let google;
    try {
      const googleapis = await import('googleapis');
      google = googleapis.google;
    } catch (importError) {
      console.error('Failed to import Google APIs:', importError);
      return NextResponse.json(
        { error: 'Google Calendar integration is not available' },
        { status: 503 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({ access_token: user.googleAccessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const event = {
    summary: title,
    start: { dateTime: new Date(date).toISOString(), timeZone: 'UTC' },
    end: { dateTime: new Date(new Date(date).getTime() + 60 * 60 * 1000).toISOString(), timeZone: 'UTC' },
    recurrence: recurrence ? [recurrence] : undefined,
  };

  try {
    let googleEventId;
    if (action === 'create') {
      const response = await calendar.events.insert({ calendarId: 'primary', resource: event });
      googleEventId = response.data.id;
    } else if (action === 'update') {
      const appointment = await payload.findByID({ collection: 'appointments', id: appointmentId });
      await calendar.events.update({ calendarId: 'primary', eventId: appointment.googleEventId, resource: event });
      googleEventId = appointment.googleEventId;
    } else if (action === 'delete') {
      const appointment = await payload.findByID({ collection: 'appointments', id: appointmentId });
      await calendar.events.delete({ calendarId: 'primary', eventId: appointment.googleEventId });
      return NextResponse.json({ success: true });
    }

    if (action !== 'delete') {
      await payload.update({
        collection: 'appointments',
        id: appointmentId,
        data: { googleEventId },
      });
    }
    return NextResponse.json({ success: true, googleEventId });
  } catch (error) {
    console.error('Calendar integration error:', error);
    return NextResponse.json({ error: 'Failed to sync with Google Calendar' }, { status: 500 });
  }
  } catch (error) {
    console.error('Unexpected error in calendar integration:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
