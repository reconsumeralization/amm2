import { useState, useEffect, useCallback } from 'react'

export interface Notification {
  id: string
  user?: string | {
    id: string
    name?: string
    email?: string
  }
  type: 'user_created' | 'user_updated' | 'user_deleted' | 'employee_created' | 'employee_updated' | 'appointment_booked' | 'appointment_updated' | 'appointment_cancelled' | 'system_alert' | 'security_alert' | 'performance_alert' | 'maintenance_notice'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  message: string
  read: boolean
  readAt?: string
  archived: boolean
  archivedAt?: string
  expiresAt?: string
  actionUrl?: string
  actionText?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface NotificationFilters {
  user?: string
  type?: string
  priority?: string
  read?: boolean
  archived?: boolean
  dateFrom?: string
  dateTo?: string
  sort?: string
  limit?: number
  offset?: number
}

export interface NotificationCreateInput {
  user?: string
  type: Notification['type']
  priority?: Notification['priority']
  title: string
  message: string
  expiresAt?: string
  actionUrl?: string
  actionText?: string
  metadata?: Record<string, any>
}

export interface NotificationUpdateInput extends Partial<NotificationCreateInput> {
  id: string
  read?: boolean
  archived?: boolean
}

export interface NotificationAnalytics {
  overview: {
    totalNotifications: number
    unreadNotifications: number
    readNotifications: number
    archivedNotifications: number
    expiredNotifications: number
  }
  types: Array<{
    type: string
    count: number
    percentage: number
  }>
  priorities: Array<{
    priority: string
    count: number
    percentage: number
  }>
  trends: Array<{
    date: string
    created: number
    read: number
    archived: number
  }>
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null)

  // Fetch notifications
  const fetchNotifications = useCallback(async (filters?: NotificationFilters) => {
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

      const response = await fetch(`/api/notifications?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      setNotifications(data.notifications || data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single notification
  const getNotification = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/notifications/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch notification')
      }

      const notification = await response.json()
      return notification
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notification'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create notification
  const createNotification = useCallback(async (notificationData: NotificationCreateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      })

      if (!response.ok) {
        throw new Error('Failed to create notification')
      }

      const newNotification = await response.json()
      setNotifications(prev => [newNotification, ...prev])
      return newNotification
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create notification'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create broadcast notification
  const createBroadcastNotification = useCallback(async (notificationData: Omit<NotificationCreateInput, 'user'>) => {
    return createNotification(notificationData)
  }, [createNotification])

  // Update notification
  const updateNotification = useCallback(async (notificationData: NotificationUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/notifications/${notificationData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      })

      if (!response.ok) {
        throw new Error('Failed to update notification')
      }

      const updatedNotification = await response.json()
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationData.id ? updatedNotification : notification
        )
      )
      return updatedNotification
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update notification'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      const updatedNotification = await response.json()
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? updatedNotification : notification
        )
      )
      return updatedNotification
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Mark as unread
  const markAsUnread = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/notifications/${id}/unread`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as unread')
      }

      const updatedNotification = await response.json()
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? updatedNotification : notification
        )
      )
      return updatedNotification
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as unread'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Archive notification
  const archiveNotification = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/notifications/${id}/archive`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to archive notification')
      }

      const archivedNotification = await response.json()
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? archivedNotification : notification
        )
      )
      return archivedNotification
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive notification'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete notification')
      }

      setNotifications(prev => prev.filter(notification => notification.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read')
      }

      const result = await response.json()

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          read: true,
          readAt: new Date().toISOString(),
        }))
      )

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all notifications as read'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Archive all read
  const archiveAllRead = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/notifications/archive-all-read', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to archive all read notifications')
      }

      const result = await response.json()

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.read
            ? { ...notification, archived: true, archivedAt: new Date().toISOString() }
            : notification
        )
      )

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive all read notifications'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Bulk operations
  const bulkMarkAsRead = useCallback(async (notificationIds: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/notifications/bulk/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: notificationIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk mark notifications as read')
      }

      const updatedNotifications = await response.json()

      // Update local state
      setNotifications(prev =>
        prev.map(notification => {
          const updated = updatedNotifications.find((n: Notification) => n.id === notification.id)
          return updated || notification
        })
      )

      return updatedNotifications
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk mark notifications as read'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkArchive = useCallback(async (notificationIds: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/notifications/bulk/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: notificationIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk archive notifications')
      }

      const updatedNotifications = await response.json()

      // Update local state
      setNotifications(prev =>
        prev.map(notification => {
          const updated = updatedNotifications.find((n: Notification) => n.id === notification.id)
          return updated || notification
        })
      )

      return updatedNotifications
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk archive notifications'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkDelete = useCallback(async (notificationIds: string[]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/notifications/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: notificationIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk delete notifications')
      }

      setNotifications(prev => prev.filter(notification => !notificationIds.includes(notification.id)))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk delete notifications'
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

      const response = await fetch(`/api/notifications/analytics?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch notification analytics')
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

  // Get unread count
  const getUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/unread-count')
      if (!response.ok) {
        throw new Error('Failed to fetch unread count')
      }

      const data = await response.json()
      return data.count || 0
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch unread count'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    notifications,
    loading,
    error,
    analytics,

    // Actions
    fetchNotifications,
    getNotification,
    createNotification,
    createBroadcastNotification,
    updateNotification,
    markAsRead,
    markAsUnread,
    archiveNotification,
    deleteNotification,
    markAllAsRead,
    archiveAllRead,
    bulkMarkAsRead,
    bulkArchive,
    bulkDelete,
    fetchAnalytics,
    getUnreadCount,
    clearError,
  }
}
