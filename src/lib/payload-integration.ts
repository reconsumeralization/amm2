/**
 * Payload CMS Integration Service
 * Provides mless integration between Payload CMS and the Modern Men Hair Salon application
 */

import { getPayload } from 'payload'
import type { Payload } from 'payload/types'
import { getUserFromSession } from '@/lib/documentation-auth'
import { BusinessDocumentation } from '@/types/business-documentation'
import { UserRole } from '@/types/documentation'

export interface PayloadIntegrationConfig {
  enableCaching: boolean
  cacheTimeout: number
  enableAnalytics: boolean
  enableNotifications: boolean
}

export class PayloadIntegrationService {
  private payload: any | null = null
  private config: PayloadIntegrationConfig
  private cache: Map<string, { data: any; expires: number }> = new Map()

  constructor(config: PayloadIntegrationConfig = {
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutes
    enableAnalytics: true,
    enableNotifications: true
  }) {
    this.config = config
  }

  /**
   * Initialize Payload CMS connection
   */
  async initialize(): Promise<void> {
    if (!this.payload) {
      this.payload = await getPayload({
        config: require('../payload.config.ts').default
      })
    }
  }

  /**
   * Get authenticated Payload instance
   */
  async getPayloadInstance(): Promise<any> {
    if (!this.payload) {
      await this.initialize()
    }
    return this.payload!
  }

  /**
   * Sync user data between NextAuth and Payload
   */
  async syncUserWithPayload(session: any): Promise<any> {
    const payload = await this.getPayloadInstance()
    const user = getUserFromSession(session)
    
    if (!user) return null

    try {
      // Check if user exists in Payload
      const existingUsers = await payload.find({
        collection: 'users',
        where: {
          email: { equals: user.email }
        },
        limit: 1
      })

      if (existingUsers.docs.length > 0) {
        // Update existing user
        const existingUser = existingUsers.docs[0]
        return await payload.update({
          collection: 'users',
          id: existingUser.id,
          data: {
            name: user.name,
            role: user.role,
            lastLogin: new Date()
          }
        })
      } else {
        // Create new user in Payload
        return await payload.create({
          collection: 'users',
          data: {
            email: user.email,
            name: user.name,
            role: user.role,
            password: Math.random().toString(36), // Temporary password
            createdAt: new Date(),
            lastLogin: new Date()
          }
        })
      }
    } catch (error) {
      console.error('Error syncing user with Payload:', error)
      return null
    }
  }

  /**
   * Get business documentation with role-based filtering
   */
  async getBusinessDocumentation(
    userRole: UserRole,
    filters: {
      type?: string[]
      category?: string[]
      status?: string[]
      search?: string
      limit?: number
      page?: number
    } = {}
  ): Promise<{
    docs: BusinessDocumentation[]
    totalDocs: number
    page: number
    totalPages: number
  }> {
    const cacheKey = `business-docs-${userRole}-${JSON.stringify(filters)}`
    
    if (this.config.enableCaching && this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey)
    }

    const payload = await this.getPayloadInstance()
    
    // Build role-based access query
    // Define role hierarchy with explicit typing to satisfy TypeScript
    const roleHierarchy: Record<UserRole, UserRole[]> = {
      salon_customer: ['guest', 'salon_customer'],
      salon_employee: ['guest', 'salon_customer', 'salon_employee'],
      salon_owner: ['guest', 'salon_customer', 'salon_employee', 'salon_owner'],
      developer: ['guest', 'salon_customer', 'salon_employee', 'salon_owner', 'developer'],
      system_admin: ['guest', 'salon_customer', 'salon_employee', 'salon_owner', 'developer', 'system_admin'],
      guest: ['guest']
    }

    const accessibleRoles = roleHierarchy[userRole] || [userRole]
    
    const whereClause: any = {
      and: [
        { targetRole: { in: accessibleRoles } },
        { status: { equals: 'published' } }
      ]
    }

    // Add filters
    if (filters.type?.length) {
      whereClause.and.push({ type: { in: filters.type } })
    }

    if (filters.category?.length) {
      whereClause.and.push({ category: { in: filters.category } })
    }

    if (filters.status?.length) {
      whereClause.and[1] = { status: { in: filters.status } }
    }

    if (filters.search) {
      whereClause.and.push({
        or: [
          { title: { contains: filters.search } },
          { excerpt: { contains: filters.search } },
          { content: { contains: filters.search } }
        ]
      })
    }

