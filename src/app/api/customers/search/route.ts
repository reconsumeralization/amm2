import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getPayload } from 'payload'
import { authOptions } from '@/lib/auth'
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
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query || query.length < 2) {
      return createErrorResponse('Search query must be at least 2 characters', 400)
    }

    // Search customers with multiple fields
    const customers = await payload.find({
      collection: 'customers',
      where: {
        and: [
          { isActive: { equals: true } },
          {
            or: [
              { firstName: { like: query } },
              { lastName: { like: query } },
              { email: { like: query } },
              { phone: { like: query } },
              { fullName: { like: query } }
            ]
          }
        ]
      },
      limit,
      sort: 'fullName',
      depth: 1,
    })

    // Format search results
    const results = customers.docs.map((customer: any) => ({
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      loyaltyTier: customer.loyaltyTier || 'bronze',
      avatar: customer.avatar,
      type: 'customer'
    }))

    return createSuccessResponse({
      query,
      results,
      total: customers.totalDocs
    })

  } catch (error) {
    console.error('Error searching customers:', error)
    return createErrorResponse('Failed to search customers', 500)
  }
}
