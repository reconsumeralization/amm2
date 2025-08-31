'use client';

import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AppointmentFormModal from './AppointmentFormModal';
import ViewAppointmentModal from './ViewAppointmentModal';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Appointment {
  id: string;
  title: string;
  date: string;
  status: string;
}

interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
    resource: any;
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ appointments }) => {
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [isViewAppointmentModalOpen, setIsViewAppointmentModalOpen] = useState(false);
  const [slotInfo, setSlotInfo] = useState<SlotInfo | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const events: CalendarEvent[] = appointments.map(app => ({
    title: app.title,
    start: new Date(app.date),
    end: new Date(new Date(app.date).getTime() + 60 * 60 * 1000), // Assuming 1-hour appointments
    resource: app,
  }));

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSlotInfo(slotInfo);
    setIsNewAppointmentModalOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsViewAppointmentModalOpen(true);
  };

  const handleCloseNewAppointmentModal = () => {
    setIsNewAppointmentModalOpen(false);
    setSlotInfo(null);
  };

  const handleCloseViewAppointmentModal = () => {
    setIsViewAppointmentModalOpen(false);
    setSelectedEvent(null);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const status = event.resource.status;
    let backgroundColor = '#3174ad'; // Default blue

    if (status === 'completed') {
      backgroundColor = '#31ad47'; // Green
    } else if (status === 'cancelled') {
      backgroundColor = '#ad3131'; // Red
    }

    const style = {
      backgroundColor,
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return {
      style: style
    };
  };

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
      />
      {slotInfo && (
        <AppointmentFormModal
          isOpen={isNewAppointmentModalOpen}
          onClose={handleCloseNewAppointmentModal}
          slotInfo={slotInfo}
        />
      )}
      {selectedEvent && (
        <ViewAppointmentModal
          isOpen={isViewAppointmentModalOpen}
          onClose={handleCloseViewAppointmentModal}
          appointment={selectedEvent}
        />
      )}
    </div>
  );
};

export default AppointmentCalendar;