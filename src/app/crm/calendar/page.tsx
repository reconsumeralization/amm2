// src/app/crm/calendar/page.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { getPayload } from 'payload';
import config from '../../../../payload.config';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AppointmentCalendar from '@/components/crm/AppointmentCalendar';

async function getAppointments() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
        throw new Error('Unauthorized');
    }

    const payload = await getPayload({ config: (await import('../../../payload.config')).default });

    const appointments = await payload.find({
        collection: 'appointments',
        limit: 100, // Add pagination later
        depth: 1, // To populate user
    });

    return appointments.docs;
}

const CalendarPage = async () => {
  const appointments = await getAppointments();

  const formattedAppointments = appointments.map((app: any) => ({
      id: app.id,
      title: `${app.title} - ${app.user.fullName}`,
      date: app.date,
      status: app.status || 'pending',
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appointment Calendar</h1>
        <Button>New Appointment</Button>
      </div>
      <div className="border rounded-lg p-4">
        <AppointmentCalendar appointments={formattedAppointments} />
      </div>
    </div>
  );
};

export default CalendarPage;
