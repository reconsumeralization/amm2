import { useState, useEffect, useCallback } from 'react'
import { StylistCreateInput, StylistUpdateInput } from '@/lib/validation'

export interface Stylist {
  id: string
  user?: string
  name?: string
  bio?: string
  profileImage?: {
    id: string
    url: string
  }
  portfolio?: Array<{
    image: {
      id: string
      url: string
    }
    title: string
    description?: string
    service?: string
  }>
  specializations?: string[]
  experience?: {
    yearsExperience?: number
    certifications?: Array<{
      name: string
      issuingOrganization?: string
      year?: number
      certificate?: {
        id: string
        url: string
      }
    }>
    awards?: Array<{
      name: string
      year?: number
      description?: string
    }>
  }
  schedule?: {
    workDays?: string[]
    workHours?: {
      startTime?: string
      endTime?: string
      breakStart?: string
      breakEnd?: string
    }
    timeOff?: Array<{
      startDate: string
      endDate: string
      reason?: string
      notes?: string
    }>
    maxAppointmentsPerDay?: number
  }
  performance?: {
    rating?: number
    reviewCount?: number
    totalAppointments?: number
    onTimeRate?: number
    averageServiceTime?: number
  }
  pricing?: {
    customPricing?: Array<{
      service: string
      price: number
      duration?: number
    }>
    hourlyRate?: number
  }
  socialMedia?: {
    instagram?: string
    facebook?: string
    website?: string
  }
  isActive?: boolean
  featured?: boolean
  displayOrder?: number
  createdAt: string
  updatedAt: string
}

export interface StylistFilters {
  search?: string
  specialization?: string
  featured?: boolean
  active?: boolean
  sort?: string
}

export interface StylistAnalytics {
  overview: {
    totalStylists: number
    activeStylists: number
    featuredStylists: number
    inactiveStylists: number
    totalAppointments: number
    totalReviews: number
    averageRating: number
    averageAppointmentsPerStylist: number
  }
  performance: {
    topRatedStylists: Array<{
      id: string
      name: string
      rating: number
      totalAppointments: number
      reviewCount: number
    }>
    topBookedStylists: Array<{
      id: string
      name: string
      totalAppointments: number
      rating: number
    }>
    experienceDistribution: {
      '0-2': number
      '3-5': number
      '6-10': number
      '10+': number
    }
    specializationStats: { [key: string]: number }
  }
  dateRange?: {
    startDate?: string
    endDate?: string
  }
}

export interface AvailabilitySlot {
  available: boolean
  stylistId: string
  date: string
  availableSlots: string[]
  workHours: {
    start: string
    end: string
    breakStart: string
    breakEnd: string
  }
  serviceDuration: number
  totalSlots: number
  dayOfWeek: string
  reason?: string
}

// Hook for managing stylist data
export function useStylists() {
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalDocs, setTotalDocs] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchStylists = useCallback(async (
    filters: StylistFilters = {},
    page: number = 1,
    limit: number = 20
  ) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [key, String(value)])
        )
      })

      const response = await fetch(`/api/stylists?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch stylists')
      }

      const data = await response.json()

      setStylists(data.stylists || [])
      setTotalDocs(data.total || 0)
      setTotalPages(data.totalPages || 0)
      setCurrentPage(data.page || 1)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching stylists:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createStylist = useCallback(async (stylistData: StylistCreateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stylists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stylistData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create stylist')
      }

      const data = await response.json()

      // Add the new stylist to the list
      setStylists(prev => [data.stylist, ...prev])
      setTotalDocs(prev => prev + 1)

      return data.stylist
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateStylist = useCallback(async (id: string, stylistData: StylistUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/stylists/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stylistData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update stylist')
      }

      const data = await response.json()

      // Update the stylist in the list
      setStylists(prev => prev.map(stylist =>
        stylist.id === id ? data.stylist : stylist
      ))

      return data.stylist
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteStylist = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/stylists/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete stylist')
      }

      // Remove the stylist from the list
      setStylists(prev => prev.filter(stylist => stylist.id !== id))
      setTotalDocs(prev => prev - 1)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    stylists,
    loading,
    error,
    totalDocs,
    totalPages,
    currentPage,
    fetchStylists,
    createStylist,
    updateStylist,
    deleteStylist,
  }
}

// Hook for stylist analytics
export function useStylistAnalytics() {
  const [analytics, setAnalytics] = useState<StylistAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const response = await fetch(`/api/stylists/analytics?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch stylist analytics')
      }

      const data = await response.json()
      setAnalytics(data)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching stylist analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
  }
}

// Hook for individual stylist data
export function useStylist(id: string | null) {
  const [stylist, setStylist] = useState<Stylist | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStylist = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/stylists/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          setStylist(null)
          return
        }
        throw new Error('Failed to fetch stylist')
      }

      const data = await response.json()
      setStylist(data.stylist)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching stylist:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchStylist()
  }, [fetchStylist])

  return {
    stylist,
    loading,
    error,
    refetch: fetchStylist,
  }
}

// Hook for stylist availability
export function useStylistAvailability() {
  const [availability, setAvailability] = useState<AvailabilitySlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkAvailability = useCallback(async (
    stylistId: string,
    date: string,
    serviceId?: string
  ) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        stylistId,
        date,
      })

      if (serviceId) {
        params.set('serviceId', serviceId)
      }

      const response = await fetch(`/api/stylists/availability?${params}`)

      if (!response.ok) {
        throw new Error('Failed to check stylist availability')
      }

      const data = await response.json()
      setAvailability(data)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error checking stylist availability:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    availability,
    loading,
    error,
    checkAvailability,
  }
}

// Hook for searching stylists
export function useStylistSearch() {
  const [searchResults, setSearchResults] = useState<Stylist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalResults, setTotalResults] = useState(0)

  const searchStylists = useCallback(async (
    query: string,
    specialization?: string,
    featured?: boolean,
    limit: number = 20
  ) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      setTotalResults(0)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
      })

      if (specialization) params.set('specialization', specialization)
      if (featured) params.set('featured', 'true')

      const response = await fetch(`/api/stylists/search?${params}`)

      if (!response.ok) {
        throw new Error('Failed to search stylists')
      }

      const data = await response.json()
      setSearchResults(data.results || [])
      setTotalResults(data.total || 0)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error searching stylists:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    searchResults,
    loading,
    error,
    totalResults,
    searchStylists,
  }
}
