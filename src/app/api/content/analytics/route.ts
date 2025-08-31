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

    // Check if user is admin or manager
    if (session.user.role !== 'admin' && session.user.role !== 'manager' && session.user.role !== 'owner') {
      return createErrorResponse('Insufficient permissions', 'FORBIDDEN', 403)
    }

    const payload = await getPayload({ config })

    // Get URL parameters for date range filtering
    const url = new URL(request.url)
    const tenantId = request.headers.get('X-Tenant-ID') || url.searchParams.get('tenantId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    if (!tenantId) {
      return createErrorResponse('Tenant ID is required', 'MISSING_REQUIRED_FIELD', 400)
    }

    // Build date filter for analytics
    const dateFilter: any = {
      tenant: { equals: tenantId }
    }

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

    // Get content statistics
    const [totalContent, publishedContent, draftContent, featuredContent, contentByType, contentByStatus] = await Promise.all([
      // Total content count
      payload.count({
        collection: 'content',
        where: { tenant: { equals: tenantId } }
      }),

      // Published content count
      payload.count({
        collection: 'content',
        where: {
          tenant: { equals: tenantId },
          status: { equals: 'published' }
        }
      }),

      // Draft content count
      payload.count({
        collection: 'content',
        where: {
          tenant: { equals: tenantId },
          status: { equals: 'draft' }
        }
      }),

      // Featured content count
      payload.count({
        collection: 'content',
        where: {
          tenant: { equals: tenantId },
          featured: { equals: true }
        }
      }),

      // Content by type
      payload.find({
        collection: 'content',
        where: { tenant: { equals: tenantId } },
        limit: 1000, // Get all for aggregation
      }),

      // Content by status
      payload.find({
        collection: 'content',
        where: { tenant: { equals: tenantId } },
        limit: 1000, // Get all for aggregation
      })
    ])

    // Calculate content type distribution
    const typeStats: { [key: string]: number } = {}
    contentByType.docs.forEach((content: any) => {
      const type = content.pageType || 'custom'
      typeStats[type] = (typeStats[type] || 0) + 1
    })

    // Calculate content status distribution
    const statusStats: { [key: string]: number } = {}
    contentByStatus.docs.forEach((content: any) => {
      const status = content.status || 'draft'
      statusStats[status] = (statusStats[status] || 0) + 1
    })

    // Get recent content (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentContent = await payload.count({
      collection: 'content',
      where: {
        tenant: { equals: tenantId },
        createdAt: { greater_than_equal: thirtyDaysAgo }
      }
    })

    // Get most viewed content
    const topViewedContent = await payload.find({
      collection: 'content',
      where: {
        tenant: { equals: tenantId },
        status: { equals: 'published' }
      },
      sort: '-analytics.viewCount',
      limit: 10,
    })

    // Get content creation trends (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const contentTrend = await payload.find({
      collection: 'content',
      where: {
        tenant: { equals: tenantId },
        createdAt: { greater_than_equal: sevenDaysAgo }
      },
      sort: 'createdAt',
    })

    // Group by date for trend analysis
    const trendData: { [key: string]: number } = {}
    contentTrend.docs.forEach((content: any) => {
      const date = content.createdAt.split('T')[0] // YYYY-MM-DD format
      trendData[date] = (trendData[date] || 0) + 1
    })

    // Calculate average metrics
    let totalViews = 0
    let totalUniqueVisitors = 0
    let totalTimeOnPage = 0
    let contentCount = 0

    contentByType.docs.forEach((content: any) => {
      if (content.analytics) {
        totalViews += content.analytics.viewCount || 0
        totalUniqueVisitors += content.analytics.uniqueVisitors || 0
        totalTimeOnPage += content.analytics.averageTimeOnPage || 0
        contentCount++
      }
    })

    const averageViewsPerContent = contentCount > 0 ? Math.round(totalViews / contentCount) : 0
    const averageTimeOnPage = contentCount > 0 ? Math.round(totalTimeOnPage / contentCount) : 0

    const analytics = {
      overview: {
        totalContent: totalContent.totalDocs,
        publishedContent: publishedContent.totalDocs,
        draftContent: draftContent.totalDocs,
        featuredContent: featuredContent.totalDocs,
        recentContent: recentContent.totalDocs,
        averageViewsPerContent,
        averageTimeOnPage,
        totalViews,
        totalUniqueVisitors,
      },
      distribution: {
        byType: typeStats,
        byStatus: statusStats,
      },
      performance: {
        topViewedContent: topViewedContent.docs.map((content: any) => ({
          id: content.id,
          title: content.title,
          slug: content.slug,
          views: content.analytics?.viewCount || 0,
          uniqueVisitors: content.analytics?.uniqueVisitors || 0,
          averageTime: content.analytics?.averageTimeOnPage || 0,
          publishedAt: content.publishedAt,
        })),
        contentTrend: Object.entries(trendData).map(([date, count]) => ({
          date,
          count,
        })).sort((a, b) => a.date.localeCompare(b.date)),
      },
      dateRange: {
        startDate,
        endDate
      }
    }

    return createSuccessResponse(analytics)

  } catch (error) {
    console.error('Error fetching content analytics:', error)
    return createErrorResponse('Failed to fetch content analytics', 'INTERNAL_SERVER_ERROR', 500)
  }
}
