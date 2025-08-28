import { useState, useEffect, useCallback } from 'react'
import { CustomerCreateInput, CustomerUpdateInput } from '@/lib/validation'

export interface Customer {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone?: string
  secondaryPhone?: string
  dateOfBirth?: string
  avatar?: {
    id: string
    url: string
  }
  hairProfile?: {
    hairType?: string
    hairTexture?: string
    hairColor?: string
    preferredStyles?: string[]
    allergies?: string
  }
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  preferences?: {
    communicationMethod?: 'email' | 'sms' | 'phone'
    marketingConsent?: boolean
    appointmentReminders?: boolean
    preferredStylist?: string
    notes?: string
  }
  loyaltyProgram?: {
    loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum'
    points?: number
    totalSpent?: number
    memberSince?: string
  }
  emergencyContact?: {
    name?: string
    relationship?: string
    phone?: string
  }
  isActive?: boolean
  lastVisit?: string
  nextAppointment?: string
  createdAt: string
  updatedAt: string
}

export interface CustomerFilters {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'all'
  sort?: string
}

export interface CustomerAnalytics {
  overview: {
    totalCustomers: number
    activeCustomers: number
    inactiveCustomers: number
    newCustomers: number
    recentCustomers: number
    growthRate: string
  }
  loyalty: {
    tiers: {
      bronze: number
      silver: number
      gold: number
      platinum: number
    }
    totalPoints: number
    totalSpent: number
    averageSpentPerCustomer: string
  }
  topSpenders: Array<{
    id: string
    name: string
    email: string
    totalSpent: number
    tier: string
    memberSince?: string
  }>
  dateRange?: {
    startDate?: string
    endDate?: string
  }
}

// Hook for managing customer data
export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalDocs, setTotalDocs] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchCustomers = useCallback(async (
    filters: CustomerFilters = {},
    page: number = 1,
    limit: number = 10
  ) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      })

      const response = await fetch(`/api/customers?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }

      const data = await response.json()

      setCustomers(data.customers || [])
      setTotalDocs(data.totalDocs || 0)
      setTotalPages(data.totalPages || 0)
      setCurrentPage(data.page || 1)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createCustomer = useCallback(async (customerData: CustomerCreateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create customer')
      }

      const data = await response.json()

      // Add the new customer to the list
      setCustomers(prev => [data.customer, ...prev])
      setTotalDocs(prev => prev + 1)

      return data.customer
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateCustomer = useCallback(async (id: string, customerData: CustomerUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update customer')
      }

      const data = await response.json()

      // Update the customer in the list
      setCustomers(prev => prev.map(customer =>
        customer.id === id ? data.customer : customer
      ))

      return data.customer
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteCustomer = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete customer')
      }

      // Remove the customer from the list
      setCustomers(prev => prev.filter(customer => customer.id !== id))
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
    customers,
    loading,
    error,
    totalDocs,
    totalPages,
    currentPage,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  }
}

// Hook for customer analytics
export function useCustomerAnalytics() {
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const response = await fetch(`/api/customers/analytics?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch customer analytics')
      }

      const data = await response.json()
      setAnalytics(data)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching customer analytics:', err)
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

// Hook for individual customer data
export function useCustomer(id: string | null) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomer = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/customers/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          setCustomer(null)
          return
        }
        throw new Error('Failed to fetch customer')
      }

      const data = await response.json()
      setCustomer(data.customer)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching customer:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  return {
    customer,
    loading,
    error,
    refetch: fetchCustomer,
  }
}
