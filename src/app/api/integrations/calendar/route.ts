import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';

export async function POST(req: Request) {
  const { date, title, userId, appointmentId, recurrence, action = 'create' } = await req.json();
  const payload = await getPayload({ config: (await import('@/payload.config')).default });
  const user = await payload.findByID({ collection: 'users', id: userId });

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
    return NextResponse.json({ error: 'Failed to sync with Google Calendar' }, { status: 500 });
  }
}