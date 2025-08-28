import { NextRequest, NextResponse } from 'next/server'
import getPayloadClient from '../../../payload'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendAdminNotification, sendUserNotification } from '@/lib/notificationService'
import { validateRequestBody, createValidationErrorResponse } from '@/lib/validation-utils'
import { createEmployeeSchema } from '@/lib/validations'

interface EmployeeFilters {
  isActive?: boolean
  specialization?: string
  rating?: number
  rch?: string
  limit?: number
  page?: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { rchParams } = new URL(request.url)
    const filters: EmployeeFilters = {
      isActive: rchParams.get('isActive') === 'true' ? true : rchParams.get('isActive') === 'false' ? false : undefined,
      specialization: rchParams.get('specialization') || undefined,
      rating: rchParams.get('rating') ? parseFloat(rchParams.get('rating')!) : undefined,
      rch: rchParams.get('rch') || undefined,
      limit: parseInt(rchParams.get('limit') || '20'),
      page: parseInt(rchParams.get('page') || '1')
    }

    const payload = await getPayloadClient()

    // Build where clause for stylists collection
    const where: any = {
      and: []
    }

    if (filters.isActive !== undefined) {
      where.and.push({ isActive: { equals: filters.isActive } })
    }

    if (filters.rating) {
      where.and.push({
        'performance.rating': {
          greater_than_equal: filters.rating
        }
      })
    }

    if (filters.rch) {
      where.and.push({
        or: [
          { name: { like: `%${filters.rch}%` } },
          { 'user.email': { like: `%${filters.rch}%` } },
          { bio: { like: `%${filters.rch}%` } }
        ]
      })
    }

    if (where.and.length === 0) {
      delete where.and
    }

    const employees = await payload.find({
      collection: 'stylists',
      where,
      limit: filters.limit,
      page: filters.page,
      sort: '-displayOrder',
      depth: 3
    })

    // Enhance with additional data
    const enhancedEmployees = await Promise.all(
      employees.docs.map(async (employee: any) => {
        // Get recent appointments count
        const recentAppointments = await payload.find({
          collection: 'appointments',
          where: {
            stylist: { equals: employee.id },
            appointmentDate: {
              greater_than_equal: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          },
          limit: 0 // Just count
        })

        // Get user info if linked
        let userInfo = null
        if (employee.user) {
          userInfo = await payload.findByID({
            collection: 'users',
            id: employee.user
          })
        }

        return {
          ...employee,
          recentAppointmentsCount: recentAppointments.totalDocs,
          userInfo: userInfo ? {
            email: userInfo.email,
            phone: userInfo.phone,
            role: userInfo.role,
            isActive: userInfo.isActive
          } : null
        }
      })
    )

    return NextResponse.json({
      employees: enhancedEmployees,
      total: employees.totalDocs,
      page: employees.page,
      totalPages: employees.totalPages,
      hasNext: employees.hasNextPage,
      hasPrev: employees.hasPrevPage
    })

  } catch (error) {
    console.error('Employees API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'manager')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get original request body for legacy fields
    const originalBody = await request.json()

    // Validate request body (clone request for validation)
    const validationRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(originalBody)
    })

    const validation = await validateRequestBody(validationRequest, createEmployeeSchema)
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!)
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      bio,
      specializations,
      hourlyRate,
      profileImage,
      experience,
      certifications,
      availability
    } = validation.data!

    // Extract legacy fields from original body
    const schedule = originalBody.schedule
    const pricing = originalBody.pricing

    const name = `${firstName} ${lastName}` // Combine first and last name

    const payload = await getPayloadClient()

    // Create or find user first
    let user = await payload.find({
      collection: 'users',
      where: { email: { equals: email } }
    }).then((result: any) => result.docs[0])

    if (!user) {
      // Create user with stylist role
      user = await payload.create({
        collection: 'users',
        data: {
          name,
          email,
          role: 'stylist',
          phone: phone || '',
          isActive: true,
          password: Math.random().toString(36).slice(-12) // Generate temp password
        }
      })
    }

    // Create stylist profile
    const stylistData: any = {
      user: user.id,
      name,
      bio: bio || '',
      isActive: true,
      featured: false,
      displayOrder: 0,
      performance: {
        rating: 0,
        reviewCount: 0,
        totalAppointments: 0,
        onTimeRate: 100,
        averageServiceTime: 30
      }
    }

    if (specializations) {
      stylistData.specializations = specializations
    }

    if (schedule) {
      stylistData.schedule = schedule
    }

    if (pricing) {
      stylistData.pricing = pricing
    }

    if (profileImage) {
      stylistData.profileImage = profileImage
    }

    const newStylist = await payload.create({
      collection: 'stylists',
      data: stylistData
    })

    console.log(`New stylist created: ${name} (${email})`)

    // Send notifications
    await sendAdminNotification({
      type: 'employee_created',
      title: 'New Employee Created',
      message: `Stylist ${name} has been added to the team`,
      data: {
        employeeId: newStylist.id,
        employeeName: name,
        employeeEmail: email
      },
      priority: 'medium'
    })

    // Send welcome notification to the new employee
    await sendUserNotification({
      userId: user.id,
      type: 'system_alert',
      title: 'Welcome to the Team!',
      message: `Your stylist profile has been created. Please complete your portfolio and set your availability.`,
      data: {
        profileSetupRequired: true,
        portfolioSetup: true,
        scheduleSetup: true
      },
      priority: 'high'
    })

    return NextResponse.json({
      stylist: newStylist,
      message: 'Stylist created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create stylist error:', error)
    return NextResponse.json(
      { error: 'Failed to create stylist' },
      { status: 500 }
    )
  }
}
