import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import payload from '@/lib/payload'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { location } = body

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

    // Find active clock entry for today
    const today = new Date().toISOString().split('T')[0]
    const activeEntries = await payload.find({
      collection: 'time-clock',
      where: {
        employee: { equals: employee.id },
        date: { equals: today },
        status: { equals: 'active' }
      }
    })

    if (activeEntries.docs.length === 0) {
      return NextResponse.json(
        { error: 'No active clock-in found for today' },
        { status: 400 }
      )
    }

    const activeEntry = activeEntries.docs[0]
    const now = new Date()

    // Update the clock entry with clock out time
    const updatedEntry = await payload.update({
      collection: 'time-clock',
      id: activeEntry.id,
      data: {
        clockOutTime: now.toISOString(),
        status: 'completed',
      }
    })

    // Update employee status
    await payload.update({
      collection: 'employees',
      id: employee.id,
      data: {
        isClockedIn: false,
      }
    })

    return NextResponse.json({
      success: true,
      clockEntry: updatedEntry,
      clockOutTime: now.toISOString(),
      totalHours: updatedEntry.totalHours,
      location: location || 'Main Salon',
    })
  } catch (error) {
    console.error('Clock out error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
