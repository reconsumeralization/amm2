/**
 * Business Documentation Service
 * Handles business documentation management, workflow automation, and content synchronization
 */

import { 
  BusinessDocumentation, 
  BusinessDocumentationCreateRequest, 
  BusinessDocumentationUpdateRequest,
  BusinessDocumentationFilter,
  DocumentationTemplate,
  ContentApprovalWorkflow,
  DocumentationMetrics,
  WorkflowStep,
  DocumentationStatus
} from '@/types/business-documentation'
import { UserRole } from '@/types/documentation'

export interface BusinessDocumentationServiceConfig {
  payloadApiUrl: string
  payloadApiKey?: string
  enableWorkflowAutomation: boolean
  enableNotifications: boolean
  enableAnalytics: boolean
  defaultWorkflowId?: string
}

export class BusinessDocumentationService {
  private config: BusinessDocumentationServiceConfig
  private cache: Map<string, any> = new Map()
  private cacheExpiry: Map<string, number> = new Map()

  constructor(config: BusinessDocumentationServiceConfig) {
    this.config = config
  }

  /**
   * Create new business documentation
   */
  async createDocumentation(
    request: BusinessDocumentationCreateRequest,
    authorId: string
  ): Promise<BusinessDocumentation> {
    try {
      // Apply template if specified
      let content = request.content
      if (request.type && request.category) {
        const template = await this.getDefaultTemplate(request.type, request.category)
        if (template) {
          content = this.applyTemplate(template, request)
        }
      }

      // Get appropriate workflow
      const workflow = await this.getWorkflowForDocument(request.type, request.category)

      const documentData = {
        ...request,
        content,
        author: authorId,
        status: 'draft' as DocumentationStatus,
        version: '1.0.0',
        workflow: {
          currentStep: 'draft' as WorkflowStep,
          steps: workflow?.steps || [],
          assignedReviewers: [],
          comments: [],
          history: [{
            id: this.generateId(),
            step: 'draft' as WorkflowStep,
            action: 'created' as const,
            actor: { id: authorId, name: '', role: 'BarberShop_owner' as UserRole },
            timestamp: new Date(),
            comment: 'Document created'
          }]
        },
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
        },
        approvals: [],
        relatedDocuments: request.relatedDocuments || [],
        attachments: [],
        translations: [],
        analytics: {
          totalViews: 0,
          uniqueViews: 0,
          averageTimeOnPage: 0,
          bounceRate: 0,
          completionRate: 0,
          searchRanking: 0,
          popularSections: [],
          commonExitPoints: [],
          userFeedback: {
            helpful: 0,
            notHelpful: 0,
            averageRating: 0,
            totalRatings: 0
          },
          conversionMetrics: {
            taskCompletions: 0,
            goalAchievements: 0,
            followUpActions: 0
          }
        }
      }

      const response = await this.makePayloadRequest('POST', '/api/documentation', documentData)
      
      if (this.config.enableAnalytics) {
        await this.trackEvent('documentation_created', {
          documentId: response.id,
          type: request.type,
          category: request.category,
          authorId
        })
      }

      return this.mapPayloadToBusinessDoc(response)
    } catch (error) {
      console.error('Error creating documentation:', error)
      throw new Error('Failed to create documentation')
    }
  }

  /**
   * Update existing documentation
   */
  async updateDocumentation(
    request: BusinessDocumentationUpdateRequest,
    userId: string
  ): Promise<BusinessDocumentation> {
    try {
      const existing = await this.getDocumentationById(request.id)
      if (!existing) {
        throw new Error('Documentation not found')
      }

      // Handle workflow actions
      if (request.workflowAction) {
        await this.processWorkflowAction(existing, request.workflowAction, userId, request.comment)
      }

      // Update version if content changed
      let version = existing.version || '1.0.0'
      if (request.content && request.content !== existing.content) {
        version = this.incrementVersion(version)
      }

      const updateData = {
        ...request,
        version,
        lastUpdated: new Date(),
        metadata: {
          ...existing.metadata,
          isUpdated: true
        }
      }

      const response = await this.makePayloadRequest('PATCH', `/api/documentation/${request.id}`, updateData)
      
      if (this.config.enableAnalytics) {
        await this.trackEvent('documentation_updated', {
          documentId: request.id,
          userId,
          workflowAction: request.workflowAction
        })
      }

      // Clear cache
      this.clearCache(`doc_${request.id}`)

      return this.mapPayloadToBusinessDoc(response)
    } catch (error) {
      console.error('Error updating documentation:', error)
      throw new Error('Failed to update documentation')
    }
  }

  /**
   * Get documentation by ID
   */
  async getDocumentationById(id: string): Promise<BusinessDocumentation | null> {
    const cacheKey = `doc_${id}`
    
    // Check cache first
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const response = await this.makePayloadRequest('GET', `/api/documentation/${id}`)
      const doc = this.mapPayloadToBusinessDoc(response)
      
      // Cache for 5 minutes
      this.setCache(cacheKey, doc, 5 * 60 * 1000)
      
      return doc
    } catch (error) {
      console.error('Error fetching documentation:', error)
      return null
    }
  }

  /**
   * Search and filter documentation
   */
  async searchDocumentation(
    filter: BusinessDocumentationFilter,
    userRole: UserRole,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    documents: BusinessDocumentation[]
    total: number
    page: number
    totalPages: number
  }> {
    try {
      const query = this.buildSearchQuery(filter, userRole)
      const response = await this.makePayloadRequest('GET', '/api/documentation', {
        ...query,
        page,
        limit
      })

      return {
        documents: response.docs.map((doc: any) => this.mapPayloadToBusinessDoc(doc)),
        total: response.totalDocs,
        page: response.page,
        totalPages: response.totalPages
      }
    } catch (error) {
      console.error('Error searching documentation:', error)
      throw new Error('Failed to search documentation')
    }
  }

  /**
   * Get documentation templates
   */
  async getTemplates(type?: string, category?: string): Promise<DocumentationTemplate[]> {
    const cacheKey = `templates_${type || 'all'}_${category || 'all'}`
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const query: any = { isActive: true }
      if (type) query.type = type
      if (category) query.category = category

      const response = await this.makePayloadRequest('GET', '/api/documentation-templates', query)
      const templates = response.docs.map((template: any) => this.mapPayloadToTemplate(template))
      
      // Cache for 30 minutes
      this.setCache(cacheKey, templates, 30 * 60 * 1000)
      
      return templates
    } catch (error) {
      console.error('Error fetching templates:', error)
      return []
    }
  }

  /**
   * Get workflow for document type/category
   */
  async getWorkflowForDocument(type: string, category: string): Promise<ContentApprovalWorkflow | null> {
    const cacheKey = `workflow_${type}_${category}`
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const response = await this.makePayloadRequest('GET', '/api/documentation-workflows', {
        isActive: true,
        $or: [
          { isDefault: true },
          { applicableTypes: { $in: [type] } },
          { applicableCategories: { $in: [category] } }
        ]
      })

      const workflow = response.docs.length > 0 ? this.mapPayloadToWorkflow(response.docs[0]) : null
      
      // Cache for 1 hour
      this.setCache(cacheKey, workflow, 60 * 60 * 1000)
      
      return workflow
    } catch (error) {
      console.error('Error fetching workflow:', error)
      return null
    }
  }

  /**
   * Get documentation metrics
   */
  async getDocumentationMetrics(
    dateRange?: { start: Date; end: Date }
  ): Promise<DocumentationMetrics> {
    try {
      const query: any = {}
      if (dateRange) {
        query.createdAt = {
          $gte: dateRange.start,
          $lte: dateRange.end
        }
      }

      const [docsResponse, templatesResponse, workflowsResponse] = await Promise.all([
        this.makePayloadRequest('GET', '/api/documentation', { ...query, limit: 1000 }),
        this.makePayloadRequest('GET', '/api/documentation-templates', { limit: 100 }),
        this.makePayloadRequest('GET', '/api/documentation-workflows', { limit: 100 })
      ])

      const docs = docsResponse.docs
      
      // Calculate metrics
      const documentsByStatus = docs.reduce((acc: any, doc: any) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1
        return acc
      }, {})

      const documentsByType = docs.reduce((acc: any, doc: any) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1
        return acc
      }, {})

      const documentsByCategory = docs.reduce((acc: any, doc: any) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1
        return acc
      }, {})

      const popularDocuments = docs
        .sort((a: any, b: any) => (b.metadata?.views || 0) - (a.metadata?.views || 0))
        .slice(0, 10)
        .map((doc: any) => this.mapPayloadToBusinessDoc(doc))

      return {
        totalDocuments: docs.length,
        documentsByStatus,
        documentsByType,
        documentsByCategory,
        averageApprovalTime: this.calculateAverageApprovalTime(docs),
        pendingApprovals: docs.filter((doc: any) => 
          ['in-review', 'pending-approval'].includes(doc.status)
        ).length,
        overdueReviews: docs.filter((doc: any) => 
          doc.metadata?.nextReviewDate && new Date(doc.metadata.nextReviewDate) < new Date()
        ).length,
        popularDocuments,
        recentActivity: [], // Would be populated from workflow history
        userEngagement: {
          activeUsers: 0, // Would be calculated from analytics
          averageSessionDuration: 0,
          mostViewedCategories: Object.keys(documentsByCategory)
            .sort((a, b) => documentsByCategory[b] - documentsByCategory[a])
            .slice(0, 5),
          searchQueries: [] // Would be populated from search analytics
        }
      }
    } catch (error) {
      console.error('Error fetching documentation metrics:', error)
      throw new Error('Failed to fetch documentation metrics')
    }
  }

  /**
   * Process workflow action
   */
  private async processWorkflowAction(
    doc: BusinessDocumentation,
    action: string,
    userId: string,
    comment?: string
  ): Promise<void> {
    const workflow = doc.workflow
    
    switch (action) {
      case 'submit-for-review':
        workflow.currentStep = 'content-review'
        // Assign reviewers based on workflow configuration
        break
      case 'approve':
        workflow.currentStep = this.getNextWorkflowStep(workflow.currentStep)
        if (workflow.currentStep === 'published') {
          // Auto-publish if final approval
        }
        break
      case 'reject':
        workflow.currentStep = 'draft'
        break
      case 'publish':
        workflow.currentStep = 'published'
        break
      case 'archive':
        // Handle archiving
        break
    }

    // Add workflow comment
    if (comment) {
      workflow.comments.push({
        id: this.generateId(),
        author: { id: userId, name: '', role: 'BarberShop_owner' },
        content: comment,
        type: action === 'approve' ? 'approval' : action === 'reject' ? 'rejection' : 'comment',
        createdAt: new Date()
      })
    }

    // Send notifications if enabled
    if (this.config.enableNotifications) {
      await this.sendWorkflowNotification(doc, action, userId)
    }
  }

  /**
   * Apply template to content
   */
  private applyTemplate(template: DocumentationTemplate, request: BusinessDocumentationCreateRequest): string {
    let content = template.template
    
    // Replace placeholders with actual values
    content = content.replace(/\{\{title\}\}/g, request.title)
    content = content.replace(/\{\{category\}\}/g, request.category)
    content = content.replace(/\{\{type\}\}/g, request.type)
    
    // Add any custom field replacements
    template.fields.forEach(field => {
      const placeholder = `{{${field.name}}}`
      const value = (request as any)[field.name] || field.placeholder || ''
      content = content.replace(new RegExp(placeholder, 'g'), value)
    })

    return content
  }

  /**
   * Get default template for type/category
   */
  private async getDefaultTemplate(type: string, category: string): Promise<DocumentationTemplate | null> {
    const templates = await this.getTemplates(type, category)
    return templates.find(t => t.isDefault) || templates[0] || null
  }

  /**
   * Build search query from filter
   */
  private buildSearchQuery(filter: BusinessDocumentationFilter, userRole: UserRole): any {
    const query: any = {}

    if (filter.type?.length) {
      query.type = { $in: filter.type }
    }

    if (filter.category?.length) {
      query.category = { $in: filter.category }
    }

    if (filter.status?.length) {
      query.status = { $in: filter.status }
    }

    if (filter.difficulty?.length) {
      query.difficulty = { $in: filter.difficulty }
    }

    if (filter.priority?.length) {
      query.priority = { $in: filter.priority }
    }

    if (filter.tags?.length) {
      query['tags.tag'] = { $in: filter.tags }
    }

    if (filter.author?.length) {
      query.author = { $in: filter.author }
    }

    if (filter.dateRange) {
      query.createdAt = {
        $gte: filter.dateRange.start,
        $lte: filter.dateRange.end
      }
    }

    if (filter.searchQuery) {
      query.$or = [
        { title: { $regex: filter.searchQuery, $options: 'i' } },
        { excerpt: { $regex: filter.searchQuery, $options: 'i' } },
        { content: { $regex: filter.searchQuery, $options: 'i' } }
      ]
    }

    // Apply role-based filtering
    const roleHierarchy = {
      'BarberShop_customer': ['guest', 'BarberShop_customer'],
      'BarberShop_employee': ['guest', 'BarberShop_customer', 'BarberShop_employee'],
      'BarberShop_owner': ['guest', 'BarberShop_customer', 'BarberShop_employee', 'BarberShop_owner'],
      'developer': ['guest', 'BarberShop_customer', 'BarberShop_employee', 'BarberShop_owner', 'developer'],
      'system_admin': ['guest', 'BarberShop_customer', 'BarberShop_employee', 'BarberShop_owner', 'developer', 'system_admin']
    }

    const accessibleRoles = roleHierarchy[userRole as keyof typeof roleHierarchy] || [userRole]
    query.targetRole = { $in: accessibleRoles }

    return query
  }

  /**
   * Helper methods
   */
  private async makePayloadRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.config.payloadApiUrl}${endpoint}`
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.payloadApiKey && { 'Authorization': `Bearer ${this.config.payloadApiKey}` })
      }
    }

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data)
    } else if (data && method === 'GET') {
      const params = new URLSearchParams(data)
      const response = await fetch(`${url}?${params}`, options)
      return response.json()
    }

    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }

  private mapPayloadToBusinessDoc(payload: any): BusinessDocumentation {
    return {
      id: payload.id,
      title: payload.title,
      slug: payload.slug,
      type: payload.type,
      targetRole: payload.targetRole,
      category: payload.category,
      content: payload.content,
      excerpt: payload.excerpt,
      tags: payload.tags?.map((t: any) => t.tag) || [],
      author: payload.author,
      status: payload.status,
      version: payload.version,
      lastUpdated: new Date(payload.updatedAt),
      createdAt: new Date(payload.createdAt),
      publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : undefined,
      scheduledPublishAt: payload.scheduledPublishAt ? new Date(payload.scheduledPublishAt) : undefined,
      difficulty: payload.difficulty,
      estimatedReadTime: payload.estimatedReadTime,
      priority: payload.priority,
      metadata: payload.metadata || {},
      workflow: payload.workflow || { currentStep: 'draft', steps: [], assignedReviewers: [], comments: [], history: [] },
      approvals: payload.approvals || [],
      relatedDocuments: payload.relatedDocuments?.map((r: any) => r.document) || [],
      attachments: payload.attachments || [],
      translations: payload.translations || [],
      analytics: payload.analytics || {
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

  private mapPayloadToTemplate(payload: any): DocumentationTemplate {
    return {
      id: payload.id,
      name: payload.name,
      description: payload.description,
      type: payload.type,
      category: payload.category,
      targetRole: payload.targetRoles?.map((r: any) => r.role) || [],
      template: payload.template,
      fields: payload.fields || [],
      isDefault: payload.isDefault,
      createdBy: payload.createdBy,
      createdAt: new Date(payload.createdAt),
      usageCount: payload.usageCount
    }
  }

  private mapPayloadToWorkflow(payload: any): ContentApprovalWorkflow {
    return {
      id: payload.id,
      name: payload.name,
      description: payload.description,
      steps: payload.steps || [],
      applicableTypes: payload.applicableTypes?.map((t: any) => t.type) || [],
      applicableCategories: payload.applicableCategories?.map((c: any) => c.category) || [],
      isDefault: payload.isDefault,
      isActive: payload.isActive,
      createdBy: payload.createdBy,
      createdAt: new Date(payload.createdAt),
      updatedAt: new Date(payload.updatedAt)
    }
  }

  private getNextWorkflowStep(currentStep: WorkflowStep): WorkflowStep {
    const stepOrder: WorkflowStep[] = [
      'draft',
      'content-review',
      'technical-review',
      'compliance-review',
      'final-approval',
      'published'
    ]
    
    const currentIndex = stepOrder.indexOf(currentStep)
    return stepOrder[currentIndex + 1] || 'published'
  }

  private calculateAverageApprovalTime(docs: any[]): number {
    // Calculate average time from creation to publication
    const publishedDocs = docs.filter(doc => doc.status === 'published' && doc.publishedAt)
    if (publishedDocs.length === 0) return 0

    const totalTime = publishedDocs.reduce((sum, doc) => {
      const created = new Date(doc.createdAt).getTime()
      const published = new Date(doc.publishedAt).getTime()
      return sum + (published - created)
    }, 0)

    return totalTime / publishedDocs.length / (1000 * 60 * 60 * 24) // Convert to days
  }

  private incrementVersion(version: string): string {
    if (!version) return '1.0.1'
    
    const parts = version.split('.')
    const major = parts[0] || '1'
    const minor = parts[1] || '0'
    const patch = parseInt(parts[2] || '0') + 1
    return `${major}.${minor}.${patch}`
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private async trackEvent(event: string, data: any): Promise<void> {
    // Implementation for analytics tracking
    console.log(`Analytics event: ${event}`, data)
  }

  private async sendWorkflowNotification(doc: BusinessDocumentation, action: string, userId: string): Promise<void> {
    // Implementation for sending notifications
    console.log(`Workflow notification: ${action} on ${doc.title} by ${userId}`)
  }

  private isValidCache(key: string): boolean {
    const expiry = this.cacheExpiry.get(key)
    return expiry ? expiry > Date.now() : false
  }

  private setCache(key: string, value: any, ttl: number): void {
    this.cache.set(key, value)
    this.cacheExpiry.set(key, Date.now() + ttl)
  }

  private clearCache(key: string): void {
    this.cache.delete(key)
    this.cacheExpiry.delete(key)
  }
}
