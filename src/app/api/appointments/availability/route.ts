import { NextRequest, NextResponse } from 'next/server'
import getPayloadClient from '@/payload'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const stylistId = searchParams.get('stylistId')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()
    const selectedDate = new Date(date)
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Get existing appointments for the date
    const existingAppointments = await payload.find({
      collection: 'appointments',
      where: {
        dateTime: {
          greater_than_equal: startOfDay,
          less_than_equal: endOfDay,
        },
        status: {
          not_in: ['cancelled', 'no-show'],
        },
        ...(stylistId && { stylist: { equals: stylistId } }),
      },
    })

    // Define business hours
    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
      '18:00', '18:30', '19:00', '19:30'
    ]

    // Check availability for each time slot
    const availability = timeSlots.map(time => {
      const [hours, minutes] = time.split(':').map(Number)
      const slotTime = new Date(selectedDate)
      slotTime.setHours(hours, minutes, 0, 0)

      // Check if slot conflicts with existing appointments
      const hasConflict = existingAppointments.docs.some((appointment: { dateTime: string | number | Date; duration: number }) => {
        const appointmentTime = new Date(appointment.dateTime)
        const appointmentEnd = new Date(appointmentTime.getTime() + (appointment.duration || 30) * 60000)
        
        return slotTime < appointmentEnd && 
               new Date(slotTime.getTime() + 30 * 60000) > appointmentTime
      })

      return {
        time,
        available: !hasConflict,
      }
    })

    return NextResponse.json({
      date: selectedDate.toISOString(),
      slots: availability,
      totalSlots: timeSlots.length,
      availableSlots: availability.filter(slot => slot.available).length,
    })

  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}
