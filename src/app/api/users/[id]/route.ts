import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '../../../../payload'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const payload = await getPayloadClient()
    const userId = id

    // Check permissions
    const canViewUser = session.user?.role === 'admin' ||
                       session.user?.role === 'manager' ||
                       session.user?.id === userId

    if (!canViewUser) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const user = await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 2
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const payload = await getPayloadClient()
    const userId = id
    const body = await request.json()

    // Check permissions
    const canUpdateUser = session.user?.role === 'admin' ||
                         session.user?.role === 'manager' ||
                         session.user?.id === userId

    if (!canUpdateUser) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Prevent non-admins from changing certain fields
    if (session.user?.role !== 'admin' && session.user?.id === userId) {
      // Users can only update their own non-sensitive info
      delete body.role
      delete body.permissions
      delete body.isActive
    }

    const updatedUser = await payload.update({
      collection: 'users',
      id: userId,
      data: body
    })

    // Log the update
    console.log(`User updated: ${updatedUser.name} (${updatedUser.id}) by ${session.user?.name}`)

    return NextResponse.json({
      user: updatedUser,
      message: 'User updated successfully'
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const payload = await getPayloadClient()
    const userId = id

    // Prevent deleting own account
    if (session.user?.id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await payload.findByID({
      collection: 'users',
      id: userId
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    await payload.delete({
      collection: 'users',
      id: userId
    })

    // Log the deletion
    console.log(`User deleted: ${user.name} (${userId}) by ${session.user?.name}`)

    return NextResponse.json({
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
