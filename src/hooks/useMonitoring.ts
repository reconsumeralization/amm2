'use client'

import { useEffect, useCallback } from 'react'
import { yoloMonitoring } from '@/lib/monitoring'
import { useSession } from 'next-auth/react'
import { logger } from '@/lib/logger'

export function useMonitoring() {
  const { data: session } = useSession()

  // Error capture helper
  const captureError = useCallback((error: Error) => {
    yoloMonitoring.captureException(error)
  }, [])

  // User action tracking
  const trackAction = useCallback((action: string, page: string) => {
    yoloMonitoring.trackUserInteraction(action, page)
  }, [])

  // API call tracking helper
  const trackApiCall = useCallback((
    endpoint: string,
    method: string,
    duration: number,
    success: boolean
  ) => {
    yoloMonitoring.trackApiPerformance(endpoint, duration, success ? 200 : 500)
  }, [])

  // Page view tracking helper
  const trackPageView = useCallback((page: string) => {
    yoloMonitoring.trackUserInteraction('page_view', page)
  }, [])

  // Form submission tracking helper
  const trackFormSubmission = useCallback((
    formName: string,
    success: boolean
  ) => {
    yoloMonitoring.trackUserInteraction(
      success ? 'form_submit_success' : 'form_submit_error',
      formName
    )
  }, [])

  // Search tracking helper
  const trackSearch = useCallback((query: string, resultsCount?: number) => {
    yoloMonitoring.trackUserInteraction('search', 'search_page')
  }, [])

  // Event tracking helper
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    yoloMonitoring.trackUserInteraction(eventName, 'event')
  }, [])

  // Performance metrics helper
  const getPerformanceMetrics = useCallback(async () => {
    return await yoloMonitoring.getPerformanceMetrics?.() || {}
  }, [])

  // General metrics helper
  const getMetrics = useCallback(async () => {
    return await yoloMonitoring.getMetrics?.() || {}
  }, [])

  // Track metric helper (for component performance hook)
  const trackMetric = useCallback((metric: { name: string; value: number; unit?: string; tags?: Record<string, any> }) => {
    yoloMonitoring.trackBusinessMetric(metric.name, metric.value, metric.tags?.component || 'general')
  }, [])

  return {
    captureError,
    trackAction,
    trackApiCall,
    trackPageView,
    trackFormSubmission,
    trackSearch,
    trackEvent,
    getPerformanceMetrics,
    getMetrics,
    trackMetric
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
export function upiPerformance() {
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
    trackAction('click', target)
  }, [trackAction])

  const trackFormInteraction = useCallback((
    formName: string,
    field: string,
    action: 'focus' | 'blur' | 'change',
    data?: Record<string, any>
  ) => {
    trackAction('form_interaction', `${formName}.${field}`)
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
    captureError(error)
  }, [captureError])

  return { reportError }
}
