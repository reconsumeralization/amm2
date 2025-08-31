'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { BusinessDocumentation } from '@/types/business-documentation'
import { UserRole } from '@/types/documentation'

export interface PayloadSearchResult {
  results: any[]
  total: number
  collections: Record<string, number>
}

export interface PayloadAnalytics {
  appointments: number
  customers: number
  services: number
  revenue: number
  topServices: any[]
  topStylists: any[]
}

export function usePayloadIntegration() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Sync current user with Payload CMS
   */
  const syncUser = useCallback(async () => {
    if (!session) return null

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payload-integration/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to sync user')
      }

      const result = await response.json()
      return result.user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync user'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [session])

  /**
   * Perform global search across Payload collections
   */
  const globalSearch = useCallback(async (
    query: string,
    collections: string[] = ['services', 'customers', 'stylists', 'documentation'],
    limit: number = 20
  ): Promise<PayloadSearchResult | null> => {
    if (!session || !query.trim()) return null

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        q: query,
        collections: collections.join(','),
        limit: limit.toString()
      })

      const response = await fetch(`/api/payload-integration/search?${params}`)

      if (!response.ok) {
        throw new Error('search failed')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'search failed'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [session])

  /**
   * Get BarberShop analytics from Payload
   */
  const getBarberShopAnalytics = useCallback(async (
    dateRange?: { start: Date; end: Date }
  ): Promise<PayloadAnalytics | null> => {
    if (!session) return null

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (dateRange) {
        params.append('startDate', dateRange.start.toISOString())
        params.append('endDate', dateRange.end.toISOString())
      }

      const response = await fetch(`/api/payload-integration/analytics?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [session])

  /**
   * Sync appointments with external calendar systems
   */
  const syncAppointments = useCallback(async (): Promise<boolean> => {
    if (!session) return false

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payload-integration/sync-appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to sync appointments')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync appointments'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [session])

  /**
   * Get business documentation with role-based filtering
   */
  const getBusinessDocumentation = useCallback(async (
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
  } | null> => {
    if (!session) return null

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','))
          } else {
            params.append(key, value.toString())
          }
        }
      })

      const response = await fetch(`/api/business-documentation?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch documentation')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documentation'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [session])

  /**
   * Create business documentation
   */
  const createBusinessDocumentation = useCallback(async (
    data: Partial<BusinessDocumentation>
  ): Promise<BusinessDocumentation | null> => {
    if (!session) return null

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/business-documentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to create documentation')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create documentation'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [session])

  /**
   * Update business documentation
   */
  const updateBusinessDocumentation = useCallback(async (
    id: string,
    data: Partial<BusinessDocumentation>
  ): Promise<BusinessDocumentation | null> => {
    if (!session) return null

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/business-documentation/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to update documentation')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update documentation'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [session])

  /**
   * Delete business documentation
   */
  const deleteBusinessDocumentation = useCallback(async (
    id: string
  ): Promise<boolean> => {
    if (!session) return false

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/business-documentation/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete documentation')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete documentation'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Auto-sync user when session changes
  useEffect(() => {
    if (session) {
      syncUser()
    }
  }, [session, syncUser])

  return {
    // State
    isLoading,
    error,
    
    // User management
    syncUser,
    
    // search
    globalSearch,
    
    // Analytics
    getBarberShopAnalytics,
    
    // Appointments
    syncAppointments,
    
    // Documentation
    getBusinessDocumentation,
    createBusinessDocumentation,
    updateBusinessDocumentation,
    deleteBusinessDocumentation,
    
    // Utility
    clearError: () => setError(null)
  }
}

export default usePayloadIntegration
