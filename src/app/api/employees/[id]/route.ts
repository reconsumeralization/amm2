import { NextRequest, NextResponse } from 'next/server'
import getPayloadClient from '../../../../payload'
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
    const stylistId = id

    const stylist = await payload.findByID({
      collection: 'stylists',
      id: stylistId,
      depth: 3
    })

    if (!stylist) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Get additional analytics
    const analytics = await getEmployeeAnalytics(payload, stylistId)

    return NextResponse.json({
      employee: stylist,
      analytics
    })

  } catch (error) {
    console.error('Get employee error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
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

    const { id } = await params
    const payload = await getPayloadClient()
    const stylistId = id
    const body = await request.json()

    // Get current stylist to check ownership
    const currentStylist = await payload.findByID({
      collection: 'stylists',
      id: stylistId
    })

    if (!currentStylist) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Check authorization based on user role and ownership
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userRole = session.user?.role
    const isStylistOwner = userRole === 'stylist' && currentStylist.user === session.user.id
    const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager'

    if (!isStylistOwner && !isManagerOrAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // If stylist is updating their own profile, restrict certain fields
    if (isStylistOwner) {
      // Only allow updating bio, schedule, and pricing
      const allowedFields = ['bio', 'schedule', 'pricing']
      const updatedFields = Object.keys(body)
      const invalidFields = updatedFields.filter(field => !allowedFields.includes(field))
      
      if (invalidFields.length > 0) {
        return NextResponse.json(
          { 
            error: 'Forbidden',
            message: `Cannot update fields: ${invalidFields.join(', ')}`
          },
          { status: 403 }
        )
      }
    }

    const updatedStylist = await payload.update({
      collection: 'stylists',
      id: stylistId,
      data: body
    })

    console.log(`Employee updated: ${updatedStylist.name} (${stylistId}) by ${session.user.name}`)

    return NextResponse.json({
      employee: updatedStylist,
      message: 'Employee updated successfully'
    })

  } catch (error) {
    console.error('Update employee error:', error)
    return NextResponse.json(
      { error: 'Failed to update employee' },
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
    const stylistId = id

    // Get stylist info for logging
    const stylist = await payload.findByID({
      collection: 'stylists',
      id: stylistId
    })

    if (!stylist) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    await payload.delete({
      collection: 'stylists',
      id: stylistId
    })

    console.log(`Employee deleted: ${stylist.name} (${stylistId}) by ${session.user.name}`)

    return NextResponse.json({
      message: 'Employee deleted successfully'
    })

  } catch (error) {
    console.error('Delete employee error:', error)
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}

// Helper function to get employee analytics
async function getEmployeeAnalytics(payload: any, stylistId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Get appointment statistics
  const [totalAppointments, recentAppointments, weeklyAppointments] = await Promise.all([
    payload.find({
      collection: 'appointments',
      where: { stylist: { equals: stylistId } },
      limit: 0
    }),
    payload.find({
      collection: 'appointments',
      where: {
        stylist: { equals: stylistId },
        appointmentDate: { greater_than_equal: thirtyDaysAgo.toISOString() }
      },
      limit: 0
    }),
    payload.find({
      collection: 'appointments',
      where: {
        stylist: { equals: stylistId },
        appointmentDate: { greater_than_equal: sevenDaysAgo.toISOString() }
      },
      limit: 0
    })
  ])

  // Get commission data
  const commissions = await payload.find({
    collection: 'commissions',
    where: {
      stylist: { equals: stylistId },
      createdAt: { greater_than_equal: thirtyDaysAgo.toISOString() }
    },
    limit: 0
  })

  return {
    totalAppointments: totalAppointments.totalDocs,
    monthlyAppointments: recentAppointments.totalDocs,
    weeklyAppointments: weeklyAppointments.totalDocs,
    monthlyEarnings: commissions.docs.reduce((sum: number, comm: any) => sum + (comm.finalCalculation?.total || 0), 0),
    averageRating: 0, // Would need to calculate from reviews
    upcomingAppointments: 0 // Would need to calculate from future appointments
  }
}
