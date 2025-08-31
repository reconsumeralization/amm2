import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '../../../../payload.config';

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });

    // Get all appointments that don't have Google Calendar events
    const appointments = await payload.find({
      collection: 'appointments',
      where: {
        or: [
          { googleEventId: { exists: false } },
          { googleEventId: { equals: null } },
          { googleEventId: { equals: '' } }
        ]
      },
    });

    // Get global settings for calendar configuration
    const settings = await payload.find({
      collection: 'settings',
      where: { tenant: { exists: false } },
      limit: 1,
    });

    const config = settings.docs[0];
    
    if (!config?.googleCalendar?.enabled) {
      return NextResponse.json(
        { error: 'Google Calendar sync is not enabled in settings' },
        { status: 400 }
      );
    }

    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Process each appointment
    for (const appointment of appointments.docs) {
      try {
        // Get the user for this appointment
        const user = await payload.findByID({
          collection: 'users',
          id: appointment.user,
        });

        if (!user?.googleAccessToken) {
          failedCount++;
          errors.push(`User ${user?.email || appointment.user} has no Google access token`);
          continue;
        }

        // Google Calendar integration is disabled to prevent build issues
        failedCount++;
        errors.push(`Google Calendar integration is disabled for appointment ${appointment.id} to prevent build issues`);
      } catch (error) {
        failedCount++;
        errors.push(`Failed to sync appointment ${appointment.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      message: `Calendar sync completed. ${syncedCount} synced, ${failedCount} failed.`,
      syncedCount,
      failedCount,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync calendar', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
