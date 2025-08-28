import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '../../../payload'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const payload = await getPayloadClient()

    // Build where clause
    const where: any = {
      and: []
    }

    if (session.user.role !== 'admin') {
      where.and.push({
        or: [
          { user: { equals: session.user.id } },
          { broadcast: { equals: true } }
        ]
      })
    }

    if (unreadOnly) {
      where.and.push({ read: { equals: false } })
    }

    if (where.and.length === 0) {
      delete where.and
    }

    const notifications = await payload.find({
      collection: 'notifications',
      where,
      limit,
      page,
      sort: '-createdAt'
    })

    return NextResponse.json({
      notifications: notifications.docs,
      total: notifications.totalDocs,
      page: notifications.page,
      totalPages: notifications.totalPages,
      hasNext: notifications.hasNextPage,
      hasPrev: notifications.hasPrevPage,
      unreadCount: notifications.docs.filter((n: any) => !n.read).length
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, notificationIds } = body

    const payload = await getPayloadClient()

    if (action === 'markAsRead' && notificationIds) {
      // Mark specific notifications as read
      for (const id of notificationIds) {
        await payload.update({
          collection: 'notifications',
          id,
          data: { read: true, readAt: new Date().toISOString() }
        })
      }

      return NextResponse.json({
        message: 'Notifications marked as read'
      })
    }

    if (action === 'markAllAsRead') {
      // Mark all user's notifications as read
      const where: any = {
        and: [
          { read: { equals: false } },
          {
            or: [
              { user: { equals: session.user.id } },
              { broadcast: { equals: true } }
            ]
          }
        ]
      }

      await payload.updateMany({
        collection: 'notifications',
        where,
        data: { read: true, readAt: new Date().toISOString() }
      })

      return NextResponse.json({
        message: 'All notifications marked as read'
      })
    }

    if (action === 'delete' && notificationIds) {
      // Delete specific notifications (only user's own)
      for (const id of notificationIds) {
        const notification = await payload.findByID({
          collection: 'notifications',
          id
        })

        if (notification && (
          notification.user?.id === session.user.id ||
          notification.broadcast ||
          session.user.role === 'admin'
        )) {
          await payload.delete({
            collection: 'notifications',
            id
          })
        }
      }

      return NextResponse.json({
        message: 'Notifications deleted'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Manage notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to manage notifications' },
      { status: 500 }
    )
  }
}
