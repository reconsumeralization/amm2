/**
 * Documentation rch Types
 * Comprehensive rch functionality with role-based filtering and analytics
 */

import { UserRole } from './documentation'

export interface rchQuery {
  query: string
  filters: rchFilters
  pagination: rchPagination
  sorting: rchSorting
}

export interface rchFilters {
  roles?: UserRole[]
  categories?: string[]
  tags?: string[]
  contentTypes?: ContentType[]
  difficulty?: DifficultyLevel[]
  dateRange?: DateRange
  authors?: string[]
  sections?: string[]
}

export interface rchPagination {
  page: number
  limit: number
  offset: number
}

export interface rchSorting {
  field: SortField
  direction: 'asc' | 'desc'
}

export type SortField = 
  | 'relevance' 
  | 'date' 
  | 'title' 
  | 'popularity' 
  | 'rating'
  | 'views'

export type ContentType = 
  | 'guide' 
  | 'api' 
  | 'component' 
  | 'page'
  | 'faq'
  | 'troubleshooting'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface DateRange {
  from: Date
  to: Date
}

export interface rchResult {
  id: string
  title: string
  description: string
  content: string
  path: string
  type: ContentType
  role: UserRole
  category: string
  tags: string[]
  author: string
  lastUpdated: Date
  difficulty?: DifficultyLevel
  estimatedReadTime?: number
  relevanceScore: number
  highlights: rchHighlight[]
  metadata: rchResultMetadata
}

export interface rchHighlight {
  field: string
  fragments: string[]
}

export interface rchResultMetadata {
  views: number
  rating: number
  completionRate: number
  feedbackCount: number
  isNew: boolean
  isUpdated: boolean
  isDeprecated: boolean
}

export interface rchResponse {
  results: rchResult[]
  totalCount: number
  facets: rchFacets
  suggestions: rchSuggestion[]
  analytics: rchAnalytics
  pagination: rchPagination
  query: rchQuery
  executionTime: number
}

export interface rchFacets {
  roles: FacetCount[]
  categories: FacetCount[]
  tags: FacetCount[]
  contentTypes: FacetCount[]
  difficulty: FacetCount[]
  authors: FacetCount[]
  sections: FacetCount[]
}

export interface FacetCount {
  value: string
  count: number
  selected: boolean
}

export interface rchSuggestion {
  text: string
  type: 'correction' | 'completion' | 'related'
  score: number
}

export interface rchAnalytics {
  queryId: string
  timestamp: Date
  userRole: UserRole
  resultsCount: number
  hasResults: boolean
  clickedResults: string[]
  rchTime: number
}

export interface rchRankingConfig {
  roleBasedBoost: Record<UserRole, number>
  recencyBoost: number
  popularityBoost: number
  accuracyBoost: number
  completionRateBoost: number
  ratingBoost: number
  viewsBoost: number
  titleBoost: number
  descriptionBoost: number
  contentBoost: number
  tagsBoost: number
}

export interface rchIndexDocument {
  id: string
  title: string
  description: string
  content: string
  path: string
  type: ContentType
  role: UserRole
  category: string
  tags: string[]
  author: string
  lastUpdated: Date
  difficulty?: DifficultyLevel
  estimatedReadTime?: number
  metadata: {
    views: number
    rating: number
    completionRate: number
    feedbackCount: number
    isNew: boolean
    isUpdated: boolean
    isDeprecated: boolean
  }
  rchableText: string
  keywords: string[]
}

export interface rchConfig {
  provider: 'local' | 'algolia' | 'elasticrch'
  indexName: string
  apiKey?: string
  appId?: string
  endpoint?: string
  maxResults: number
  enableFacets: boolean
  enableSuggestions: boolean
  enableAnalytics: boolean
  enableHighlighting: boolean
  enableTypoTolerance: boolean
  enableSynonyms: boolean
  rankingConfig: rchRankingConfig
}

export interface rchMetrics {
  totalQueries: number
  uniqueQueries: number
  averageResultsPerQuery: number
  noResultsQueries: number
  topQueries: QueryMetric[]
  topResults: ResultMetric[]
  userEngagement: EngagementMetric[]
  performanceMetrics: PerformanceMetric[]
}

export interface QueryMetric {
  query: string
  count: number
  resultsCount: number
  clickThroughRate: number
  conversionRate: number
}

export interface ResultMetric {
  resultId: string
  title: string
  clicks: number
  impressions: number
  clickThroughRate: number
  averagePosition: number
}

export interface EngagementMetric {
  userRole: UserRole
  queriesCount: number
  clicksCount: number
  averageSessionDuration: number
  bounceRate: number
}

export interface PerformanceMetric {
  date: Date
  averagerchTime: number
  averageResultsCount: number
  errorRate: number
  uptime: number
}

export interface rchFallback {
  type: 'no_results' | 'error' | 'timeout'
  message: string
  suggestions: rchSuggestion[]
  alternativeQueries: string[]
  relatedContent: rchResult[]
  supportLinks: {
    title: string
    url: string
  }[]
}

export interface AutocompleteResult {
  suggestions: AutocompleteSuggestion[]
  recentQueries: string[]
  popularQueries: string[]
  categories: string[]
}

export interface AutocompleteSuggestion {
  text: string
  type: 'query' | 'content' | 'category' | 'tag'
  score: number
  metadata?: {
    contentType?: ContentType
    role?: UserRole
    category?: string
  }
}