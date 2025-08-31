import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getPayload } from 'payload'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // Check if user is admin or manager
    if (session.user.role !== 'admin' && session.user.role !== 'manager' && session.user.role !== 'owner') {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN')
    }

    const payload = await getPayload({ config: (await import('../../../payload.config')).default })

    // Get URL parameters for date range filtering
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    // Build date filter for analytics
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.createdAt = { greater_than_equal: new Date(startDate) }
    }
    if (endDate) {
      if (dateFilter.createdAt) {
        dateFilter.createdAt.less_than_equal = new Date(endDate)
      } else {
        dateFilter.createdAt = { less_than_equal: new Date(endDate) }
      }
    }

    // Get stylist statistics
    const [totalStylists, activeStylists, featuredStylists, stylistPerformance] = await Promise.all([
      // Total stylists count
      payload.count({
        collection: 'stylists',
      }),

      // Active stylists count
      payload.count({
        collection: 'stylists',
        where: { isActive: { equals: true } }
      }),

      // Featured stylists count
      payload.count({
        collection: 'stylists',
        where: { featured: { equals: true } }
      }),

      // Get all stylists with performance data
      payload.find({
        collection: 'stylists',
        where: { isActive: { equals: true } },
        limit: 1000, // Get all for statistics
      })
    ])

    // Calculate performance metrics
    let totalAppointments = 0
    let totalReviews = 0
    let averageRating = 0
    let experienceDistribution = {
      '0-2': 0,
      '3-5': 0,
      '6-10': 0,
      '10+': 0
    }

    stylistPerformance.docs.forEach((stylist: any) => {
      // Aggregate appointments
      if (stylist.performance?.totalAppointments) {
        totalAppointments += stylist.performance.totalAppointments
      }

      // Aggregate reviews
      if (stylist.performance?.reviewCount) {
        totalReviews += stylist.performance.reviewCount
      }

      // Aggregate ratings
      if (stylist.performance?.rating) {
        averageRating += stylist.performance.rating
      }

      // Experience distribution
      const years = stylist.experience?.yearsExperience || 0
      if (years <= 2) experienceDistribution['0-2']++
      else if (years <= 5) experienceDistribution['3-5']++
      else if (years <= 10) experienceDistribution['6-10']++
      else experienceDistribution['10+']++
    })

    // Calculate average rating
    const finalAverageRating = stylistPerformance.docs.length > 0
      ? (averageRating / stylistPerformance.docs.length).toFixed(2)
      : 0

    // Get top performing stylists by rating
    const topRatedStylists = stylistPerformance.docs
      .filter((stylist: any) => stylist.performance?.rating)
      .sort((a: any, b: any) => (b.performance?.rating || 0) - (a.performance?.rating || 0))
      .slice(0, 5)
      .map((stylist: any) => ({
        id: stylist.id,
        name: stylist.name,
        rating: stylist.performance?.rating || 0,
        totalAppointments: stylist.performance?.totalAppointments || 0,
        reviewCount: stylist.performance?.reviewCount || 0,
      }))

    // Get top stylists by appointments
    const topBookedStylists = stylistPerformance.docs
      .filter((stylist: any) => stylist.performance?.totalAppointments)
      .sort((a: any, b: any) => (b.performance?.totalAppointments || 0) - (a.performance?.totalAppointments || 0))
      .slice(0, 5)
      .map((stylist: any) => ({
        id: stylist.id,
        name: stylist.name,
        totalAppointments: stylist.performance?.totalAppointments || 0,
        rating: stylist.performance?.rating || 0,
      }))

    // Get specialization distribution
    const specializationStats: { [key: string]: number } = {}
    stylistPerformance.docs.forEach((stylist: any) => {
      if (stylist.specializations) {
        stylist.specializations.forEach((spec: any) => {
          const specName = typeof spec === 'string' ? spec : spec.name || 'Other'
          specializationStats[specName] = (specializationStats[specName] || 0) + 1
        })
      }
    })

    // Calculate stylist utilization rate (simplified)
    const averageAppointmentsPerStylist = totalStylists.totalDocs > 0
      ? Math.round(totalAppointments / totalStylists.totalDocs)
      : 0

    const analytics = {
      overview: {
        totalStylists: totalStylists.totalDocs,
        activeStylists: activeStylists.totalDocs,
        featuredStylists: featuredStylists.totalDocs,
        inactiveStylists: totalStylists.totalDocs - activeStylists.totalDocs,
        totalAppointments,
        totalReviews,
        averageRating: typeof finalAverageRating === 'string' ? parseFloat(finalAverageRating) : finalAverageRating,
        averageAppointmentsPerStylist: averageAppointmentsPerStylist,
      },
      performance: {
        topRatedStylists,
        topBookedStylists,
        experienceDistribution,
        specializationStats,
      },
      dateRange: {
        startDate,
        endDate
      }
    }

    return createSuccessResponse(analytics)

  } catch (error) {
    console.error('Error fetching stylist analytics:', error)
    return createErrorResponse('Failed to fetch stylist analytics', 'INTERNAL_SERVER_ERROR')
  }
}
