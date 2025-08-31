import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getPayload } from 'payload'
import { authOptions } from '@/lib/auth'
import { validateSearchParams } from '@/lib/validation-utils'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Check if user is admin or has customer access
    if (session.user.role !== 'admin' && session.user.role !== 'employee') {
      return createErrorResponse('Insufficient permissions', 403)
    }

    const payload = await getPayload()

    // Parse search parameters
    const url = new URL(request.url)
    const searchParams = new URLSearchParams(url.search)
    const searchQuery = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const loyaltyTier = searchParams.get('loyaltyTier')
    const sort = searchParams.get('sort') || 'createdAt'

    // Build query filters
    const where: any = {}

    if (searchQuery) {
      where.or = [
        { firstName: { like: searchQuery } },
        { lastName: { like: searchQuery } },
        { email: { like: searchQuery } },
        { phone: { like: searchQuery } },
        { fullName: { like: searchQuery } }
      ]
    }

    if (status) {
      where.isActive = status === 'active'
    }

    if (loyaltyTier && loyaltyTier !== 'all') {
      where.loyaltyTier = { equals: loyaltyTier }
    }

    // Fetch customers with pagination
    const customers = await payload.find({
      collection: 'customers',
      where,
      page,
      limit,
      sort,
      depth: 2, // Include relationships
    })

    return createSuccessResponse({
      customers: customers.docs,
      totalDocs: customers.totalDocs,
      totalPages: customers.totalPages,
      page: customers.page,
      hasNextPage: customers.hasNextPage,
      hasPrevPage: customers.hasPrevPage,
    })

  } catch (error) {
    console.error('Error fetching customers:', error)
    return createErrorResponse('Failed to fetch customers', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return createErrorResponse('Insufficient permissions', 403)
    }

    const payload = await getPayload()
    const body = await request.json()

    // Validate customer data
    const validation = validateSearchParams(body, {
      firstName: 'string',
      lastName: 'string',
      email: 'string',
    })

    if (!validation.isValid) {
      return createErrorResponse(`Validation error: ${validation.errors.join(', ')}`, 400)
    }

    // Create customer
    const customer = await payload.create({
      collection: 'customers',
      data: {
        ...body,
        createdBy: session.user.id,
      },
      depth: 2,
    })

    return createSuccessResponse({
      customer,
      message: 'Customer created successfully'
    }, 201)

  } catch (error) {
    console.error('Error creating customer:', error)
    return createErrorResponse('Failed to create customer', 500)
  }
}
