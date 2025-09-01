import { NextRequest, NextResponse } from 'next/server'
import payload from '@/lib/payload'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Get current user from session
    const user = request.user // This would come from your auth middleware

    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const schedule = await payload.findByID({
      collection: 'employee-schedules',
      id,
    })

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      schedule,
    })
  } catch (error) {
    console.error('Schedule fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      date,
      startTime,
      endTime,
      position,
      location,
      shiftType,
      status,
      notes,
    } = body

    // Get current user from session
    const user = request.user // This would come from your auth middleware

    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const updateData: any = {}

    if (date) updateData.date = date
    if (startTime) updateData.startTime = startTime
    if (endTime) updateData.endTime = endTime
    if (position) updateData.position = position
    if (location) updateData.location = location
    if (shiftType) updateData.shiftType = shiftType
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    const updatedSchedule = await payload.update({
      collection: 'employee-schedules',
      id,
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      schedule: updatedSchedule,
      message: 'Schedule updated successfully',
    })
  } catch (error) {
    console.error('Schedule update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Get current user from session
    const user = request.user // This would come from your auth middleware

    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await payload.delete({
      collection: 'employee-schedules',
      id,
    })

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully',
    })
  } catch (error) {
    console.error('Schedule delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
