import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
import { sendEmail } from '../../../../../utils/email';


export async function POST(req: NextRequest) {
  try {
    const { eventId, userId, action } = await req.json();

    if (!eventId || !userId || !action) {
      return NextResponse.json(
        { error: 'Event ID, user ID, and action are required' },
        { status: 400 }
      );
    }

    if (!['attend', 'waitlist', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be attend, waitlist, or cancel' },
        { status: 400 }
      );
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();

    // Get the event
    const event = await payload.findByID({
      collection: 'events',
      id: eventId,
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.isActive) {
      return NextResponse.json(
        { error: 'Event is not active' },
        { status: 400 }
      );
    }

    // Get the user
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let updatedEvent;
    let emailSubject = '';
    let emailBody = '';

    if (action === 'attend') {
      // Check if event is full
      const currentAttendees = event.attendees?.length || 0;
      if (currentAttendees >= event.capacity) {
        // Add to waitlist instead
        updatedEvent = await payload.update({
          collection: 'events',
          id: eventId,
          data: {
            waitlist: {
              push: userId,
            },
          },
        });
        emailSubject = 'Added to Event Waitlist';
        emailBody = `You've been added to the waitlist for "${event.title}" on ${new Date(event.date).toLocaleString()}. We'll notify you if a spot becomes available.`;
      } else {
        // Add to attendees
        updatedEvent = await payload.update({
          collection: 'events',
          id: eventId,
          data: {
            attendees: {
              push: userId,
            },
          },
        });
        emailSubject = 'Event RSVP Confirmation';
        emailBody = `You're registered for "${event.title}" on ${new Date(event.date).toLocaleString()}! We look forward to seeing you.`;
      }
    } else if (action === 'waitlist') {
      updatedEvent = await payload.update({
        collection: 'events',
        id: eventId,
        data: {
          waitlist: {
            push: userId,
          },
        },
      });
      emailSubject = 'Added to Event Waitlist';
      emailBody = `You've been added to the waitlist for "${event.title}" on ${new Date(event.date).toLocaleString()}. We'll notify you if a spot becomes available.`;
    } else if (action === 'cancel') {
      // Remove from attendees and waitlist
      const attendees = event.attendees?.filter((id: string) => id !== userId) || [];
      const waitlist = event.waitlist?.filter((id: string) => id !== userId) || [];
      
      updatedEvent = await payload.update({
        collection: 'events',
        id: eventId,
        data: {
          attendees,
          waitlist,
        },
      });
      emailSubject = 'Event RSVP Cancelled';
      emailBody = `Your RSVP for "${event.title}" has been cancelled.`;
    }

    // Award loyalty points for attending (if not cancelling)
    if (action !== 'cancel' && event.loyaltyPoints > 0) {
      try {
        await payload.update({
          collection: 'users',
          id: userId,
          data: {
            loyalty: {
              points: {
                increment: event.loyaltyPoints,
              },
            },
          },
        });
      } catch (error) {
        console.error('Failed to award loyalty points:', error);
      }
    }

    // Send confirmation email
    try {
      await sendEmail({
        to: user.email,
        subject: emailSubject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${emailSubject}</h2>
            <p>${emailBody}</p>
            ${action !== 'cancel' ? `
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>Event Details:</h3>
                <p><strong>Title:</strong> ${event.title}</p>
                <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
                <p><strong>Duration:</strong> ${event.duration} minutes</p>
                ${event.location?.type === 'online' && event.location?.zoomLink ? 
                  `<p><strong>Zoom Link:</strong> <a href="${event.location.zoomLink}">${event.location.zoomLink}</a></p>` : ''
                }
                ${event.location?.type === 'external' && event.location?.address ? 
                  `<p><strong>Location:</strong> ${event.location.address}</p>` : ''
                }
              </div>
            ` : ''}
            <p style="color: #666; font-size: 14px;">
              If you have any questions, please contact us.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: emailSubject,
    });

  } catch (error) {
    console.error('Event RSVP error:', error);
    return NextResponse.json(
      { error: 'Failed to process RSVP' },
      { status: 500 }
    );
  }
}
