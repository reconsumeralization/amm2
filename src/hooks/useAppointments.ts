import { useState, useEffect, useCallback } from 'react'

export interface Appointment {
  id: string
  title: string
  user: string | {
    id: string
    name?: string
    email?: string
    phone?: string
  }
  tenant: string | {
    id: string
    name: string
  }
  date: string
  service: string | {
    id: string
    name: string
    category: string
    price: number
    duration: number
  }
  stylist?: string | {
    id: string
    name?: string
    specializations?: string[]
  }
  status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduled' | 'completed' | 'no-show'
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'partially-refunded'
  stripePaymentIntentId?: string
  googleEventId?: string
  notes?: string
  internalNotes?: string
  duration?: number
  price?: number
  tips?: number
  totalAmount?: number
  remindersSent?: boolean
  checkInTime?: string
  checkOutTime?: string
  customerRating?: number
  customerFeedback?: string
  stylistNotes?: string
  createdAt: string
  updatedAt: string
}

export interface AppointmentFilters {
  search?: string
  user?: string
  tenant?: string
  stylist?: string
  service?: string
  status?: string
  paymentStatus?: string
  dateFrom?: string
  dateTo?: string
  upcoming?: boolean
  today?: boolean
  thisWeek?: boolean
  sort?: string
  limit?: number
  offset?: number
}

export interface AppointmentCreateInput {
  title?: string
  user: string
  tenant: string
  date: string
  service: string
  stylist?: string
  notes?: string
  internalNotes?: string
  duration?: number
  price?: number
}

export interface AppointmentUpdateInput extends Partial<AppointmentCreateInput> {
  id: string
  status?: Appointment['status']
  paymentStatus?: Appointment['paymentStatus']
  checkInTime?: string
  checkOutTime?: string
  customerRating?: number
  customerFeedback?: string
  stylistNotes?: string
  tips?: number
}

export interface AppointmentAnalytics {
  overview: {
    totalAppointments: number
    confirmedAppointments: number
    pendingAppointments: number
    cancelledAppointments: number
    completedAppointments: number
    totalRevenue: number
    averageAppointmentValue: number
    averageDuration: number
  }
  statusBreakdown: Array<{
    status: string
    count: number
    percentage: number
  }>
  revenueByService: Array<{
    service: string
    appointmentCount: number
    totalRevenue: number
    averagePrice: number
  }>
  stylistPerformance: Array<{
    stylistId: string
    stylistName: string
    appointmentCount: number
    totalRevenue: number
    averageRating: number
    completionRate: number
  }>
  dailyBookings: Array<{
    date: string
    appointmentCount: number
    totalRevenue: number
  }>
  peakHours: Array<{
    hour: number
    appointmentCount: number
  }>
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<AppointmentAnalytics | null>(null)

  // Fetch appointments
  const fetchAppointments = useCallback(async (filters?: AppointmentFilters) => {
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

      const response = await fetch(`/api/appointments?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }

      const data = await response.json()
      setAppointments(data.appointments || data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch appointments'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get single appointment
  const getAppointment = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/appointments/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch appointment')
      }

      const appointment = await response.json()
      return appointment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch appointment'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create appointment
  const createAppointment = useCallback(async (appointmentData: AppointmentCreateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })

      if (!response.ok) {
        throw new Error('Failed to create appointment')
      }

      const newAppointment = await response.json()
      setAppointments(prev => [newAppointment, ...prev])
      return newAppointment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create appointment'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update appointment
  const updateAppointment = useCallback(async (appointmentData: AppointmentUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/appointments/${appointmentData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })

      if (!response.ok) {
        throw new Error('Failed to update appointment')
      }

      const updatedAppointment = await response.json()
      setAppointments(prev =>
        prev.map(appointment =>
          appointment.id === appointmentData.id ? updatedAppointment : appointment
        )
      )
      return updatedAppointment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update appointment'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete appointment
  const deleteAppointment = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete appointment')
      }

      setAppointments(prev => prev.filter(appointment => appointment.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete appointment'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Cancel appointment
  const cancelAppointment = useCallback(async (id: string, reason?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/appointments/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel appointment')
      }

      const cancelledAppointment = await response.json()
      setAppointments(prev =>
        prev.map(appointment =>
          appointment.id === id ? cancelledAppointment : appointment
        )
      )
      return cancelledAppointment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel appointment'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Reschedule appointment
  const rescheduleAppointment = useCallback(async (id: string, newDate: string, newService?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/appointments/${id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: newDate, service: newService }),
      })

      if (!response.ok) {
        throw new Error('Failed to reschedule appointment')
      }

      const rescheduledAppointment = await response.json()
      setAppointments(prev =>
        prev.map(appointment =>
          appointment.id === id ? rescheduledAppointment : appointment
        )
      )
      return rescheduledAppointment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reschedule appointment'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Check-in appointment
  const checkInAppointment = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/appointments/${id}/checkin`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to check in appointment')
      }

      const checkedInAppointment = await response.json()
      setAppointments(prev =>
        prev.map(appointment =>
          appointment.id === id ? checkedInAppointment : appointment
        )
      )
      return checkedInAppointment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check in appointment'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Complete appointment
  const completeAppointment = useCallback(async (id: string, notes?: string, rating?: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/appointments/${id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes, rating }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete appointment')
      }

      const completedAppointment = await response.json()
      setAppointments(prev =>
        prev.map(appointment =>
          appointment.id === id ? completedAppointment : appointment
        )
      )
      return completedAppointment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete appointment'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Bulk operations
  const bulkUpdateAppointments = useCallback(async (appointmentIds: string[], updates: Partial<AppointmentUpdateInput>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/appointments/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: appointmentIds, updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to bulk update appointments')
      }

      const updatedAppointments = await response.json()

      // Update local state
      setAppointments(prev =>
        prev.map(appointment => {
          const updated = updatedAppointments.find((a: Appointment) => a.id === appointment.id)
          return updated || appointment
        })
      )

      return updatedAppointments
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update appointments'
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

      const response = await fetch(`/api/appointments/analytics?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch appointment analytics')
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

  // Get available time slots
  const getAvailableSlots = useCallback(async (date: string, serviceId?: string, stylistId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({ date })
      if (serviceId) queryParams.append('service', serviceId)
      if (stylistId) queryParams.append('stylist', stylistId)

      const response = await fetch(`/api/appointments/available-slots?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch available slots')
      }

      const slots = await response.json()
      return slots
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch available slots'
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
    appointments,
    loading,
    error,
    analytics,

    // Actions
    fetchAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
    rescheduleAppointment,
    checkInAppointment,
    completeAppointment,
    bulkUpdateAppointments,
    fetchAnalytics,
    getAvailableSlots,
    clearError,
  }
}
