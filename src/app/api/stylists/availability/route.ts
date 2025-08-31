import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/payload'
import { createErrorResponse, createSuccessResponse, ERROR_CODES } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stylistId = searchParams.get('stylistId')
    const date = searchParams.get('date') // Format: YYYY-MM-DD
    const serviceId = searchParams.get('serviceId')

    if (!stylistId || !date) {
      return createErrorResponse('Stylist ID and date are required', ERROR_CODES.VALIDATION_ERROR, 400)
    }

    const payload = await getPayloadClient()

    // Get stylist with schedule information
    const stylist = await payload.findByID({
      collection: 'stylists',
      id: stylistId,
      depth: 2,
    })

    if (!stylist) {
      return createErrorResponse('Stylist not found', 'RESOURCE_NOT_FOUND')
    }

    if (!stylist.isActive) {
      return createErrorResponse('Stylist is not available', 'VALIDATION_ERROR')
    }

    // Get service duration if provided
    let serviceDuration = 60 // Default 60 minutes
    if (serviceId) {
      const service = await payload.findByID({
        collection: 'services',
        id: serviceId,
      })
      if (service && service.duration) {
        serviceDuration = service.duration
      }
    }

    // Parse the requested date
    const requestedDate = new Date(date)
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

    // Check if stylist works on this day
    const schedule = stylist.schedule
    if (!schedule?.workDays?.includes(dayOfWeek)) {
      return createSuccessResponse({
        available: false,
        reason: 'Stylist does not work on this day',
        stylistId,
        date,
      })
    }

    // Check for time off
    if (schedule.timeOff) {
      const hasTimeOff = schedule.timeOff.some((timeOff: any) => {
        const startDate = new Date(timeOff.startDate)
        const endDate = new Date(timeOff.endDate)
        return requestedDate >= startDate && requestedDate <= endDate
      })

      if (hasTimeOff) {
        return createSuccessResponse({
          available: false,
          reason: 'Stylist is on time off',
          stylistId,
          date,
        })
      }
    }

    // Get existing appointments for this stylist on this date
    const startOfDay = new Date(requestedDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(requestedDate)
    endOfDay.setHours(23, 59, 59, 999)

    const existingAppointments = await payload.find({
      collection: 'appointments',
      where: {
        stylist: { equals: stylistId },
        date: {
          greater_than_equal: startOfDay,
          less_than_equal: endOfDay
        },
        status: { not_in: ['cancelled'] }
      },
      depth: 1,
    })

    // Calculate available time slots
    const workHours = schedule.workHours
    const startTime = workHours?.startTime || '09:00'
    const endTime = workHours?.endTime || '17:00'
    const breakStart = workHours?.breakStart || '12:00'
    const breakEnd = workHours?.breakEnd || '13:00'

    // Parse times
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    const [breakStartHour, breakStartMinute] = breakStart.split(':').map(Number)
    const [breakEndHour, breakEndMinute] = breakEnd.split(':').map(Number)

    // Generate time slots (30-minute intervals)
    const timeSlots: string[] = []
    let currentTime = new Date(requestedDate)
    currentTime.setHours(startHour, startMinute, 0, 0)

    const endTimeDate = new Date(requestedDate)
    endTimeDate.setHours(endHour, endMinute, 0, 0)

    const breakStartTime = new Date(requestedDate)
    breakStartTime.setHours(breakStartHour, breakStartMinute, 0, 0)

    const breakEndTime = new Date(requestedDate)
    breakEndTime.setHours(breakEndHour, breakEndMinute, 0, 0)

    while (currentTime < endTimeDate) {
      // Skip break time
      if (currentTime >= breakStartTime && currentTime < breakEndTime) {
        currentTime.setMinutes(currentTime.getMinutes() + 30)
        continue
      }

      // Check if this time slot conflicts with existing appointments
      const slotEnd = new Date(currentTime)
      slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration)

      const hasConflict = existingAppointments.docs.some((appointment: any) => {
        const appointmentStart = new Date(appointment.date)
        const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.duration || 60) * 60000)

        return (
          (currentTime >= appointmentStart && currentTime < appointmentEnd) ||
          (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
          (currentTime <= appointmentStart && slotEnd >= appointmentEnd)
        )
      })

      if (!hasConflict) {
        timeSlots.push(currentTime.toTimeString().slice(0, 5)) // HH:MM format
      }

      currentTime.setMinutes(currentTime.getMinutes() + 30) // 30-minute intervals
    }

    return createSuccessResponse({
      available: timeSlots.length > 0,
      stylistId,
      date,
      availableSlots: timeSlots,
      workHours: {
        start: startTime,
        end: endTime,
        breakStart,
        breakEnd
      },
      serviceDuration,
      totalSlots: timeSlots.length,
      dayOfWeek
    })

  } catch (error) {
    console.error('Error checking stylist availability:', error)
    return createErrorResponse('Failed to check stylist availability', 'INTERNAL_SERVER_ERROR')
  }
}
