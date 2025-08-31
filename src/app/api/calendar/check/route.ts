
import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';

export async function POST(req: Request) {
  try {
    const { date, duration = 60 } = await req.json();
    
    // Initialize Payload
    const payload = await getPayloadClient();

    // Check for existing appointments at the requested time
    const appointmentTime = new Date(date);
    const endTime = new Date(appointmentTime.getTime() + duration * 60 * 1000);
    
    // Buffer time before and after the appointment (15 minutes)
    const bufferStart = new Date(appointmentTime.getTime() - 15 * 60 * 1000);
    const bufferEnd = new Date(endTime.getTime() + 15 * 60 * 1000);

    const existingAppointments = await payload.find({
      collection: 'appointments',
      where: {
        and: [
          {
            date: {
              greater_than: bufferStart.toISOString(),
            },
          },
          {
            date: {
              less_than: bufferEnd.toISOString(),
            },
          },
          {
            status: {
              not_equals: 'cancelled',
            },
          },
        ],
      },
      limit: 10,
    });

    // Check if the time slot conflicts with business hours
    const hour = appointmentTime.getHours();
    const dayOfWeek = appointmentTime.getDay();
    
    // Business hours: Monday-Friday, 9 AM - 6 PM
    const isBusinessHours = dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour < 18;
    
    // Check if the requested time is in the future
    const isFuture = appointmentTime > new Date();

    const available = isBusinessHours && isFuture && existingAppointments.docs.length === 0;

    return NextResponse.json({ 
      available,
      conflicts: existingAppointments.docs.map((appt: any) => ({
        id: appt.id,
        title: appt.title,
        date: appt.date,
        service: appt.service,
      })),
      businessHours: isBusinessHours,
      isFuture,
      requestedTime: date,
      duration,
    });

  } catch (error) {
    console.error('Calendar availability check error:', error);
    return NextResponse.json(
      { 
        available: false, 
        error: 'Failed to check availability',
        message: 'Error checking calendar availability' 
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Initialize Payload
    const payload = await getPayloadClient();

    // Get available time slots for the specified date
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(9, 0, 0, 0); // 9 AM
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(18, 0, 0, 0); // 6 PM

    // Get all appointments for this date
    const appointments = await payload.find({
      collection: 'appointments',
      where: {
        and: [
          {
            date: {
              greater_than: startOfDay.toISOString(),
            },
          },
          {
            date: {
              less_than: endOfDay.toISOString(),
            },
          },
          {
            status: {
              not_equals: 'cancelled',
            },
          },
        ],
      },
      limit: 50,
    });

    // Generate available time slots (30-minute intervals)
    const timeSlots: string[] = [];
    const currentTime = new Date(startOfDay);
    
    while (currentTime < endOfDay) {
      const slotTime = new Date(currentTime);
      
      // Check if this slot conflicts with existing appointments
      const conflicts = appointments.docs.some((appt: any) => {
        const apptTime = new Date(appt.date);
        const diff = Math.abs(apptTime.getTime() - slotTime.getTime());
        return diff < 60 * 60 * 1000; // 1 hour buffer
      });

      if (!conflicts && slotTime > new Date()) {
        timeSlots.push(slotTime.toISOString());
      }

      // Move to next 30-minute slot
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return NextResponse.json({ 
      date,
      availableSlots: timeSlots,
      businessHours: {
        start: '09:00',
        end: '18:00',
      },
    });

  } catch (error) {
    console.error('Calendar slots error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get available slots',
        message: 'Error retrieving calendar slots' 
      },
      { status: 500 }
    );
  }
}
