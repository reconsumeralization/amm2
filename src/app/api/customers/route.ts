import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import getPayload from '@/payload'
import { authOptions } from '@/lib/auth'
import { validateRequestBody } from '@/lib/validation-utils'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // Check if user is admin or has customer access
    if (session.user.role !== 'admin' && session.user.role !== 'employee') {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN', 403)
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
    return createErrorResponse('Failed to fetch customers', 'INTERNAL_SERVER_ERROR', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN', 403)
    }

    const payload = await getPayload()

    // Define customer creation schema
    const customerSchema = z.object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      email: z.string().email('Invalid email address'),
      phone: z.string().optional(),
      address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
      }).optional(),
    })

    // Validate customer data
    const validation = await validateRequestBody(request, customerSchema)

    if (!validation.success) {
      return createErrorResponse(`Validation error: ${validation.errors?.join(', ') || 'Unknown validation error'}`, 'VALIDATION_ERROR', 400)
    }

    // Create customer
    const customer = await payload.create({
      collection: 'customers',
      data: {
        ...validation.data,
        createdBy: session.user.id,
      },
      depth: 2,
    })

    return createSuccessResponse({
      customer,
      message: 'Customer created successfully'
    })

  } catch (error) {
    console.error('Error creating customer:', error)
    return createErrorResponse('Failed to create customer', 'INTERNAL_SERVER_ERROR', 500)
  }
}
