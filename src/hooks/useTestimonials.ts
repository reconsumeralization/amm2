import { useState, useEffect, useCallback } from 'react'

export interface Testimonial {
  id: string
  content: string
  barber: {
    id: string
    name: string
  }
  client?: {
    id: string
    name: string
    email?: string
  }
  likes: number
  tenant: {
    id: string
    name: string
  }
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

export interface TestimonialFilters {
  search?: string
  barber?: string
  client?: string
  status?: 'pending' | 'approved' | 'rejected'
  tenant?: string
  dateFrom?: string
  dateTo?: string
  sort?: string
  limit?: number
  offset?: number
}

export interface TestimonialCreateInput {
  content: string
  barber: string
  client?: string
  tenant: string
  status?: 'pending' | 'approved' | 'rejected'
}

export interface TestimonialUpdateInput extends Partial<TestimonialCreateInput> {
  id: string
  likes?: number
}

export interface TestimonialAnalytics {
  overview: {
    totalTestimonials: number
    approvedTestimonials: number
    pendingTestimonials: number
    rejectedTestimonials: number
    totalLikes: number
  }
  status: {
    pending: number
    approved: number
    rejected: number
  }
  barbers: Array<{
    barberId: string
    barberName: string
    testimonialCount: number
    totalLikes: number
  }>
  tenants: Array<{
    tenantId: string
    tenantName: string
    testimonialCount: number
    totalLikes: number
  }>
  trends: Array<{
    date: string
    count: number
    likes: number
  }>
}

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<TestimonialAnalytics | null>(null)

  // Fetch testimonials
  const fetchTestimonials = useCallback(async (filters?: TestimonialFilters) => {
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

      const response = await fetch(`/api/testimonials?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch testimonials')
      }

      const data = await response.json()
      setTestimonials(data.docs || data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch testimonials'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single testimonial
  const getTestimonial = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/testimonials/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch testimonial')
      }

      const testimonial = await response.json()
      return testimonial
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch testimonial'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create testimonial
  const createTestimonial = useCallback(async (testimonialData: TestimonialCreateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonialData),
      })

      if (!response.ok) {
        throw new Error('Failed to create testimonial')
      }

      const newTestimonial = await response.json()
      setTestimonials(prev => [newTestimonial, ...prev])
      return newTestimonial
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create testimonial'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update testimonial
  const updateTestimonial = useCallback(async (testimonialData: TestimonialUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/testimonials/${testimonialData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonialData),
      })

      if (!response.ok) {
        throw new Error('Failed to update testimonial')
      }

      const updatedTestimonial = await response.json()
      setTestimonials(prev =>
        prev.map(testimonial =>
          testimonial.id === testimonialData.id ? updatedTestimonial : testimonial
        )
      )
      return updatedTestimonial
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update testimonial'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete testimonial
  const deleteTestimonial = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete testimonial')
      }

      setTestimonials(prev => prev.filter(testimonial => testimonial.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete testimonial'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Approve testimonial
  const approveTestimonial = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve testimonial')
      }

      const approvedTestimonial = await response.json()
      setTestimonials(prev =>
        prev.map(testimonial =>
          testimonial.id === id ? approvedTestimonial : testimonial
        )
      )
      return approvedTestimonial
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve testimonial'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Reject testimonial
  const rejectTestimonial = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject testimonial')
      }

      const rejectedTestimonial = await response.json()
      setTestimonials(prev =>
        prev.map(testimonial =>
          testimonial.id === id ? rejectedTestimonial : testimonial
        )
      )
      return rejectedTestimonial
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject testimonial'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Like testimonial
  const likeTestimonial = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/testimonials/${id}/like`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to like testimonial')
      }

      const result = await response.json()

      // Update local state
      setTestimonials(prev =>
        prev.map(testimonial =>
          testimonial.id === id
            ? {
                ...testimonial,
                likes: (testimonial.likes || 0) + 1,
              }
            : testimonial
        )
      )

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to like testimonial'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Bulk operations
  const bulkUpdateTestimonials = useCallback(async (testimonialIds: string[], updates: Partial<TestimonialUpdateInput>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/testimonials/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: testimonialIds, updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk update testimonials')
      }

      const updatedTestimonials = await response.json()

      // Update local state
      setTestimonials(prev =>
        prev.map(testimonial => {
          const updated = updatedTestimonials.find((t: Testimonial) => t.id === testimonial.id)
          return updated || testimonial
        })
      )

      return updatedTestimonials
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update testimonials'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkDeleteTestimonials = useCallback(async (testimonialIds: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/testimonials/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: testimonialIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk delete testimonials')
      }

      setTestimonials(prev => prev.filter(testimonial => !testimonialIds.includes(testimonial.id)))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk delete testimonials'
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

      const response = await fetch(`/api/testimonials/analytics?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch testimonial analytics')
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
    testimonials,
    loading,
    error,
    analytics,

    // Actions
    fetchTestimonials,
    getTestimonial,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    approveTestimonial,
    rejectTestimonial,
    likeTestimonial,
    bulkUpdateTestimonials,
    bulkDeleteTestimonials,
    fetchAnalytics,
    clearError,
  }
}
