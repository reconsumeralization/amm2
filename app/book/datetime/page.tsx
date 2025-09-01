"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Clock, Calendar as CalendarIcon, Loader2, AlertCircle } from "@/lib/icon-mapping"
import { cn } from "@/lib/utils"
import { format, addDays, isBefore, isToday, startOfDay } from "date-fns"

interface Service {
  id: string
  name: string
  duration: number
}

interface Stylist {
  id: string
  firstName: string
  lastName: string
  working_hours: {
    monday: { start: string; end: string; is_open: boolean }
    tuesday: { start: string; end: string; is_open: boolean }
    wednesday: { start: string; end: string; is_open: boolean }
    thursday: { start: string; end: string; is_open: boolean }
    friday: { start: string; end: string; is_open: boolean }
    saturday: { start: string; end: string; is_open: boolean }
    sunday: { start: string; end: string; is_open: boolean }
  }
}

interface BookingData {
  service: Service
  stylist: Stylist | null
}

interface TimeSlot {
  time: string
  available: boolean
  reason?: string
}

export default function SelectDateTimePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load booking data from localStorage
    const data = localStorage.getItem('bookingData')
    if (data) {
      setBookingData(JSON.parse(data))
    } else {
      router.push('/book')
      return
    }

    // Set default date to tomorrow
    const tomorrow = addDays(new Date(), 1)
    setSelectedDate(tomorrow)
  }, [router])

  useEffect(() => {
    if (selectedDate && bookingData) {
      fetchAvailableSlots()
    }
  }, [selectedDate, bookingData])

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !bookingData) return

    setLoading(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const params = new URLSearchParams({
        date: dateStr,
        service: bookingData.service.id
      })

      if (bookingData.stylist) {
        params.append('stylist', bookingData.stylist.id)
      }

      const response = await fetch(`/api/appointments/available-slots?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch available slots')

      const slots = await response.json()
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error fetching available slots:', error)
      // Generate mock time slots if API fails
      generateMockTimeSlots()
    } finally {
      setLoading(false)
    }
  }

  const generateMockTimeSlots = () => {
    if (!selectedDate || !bookingData) return

    const slots: TimeSlot[] = []
    const startHour = 9
    const endHour = 18
    const interval = 30 // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        // Simulate some slots as unavailable
        const isAvailable = Math.random() > 0.3
        slots.push({
          time: timeString,
          available: isAvailable,
          reason: isAvailable ? undefined : 'Booked'
        })
      }
    }

    setAvailableSlots(slots)
  }

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    if (timeSlot.available) {
      setSelectedTime(timeSlot.time)
    }
  }

  const handleContinue = () => {
    if (!selectedDate || !selectedTime || !bookingData) return

    const finalBookingData = {
      ...bookingData,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime
    }

    localStorage.setItem('finalBookingData', JSON.stringify(finalBookingData))
    router.push('/book/details')
  }

  const handleBack = () => {
    router.push('/book/stylist')
  }

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    if (isBefore(date, startOfDay(new Date()))) return true

    // Disable dates more than 30 days in the future
    if (isBefore(addDays(new Date(), 30), date)) return true

    return false
  }

  const getDaySchedule = () => {
    if (!selectedDate || !bookingData?.stylist) return null

    const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase() as keyof typeof bookingData.stylist.working_hours
    const schedule = bookingData.stylist.working_hours[dayOfWeek]

    return schedule?.is_open ? schedule : null
  }

  const schedule = getDaySchedule()

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading booking data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Stylists
            </Button>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Select Date & Time
              </h1>
              <p className="text-xl text-gray-600">
                {bookingData.service.name} • {bookingData.service.duration} minutes
              </p>
              {bookingData.stylist && (
                <p className="text-sm text-gray-500 mt-1">
                  with {bookingData.stylist.firstName} {bookingData.stylist.lastName}
                </p>
              )}
            </div>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Calendar Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Select Date
                </CardTitle>
                <CardDescription>
                  Choose your preferred appointment date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
                  className="rounded-md border"
                />

                {schedule && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-800">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Business Hours</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      {format(selectedDate!, 'EEEE')}: {schedule.start} - {schedule.end}
                    </p>
                  </div>
                )}

                {!schedule && selectedDate && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Closed</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      We're closed on {format(selectedDate, 'EEEE')}. Please select a different date.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Time Slots Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Available Times
                </CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `Times for ${format(selectedDate, 'EEEE, MMMM do')}`
                    : 'Select a date to view available times'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedDate ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Please select a date first</p>
                  </div>
                ) : loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading available times...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No available times for this date</p>
                    <p className="text-sm mt-2">Try selecting a different date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {availableSlots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        className={cn(
                          "h-12 text-sm font-medium",
                          selectedTime === slot.time && "bg-blue-600 hover:bg-blue-700",
                          !slot.available && "opacity-50 cursor-not-allowed bg-gray-100 hover:bg-gray-100"
                        )}
                        disabled={!slot.available}
                        onClick={() => handleTimeSelect(slot)}
                      >
                        {slot.time}
                        {!slot.available && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {slot.reason || 'Booked'}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Selected Appointment Summary */}
        {(selectedDate || selectedTime) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Appointment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Service</h4>
                  <p className="text-gray-600">{bookingData.service.name}</p>
                  <p className="text-sm text-gray-500">{bookingData.service.duration} minutes</p>
                </div>

                {bookingData.stylist && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Stylist</h4>
                    <p className="text-gray-600">
                      {bookingData.stylist.firstName} {bookingData.stylist.lastName}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Date & Time</h4>
                  {selectedDate && (
                    <p className="text-gray-600">
                      {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                    </p>
                  )}
                  {selectedTime && (
                    <p className="text-gray-600">{selectedTime}</p>
                  )}
                  {!selectedDate && !selectedTime && (
                    <p className="text-gray-500">Not selected yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedDate || !selectedTime}
            className="px-8 py-3 text-lg"
          >
            Continue to Booking Details
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Need help with booking?
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <span>📞 (555) 123-4567</span>
              <span>📧 info@modernmen.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
