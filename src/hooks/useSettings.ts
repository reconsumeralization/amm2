import { useState, useEffect, useCallback } from 'react'

export interface Settings {
  id: string
  name: string
  tenant?: string | {
    id: string
    name: string
  }
  chatbot: {
    enabled: boolean
    displayPaths: Array<{ path: string }>
    greetingMessage?: string
    offlineMessage?: string
    businessHours?: {
      enabled: boolean
      timezone: string
      schedule: Array<{
        day: string
        startTime: string
        endTime: string
        isOpen: boolean
      }>
    }
  }
  booking: {
    enabled: boolean
    requireLogin: boolean
    advanceBookingDays: number
    cancellationHours: number
    reminderHours: number
    maxAppointmentsPerDay: number
    bufferTimeMinutes: number
    workingHours: {
      startTime: string
      endTime: string
    }
    blockedDates: string[]
    holidays: Array<{
      date: string
      name: string
      isClosed: boolean
    }>
  }
  notifications: {
    enabled: boolean
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    smtpSettings?: {
      host: string
      port: number
      secure: boolean
      user: string
      pass: string
    }
    smsSettings?: {
      provider: string
      apiKey: string
      senderId: string
    }
    templates: {
      appointmentConfirmation?: string
      appointmentReminder?: string
      appointmentCancellation?: string
      paymentConfirmation?: string
    }
  }
  payments: {
    enabled: boolean
    currency: string
    stripePublishableKey?: string
    stripeSecretKey?: string
    paypalClientId?: string
    paypalClientSecret?: string
    paymentMethods: string[]
    taxRate: number
    depositRequired: boolean
    depositPercentage?: number
  }
  business: {
    name: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    phone: string
    email: string
    website?: string
    socialMedia: {
      facebook?: string
      instagram?: string
      twitter?: string
      linkedin?: string
    }
    license?: string
    insurance?: string
  }
  seo: {
    title?: string
    description?: string
    keywords?: string[]
    ogImage?: {
      id: string
      url: string
    }
    favicon?: {
      id: string
      url: string
    }
  }
  features: {
    gallery: boolean
    blog: boolean
    testimonials: boolean
    loyaltyProgram: boolean
    giftCards: boolean
    onlineStore: boolean
  }
  maintenance: {
    enabled: boolean
    message?: string
    estimatedTime?: string
  }
  createdAt: string
  updatedAt: string
}

export interface SettingsFilters {
  tenant?: string
  sort?: string
}

export interface SettingsCreateInput {
  name?: string
  tenant?: string
  chatbot?: Partial<Settings['chatbot']>
  booking?: Partial<Settings['booking']>
  notifications?: Partial<Settings['notifications']>
  payments?: Partial<Settings['payments']>
  business?: Partial<Settings['business']>
  seo?: Partial<Settings['seo']>
  features?: Partial<Settings['features']>
  maintenance?: Partial<Settings['maintenance']>
}

export interface SettingsUpdateInput extends Partial<SettingsCreateInput> {
  id: string
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch settings
  const fetchSettings = useCallback(async (filters?: SettingsFilters) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`/api/settings?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const data = await response.json()
      if (data.settings && data.settings.length > 0) {
        setSettings(data.settings[0]) // Take the first/global settings
      } else if (data) {
        setSettings(data)
      }
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch settings'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get settings by tenant
  const getSettingsByTenant = useCallback(async (tenantId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      if (tenantId) {
        queryParams.append('tenant', tenantId)
      }

      const response = await fetch(`/api/settings?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tenant settings')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tenant settings'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create settings
  const createSettings = useCallback(async (settingsData: SettingsCreateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      })

      if (!response.ok) {
        throw new Error('Failed to create settings')
      }

      const newSettings = await response.json()
      setSettings(newSettings)
      return newSettings
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create settings'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update settings
  const updateSettings = useCallback(async (settingsData: SettingsUpdateInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/settings/${settingsData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
      return updatedSettings
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update chatbot settings
  const updateChatbotSettings = useCallback(async (chatbotSettings: Partial<Settings['chatbot']>) => {
    if (!settings) {
      throw new Error('Settings not loaded')
    }

    return updateSettings({
      id: settings.id,
      chatbot: {
        ...settings.chatbot,
        ...chatbotSettings,
      },
    })
  }, [settings, updateSettings])

  // Update booking settings
  const updateBookingSettings = useCallback(async (bookingSettings: Partial<Settings['booking']>) => {
    if (!settings) {
      throw new Error('Settings not loaded')
    }

    return updateSettings({
      id: settings.id,
      booking: {
        ...settings.booking,
        ...bookingSettings,
      },
    })
  }, [settings, updateSettings])

  // Update notification settings
  const updateNotificationSettings = useCallback(async (notificationSettings: Partial<Settings['notifications']>) => {
    if (!settings) {
      throw new Error('Settings not loaded')
    }

    return updateSettings({
      id: settings.id,
      notifications: {
        ...settings.notifications,
        ...notificationSettings,
      },
    })
  }, [settings, updateSettings])

  // Update payment settings
  const updatePaymentSettings = useCallback(async (paymentSettings: Partial<Settings['payments']>) => {
    if (!settings) {
      throw new Error('Settings not loaded')
    }

    return updateSettings({
      id: settings.id,
      payments: {
        ...settings.payments,
        ...paymentSettings,
      },
    })
  }, [settings, updateSettings])

  // Update business settings
  const updateBusinessSettings = useCallback(async (businessSettings: Partial<Settings['business']>) => {
    if (!settings) {
      throw new Error('Settings not loaded')
    }

    return updateSettings({
      id: settings.id,
      business: {
        ...settings.business,
        ...businessSettings,
      },
    })
  }, [settings, updateSettings])

  // Update feature flags
  const updateFeatures = useCallback(async (features: Partial<Settings['features']>) => {
    if (!settings) {
      throw new Error('Settings not loaded')
    }

    return updateSettings({
      id: settings.id,
      features: {
        ...settings.features,
        ...features,
      },
    })
  }, [settings, updateSettings])

  // Enable maintenance mode
  const enableMaintenanceMode = useCallback(async (message?: string, estimatedTime?: string) => {
    if (!settings) {
      throw new Error('Settings not loaded')
    }

    return updateSettings({
      id: settings.id,
      maintenance: {
        enabled: true,
        message,
        estimatedTime,
      },
    })
  }, [settings, updateSettings])

  // Disable maintenance mode
  const disableMaintenanceMode = useCallback(async () => {
    if (!settings) {
      throw new Error('Settings not loaded')
    }

    return updateSettings({
      id: settings.id,
      maintenance: {
        enabled: false,
      },
    })
  }, [settings, updateSettings])

  // Test SMTP settings
  const testEmailSettings = useCallback(async () => {
    if (!settings) {
      throw new Error('Settings not loaded')
    }

    try {
      const response = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settingsId: settings.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to test email settings')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test email settings'
      setError(errorMessage)
      throw err
    }
  }, [settings])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    settings,
    loading,
    error,

    // Actions
    fetchSettings,
    getSettingsByTenant,
    createSettings,
    updateSettings,
    updateChatbotSettings,
    updateBookingSettings,
    updateNotificationSettings,
    updatePaymentSettings,
    updateBusinessSettings,
    updateFeatures,
    enableMaintenanceMode,
    disableMaintenanceMode,
    testEmailSettings,
    clearError,
  }
}