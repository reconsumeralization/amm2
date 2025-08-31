import { useState, useEffect, useCallback } from 'react'

export interface FAQ {
  id: string
  question: string
  answer: string
  category?: string
  tags?: string[]
  featured?: boolean
  published?: boolean
  publishedAt?: string
  displayOrder?: number
  viewCount?: number
  helpfulCount?: number
  notHelpfulCount?: number
  seoTitle?: string
  seoDescription?: string
  relatedFAQs?: string[]
  createdAt: string
  updatedAt: string
}

export interface FAQFilters {
  search?: string
  category?: string
  tags?: string[]
  featured?: boolean
  published?: boolean
  sort?: string
  limit?: number
  offset?: number
}

export interface FAQCreateInput {
  question: string
  answer: string
  category?: string
  tags?: string[]
  featured?: boolean
  published?: boolean
  publishedAt?: string
  displayOrder?: number
  seoTitle?: string
  seoDescription?: string
  relatedFAQs?: string[]
}

export interface FAQUpdateInput extends Partial<FAQCreateInput> {
  id: string
}

export interface FAQAnalytics {
  overview: {
    totalFAQs: number
    publishedFAQs: number
    featuredFAQs: number
    totalViews: number
    totalHelpfulVotes: number
    averageHelpfulRate: number
  }
  categories: Array<{
    category: string
    faqCount: number
    totalViews: number
    averageHelpfulRate: number
  }>
  performance: Array<{
    faqId: string
    question: string
    views: number
    helpfulCount: number
    notHelpfulCount: number
    helpfulRate: number
  }>
  searchQueries: Array<{
    query: string
    count: number
    resultsFound: number
  }>
}

export function useFAQ() {
  const [faqs, setFAQs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<FAQAnalytics | null>(null)

  // Fetch FAQs
  const fetchFAQs = useCallback(async (filters?: FAQFilters) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v.toString()))
            } else {
              queryParams.append(key, value.toString())
            }
          }
        })
      }

      const response = await fetch(`/api/faq?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch FAQs')
      }

      const data = await response.json()
      setFAQs(data.faqs || data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch FAQs'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single FAQ
  const getFAQ = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/faq/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch FAQ')
      }

      const faq = await response.json()
      return faq
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch FAQ'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Search FAQs
  const searchFAQs = useCallback(async (query: string, category?: string) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({ q: query })
      if (category) queryParams.append('category', category)

      const response = await fetch(`/api/faq/search?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to search FAQs')
      }

      const results = await response.json()
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search FAQs'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create FAQ
  const createFAQ = useCallback(async (faqData: FAQCreateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faqData),
      })

      if (!response.ok) {
        throw new Error('Failed to create FAQ')
      }

      const newFAQ = await response.json()
      setFAQs(prev => [newFAQ, ...prev])
      return newFAQ
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create FAQ'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update FAQ
  const updateFAQ = useCallback(async (faqData: FAQUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/faq/${faqData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faqData),
      })

      if (!response.ok) {
        throw new Error('Failed to update FAQ')
      }

      const updatedFAQ = await response.json()
      setFAQs(prev =>
        prev.map(faq =>
          faq.id === faqData.id ? updatedFAQ : faq
        )
      )
      return updatedFAQ
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update FAQ'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete FAQ
  const deleteFAQ = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/faq/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete FAQ')
      }

      setFAQs(prev => prev.filter(faq => faq.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete FAQ'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Publish FAQ
  const publishFAQ = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/faq/${id}/publish`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to publish FAQ')
      }

      const publishedFAQ = await response.json()
      setFAQs(prev =>
        prev.map(faq =>
          faq.id === id ? publishedFAQ : faq
        )
      )
      return publishedFAQ
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to publish FAQ'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Unpublish FAQ
  const unpublishFAQ = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/faq/${id}/unpublish`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to unpublish FAQ')
      }

      const unpublishedFAQ = await response.json()
      setFAQs(prev =>
        prev.map(faq =>
          faq.id === id ? unpublishedFAQ : faq
        )
      )
      return unpublishedFAQ
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unpublish FAQ'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Mark as helpful
  const markHelpful = useCallback(async (id: string, helpful: boolean) => {
    try {
      const response = await fetch(`/api/faq/${id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ helpful }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      const result = await response.json()

      // Update local state
      setFAQs(prev =>
        prev.map(faq =>
          faq.id === id
            ? {
                ...faq,
                helpfulCount: helpful ? (faq.helpfulCount || 0) + 1 : faq.helpfulCount,
                notHelpfulCount: !helpful ? (faq.notHelpfulCount || 0) + 1 : faq.notHelpfulCount,
              }
            : faq
        )
      )

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit feedback'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Bulk operations
  const bulkUpdateFAQs = useCallback(async (faqIds: string[], updates: Partial<FAQCreateInput>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/faq/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: faqIds, updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk update FAQs')
      }

      const updatedFAQs = await response.json()

      // Update local state
      setFAQs(prev =>
        prev.map(faq => {
          const updated = updatedFAQs.find((f: FAQ) => f.id === faq.id)
          return updated || faq
        })
      )

      return updatedFAQs
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update FAQs'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkDeleteFAQs = useCallback(async (faqIds: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/faq/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: faqIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk delete FAQs')
      }

      setFAQs(prev => prev.filter(faq => !faqIds.includes(faq.id)))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk delete FAQs'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get categories
  const getCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/faq/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      const categories = await response.json()
      return categories
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Reorder FAQs
  const reorderFAQs = useCallback(async (faqIds: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/faq/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: faqIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder FAQs')
      }

      const result = await response.json()

      // Update local state with new order
      setFAQs(prev => {
        const reordered = faqIds.map(id => prev.find(faq => faq.id === id)).filter(Boolean) as FAQ[]
        return reordered
      })

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder FAQs'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Analytics
  const fetchAnalytics = useCallback(async (dateRange?: { start: string; end: string }) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      if (dateRange) {
        queryParams.append('startDate', dateRange.start)
        queryParams.append('endDate', dateRange.end)
      }

      const response = await fetch(`/api/faq/analytics?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch FAQ analytics')
      }

      const analyticsData = await response.json()
      setAnalytics(analyticsData)
      return analyticsData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    faqs,
    loading,
    error,
    analytics,

    // Actions
    fetchFAQs,
    getFAQ,
    searchFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    publishFAQ,
    unpublishFAQ,
    markHelpful,
    bulkUpdateFAQs,
    bulkDeleteFAQs,
    getCategories,
    reorderFAQs,
    fetchAnalytics,
    clearError,
  }
}
