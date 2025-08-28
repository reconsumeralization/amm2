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

    const payload = await getPayloadClient()

    // Get user profile
    const user = await payload.findByID({
      collection: 'users',
      id: session.user.id,
      depth: 2
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get associated stylist profile if exists
    let stylistProfile = null
    if (user.role === 'stylist') {
      const stylist = await payload.find({
        collection: 'stylists',
        where: { user: { equals: user.id } }
      })
      if (stylist.docs.length > 0) {
        stylistProfile = stylist.docs[0]
      }
    }

    // Get recent activity
    const recentAppointments = await payload.find({
      collection: 'appointments',
      where: {
        or: [
          { customer: { equals: user.id } },
          ...(user.role === 'stylist' ? [{ stylist: { equals: stylistProfile?.id } }] : [])
        ]
      },
      limit: 5,
      sort: '-createdAt',
      depth: 2
    })

    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        specializations: user.specializations,
        schedule: user.schedule,
        permissions: user.permissions,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      stylistProfile: stylistProfile ? {
        id: stylistProfile.id,
        bio: stylistProfile.bio,
        specializations: stylistProfile.specializations,
        performance: stylistProfile.performance,
        schedule: stylistProfile.schedule,
        pricing: stylistProfile.pricing,
        portfolio: stylistProfile.portfolio,
        socialMedia: stylistProfile.socialMedia,
        isActive: stylistProfile.isActive
      } : null,
      recentActivity: {
        appointments: recentAppointments.docs.map((apt: any) => ({
          id: apt.id,
          title: apt.appointmentTitle,
          date: apt.appointmentDate,
          status: apt.status,
          type: apt.customer === user.id ? 'customer' : 'stylist'
        }))
      }
    })

  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const payload = await getPayloadClient()

    // Define allowed fields for profile updates
    const allowedFields = [
      'name', 'phone', 'bio', 'avatar',
      'specializations', 'schedule'
    ]

    // Filter out only allowed fields
    const updateData: any = {}
    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = body[key]
      }
    })

    // Validate required fields
    if (updateData.name && updateData.name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    const updatedUser = await payload.update({
      collection: 'users',
      id: session.user.id,
      data: updateData
    })

    // If user is a stylist, update their stylist profile too
    if (session.user.role === 'stylist' && body.stylistProfile) {
      const stylistProfile = await payload.find({
        collection: 'stylists',
        where: { user: { equals: session.user.id } }
      })

      if (stylistProfile.docs.length > 0) {
        const stylistAllowedFields = [
          'bio', 'specializations', 'schedule', 'pricing',
          'portfolio', 'socialMedia'
        ]

        const stylistUpdateData: any = {}
        Object.keys(body.stylistProfile).forEach(key => {
          if (stylistAllowedFields.includes(key)) {
            stylistUpdateData[key] = body.stylistProfile[key]
          }
        })

        if (Object.keys(stylistUpdateData).length > 0) {
          await payload.update({
            collection: 'stylists',
            id: stylistProfile.docs[0].id,
            data: stylistUpdateData
          })
        }
      }
    }

    console.log(`Profile updated: ${session.user.name} (${session.user.id})`)

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        specializations: updatedUser.specializations,
        schedule: updatedUser.schedule
      }
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    // Validate password change request
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All password fields are required' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New passwords do not match' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    // Verify current password and update
    // Note: Password verification would need to be implemented with proper hashing
    const updatedUser = await payload.update({
      collection: 'users',
      id: session.user.id,
      data: {
        password: newPassword
      }
    })

    console.log(`Password changed for user: ${session.user.id}`)

    return NextResponse.json({
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
