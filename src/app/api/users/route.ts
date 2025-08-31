import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '../../../payload'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { sendUserNotification, sendAdminNotification } from '@/lib/notificationService'
import { validateRequestBody, validateSearchParams, createValidationErrorResponse, createServerErrorResponse } from '@/lib/validation-utils'
import { createUserSchema } from '@/lib/validations'

interface UserFilters {
  role?: string
  isActive?: boolean
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

    // Mock data for development when Payload isn't available
    const mockUsers = [
      {
        id: '1',
        email: 'admin@modernmen.com',
        name: 'Master Administrator',
        role: 'super-admin',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        email: 'manager@modernmen.com',
        name: 'Store Manager',
        role: 'manager',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        email: 'stylist1@modernmen.com',
        name: 'John Smith',
        role: 'stylist',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ]

    const { searchParams } = new URL(request.url)
    const filters: UserFilters = {
      role: searchParams.get('role') || undefined,
      isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
      rch: searchParams.get('rch') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      page: parseInt(searchParams.get('page') || '1')
    }

    // Check permissions based on user role
    const canViewAllUsers = (session as any)?.user?.role === 'admin' || (session as any)?.user?.role === 'manager'

    // Filter mock users based on request parameters
    let filteredUsers = mockUsers

    if (!canViewAllUsers) {
      // Regular users can only see themselves
      filteredUsers = filteredUsers.filter(user => user.id === (session as any)?.user?.id)
    }

    if (filters.role) {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role)
    }

    if (filters.isActive !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.isActive === filters.isActive)
    }

    if (filters.rch) {
      const search = filters.rch.toLowerCase()
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      )
    }

    // Simple pagination
    const startIndex = ((filters.page || 1) - 1) * (filters.limit || 20)
    const endIndex = startIndex + (filters.limit || 20)
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    return NextResponse.json({
      users: paginatedUsers,
      total: filteredUsers.length,
      page: filters.page || 1,
      totalPages: Math.ceil(filteredUsers.length / (filters.limit || 20)),
      hasNext: endIndex < filteredUsers.length,
      hasPrev: (filters.page || 1) > 1
    })

  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || ((session as any)?.user?.role !== 'admin' && (session as any)?.user?.role !== 'manager')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate request body
    const validation = await validateRequestBody(request, createUserSchema)
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!)
    }

    const { firstName, lastName, email, role, phone, password } = validation.data!
    const name = `${firstName} ${lastName}` // Combine first and last name

    const payload = await getPayloadClient()

    // Check if user already exists
    const existingUser = await payload.find({
      collection: 'users',
      where: { email: { equals: email } }
    })

    if (existingUser.docs.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = await payload.create({
      collection: 'users',
      data: {
        name,
        email,
        role,
        phone: phone || '',
        isActive: true,
        password: password || Math.random().toString(36).slice(-12) // Generate temp password
      }
    })

    // Send welcome email (implement email service)
    console.log(`New user created: ${name} (${email})`)

    // Send notifications
    await sendAdminNotification({
      type: 'user_created',
      title: 'New User Created',
      message: `User ${name} (${email}) has been created with role: ${role}`,
      data: {
        userId: newUser.id,
        userEmail: email,
        userRole: role
      },
      priority: 'medium'
    })

    // Send welcome notification to the new user
    await sendUserNotification({
      userId: newUser.id,
      type: 'system_alert',
      title: 'Welcome to Modern Men!',
      message: `Your account has been created successfully. Welcome to the team!`,
      data: {
        userRole: role,
        setupRequired: role === 'stylist'
      },
      priority: 'low'
    })

    return NextResponse.json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      },
      message: 'User created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
