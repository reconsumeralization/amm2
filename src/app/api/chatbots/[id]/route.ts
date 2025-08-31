import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/payload'
import config from '@/payload.config'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-error-handler'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()
    const { id } = await params

    const chatbot = await payload.findByID({
      collection: 'chatbots',
      id,
    })

    if (!chatbot) {
      return createErrorResponse('Chatbot not found', 'NOT_FOUND', 404)
    }

    return createSuccessResponse(chatbot, 'Chatbot retrieved successfully')
  } catch (error) {
    console.error('Error fetching chatbot:', error)
    return createErrorResponse('Failed to fetch chatbot', 'DATABASE_ERROR', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()
    const { id } = await params
    const body = await request.json()

    // Check if chatbot exists
    const existingChatbot = await payload.findByID({
      collection: 'chatbots',
      id,
    })

    if (!existingChatbot) {
      return createErrorResponse('Chatbot not found', 'NOT_FOUND', 404)
    }

    // Update chatbot
    const updatedChatbot = await payload.update({
      collection: 'chatbots',
      id,
      data: {
        ...body,
        updatedBy: body.userId, // Set from authenticated user
      },
    })

    return createSuccessResponse(updatedChatbot, 'Chatbot updated successfully')
  } catch (error) {
    console.error('Error updating chatbot:', error)
    return createErrorResponse('Failed to update chatbot', 'DATABASE_ERROR', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()
    const { id } = await params

    // Check if chatbot exists
    const existingChatbot = await payload.findByID({
      collection: 'chatbots',
      id,
    })

    if (!existingChatbot) {
      return createErrorResponse('Chatbot not found', 'NOT_FOUND', 404)
    }

    // Delete chatbot
    await payload.delete({
      collection: 'chatbots',
      id,
    })

    return createSuccessResponse(null, 'Chatbot deleted successfully')
  } catch (error) {
    console.error('Error deleting chatbot:', error)
    return createErrorResponse('Failed to delete chatbot', 'DATABASE_ERROR', 500)
  }
}
