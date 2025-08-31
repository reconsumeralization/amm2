import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/payload'
import config from '@/payload.config'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()
    const { searchParams } = new URL(request.url)

    const chatbotId = searchParams.get('chatbotId')
    const conversationId = searchParams.get('conversationId')
    const senderId = searchParams.get('senderId')
    const limit = searchParams.get('limit') || '50'
    const page = searchParams.get('page') || '1'

    const where: any = {}
    if (chatbotId) where.chatbot = { equals: chatbotId }
    if (conversationId) where.conversationId = { equals: conversationId }
    if (senderId) where.sender = { equals: senderId }

    const messages = await payload.find({
      collection: 'chat-messages',
      where,
      limit: parseInt(limit),
      page: parseInt(page),
      sort: 'timestamp',
    })

    return createSuccessResponse(messages, 'Chat messages retrieved successfully')
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return createErrorResponse('Failed to fetch chat messages', 'DATABASE_ERROR', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient()
    const body = await request.json()

    // Validate required fields
    if (!body.content || !body.sender || !body.chatbot || !body.tenant) {
      return createErrorResponse(
        'Content, sender, chatbot, and tenant are required',
        'VALIDATION_ERROR',
        400
      )
    }

    // Create message
    const message = await payload.create({
      collection: 'chat-messages',
      data: {
        ...body,
        senderType: body.senderType || 'user',
        messageType: body.messageType || 'text',
        timestamp: new Date(),
        isRead: false,
        isDelivered: true,
        deliveryStatus: 'sent',
        createdBy: body.sender,
      },
    })

    // Update conversation if conversationId is provided
    if (body.conversationId) {
      const conversations = await payload.find({
        collection: 'chat-conversations',
        where: { conversationId: { equals: body.conversationId } },
        limit: 1,
      })
      const conversation = conversations.docs[0]

      if (conversation) {
        await payload.update({
          collection: 'chat-conversations',
          id: conversation.id,
          data: {
            lastMessageAt: new Date(),
            messageCount: (conversation.messageCount || 0) + 1,
            userMessageCount: body.senderType === 'user'
              ? (conversation.userMessageCount || 0) + 1
              : conversation.userMessageCount,
            botMessageCount: body.senderType === 'bot'
              ? (conversation.botMessageCount || 0) + 1
              : conversation.botMessageCount,
          },
        })
      }
    }

    return createSuccessResponse(message, 'Message created successfully', 201)
  } catch (error) {
    console.error('Error creating chat message:', error)
    return createErrorResponse('Failed to create chat message', 'DATABASE_ERROR', 500)
  }
}
