import { NextRequest, NextResponse } from 'next/server'
import payload from '@/lib/payload'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const employeeId = searchParams.get('employeeId')

    // Get current user from session
    const user = request.user // This would come from your auth middleware

    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    let whereClause: any = {}

    // Add date range filter
    if (startDate && endDate) {
      whereClause.date = {
        greater_than_equal: startDate,
        less_than_equal: endDate,
      }
    }

    // Add employee filter if provided
    if (employeeId) {
      whereClause.employee = { equals: employeeId }
    }

    const schedules = await payload.find({
      collection: 'employee-schedules',
      where: whereClause,
      sort: 'date',
      limit: 1000,
    })

    // Calculate stats
    const schedulesData = schedules.docs
    const totalShifts = schedulesData.length
    const scheduledEmployees = new Set(schedulesData.map(s => s.employee)).size
    const completedShifts = schedulesData.filter(s => s.status === 'completed').length
    const openShifts = totalShifts - completedShifts

    // Check for conflicts (simplified)
    const conflicts = 0 // Would implement conflict detection logic

    const stats = {
      totalShifts,
      scheduledEmployees,
      openShifts,
      conflicts,
    }

    return NextResponse.json({
      success: true,
      schedules: schedulesData,
      stats,
    })
  } catch (error) {
    console.error('Schedules fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employeeId,
      date,
      startTime,
      endTime,
      position,
      location,
      shiftType,
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

    // Validate required fields
    if (!employeeId || !date || !startTime || !endTime || !position) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get employee details
    const employee = await payload.findByID({
      collection: 'employees',
      id: employeeId,
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Create schedule
    const schedule = await payload.create({
      collection: 'employee-schedules',
      data: {
        employee: employeeId,
        date,
        startTime,
        endTime,
        position,
        location: location || 'main-salon',
        shiftType: shiftType || 'regular',
        notes,
        status: 'scheduled',
        createdBy: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      schedule,
      message: 'Schedule created successfully',
    })
  } catch (error) {
    console.error('Schedule creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
