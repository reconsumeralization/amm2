import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/payload'
import config from '@/payload.config'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()
    const { id } = await params

    const conversation = await payload.findByID({
      collection: 'chat-conversations',
      id,
    })

    if (!conversation) {
      return createErrorResponse('Conversation not found', 'NOT_FOUND', 404)
    }

    return createSuccessResponse(conversation, 'Conversation retrieved successfully')
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return createErrorResponse('Failed to fetch conversation', 'DATABASE_ERROR', 500)
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

    // Check if conversation exists
    const existingConversation = await payload.findByID({
      collection: 'chat-conversations',
      id,
    })

    if (!existingConversation) {
      return createErrorResponse('Conversation not found', 'NOT_FOUND', 404)
    }

    // Update conversation
    const updatedConversation = await payload.update({
      collection: 'chat-conversations',
      id,
      data: {
        ...body,
        updatedBy: body.userId, // Set from authenticated user
      },
    })

    return createSuccessResponse(updatedConversation, 'Conversation updated successfully')
  } catch (error) {
    console.error('Error updating conversation:', error)
    return createErrorResponse('Failed to update conversation', 'DATABASE_ERROR', 500)
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

    // Check if conversation exists
    const existingConversation = await payload.findByID({
      collection: 'chat-conversations',
      id,
    })

    if (!existingConversation) {
      return createErrorResponse('Conversation not found', 'NOT_FOUND', 404)
    }

    // Delete conversation and all associated messages
    await payload.delete({
      collection: 'chat-messages',
      where: { conversationId: { equals: existingConversation.conversationId } },
    })

    await payload.delete({
      collection: 'chat-conversations',
      id,
    })

    return createSuccessResponse(null, 'Conversation and messages deleted successfully')
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return createErrorResponse('Failed to delete conversation', 'DATABASE_ERROR', 500)
  }
}
