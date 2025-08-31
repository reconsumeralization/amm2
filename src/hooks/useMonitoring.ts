'use client'

import { useEffect, useCallback } from 'react'
import { monitoring } from '@/lib/monitoring'
import { useSession } from 'next-auth/react'
import { logger } from '@/lib/logger'

export function useMonitoring() {
  const { data: session } = useSession()

  // Initialize monitoring on mount
  useEffect(() => {
    const initializeMonitoring = async () => {
      try {
        const { monitoringConfig } = await import('@/config/monitoring')

        // Use the monitoring object for initialization
        monitoring.log?.('Monitoring initialized via useMonitoring hook')

        logger.info('Monitoring initialized via useMonitoring hook')
      } catch (error) {
        logger.error('Failed to initialize monitoring', {
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    initializeMonitoring()
  }, [])

  // Set user context when session changes
  useEffect(() => {
    if (session?.user) {
      monitoring.log?.('User session changed', {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role
      })
    }
  }, [session])

  // Error capture helper
  const captureError = useCallback((error: any) => {
    monitoring.error?.(error)
  }, [])

  // Performance metric tracking
  const trackMetric = useCallback((metric: any) => {
    monitoring.track('performance_metric', metric)
  }, [])

  // User action tracking
  const trackAction = useCallback((action: any) => {
    monitoring.track('user_action', action)
  }, [])

  // Breadcrumb helper
  const addBreadcrumb = useCallback((
    message: string,
    category?: string,
    level?: 'info' | 'warning' | 'error'
  ) => {
    monitoring.log?.(`Breadcrumb: ${message}`, { category, level })
  }, [])

  // API call tracking helper
  const trackApiCall = useCallback((
    endpoint: string,
    method: string,
    duration: number,
    success: boolean
  ) => {
    monitoring.track('api_call', { endpoint, method, duration, success })
  }, [])

  // Page view tracking helper
  const trackPageView = useCallback((page: string, properties?: Record<string, any>) => {
    monitoring.track('page_view', { page, ...properties })
  }, [])

  // Form submission tracking helper
  const trackFormSubmission = useCallback((
    formName: string,
    success: boolean,
    duration?: number
  ) => {
    monitoring.track('form_submission', { formName, success, duration })
  }, [])

  // Search tracking helper
  const trackrch = useCallback((query: string, resultsCount?: number) => {
    monitoring.track('search', { query, resultsCount })
  }, [])

  // Event tracking helper
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    monitoring.track(eventName, properties)
  }, [])

  // Performance metrics helper
  const getPerformanceMetrics = useCallback(() => {
    return {}
  }, [])

  // Metrics helper (alias for getPerformanceMetrics)
  const getMetrics = useCallback(() => {
    return {}
  }, [])

  return {
    captureError,
    trackMetric,
    trackAction,
    addBreadcrumb,
    trackApiCall,
    trackPageView,
    trackFormSubmission,
    trackrch,
    trackEvent,
    getPerformanceMetrics,
    getMetrics
  }
}

// Hook for tracking component performance
export function useComponentPerformance(componentName: string) {
  const { trackMetric } = useMonitoring()

  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime

      trackMetric({
        name: 'component_render_time',
        value: duration,
        unit: 'ms',
        tags: {
          component: componentName
        }
      })
    }
  }, [componentName, trackMetric])
}

// Hook for tracking API performance
export function useApiPerformance() {
  const { trackApiCall } = useMonitoring()

  const trackApiRequest = useCallback(async <T>(
    endpoint: string,
    method: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now()

    try {
      const result = await requestFn()
      const duration = performance.now() - startTime

      trackApiCall(endpoint, method, duration, true)

      return result
    } catch (error) {
      const duration = performance.now() - startTime

      trackApiCall(endpoint, method, duration, false)

      throw error
    }
  }, [trackApiCall])

  return { trackApiRequest }
}

// Hook for tracking user interactions
export function useInteractionTracking() {
  const { trackAction } = useMonitoring()

  const trackClick = useCallback((target: string, data?: Record<string, any>) => {
    trackAction({
      type: 'click',
      target,
      data
    })
  }, [trackAction])

  const trackFormInteraction = useCallback((
    formName: string,
    field: string,
    action: 'focus' | 'blur' | 'change',
    data?: Record<string, any>
  ) => {
    trackAction({
      type: 'form_submission',
      target: `${formName}.${field}`,
      data: {
        action,
        ...data
      }
    })
  }, [trackAction])

  return {
    trackClick,
    trackFormInteraction
  }
}

// Hook for error boundary integration
export function useErrorBoundary() {
  const { captureError } = useMonitoring()

  const reportError = useCallback((error: Error, errorInfo?: { componentStack?: string }) => {
    captureError({
      message: error.message,
      stack: error.stack,
      context: {
        componentStack: errorInfo?.componentStack
      },
      level: 'error'
    })
  }, [captureError])

  return { reportError }
}
