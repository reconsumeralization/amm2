import { NextRequest, NextResponse } from 'next/server'
import payload from '@/lib/payload'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const employeeId = searchParams.get('employeeId')

    // Get current user from session
    const user = request.user // This would come from your auth middleware

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let whereClause: any = {}

    // If employeeId is provided, use it; otherwise get entries for current user
    if (employeeId) {
      // Check if user has permission to view this employee's entries
      if (!['admin', 'manager'].includes(user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
      whereClause.employee = { equals: employeeId }
    } else {
      // Get employee record for current user
      const employees = await payload.find({
        collection: 'employees',
        where: {
          user: { equals: user.id }
        }
      })

      if (employees.docs.length === 0) {
        return NextResponse.json(
          { error: 'Employee record not found' },
          { status: 404 }
        )
      }

      whereClause.employee = { equals: employees.docs[0].id }
    }

    // Add date filter if provided
    if (date) {
      whereClause.date = { equals: date }
    }

    const entries = await payload.find({
      collection: 'time-clock',
      where: whereClause,
      sort: '-createdAt',
      limit: 100,
    })

    return NextResponse.json({
      success: true,
      entries: entries.docs,
      total: entries.totalDocs,
    })
  } catch (error) {
    console.error('Clock entries error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
