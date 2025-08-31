import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';


export async function GET(req: Request) {
  try {
    // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let where: any = {};
    
    if (userId) {
      where.user = { equals: userId };
    }
    
    if (status) {
      where.status = { equals: status };
    }

    const appointments = await payload.find({
      collection: 'appointments',
      where,
      sort: '-dateTime',
      limit: 50,
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
  const data = await req.json();

  try {
    const appointment = await payload.create({
      collection: 'appointments',
      data,
    });

    // Fetch the service description
    const serviceDoc = await payload.find({
      collection: 'business-documentation',
      where: {
        title: {
          equals: data.service,
        },
      },
    });

    const serviceContent = serviceDoc.docs.length > 0 ? serviceDoc.docs[0].content : '';

    // Send appointment booking email notifications
    try {
      await sendAppointmentBookingNotifications(appointment, payload);
    } catch (emailError) {
      console.error('Error sending appointment notifications:', emailError);
      // Don't fail the appointment creation if email fails
    }

    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();

    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const appointment = await payload.update({
      collection: 'appointments',
      id,
      data: updateData,
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    await payload.delete({
      collection: 'appointments',
      id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}

/**
 * Send appointment booking notifications to customer and staff
 */
async function sendAppointmentBookingNotifications(appointment: any, payload: any) {
  try {
    const { emailService } = await import('@/lib/email-service');

    // Get customer details
    const customer = appointment.user ? await payload.findByID({
      collection: 'users',
      id: appointment.user
    }) : null;

    // Get barber/staff details
    const barber = appointment.barber ? await payload.findByID({
      collection: 'users',
      id: appointment.barber
    }) : null;

    // Get service details
    const service = appointment.service ? await payload.findByID({
      collection: 'services',
      id: appointment.service
    }) : null;

    // Format appointment date and time
    const appointmentDate = new Date(appointment.dateTime || appointment.date).toLocaleDateString();
    const appointmentTime = appointment.time || new Date(appointment.dateTime).toLocaleTimeString();

    // Send confirmation email to customer
    if (customer?.email) {
      await emailService.sendEmail({
        to: customer.email,
        subject: 'Appointment Confirmation - ModernMen',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ffc107;">Appointment Confirmed!</h2>
            <p>Hi ${customer.name || customer.email},</p>
            <p>Your appointment has been successfully booked. We look forward to seeing you!</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Appointment Details:</h3>
              <p><strong>Date:</strong> ${appointmentDate}</p>
              <p><strong>Time:</strong> ${appointmentTime}</p>
              ${service ? `<p><strong>Service:</strong> ${service.name}</p>` : ''}
              ${barber ? `<p><strong>Barber:</strong> ${barber.name}</p>` : ''}
              ${appointment.duration ? `<p><strong>Duration:</strong> ${appointment.duration} minutes</p>` : ''}
              ${appointment.price ? `<p><strong>Price:</strong> $${appointment.price}</p>` : ''}
              <p><strong>Status:</strong> ${appointment.status || 'Pending'}</p>
              ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
            </div>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>What to Expect:</h4>
              <ul>
                <li>Please arrive 10 minutes early</li>
                <li>Bring a valid ID</li>
                <li>If you need to reschedule, please give us 24 hours notice</li>
                <li>We look forward to providing you with excellent service!</li>
              </ul>
            </div>
            
            <p>If you have any questions or need to make changes, please contact us.</p>
            <p>Thank you for choosing ModernMen!</p>
            <p>Best regards,<br>The ModernMen Team</p>
          </div>
        `,
        text: `Hi ${customer.name || customer.email}, Your appointment has been confirmed for ${appointmentDate} at ${appointmentTime}. ${service ? 'Service: ' + service.name + '. ' : ''}${barber ? 'Barber: ' + barber.name + '. ' : ''}Please arrive 10 minutes early. Thank you for choosing ModernMen!`
      });

      console.log(`Sent appointment confirmation to customer: ${customer.email}`);
    }

    // Send notification email to barber/staff
    if (barber?.email) {
      await emailService.sendEmail({
        to: barber.email,
        subject: 'New Appointment Booking - ModernMen',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">New Appointment Booking</h2>
            <p>Hi ${barber.name || barber.email},</p>
            <p>You have a new appointment booking that requires your attention.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Appointment Details:</h3>
              <p><strong>Customer:</strong> ${customer?.name || customer?.email || 'Walk-in'}</p>
              <p><strong>Date:</strong> ${appointmentDate}</p>
              <p><strong>Time:</strong> ${appointmentTime}</p>
              ${service ? `<p><strong>Service:</strong> ${service.name}</p>` : ''}
              ${appointment.duration ? `<p><strong>Duration:</strong> ${appointment.duration} minutes</p>` : ''}
              ${appointment.price ? `<p><strong>Price:</strong> $${appointment.price}</p>` : ''}
              <p><strong>Status:</strong> ${appointment.status || 'Pending'}</p>
              ${appointment.notes ? `<p><strong>Customer Notes:</strong> ${appointment.notes}</p>` : ''}
              ${customer?.phone ? `<p><strong>Customer Phone:</strong> ${customer.phone}</p>` : ''}
            </div>
            
            <p>Please review this appointment in your admin panel and confirm or reschedule as needed.</p>
            <p>Best regards,<br>ModernMen System</p>
          </div>
        `,
        text: `New appointment booking: ${customer?.name || customer?.email || 'Walk-in'} on ${appointmentDate} at ${appointmentTime}. ${service ? 'Service: ' + service.name + '. ' : ''}Status: ${appointment.status || 'Pending'}. ${appointment.notes ? 'Notes: ' + appointment.notes : ''}`
      });

      console.log(`Sent appointment notification to barber: ${barber.email}`);
    }

    // Send notification to managers/admin
    try {
      const managers = await payload.find({
        collection: 'users',
        where: {
          and: [
            { role: { in: ['admin', 'manager'] } },
            { isActive: { equals: true } }
          ]
        },
        limit: 10
      });

      for (const manager of managers.docs) {
        if (manager.email) {
          await emailService.sendEmail({
            to: manager.email,
            subject: 'New Appointment Booking - Management Alert',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #17a2b8;">New Appointment Alert</h2>
                <p>Hi ${manager.name || manager.email},</p>
                <p>A new appointment has been booked in the system.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                  <h3>Booking Summary:</h3>
                  <p><strong>Customer:</strong> ${customer?.name || customer?.email || 'Walk-in'}</p>
                  <p><strong>Barber:</strong> ${barber?.name || 'Not assigned'}</p>
                  <p><strong>Date:</strong> ${appointmentDate}</p>
                  <p><strong>Time:</strong> ${appointmentTime}</p>
                  ${service ? `<p><strong>Service:</strong> ${service.name}</p>` : ''}
                  ${appointment.price ? `<p><strong>Revenue:</strong> $${appointment.price}</p>` : ''}
                  <p><strong>Status:</strong> ${appointment.status || 'Pending'}</p>
                </div>
                
                <p>Please review in the admin dashboard if needed.</p>
                <p>Best regards,<br>ModernMen System</p>
              </div>
            `,
            text: `New appointment: ${customer?.name || customer?.email || 'Walk-in'} with ${barber?.name || 'unassigned barber'} on ${appointmentDate} at ${appointmentTime}. ${service ? 'Service: ' + service.name + '. ' : ''}Status: ${appointment.status || 'Pending'}.`
          });
        }
      }

      console.log(`Sent appointment notifications to ${managers.totalDocs} managers`);
    } catch (managerError) {
      console.error('Error notifying managers:', managerError);
    }

  } catch (error) {
    console.error('Error in sendAppointmentBookingNotifications:', error);
    throw error;
  }
}