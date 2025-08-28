import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '../../../../../payload'
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
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const stylistId = id

    const payload = await getPayloadClient()

    // Verify employee exists and user has access
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

    // Check permissions
    const canViewAnalytics = session.user?.role === 'admin' ||
                           session.user?.role === 'manager' ||
                           (session.user?.role === 'stylist' && stylist.user === session.user?.id)

    if (!canViewAnalytics) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const days = parseInt(period)
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Get appointment analytics
    const appointments = await payload.find({
      collection: 'appointments',
      where: {
        stylist: { equals: stylistId },
        appointmentDate: { greater_than_equal: startDate.toISOString() }
      },
      depth: 2,
      sort: '-appointmentDate'
    })

    // Get commission analytics
    const commissions = await payload.find({
      collection: 'commissions',
      where: {
        stylist: { equals: stylistId },
        createdAt: { greater_than_equal: startDate.toISOString() }
      },
      depth: 2
    })

    // Calculate metrics
    const totalAppointments = appointments.totalDocs
    const completedAppointments = appointments.docs.filter((apt: any) =>
      apt.status === 'completed'
    ).length
    const cancelledAppointments = appointments.docs.filter((apt: any) =>
      apt.status === 'cancelled'
    ).length

    const totalEarnings = commissions.docs.reduce((sum: number, comm: any) =>
      sum + (comm.finalCalculation?.total || 0), 0
    )

    const averageServiceTime = appointments.docs.length > 0
      ? appointments.docs.reduce((sum: number, apt: any) => {
          if (apt.duration) return sum + apt.duration
          return sum + 30 // default 30 minutes
        }, 0) / appointments.docs.length
      : 0

    // Daily breakdown
    const dailyStats = calculateDailyStats(appointments.docs, days)

    // Service breakdown
    const serviceStats = calculateServiceStats(appointments.docs)

    // Customer satisfaction (if reviews available)
    const customerStats = await calculateCustomerStats(payload, stylistId, startDate)

    return NextResponse.json({
      period: `${days} days`,
      overview: {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(1) : '0',
        totalEarnings: totalEarnings.toFixed(2),
        averageServiceTime: Math.round(averageServiceTime),
        averageDailyAppointments: (totalAppointments / days).toFixed(1)
      },
      dailyBreakdown: dailyStats,
      serviceBreakdown: serviceStats,
      customerSatisfaction: customerStats,
      trends: calculateTrends(dailyStats),
      recommendations: generateRecommendations({
        totalAppointments,
        completionRate: parseFloat((totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(1) : '0')),
        averageServiceTime,
        customerRating: customerStats.averageRating
      })
    })

  } catch (error) {
    console.error('Employee analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateDailyStats(appointments: any[], days: number) {
  const dailyStats: Record<string, {
    appointments: number
    earnings: number
    completed: number
  }> = {}

  // Initialize all days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateKey = date.toISOString().split('T')[0]
    dailyStats[dateKey] = { appointments: 0, earnings: 0, completed: 0 }
  }

  // Fill with actual data
  appointments.forEach((apt: any) => {
    const dateKey = apt.appointmentDate?.split('T')[0]
    if (dateKey && dailyStats[dateKey]) {
      dailyStats[dateKey].appointments++
      if (apt.status === 'completed') {
        dailyStats[dateKey].completed++
      }
      // Add earnings calculation here if available
    }
  })

  return Object.entries(dailyStats).map(([date, stats]) => ({
    date,
    ...stats
  }))
}

function calculateServiceStats(appointments: any[]) {
  const serviceCounts: Record<string, number> = {}

  appointments.forEach((apt: any) => {
    const serviceName = apt.service?.name || 'General Service'
    serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1
  })

  return Object.entries(serviceCounts).map(([service, count]) => ({
    service,
    count,
    percentage: ((count / appointments.length) * 100).toFixed(1)
  }))
}

async function calculateCustomerStats(payload: any, stylistId: string, startDate: Date) {
  // This would integrate with a reviews system
  // For now, return mock data
  return {
    averageRating: 4.7,
    totalReviews: 23,
    ratingBreakdown: {
      5: 18,
      4: 4,
      3: 1,
      2: 0,
      1: 0
    },
    commonCompliments: [
      'Professional and skilled',
      'Great communication',
      'Excellent results',
      'Friendly atmosphere'
    ]
  }
}

function calculateTrends(dailyStats: any[]) {
  if (dailyStats.length < 7) return { trend: 'stable', change: 0 }

  const recent = dailyStats.slice(-7)
  const previous = dailyStats.slice(-14, -7)

  const recentAvg = recent.reduce((sum, day) => sum + day.appointments, 0) / recent.length
  const previousAvg = previous.length > 0
    ? previous.reduce((sum, day) => sum + day.appointments, 0) / previous.length
    : recentAvg

  const change = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg * 100) : 0

  return {
    trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
    change: Math.round(change),
    recentAverage: recentAvg.toFixed(1),
    previousAverage: previousAvg.toFixed(1)
  }
}

function generateRecommendations(metrics: any) {
  const recommendations = []

  if (metrics.completionRate < 85) {
    recommendations.push({
      type: 'warning',
      title: 'Appointment Completion Rate',
      message: 'Consider implementing reminder systems to reduce no-shows.',
      action: 'Set up automated reminders'
    })
  }

  if (metrics.averageServiceTime > 60) {
    recommendations.push({
      type: 'info',
      title: 'Service Time Optimization',
      message: 'Longer service times may impact daily capacity.',
      action: 'Review workflow efficiency'
    })
  }

  if (metrics.customerRating < 4.5) {
    recommendations.push({
      type: 'warning',
      title: 'Customer Satisfaction',
      message: 'Focus on improving customer experience and service quality.',
      action: 'Review customer feedback'
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      title: 'Excellent Performance',
      message: 'All metrics are performing well. Keep up the great work!',
      action: 'Maintain current standards'
    })
  }

  return recommendations
}
