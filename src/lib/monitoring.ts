import { monitoring as mainMonitoring } from '../../lib/monitoring'

// Re-export the main monitoring service for consistency
export const monitoring = mainMonitoring

// YOLO-specific monitoring enhancements
export class YoloMonitoring {
  private static instance: YoloMonitoring

  static getInstance(): YoloMonitoring {
    if (!YoloMonitoring.instance) {
      YoloMonitoring.instance = new YoloMonitoring()
    }
    return YoloMonitoring.instance
  }

  // Track Payload CMS operations
  trackPayloadOperation(collection: string, operation: string, userId?: string) {
    monitoring.track('payload_operation', {
      collection,
      operation,
      userId,
      project: 'modernmen-yolo'
    })
  }

  // Track API performance
  trackApiPerformance(endpoint: string, duration: number, status: number) {
    monitoring.track('api_performance', {
      endpoint,
      duration,
      status,
      project: 'modernmen-yolo'
    })
  }

  // Track business metrics
  trackBusinessMetric(metric: string, value: number, category: string) {
    monitoring.track('business_metric', {
      metric,
      value,
      category,
      project: 'modernmen-yolo'
    })
  }

  // Track user interactions
  trackUserInteraction(action: string, page: string, userId?: string) {
    monitoring.track('user_interaction', {
      action,
      page,
      userId,
      project: 'modernmen-yolo'
    })
  }

  // Track errors with context
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
