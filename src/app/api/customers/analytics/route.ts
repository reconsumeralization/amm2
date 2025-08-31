import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getPayload } from 'payload'
import config from '../../../../payload.config'
import { authOptions } from '@/lib/auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // Check if user is admin or has analytics access
    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN', 403)
    }

    const payload = await getPayload({ config })

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

    // Get customer statistics
    const [totalCustomers, activeCustomers, loyaltyStats, newCustomers] = await Promise.all([
      // Total customers count
      payload.count({
        collection: 'customers',
      }),

      // Active customers count
      payload.count({
        collection: 'customers',
        where: { isActive: { equals: true } }
      }),

      // Loyalty program statistics
      payload.find({
        collection: 'customers',
        where: { isActive: { equals: true } },
        limit: 1000, // Get all for statistics
      }),

      // New customers in date range
      startDate ? payload.count({
        collection: 'customers',
        where: dateFilter
      }) : Promise.resolve({ totalDocs: 0 })
    ])

    // Calculate loyalty tier distribution
    const loyaltyTiers = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0
    }

    let totalPoints = 0
    let totalSpent = 0

    loyaltyStats.docs.forEach((customer: any) => {
      const tier = (customer.loyaltyTier || 'bronze') as keyof typeof loyaltyTiers
      loyaltyTiers[tier]++

      if (customer.loyaltyProgram?.points) {
        totalPoints += customer.loyaltyProgram.points
      }

      if (customer.loyaltyProgram?.totalSpent) {
        totalSpent += customer.loyaltyProgram.totalSpent
      }
    })

    // Get recent customer registrations (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentCustomers = await payload.count({
      collection: 'customers',
      where: {
        createdAt: { greater_than_equal: thirtyDaysAgo }
      }
    })

    // Calculate customer growth rate
    const growthRate = totalCustomers.totalDocs > 0
      ? ((recentCustomers.totalDocs / totalCustomers.totalDocs) * 100).toFixed(2)
      : 0

    // Get top spending customers
    const topSpenders = await payload.find({
      collection: 'customers',
      where: {
        isActive: { equals: true },
        'loyaltyProgram.totalSpent': { greater_than: 0 }
      },
      sort: '-loyaltyProgram.totalSpent',
      limit: 10,
    })

    const analytics = {
      overview: {
        totalCustomers: totalCustomers.totalDocs,
        activeCustomers: activeCustomers.totalDocs,
        inactiveCustomers: totalCustomers.totalDocs - activeCustomers.totalDocs,
        newCustomers: (newCustomers as any).totalDocs || 0,
        recentCustomers: recentCustomers.totalDocs,
        growthRate: `${growthRate}%`
      },
      loyalty: {
        tiers: loyaltyTiers,
        totalPoints,
        totalSpent,
        averageSpentPerCustomer: totalCustomers.totalDocs > 0
          ? (totalSpent / totalCustomers.totalDocs).toFixed(2)
          : 0
      },
      topSpenders: topSpenders.docs.map((customer: any) => ({
        id: customer.id,
        name: customer.fullName,
        email: customer.email,
        totalSpent: customer.loyaltyProgram?.totalSpent || 0,
        tier: customer.loyaltyProgram?.loyaltyTier || 'bronze',
        memberSince: customer.loyaltyProgram?.memberSince
      })),
      dateRange: {
        startDate,
        endDate
      }
    }

    return createSuccessResponse(analytics)

  } catch (error) {
    console.error('Error fetching customer analytics:', error)
    return createErrorResponse('Failed to fetch customer analytics', 'INTERNAL_SERVER_ERROR', 500)
  }
}
