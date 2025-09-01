import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import payload from '@/lib/payload'

interface ClockEntry {
  id: string
  employee: string
  date: string
  clockInTime?: string
  clockOutTime?: string
  totalHours?: number
  status: 'active' | 'completed'
  location?: string
  createdAt: string
  updatedAt: string
}

export async function GET(request: NextRequest) {
  try {
    // Get current user from Supabase session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // No-op for API routes
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find employee record for this user
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

    const employee = employees.docs[0]

    // Check if employee is currently clocked in
    const today = new Date().toISOString().split('T')[0]

    // Find today's incomplete clock entries
    const todaysEntries = await payload.find({
      collection: 'time-clock',
      where: {
        employee: { equals: employee.id },
        date: { equals: today },
        status: { equals: 'active' }
      }
    })

    const isClockedIn = todaysEntries.docs.length > 0
    const currentEntry = todaysEntries.docs[0]

    // Calculate today's total hours
    const allTodaysEntries = await payload.find({
      collection: 'time-clock',
      where: {
        employee: { equals: employee.id },
        date: { equals: today },
        status: { equals: 'completed' }
      }
    })

    const todaysHours = allTodaysEntries.docs.reduce((total: number, entry: ClockEntry) => {
      return total + (entry.totalHours || 0)
    }, 0)

    const sessionData = {
      isClockedIn,
      todaysHours,
      clockInTime: currentEntry?.clockInTime,
      currentLocation: currentEntry?.location,
      employeeId: employee.id,
      employeeName: employee.fullName,
    }

    return NextResponse.json(sessionData)
  } catch (error) {
    console.error('Clock session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
