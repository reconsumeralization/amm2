/**
 * Documentation Search Types
 * Comprehensive search functionality with role-based filtering and analytics
 */

import { UserRole } from './documentation'

export interface SearchQuery {
  query: string
  filters: SearchFilters
  pagination: SearchPagination
  sorting: SearchSorting
}

export interface SearchFilters {
  roles?: UserRole[]
  categories?: string[]
  tags?: string[]
  contentTypes?: ContentType[]
  difficulty?: DifficultyLevel[]
  dateRange?: DateRange
  authors?: string[]
  sections?: string[]
}

export interface SearchPagination {
  page: number
  limit: number
  offset: number
}

export interface SearchSorting {
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

export interface SearchResult {
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
  highlights: SearchHighlight[]
  metadata: SearchResultMetadata
}

export interface SearchHighlight {
  field: string
  fragments: string[]
}

export interface SearchResultMetadata {
  views: number
  rating: number
  completionRate: number
  feedbackCount: number
  isNew: boolean
  isUpdated: boolean
  isDeprecated: boolean
}

export interface SearchResponse {
  results: SearchResult[]
  totalCount: number
  facets: SearchFacets
  suggestions: SearchSuggestion[]
  analytics: SearchAnalytics
  pagination: SearchPagination
  query: SearchQuery
  executionTime: number
}

export interface SearchFacets {
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

export interface SearchSuggestion {
  text: string
  type: 'correction' | 'completion' | 'related'
  score: number
}

export interface SearchAnalytics {
  queryId: string
  timestamp: Date
  userRole: UserRole
  resultsCount: number
  hasResults: boolean
  clickedResults: string[]
  searchTime: number
}

export interface SearchRankingConfig {
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

export interface SearchIndexDocument {
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
  searchableText: string
  keywords: string[]
}

export interface SearchConfig {
  provider: 'local' | 'algolia' | 'elasticsearch'
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
  rankingConfig: SearchRankingConfig
}

export interface SearchMetrics {
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

export interface SearchFallback {
  type: 'no_results' | 'error' | 'timeout'
  message: string
  suggestions: SearchSuggestion[]
  alternativeQueries: string[]
  relatedContent: SearchResult[]
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
