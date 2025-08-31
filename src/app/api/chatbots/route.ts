import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/payload'
import config from '@/payload.config'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()
    const { searchParams } = new URL(request.url)

    const tenantId = searchParams.get('tenantId')
    const isActive = searchParams.get('isActive')
    const limit = searchParams.get('limit') || '10'
    const page = searchParams.get('page') || '1'

    const where: any = {}
    if (tenantId) where.tenant = { equals: tenantId }
    if (isActive !== null) where.isActive = { equals: isActive === 'true' }

    const chatbots = await payload.find({
      collection: 'chatbots',
      where,
      limit: parseInt(limit),
      page: parseInt(page),
      sort: '-createdAt',
    })

    return createSuccessResponse(chatbots, 'Chatbots retrieved successfully')
  } catch (error) {
    console.error('Error fetching chatbots:', error)
    return createErrorResponse('Failed to fetch chatbots', 'DATABASE_ERROR', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.tenant) {
      return createErrorResponse('Name and tenant are required', 'VALIDATION_ERROR', 400)
    }

    // Check if user has permission to create chatbots for this tenant
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: body.tenant,
    })

    if (!tenant) {
      return createErrorResponse('Tenant not found', 'NOT_FOUND', 404)
    }

    const chatbot = await payload.create({
      collection: 'chatbots',
      data: {
        ...body,
        createdBy: body.userId, // Set from authenticated user
      },
    })

    return createSuccessResponse(chatbot, 'Chatbot created successfully', 201)
  } catch (error) {
    console.error('Error creating chatbot:', error)
    return createErrorResponse('Failed to create chatbot', 'DATABASE_ERROR', 500)
  }
}
