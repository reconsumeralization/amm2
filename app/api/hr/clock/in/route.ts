import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import payload from '@/lib/payload'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { location } = body

    // Get current user from Supabase auth
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

    // Check if already clocked in
    const today = new Date().toISOString().split('T')[0]
    const existingEntries = await payload.find({
      collection: 'time-clock',
      where: {
        employee: { equals: employee.id },
        date: { equals: today },
        status: { equals: 'active' }
      }
    })

    if (existingEntries.docs.length > 0) {
      return NextResponse.json(
        { error: 'Already clocked in for today' },
        { status: 400 }
      )
    }

    const now = new Date()

    // Create clock entry
    const clockEntry = await payload.create({
      collection: 'time-clock',
      data: {
        employee: employee.id,
        date: today,
        clockInTime: now.toISOString(),
        status: 'active',
        location: location || 'Main Salon',
      }
    })

    // Update employee status
    await payload.update({
      collection: 'employees',
      id: employee.id,
      data: {
        isClockedIn: true,
        lastClockInTime: now.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      clockEntry,
      clockInTime: now.toISOString(),
      location: location || 'Main Salon',
    })
  } catch (error) {
    console.error('Clock in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