    try {
      const result = await payload.find({
        collection: 'documentation',
        where: whereClause,
        limit: filters.limit || 20,
        page: filters.page || 1,
        sort: '-updatedAt'
      })

      const mappedResult = {
        docs: result.docs.map((doc: any) => this.mapPayloadDocToBusinessDoc(doc)),
        totalDocs: result.totalDocs,
        page: result.page || 1,
        totalPages: result.totalPages || 1
      }

      if (this.config.enableCaching) {
        this.setCache(cacheKey, mappedResult)
      }

      return mappedResult
    } catch (error) {
      console.error('Error fetching business documentation:', error)
      throw new Error('Failed to fetch documentation')
    }
  }

  /**
   * Create business documentation
   */
  async createBusinessDocumentation(
    data: Partial<BusinessDocumentation>,
    authorId: string
  ): Promise<BusinessDocumentation> {
    const payload = await this.getPayloadInstance()

    try {
      const doc = await payload.create({
        collection: 'documentation',
        data: {
          ...data,
          author: authorId,
          status: 'draft',
          version: '1.0.0',
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            views: 0,
            rating: 0,
            ratingCount: 0,
            completionRate: 0,
            feedbackCount: 0,
            isNew: true,
            isUpdated: false,
            isDeprecated: false,
            isFeatured: false,
            isRequired: false,
            complianceRequired: false,
            trainingRequired: false
          }
        }
      })

      // Clear related caches
      this.clearCacheByPattern('business-docs-')

      if (this.config.enableAnalytics) {
        await this.trackEvent('documentation_created', {
          documentId: doc.id,
          type: data.type,
          category: data.category,
          authorId
        })
      }

      return this.mapPayloadDocToBusinessDoc(doc)
    } catch (error) {
      console.error('Error creating business documentation:', error)
      throw new Error('Failed to create documentation')
    }
  }

  /**
   * Update business documentation
   */
  async updateBusinessDocumentation(
    id: string,
    data: Partial<BusinessDocumentation>,
    userId: string
  ): Promise<BusinessDocumentation> {
    const payload = await this.getPayloadInstance()

    try {
      const doc = await payload.update({
        collection: 'documentation',
        id,
        data: {
          ...data,
          updatedAt: new Date(),
          metadata: {
            ...data.metadata,
            isUpdated: true
          }
        }
      })

      // Clear related caches
      this.clearCacheByPattern('business-docs-')
      this.clearCache(`business-doc-${id}`)

      if (this.config.enableAnalytics) {
        await this.trackEvent('documentation_updated', {
          documentId: id,
          userId
        })
      }

      return this.mapPayloadDocToBusinessDoc(doc)
    } catch (error) {
      console.error('Error updating business documentation:', error)
      throw new Error('Failed to update documentation')
    }
  }

  /**
   * Delete business documentation
   */
  async deleteBusinessDocumentation(id: string, userId: string): Promise<boolean> {
    const payload = await this.getPayloadInstance()

    try {
      await payload.delete({
        collection: 'documentation',
        id
      })

      // Clear related caches
      this.clearCacheByPattern('business-docs-')
      this.clearCache(`business-doc-${id}`)

      if (this.config.enableAnalytics) {
        await this.trackEvent('documentation_deleted', {
          documentId: id,
          userId
        })
      }

      return true
    } catch (error) {
      console.error('Error deleting business documentation:', error)
      throw new Error('Failed to delete documentation')
    }
  }

  /**
   * Get documentation templates
   */
  async getDocumentationTemplates(
    type?: string,
    category?: string
  ): Promise<any[]> {
    const cacheKey = `templates-${type || 'all'}-${category || 'all'}`
    
    if (this.config.enableCaching && this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey)
    }

    const payload = await this.getPayloadInstance()
    
    const whereClause: any = { isActive: { equals: true } }
    
    if (type) {
      whereClause.type = { equals: type }
    }
    
    if (category) {
      whereClause.category = { equals: category }
    }

    try {
      const result = await payload.find({
        collection: 'documentation-templates',
        where: whereClause,
        sort: '-usageCount'
      })

      if (this.config.enableCaching) {
        this.setCache(cacheKey, result.docs)
      }

      return result.docs
    } catch (error) {
      console.error('Error fetching templates:', error)
      return []
    }
  }

  /**
   * Get documentation workflows
   */
  async getDocumentationWorkflows(
    type?: string,
    category?: string
  ): Promise<any[]> {
    const cacheKey = `workflows-${type || 'all'}-${category || 'all'}`
    
    if (this.config.enableCaching && this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey)
    }

    const payload = await this.getPayloadInstance()
    
    const whereClause: any = { isActive: { equals: true } }
    
    if (type) {
      whereClause.applicableTypes = { contains: type }
    }
    
    if (category) {
      whereClause.applicableCategories = { contains: category }
    }

    try {
      const result = await payload.find({
        collection: 'documentation-workflows',
        where: whereClause,
        sort: 'isDefault'
      })

      if (this.config.enableCaching) {
        this.setCache(cacheKey, result.docs)
      }

      return result.docs
    } catch (error) {
      console.error('Error fetching workflows:', error)
      return []
    }
  }

  /**
   * Get salon analytics from Payload
   */
  async getSalonAnalytics(dateRange?: { start: Date; end: Date }): Promise<{
    appointments: number
    customers: number
    services: number
    revenue: number
    topServices: any[]
    topStylists: any[]
  }> {
    const cacheKey = `salon-analytics-${dateRange?.start?.toISOString()}-${dateRange?.end?.toISOString()}`
    
    if (this.config.enableCaching && this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey)
    }

    const payload = await this.getPayloadInstance()
    
    try {
      const whereClause: any = {}
      
      if (dateRange) {
        whereClause.createdAt = {
          greater_than_equal: dateRange.start,
          less_than_equal: dateRange.end
        }
      }

      const [appointments, customers, services] = await Promise.all([
        payload.count({ collection: 'appointments', where: whereClause }),
        payload.count({ collection: 'customers', where: whereClause }),
        payload.count({ collection: 'services' })
      ])

      // Get top services and stylists
      const [topServicesResult, topStylistsResult] = await Promise.all([
        payload.find({
          collection: 'services',
          sort: '-bookingCount',
          limit: 5
        }),
        payload.find({
          collection: 'stylists',
          sort: '-totalBookings',
          limit: 5
        })
      ])

      const analytics = {
        appointments: appointments.totalDocs,
        customers: customers.totalDocs,
        services: services.totalDocs,
        revenue: 0, // Would be calculated from appointments
        topServices: topServicesResult.docs,
        topStylists: topStylistsResult.docs
      }

      if (this.config.enableCaching) {
        this.setCache(cacheKey, analytics)
      }

      return analytics
    } catch (error) {
      console.error('Error fetching salon analytics:', error)
      throw new Error('Failed to fetch analytics')
    }
  }

  /**
   * search across all collections
   */
  async globalSearch(
    query: string,
    collections: string[] = ['services', 'customers', 'stylists', 'documentation'],
    limit: number = 20
  ): Promise<{
    results: any[]
    total: number
    collections: Record<string, number>
  }> {
    const cacheKey = `global-search-${query}-${collections.join(',')}-${limit}`
    
    if (this.config.enableCaching && this.isValidCache(cacheKey)) {
      return this.getFromCache(cacheKey)
    }

    const payload = await this.getPayloadInstance()
    const results: any[] = []
    const collectionCounts: Record<string, number> = {}

    try {
      for (const collection of collections) {
        let searchResult: any

        switch (collection) {
          case 'services':
            searchResult = await payload.find({
              collection: 'services',
              where: {
                or: [
                  { name: { contains: query } },
                  { description: { contains: query } }
                ]
              },
              limit: Math.ceil(limit / collections.length)
            })
            break

          case 'customers':
            searchResult = await payload.find({
              collection: 'customers',
              where: {
                or: [
                  { firstName: { contains: query } },
                  { lastName: { contains: query } },
                  { email: { contains: query } }
                ]
              },
              limit: Math.ceil(limit / collections.length)
            })
            break

          case 'stylists':
            searchResult = await payload.find({
              collection: 'stylists',
              where: {
                or: [
                  { firstName: { contains: query } },
                  { lastName: { contains: query } },
                  { bio: { contains: query } }
                ]
              },
              limit: Math.ceil(limit / collections.length)
            })
            break

          case 'documentation':
            searchResult = await payload.find({
              collection: 'documentation',
              where: {
                and: [
                  { status: { equals: 'published' } },
                  {
                    or: [
                      { title: { contains: query } },
                      { excerpt: { contains: query } },
                      { content: { contains: query } }
                    ]
                  }
                ]
              },
              limit: Math.ceil(limit / collections.length)
            })
            break
            
          default:
            continue
        }

        if (searchResult) {
          const mappedResults = searchResult.docs.map((doc: Record<string, any>) => ({
            ...doc,
            _collection: collection,
            _type: collection.slice(0, -1) // Remove 's' from plural
          }))

          results.push(...mappedResults)
          collectionCounts[collection] = searchResult.docs.length
        }
      }

      const searchResults = {
        results,
        total: results.length,
        collections: collectionCounts
      }

      if (this.config.enableCaching) {
        this.setCache(cacheKey, searchResults)
      }

      return searchResults
    } catch (error) {
      console.error('Error performing global search:', error)
      throw new Error('search failed')
    }
  }

  /**
   * Sync appointment data with external calendar systems
   * Note: Google Calendar integration is disabled to prevent build issues
   */
  async syncAppointments(): Promise<{ synced: number; failed: number; errors: string[] }> {
    const payload = await this.getPayloadInstance()

    let syncedCount = 0
    let failedCount = 0
    const errors: string[] = []

    try {
      // Get appointments that need syncing (confirmed/rescheduled without Google Event ID)
      const appointments = await payload.find({
        collection: 'appointments',
        where: {
          and: [
            { status: { in: ['confirmed', 'rescheduled'] } },
            { date: { greater_than: new Date() } },
            {
              or: [
                { googleEventId: { exists: false } },
                { googleEventId: { equals: null } },
                { googleEventId: { equals: '' } }
              ]
            }
          ]
        },
        populate: ['user', 'tenant']
      })

      console.log(`Google Calendar sync is currently disabled to prevent build issues. Found ${appointments.docs.length} appointments that would need syncing.`)

      // Temporarily disabled to prevent build issues with Google APIs
      errors.push('Google Calendar integration is currently disabled to prevent build issues')

      return {
        synced: 0,
        failed: appointments.docs.length,
        errors: ['Google Calendar integration is currently disabled to prevent build issues']
      }

    } catch (error) {
      console.error('Error during appointment sync:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`Sync process failed: ${errorMsg}`)
    }

    return { synced: syncedCount, failed: failedCount, errors }
  }

  /**
   * Helper methods
   */
  private mapPayloadDocToBusinessDoc(doc: Record<string, any>): BusinessDocumentation {
    return {
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      type: doc.type,
      targetRole: doc.targetRole,
      category: doc.category,
      content: doc.content,
      excerpt: doc.excerpt,
      tags: doc.tags?.map((t: any) => t.tag) || [],
      author: doc.author,
      status: doc.status,
      version: doc.version,
      lastUpdated: new Date(doc.updatedAt),
      createdAt: new Date(doc.createdAt),
      publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : undefined,
      scheduledPublishAt: doc.scheduledPublishAt ? new Date(doc.scheduledPublishAt) : undefined,
      difficulty: doc.difficulty,
      estimatedReadTime: doc.estimatedReadTime,
      priority: doc.priority,
      metadata: doc.metadata || {},
      workflow: doc.workflow || { currentStep: 'draft', steps: [], assignedReviewers: [], comments: [], history: [] },
      approvals: doc.approvals || [],
      relatedDocuments: doc.relatedDocuments?.map((r: any) => r.document) || [],
      attachments: doc.attachments || [],
      translations: doc.translations || [],
      analytics: doc.analytics || {
        totalViews: 0,
        uniqueViews: 0,
        averageTimeOnPage: 0,
        bounceRate: 0,
        completionRate: 0,
        searchRanking: 0,
        popularSections: [],
        commonExitPoints: [],
        userFeedback: { helpful: 0, notHelpful: 0, averageRating: 0, totalRatings: 0 },
        conversionMetrics: { taskCompletions: 0, goalAchievements: 0, followUpActions: 0 }
      }
    }
  }

  private async trackEvent(event: string, data: any): Promise<void> {
    if (!this.config.enableAnalytics) return
    
    // Implementation for analytics tracking
    console.log(`Analytics event: ${event}`, data)
    
    // Here you would integrate with your analytics service
    // (Google Analytics, Mixpanel, etc.)
  }

  private isValidCache(key: string): boolean {
    const cached = this.cache.get(key)
    return cached ? cached.expires > Date.now() : false
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key)
    return cached ? cached.data : null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.config.cacheTimeout
    })
  }

  private clearCache(key: string): void {
    this.cache.delete(key)
  }

  private clearCacheByPattern(pattern: string): void {
    for (const key of Array.from(this.cache.keys())) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

// Singleton instance
let payloadIntegrationService: PayloadIntegrationService | null = null

export function getPayloadIntegrationService(): PayloadIntegrationService {
  if (!payloadIntegrationService) {
    payloadIntegrationService = new PayloadIntegrationService()
  }
  return payloadIntegrationService
}

export default PayloadIntegrationService
