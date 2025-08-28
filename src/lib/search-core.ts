// Core search interfaces and types
export interface searchQuery {
  query: string
  filters?: {
    category?: string[]
    type?: string[]
    difficulty?: string[]
    tags?: string[]
  }
  limit?: number
  offset?: number
  sortBy?: 'relevance' | 'date' | 'title'
}

export interface searchResult {
  id: string
  title: string
  description: string
  url: string
  type: 'component' | 'guide' | 'api' | 'reference'
  category: string
  tags: string[]
  relevanceScore: number
  highlights?: string[]
  metadata: {
    author?: string
    lastUpdated?: Date
    difficulty?: string
    estimatedTime?: number
  }
}

export interface searchAnalytics {
  query: string
  resultsCount: number
  filters: searchQuery['filters']
  responseTime: number
  timestamp: Date
  userAgent?: string
  sessionId?: string
}
