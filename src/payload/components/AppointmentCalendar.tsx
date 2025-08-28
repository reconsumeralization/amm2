// Start of Selection
import React, { useState } from 'react'
import { Card, Button, Select } from '@payloadcms/ui'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'

interface Appointment {
  id: string
  dateTime: string
  duration: number
  customer: {
    firstName: string
    lastName: string
  }
  stylist: {
    name: string
  }
  service: {
    name: string
  }
  status: string
}

interface CalendarDayProps {
  date: Date
  appointments: Appointment[]
  isToday: boolean
  isSelected: boolean
  onClick: () => void
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  appointments,
  isToday,
  isSelected,
  onClick
}) => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
  const dayNumber = date.getDate()

  const statusColors = {
    confirmed: 'bg-green-100 border-green-300',
    pending: 'bg-yellow-100 border-yellow-300',
    'in-progress': 'bg-blue-100 border-blue-300',
    completed: 'bg-gray-100 border-gray-300',
    cancelled: 'bg-red-100 border-red-300'
  }

  return (
    <div
      className={`min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all ${
        isToday ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      } ${isSelected ? 'bg-blue-100 border-blue-400' : 'border-gray-200'}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-gray-500">{dayName}</span>
        <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
          {dayNumber}
        </span>
      </div>

      <div className="space-y-1 max-h-[80px] overflow-y-auto">
        {appointments.slice(0, 3).map((appointment) => (
          <div
            key={appointment.id}
            className={`text-xs p-1 rounded border ${statusColors[appointment.status as keyof typeof statusColors]} truncate`}
            title={`${appointment.customer.firstName} ${appointment.customer.lastName} - ${appointment.service.name}`}
          >
            {appointment.customer.firstName} {appointment.customer.lastName.charAt(0)}.
          </div>
        ))}
        {appointments.length > 3 && (
          <div className="text-xs text-gray-500">
            +{appointments.length - 3} more
          </div>
        )}
      </div>
    </div>
  )
}

interface AppointmentCalendarProps {
  appointments: Appointment[]
  onDateSelect?: (date: Date) => void
  onAppointmentClick?: (appointment: Appointment) => void
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onDateSelect,
  onAppointmentClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<'month' | 'week'>('month')
  const [selectedStylist, setSelectedStylist] = useState<string>('all')

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const startDate = new Date(monthStart.setDate(monthStart.getDate() - monthStart.getDay()))

  const generateCalendarDays = () => {
    const days = []
    const day = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      const dayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.dateTime)
        return appointmentDate.toDateString() === day.toDateString() &&
               (selectedStylist === 'all' || appointment.stylist.name === selectedStylist)
      })

      days.push({
        date: new Date(day),
        appointments: dayAppointments,
        isToday: day.toDateString() === new Date().toDateString(),
        isSelected: selectedDate?.toDateString() === day.toDateString()
      })
      day.setDate(day.getDate() + 1)
    }

    return days
  }

  const calendarDays = generateCalendarDays()
  const selectedDayAppointments = selectedDate
    ? appointments.filter(appointment =>
        new Date(appointment.dateTime).toDateString() === selectedDate.toDateString()
      )
    : []

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onDateSelect?.(date)
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    onAppointmentClick?.(appointment)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const uniqueStylists = Array.from(new Set(appointments.map(app => app.stylist.name)))
  // Start of Selection
  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Heading className="text-2xl font-bold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Heading>
          <div className="flex space-x-2">
            <Button
              onClick={() => navigateMonth('prev')}
            >
              ←
            </Button>
            <Button
              onClick={() => navigateMonth('next')}
            >
              →
            </Button>
            <Button
              onClick={goToToday}
            >
              Today
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Select
            value={{ label: view === 'month' ? 'Month' : 'Week', value: view }}
            onChange={(option: any) => setView(option.value as 'month' | 'week')}
            options={[
              { label: 'Month', value: 'month' },
              { label: 'Week', value: 'week' }
            ]}
          />
          <Select
            value={{ label: selectedStylist === 'all' ? 'All Stylists' : selectedStylist, value: selectedStylist }}
            onChange={(option: any) => setSelectedStylist(option.value as string)}
            options={[
              { label: 'All Stylists', value: 'all' },
              ...uniqueStylists.map(stylist => ({
                label: stylist,
                value: stylist
              }))
            ]}
          />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => (
          <CalendarDay
            key={index}
            date={day.date}
            appointments={day.appointments}
            isToday={day.isToday}
            isSelected={day.isSelected}
            onClick={() => handleDateClick(day.date)}
          />
        ))}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <Heading className="text-lg font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Heading>
            <Text className="text-sm text-gray-500">
              {selectedDayAppointments.length} appointments
            </Text>
          </div>

          <div className="space-y-3">
            {selectedDayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleAppointmentClick(appointment)}
              >
                <div>
                  <Text className="font-medium text-gray-900">
                    {appointment.customer.firstName} {appointment.customer.lastName}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {appointment.service.name} with {appointment.stylist.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {new Date(appointment.dateTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })} ({appointment.duration} min)
                  </Text>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  appointment.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {appointment.status}
                </div>
              </div>
            ))}
            {selectedDayAppointments.length === 0 && (
              <Text className="text-center text-gray-500 py-8">
                No appointments scheduled for this date
              </Text>
            )}
          </div>
        </div>
      )}
    </div>
  )
}