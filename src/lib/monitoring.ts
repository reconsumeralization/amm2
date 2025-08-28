// Local monitoring shim providing the APIs used across the app.
// This avoids importing from a non-existent parent project path.

export type ErrorEvent = {
  message: string
  stack?: string
  context?: Record<string, any>
  level?: 'info' | 'warning' | 'error'
}

export type UserAction = {
  type: string
  target: string
  data?: Record<string, any>
}

export type PerformanceMetric = {
  name: string
  value: number
  unit?: string
  tags?: Record<string, any>
}

type UserContext = {
  id: string
  email?: string
  role?: string
}

type Monitoring = {
  initialize: (config: Record<string, any>) => void
  setUser: (user: UserContext) => void
  captureError: (error: ErrorEvent) => void
  captureException: (error: Error, context?: Record<string, any>) => void
  trackMetric: (metric: PerformanceMetric) => void
  trackUserAction: (action: UserAction) => void
  addBreadcrumb: (message: string, category?: string, level?: 'info' | 'warning' | 'error') => void
  trackEvent: (eventName: string, properties?: Record<string, any>) => void
  getPerformanceMetrics?: () => Record<string, any>
  track: (eventName: string, properties?: Record<string, any>) => void
}

let currentUser: UserContext | undefined
const performanceMetrics: Record<string, any> = {}

export const monitoring: Monitoring = {
  initialize: (config) => {
    console.info('[monitoring] initialize', config)
  },
  setUser: (user) => {
    currentUser = user
    console.info('[monitoring] setUser', user)
  },
  captureError: (error) => {
    console.error('[monitoring] captureError', { ...error, user: currentUser })
  },
  captureException: (error, context) => {
    console.error('[monitoring] captureException', { message: error.message, stack: error.stack, context, user: currentUser })
  },
  trackMetric: (metric) => {
    performanceMetrics[metric.name] = metric
    console.info('[monitoring] trackMetric', metric)
  },
  trackUserAction: (action) => {
    console.info('[monitoring] trackUserAction', action)
  },
  addBreadcrumb: (message, category, level) => {
    console.info('[monitoring] breadcrumb', { message, category, level })
  },
  trackEvent: (eventName, properties) => {
    console.info('[monitoring] event', { eventName, properties })
  },
  getPerformanceMetrics: () => ({ ...performanceMetrics }),
  track: (eventName, properties) => {
    console.info('[monitoring] track', { eventName, properties })
  },
}

export const monitoringHelpers = {
  trackApiCall: (endpoint: string, method: string, duration: number, success: boolean) => {
    monitoring.track('api_call', { endpoint, method, duration, success })
  },
  trackPageView: (page: string, properties?: Record<string, any>) => {
    monitoring.track('page_view', { page, ...properties })
  },
  trackFormSubmission: (formName: string, success: boolean, duration?: number) => {
    monitoring.track('form_submission', { formName, success, duration })
  },
  trackrch: (query: string, resultsCount?: number) => {
    monitoring.track('rch', { query, resultsCount })
  },
}

// YOLO-specific monitoring enhancements
export class YoloMonitoring {
  private static instance: YoloMonitoring

  static getInstance(): YoloMonitoring {
    if (!YoloMonitoring.instance) {
      YoloMonitoring.instance = new YoloMonitoring()
    }
    return YoloMonitoring.instance
  }

  trackPayloadOperation(collection: string, operation: string, userId?: string) {
    monitoring.track('payload_operation', {
      collection,
      operation,
      userId,
      project: 'modernmen-yolo'
    })
  }

  trackApiPerformance(endpoint: string, duration: number, status: number) {
    monitoring.track('api_performance', {
      endpoint,
      duration,
      status,
      project: 'modernmen-yolo'
    })
  }

  trackBusinessMetric(metric: string, value: number, category: string) {
    monitoring.track('business_metric', {
      metric,
      value,
      category,
      project: 'modernmen-yolo'
    })
  }

  trackUserInteraction(action: string, page: string, userId?: string) {
    monitoring.track('user_interaction', {
      action,
      page,
      userId,
      project: 'modernmen-yolo'
    })
  }

  captureException(error: Error, context?: Record<string, any>) {
    monitoring.captureException(error, {
      ...context,
      project: 'modernmen-yolo',
      environment: process.env.NODE_ENV
    })
  }
}

// Export singleton instance
export const yoloMonitoring = YoloMonitoring.getInstance()
