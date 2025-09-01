import { useState, useEffect, useCallback } from 'react'

export interface User {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  avatar?: {
    id: string
    url: string
  }
  role: 'admin' | 'manager' | 'barber' | 'customer'
  isActive: boolean
  emailVerified?: boolean
  lastLogin?: string
  loginCount?: number
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  preferences?: {
    language?: string
    timezone?: string
    dateFormat?: string
    currency?: string
    notifications?: {
      email?: boolean
      sms?: boolean
      push?: boolean
    }
  }
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface UserFilters {
  search?: string
  role?: string
  isActive?: boolean
  emailVerified?: boolean
  dateFrom?: string
  dateTo?: string
  sort?: string
  limit?: number
  offset?: number
}

export interface UserCreateInput {
  email: string
  name?: string
  firstName?: string
  lastName?: string
  role?: 'admin' | 'manager' | 'barber' | 'customer'
  isActive?: boolean
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  preferences?: {
    language?: string
    timezone?: string
    dateFormat?: string
    currency?: string
    notifications?: {
      email?: boolean
      sms?: boolean
      push?: boolean
    }
  }
  metadata?: Record<string, any>
}

export interface UserUpdateInput extends Partial<UserCreateInput> {
  id: string
}

export interface UserAnalytics {
  overview: {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    verifiedUsers: number
    totalLogins: number
  }
  roles: Array<{
    role: string
    count: number
    percentage: number
  }>
  activity: {
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
    averageSessionDuration: number
  }
  registrationTrends: Array<{
    date: string
    count: number
  }>
  loginTrends: Array<{
    date: string
    count: number
  }>
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null)

  // Fetch users
  const fetchUsers = useCallback(async (filters?: UserFilters) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v: any) => queryParams.append(key, v.toString()))
            } else {
              queryParams.append(key, value.toString())
            }
          }
        })
      }

      const response = await fetch(`/api/users?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users || data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single user
  const getUser = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }

      const user = await response.json()
      return user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create user
  const createUser = useCallback(async (userData: UserCreateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error('Failed to create user')
      }

      const newUser = await response.json()
      setUsers(prev => [newUser, ...prev])
      return newUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update user
  const updateUser = useCallback(async (userData: UserUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      const updatedUser = await response.json()
      setUsers(prev =>
        prev.map((user: User) =>
          user.id === userData.id ? updatedUser : user
        )
      )
      return updatedUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete user
  const deleteUser = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      setUsers(prev => prev.filter(user => user.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Activate/Deactivate user
  const toggleUserStatus = useCallback(async (id: string, isActive: boolean) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user status')
      }

      const updatedUser = await response.json()
      setUsers(prev =>
        prev.map((user: User) =>
          user.id === id ? updatedUser : user
        )
      )
      return updatedUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user status'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Change user role
  const changeUserRole = useCallback(async (id: string, role: User['role']) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        throw new Error('Failed to change user role')
      }

      const updatedUser = await response.json()
      setUsers(prev =>
        prev.map(user =>
          user.id === id ? updatedUser : user
        )
      )
      return updatedUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change user role'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Reset user password
  const resetUserPassword = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${id}/reset-password`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to reset user password')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset user password'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Send email verification
  const sendEmailVerification = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${id}/verify-email`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to send email verification')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email verification'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Bulk operations
  const bulkUpdateUsers = useCallback(async (userIds: string[], updates: Partial<UserUpdateInput>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/users/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: userIds, updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk update users')
      }

      const updatedUsers = await response.json()

      // Update local state
      setUsers(prev =>
        prev.map(user => {
          const updated = updatedUsers.find((u: User) => u.id === user.id)
          return updated || user
        })
      )

      return updatedUsers
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update users'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkDeleteUsers = useCallback(async (userIds: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/users/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: userIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk delete users')
      }

      setUsers(prev => prev.filter(user => !userIds.includes(user.id)))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk delete users'
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

      const response = await fetch(`/api/users/analytics?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user analytics')
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
    users,
    loading,
    error,
    analytics,

    // Actions
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    changeUserRole,
    resetUserPassword,
    sendEmailVerification,
    bulkUpdateUsers,
    bulkDeleteUsers,
    fetchAnalytics,
    clearError,
  }
}
