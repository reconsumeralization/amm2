import { useState, useEffect, useCallback } from 'react'

export interface Service {
  id: string
  name: string
  category: 'haircut' | 'color' | 'treatment' | 'beard' | 'special'
  description: string
  price: number
  duration: number // in minutes
  bufferTime?: number // time needed after service
  isActive: boolean
  isPopular?: boolean
  featuredOrder?: number
  image?: {
    id: string
    url: string
    alt?: string
  }
  prerequisites?: string[]
  preparation?: string
  aftercare?: string
  contraindications?: string[]
  requiredProducts?: string[]
  skillLevel?: 'beginner' | 'intermediate' | 'advanced'
  maxAdvanceBooking?: number // days
  minAdvanceBooking?: number // hours
  cancellationPolicy?: string
  bookingInstructions?: string
  seoTitle?: string
  seoDescription?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface ServiceFilters {
  search?: string
  category?: string
  priceMin?: number
  priceMax?: number
  durationMin?: number
  durationMax?: number
  isActive?: boolean
  isPopular?: boolean
  skillLevel?: string
  sort?: string
  limit?: number
  offset?: number
}

export interface ServiceCreateInput {
  name: string
  category: 'haircut' | 'color' | 'treatment' | 'beard' | 'special'
  description: string
  price: number
  duration: number
  bufferTime?: number
  isActive?: boolean
  isPopular?: boolean
  featuredOrder?: number
  prerequisites?: string[]
  preparation?: string
  aftercare?: string
  contraindications?: string[]
  requiredProducts?: string[]
  skillLevel?: 'beginner' | 'intermediate' | 'advanced'
  maxAdvanceBooking?: number
  minAdvanceBooking?: number
  cancellationPolicy?: string
  bookingInstructions?: string
  seoTitle?: string
  seoDescription?: string
  tags?: string[]
}

export interface ServiceUpdateInput extends Partial<ServiceCreateInput> {
  id: string
}

export interface ServiceAnalytics {
  overview: {
    totalServices: number
    activeServices: number
    popularServices: number
    totalBookings: number
    totalRevenue: number
    averageServiceTime: number
    averagePrice: number
  }
  categories: Array<{
    category: string
    serviceCount: number
    totalBookings: number
    totalRevenue: number
    averagePrice: number
  }>
  performance: Array<{
    serviceId: string
    serviceName: string
    bookingCount: number
    revenue: number
    averageRating: number
    averageDuration: number
    popularityRank: number
  }>
  bookingTrends: Array<{
    date: string
    totalBookings: number
    totalRevenue: number
  }>
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<ServiceAnalytics | null>(null)

  // Fetch services
  const fetchServices = useCallback(async (filters?: ServiceFilters) => {
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

      const response = await fetch(`/api/services?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()
      setServices(data.services || data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch services'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single service
  const getService = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/services/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch service')
      }

      const service = await response.json()
      return service
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch service'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create service
  const createService = useCallback(async (serviceData: ServiceCreateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      })

      if (!response.ok) {
        throw new Error('Failed to create service')
      }

      const newService = await response.json()
      setServices(prev => [newService, ...prev])
      return newService
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create service'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update service
  const updateService = useCallback(async (serviceData: ServiceUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/services/${serviceData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      })

      if (!response.ok) {
        throw new Error('Failed to update service')
      }

      const updatedService = await response.json()
      setServices(prev =>
        prev.map(service =>
          service.id === serviceData.id ? updatedService : service
        )
      )
      return updatedService
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update service'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete service
  const deleteService = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete service')
      }

      setServices(prev => prev.filter(service => service.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete service'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Duplicate service
  const duplicateService = useCallback(async (id: string, newName?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/services/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      })

      if (!response.ok) {
        throw new Error('Failed to duplicate service')
      }

      const duplicatedService = await response.json()
      setServices(prev => [duplicatedService, ...prev])
      return duplicatedService
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate service'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Bulk operations
  const bulkUpdateServices = useCallback(async (serviceIds: string[], updates: Partial<ServiceCreateInput>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/services/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: serviceIds, updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk update services')
      }

      const updatedServices = await response.json()

      // Update local state
      setServices(prev =>
        prev.map(service => {
          const updated = updatedServices.find((s: Service) => s.id === service.id)
          return updated || service
        })
      )

      return updatedServices
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update services'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkDeleteServices = useCallback(async (serviceIds: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/services/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: serviceIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk delete services')
      }

      setServices(prev => prev.filter(service => !serviceIds.includes(service.id)))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk delete services'
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

      const response = await fetch(`/api/services/analytics?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch service analytics')
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
    services,
    loading,
    error,
    analytics,

    // Actions
    fetchServices,
    getService,
    createService,
    updateService,
    deleteService,
    duplicateService,
    bulkUpdateServices,
    bulkDeleteServices,
    fetchAnalytics,
    clearError,
  }
}
