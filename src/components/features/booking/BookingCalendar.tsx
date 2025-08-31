'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, CalendarProps } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// Icons replaced with emoji placeholders to avoid lucide-react import issues
import { format, addDays, isSameDay, isBefore, startOfDay } from 'date-fns'

interface TimeSlot {
  time: string
  available: boolean
  stylist?: string
}

interface BookingCalendarProps {
  onDateSelect?: (date: Date) => void
  onTimeSelect?: (time: string) => void
  selectedDate?: Date
  selectedTime?: string
  stylistId?: string
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30'
]

export function BookingCalendar({
  onDateSelect,
  onTimeSelect,
  selectedDate,
  selectedTime,
  stylistId
}: BookingCalendarProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)

  // Disable past dates and Sundays
  const disabledDays = (date: Date) => {
    const today = startOfDay(new Date())
    const dayOfWeek = date.getDay()
    return isBefore(date, today) || dayOfWeek === 0 // Sunday
  }

  const fetchAvailableSlots = useCallback(async (date: Date) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/availability?date=${date.toISOString()}&stylistId=${stylistId || ''}`)
      const data = await response.json()
      setAvailableSlots(data.slots || timeSlots.map(time => ({ time, available: true })))
    } catch (error) {
      console.error('Error fetching available slots:', error)
      // Fallback to all slots available
      setAvailableSlots(timeSlots.map(time => ({ time, available: true })))
    } finally {
      setLoading(false)
    }
  }, [stylistId])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect?.(date)
    }
  }

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate, stylistId, fetchAvailableSlots])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={disabledDays}
            className="rounded-md border"
            classNames={{
              day_selected: "bg-amber-500 text-white hover:bg-amber-600",
              day_today: "bg-amber-100 text-amber-900",
              day_disabled: "text-gray-400 cursor-not-allowed",
            }}
          />
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-5 w-5">🕐</div> 
            Select Time
          </CardTitle>
          {selectedDate && (
            <p className="text-sm text-gray-600">
              Available times for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  disabled={!slot.available}
                  onClick={() => onTimeSelect?.(slot.time)}
                  className={`h-12 ${
                    selectedTime === slot.time 
                      ? 'bg-amber-500 hover:bg-amber-600' 
                      : slot.available 
                        ? 'hover:bg-amber-50' 
                        : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
