import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import payload from '@/lib/payload'

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

    // For now, allow all authenticated users to view employees
    // TODO: Add role-based access control based on user metadata

    // Get all employees
    const employeesResult = await payload.find({
      collection: 'employees',
      sort: 'fullName',
      limit: 1000,
    })

    // Get stats
    const employees = employeesResult.docs
    const totalEmployees = employees.length
    const activeEmployees = employees.filter((emp: any) => emp.isActive).length
    const clockedInToday = employees.filter((emp: any) => emp.isClockedIn).length

    // Calculate new hires this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const newHiresThisMonth = employees.filter((emp: any) => {
      const hireDate = new Date(emp.employment?.hireDate)
      return hireDate >= startOfMonth
    }).length

    const stats = {
      totalEmployees,
      activeEmployees,
      clockedInToday,
      newHiresThisMonth,
    }

    return NextResponse.json({
      success: true,
      employees,
      stats,
    })
  } catch (error) {
    console.error('Employees fetch error:', error)
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
      userId,
      employeeId,
      department,
      position,
      hireDate,
      hourlyRate,
      employmentType,
      workLocation,
      phone,
      email,
    } = body

    // Get current user from session
    const user = request.user // This would come from your auth middleware

    if (!user || !['admin', 'manager'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Verify user exists
    const userRecord = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if employee already exists for this user
    const existingEmployee = await payload.find({
      collection: 'employees',
      where: {
        user: { equals: userId }
      }
    })

    if (existingEmployee.docs.length > 0) {
      return NextResponse.json(
        { error: 'Employee record already exists for this user' },
        { status: 400 }
      )
    }

    // Create employee record
    const employee = await payload.create({
      collection: 'employees',
      data: {
        user: userId,
        employeeId,
        department,
        position,
        employment: {
          hireDate,
          employmentType: employmentType || 'full-time',
          workLocation: workLocation || 'main-salon',
        },
        compensation: {
          hourlyRate: Math.round(hourlyRate * 100), // Convert to cents
          compensationType: 'hourly',
        },
        contact: {
          phone,
          email: email || userRecord.email,
        },
        isActive: true,
        isClockedIn: false,
      },
    })

    return NextResponse.json({
      success: true,
      employee,
      message: 'Employee created successfully',
    })
  } catch (error) {
    console.error('Employee creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
