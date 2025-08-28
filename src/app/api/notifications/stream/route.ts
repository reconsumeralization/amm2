import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPayloadClient } from '../../../../payload'
import { notificationEmitter, activeConnections } from '@/lib/notificationEmitter'

interface Notification {
  id: string
  userId: string
  type: 'user_created' | 'user_updated' | 'employee_created' | 'appointment_booked' | 'system_alert'
  title: string
  message: string
  data?: any
  timestamp: string
  read: boolean
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const userId = session.user.id
    const { rchParams } = new URL(request.url)
    const includeHistory = rchParams.get('history') === 'true'

    // Set up Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection confirmation
        const encoder = new TextEncoder()
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'connection',
          message: 'Connected to notification stream'
        })}\n\n`))

        // If history requested, send recent notifications
        if (includeHistory) {
          sendRecentNotifications(controller, userId, encoder)
        }

        // Listen for new notifications
        const notificationHandler = (notification: Notification) => {
          if (notification.userId === userId || notification.userId === 'all') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              ...notification
            })}\n\n`))
          }
        }

        notificationEmitter.on('notification', notificationHandler)

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          notificationEmitter.off('notification', notificationHandler)
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    })

  } catch (error) {
    console.error('Notification stream error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

async function sendRecentNotifications(
  controller: ReadableStreamDefaultController,
  userId: string,
  encoder: TextEncoder
) {
  try {
    const payload = await getPayloadClient()

    // Get recent notifications (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // In a real implementation, this would query a notifications collection
    // For now, we'll send a sample notification
    const sampleNotification = {
      id: 'welcome-' + Date.now(),
      userId,
      type: 'system_alert',
      title: 'Welcome to Modern Men Admin',
      message: 'You are now connected to the real-time notification system.',
      timestamp: new Date().toISOString(),
      read: false
    }
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(sampleNotification)}\n\n`))

  } catch (error) {
    console.error('Error sending recent notifications:', error)
  }
}

