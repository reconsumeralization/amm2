import { UserRole } from './documentation'

export interface BusinessDocumentation {
  id: string
  title: string
  slug: string
  type: BusinessDocumentationType
  targetRole: UserRole
  category: BusinessDocumentationCategory
  content: string
  excerpt?: string
  tags: string[]
  author: {
    id: string
    name: string
    email: string
  }
  status: DocumentationStatus
  version: string
  lastUpdated: Date
  createdAt: Date
  publishedAt?: Date
  scheduledPublishAt?: Date
  difficulty: DifficultyLevel
  estimatedReadTime: number
  priority: PriorityLevel
  metadata: BusinessDocumentationMetadata
  workflow: DocumentationWorkflow
  approvals: DocumentationApproval[]
  relatedDocuments: string[]
  attachments: DocumentationAttachment[]
  translations: DocumentationTranslation[]
  analytics: DocumentationAnalytics
}

export type BusinessDocumentationType = 
  | 'guide'
  | 'procedure'
  | 'policy'
  | 'training'
  | 'faq'
  | 'troubleshooting'
  | 'announcement'
  | 'tutorial'
  | 'checklist'
  | 'template'

export type BusinessDocumentationCategory =
  | 'salon-operations'
  | 'customer-service'
  | 'booking-management'
  | 'staff-training'
  | 'safety-procedures'
  | 'marketing'
  | 'financial-management'
  | 'inventory-management'
  | 'compliance'
  | 'technology-setup'
  | 'emergency-procedures'
  | 'quality-assurance'

export type DocumentationStatus = 
  | 'draft'
  | 'in-review'
  | 'pending-approval'
  | 'approved'
  | 'published'
  | 'scheduled'
  | 'archived'
  | 'deprecated'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical'

export interface BusinessDocumentationMetadata {
  views: number
  rating: number
  ratingCount: number
  completionRate: number
  feedbackCount: number
  lastReviewDate?: Date
  nextReviewDate?: Date
  isNew: boolean
  isUpdated: boolean
  isDeprecated: boolean
  isFeatured: boolean
  isRequired: boolean
  expirationDate?: Date
  complianceRequired: boolean
  trainingRequired: boolean
  certificationRequired: boolean
}

export interface DocumentationWorkflow {
  currentStep: WorkflowStep
  steps: WorkflowStepDefinition[]
  assignedReviewers: string[]
  dueDate?: Date
  comments: WorkflowComment[]
  history: WorkflowHistoryEntry[]
}

export type WorkflowStep = 
  | 'draft'
  | 'content-review'
  | 'technical-review'
  | 'compliance-review'
  | 'final-approval'
  | 'published'

export interface WorkflowStepDefinition {
  step: WorkflowStep
  name: string
  description: string
  requiredRole: UserRole[]
  isOptional: boolean
  estimatedDuration: number // in hours
  autoAdvance: boolean
}

export interface WorkflowComment {
  id: string
  author: {
    id: string
    name: string
    role: UserRole
  }
  content: string
  type: 'comment' | 'suggestion' | 'approval' | 'rejection'
  createdAt: Date
  resolvedAt?: Date
  resolvedBy?: string
}

export interface WorkflowHistoryEntry {
  id: string
  step: WorkflowStep
  action: 'created' | 'submitted' | 'approved' | 'rejected' | 'revised'
  actor: {
    id: string
    name: string
    role: UserRole
  }
  timestamp: Date
  comment?: string
  changes?: Record<string, any>
}

export interface DocumentationApproval {
  id: string
  approver: {
    id: string
    name: string
    role: UserRole
  }
  status: 'pending' | 'approved' | 'rejected'
  comments?: string
  approvedAt?: Date
  requiredFor: WorkflowStep[]
}

export interface DocumentationAttachment {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  description?: string
  uploadedBy: string
  uploadedAt: Date
}

export interface DocumentationTranslation {
  language: string
  title: string
  content: string
  excerpt?: string
  status: 'draft' | 'in-progress' | 'completed' | 'needs-review'
  translator?: {
    id: string
    name: string
  }
  lastUpdated: Date
}

export interface DocumentationAnalytics {
  totalViews: number
  uniqueViews: number
  averageTimeOnPage: number
  bounceRate: number
  completionRate: number
  rchRanking: number
  popularSections: string[]
  commonExitPoints: string[]
  userFeedback: {
    helpful: number
    notHelpful: number
    averageRating: number
    totalRatings: number
  }
  conversionMetrics: {
    taskCompletions: number
    goalAchievements: number
    followUpActions: number
  }
}

export interface BusinessDocumentationFilter {
  type?: BusinessDocumentationType[]
  category?: BusinessDocumentationCategory[]
  targetRole?: UserRole[]
  status?: DocumentationStatus[]
  difficulty?: DifficultyLevel[]
  priority?: PriorityLevel[]
  tags?: string[]
  author?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  rchQuery?: string
}

export interface BusinessDocumentationCreateRequest {
  title: string
  type: BusinessDocumentationType
  targetRole: UserRole
  category: BusinessDocumentationCategory
  content: string
  excerpt?: string
  tags: string[]
  difficulty: DifficultyLevel
  priority: PriorityLevel
  estimatedReadTime?: number
  scheduledPublishAt?: Date
  relatedDocuments?: string[]
  attachments?: File[]
}

export interface BusinessDocumentationUpdateRequest extends Partial<BusinessDocumentationCreateRequest> {
  id: string
  version?: string
  workflowAction?: 'submit-for-review' | 'approve' | 'reject' | 'publish' | 'archive'
  comment?: string
}

export interface DocumentationTemplate {
  id: string
  name: string
  description: string
  type: BusinessDocumentationType
  category: BusinessDocumentationCategory
  targetRole: UserRole[]
  template: string
  fields: TemplateField[]
  isDefault: boolean
  createdBy: string
  createdAt: Date
  usageCount: number
}

export interface TemplateField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number' | 'file'
  required: boolean
  placeholder?: string
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
}

export interface ContentApprovalWorkflow {
  id: string
  name: string
  description: string
  steps: WorkflowStepDefinition[]
  applicableTypes: BusinessDocumentationType[]
  applicableCategories: BusinessDocumentationCategory[]
  isDefault: boolean
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface DocumentationMetrics {
  totalDocuments: number
  documentsByStatus: Record<DocumentationStatus, number>
  documentsByType: Record<BusinessDocumentationType, number>
  documentsByCategory: Record<BusinessDocumentationCategory, number>
  averageApprovalTime: number
  pendingApprovals: number
  overdueReviews: number
  popularDocuments: BusinessDocumentation[]
  recentActivity: WorkflowHistoryEntry[]
  userEngagement: {
    activeUsers: number
    averageSessionDuration: number
    mostViewedCategories: string[]
    rchQueries: string[]
  }
}