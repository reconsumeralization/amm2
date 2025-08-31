import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/payload'
import config from '@/payload.config'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-error-handler'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()
    const { searchParams } = new URL(request.url)

    const userId = searchParams.get('userId')
    const chatbotId = searchParams.get('chatbotId')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') || '20'
    const page = searchParams.get('page') || '1'

    const where: any = {}
    if (userId) where.user = { equals: userId }
    if (chatbotId) where.chatbot = { equals: chatbotId }
    if (status) where.status = { equals: status }

    const conversations = await payload.find({
              collection: 'chatbot-conversations',
      where,
      limit: parseInt(limit),
      page: parseInt(page),
      sort: '-lastMessageAt',
    })

    return createSuccessResponse(conversations, 'Conversations retrieved successfully')
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return createErrorResponse('Failed to fetch conversations', 'DATABASE_ERROR', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()
    const body = await request.json()

    // Validate required fields
    if (!body.user || !body.chatbot || !body.tenant) {
      return createErrorResponse(
        'User, chatbot, and tenant are required',
        'VALIDATION_ERROR',
        400
      )
    }

    // Generate unique conversation ID
    const conversationId = uuidv4()

    // Create conversation
    const conversation = await payload.create({
              collection: 'chatbot-conversations',
      data: {
        conversationId,
        user: body.user,
        chatbot: body.chatbot,
        tenant: body.tenant,
        status: 'active',
        startedAt: new Date(),
        lastMessageAt: new Date(),
        messageCount: 0,
        userMessageCount: 0,
        botMessageCount: 0,
        channel: body.channel || 'web_chat',
        priority: body.priority || 'medium',
        createdBy: body.user,
      },
    })

    return createSuccessResponse(conversation, 'Conversation created successfully', 201)
  } catch (error) {
    console.error('Error creating conversation:', error)
    return createErrorResponse('Failed to create conversation', 'DATABASE_ERROR', 500)
  }
}
