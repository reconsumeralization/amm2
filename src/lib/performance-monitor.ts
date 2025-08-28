interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  metadata?: Record<string, any>
}

interface PerformanceThreshold {
  name: string
  warning: number
  critical: number
  unit: string
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private thresholds: PerformanceThreshold[] = []
  private observers: PerformanceObserver[] = []

  private constructor() {
    this.initializeObservers()
    this.setupThresholds()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return

    // Monitor navigation timing
    const navigationObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          this.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.loadEventStart, 'ms')
          this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart, 'ms')
          this.recordMetric('first_paint', navEntry.responseStart - navEntry.requestStart, 'ms')
        }
      })
    })

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming
          this.recordMetric('resource_load_time', resourceEntry.duration, 'ms', {
            name: resourceEntry.name,
            type: resourceEntry.initiatorType,
          })
        }
      })
    })

    // Monitor long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'longtask') {
          this.recordMetric('long_task_duration', entry.duration, 'ms', {
            startTime: entry.startTime,
          })
        }
      })
    })

    // Monitor layout shifts
    const layoutShiftObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'layout-shift') {
          const layoutShiftEntry = entry as any
          this.recordMetric('layout_shift', layoutShiftEntry.value, 'score', {
            sources: layoutShiftEntry.sources,
          })
        }
      })
    })

    try {
      navigationObserver.observe({ entryTypes: ['navigation'] })
      resourceObserver.observe({ entryTypes: ['resource'] })
      longTaskObserver.observe({ entryTypes: ['longtask'] })
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('Performance monitoring not supported:', error)
    }
  }

  private setupThresholds() {
    this.thresholds = [
      { name: 'page_load_time', warning: 2000, critical: 5000, unit: 'ms' },
      { name: 'dom_content_loaded', warning: 1000, critical: 3000, unit: 'ms' },
      { name: 'resource_load_time', warning: 1000, critical: 3000, unit: 'ms' },
      { name: 'long_task_duration', warning: 50, critical: 100, unit: 'ms' },
      { name: 'layout_shift', warning: 0.1, critical: 0.25, unit: 'score' },
    ]
  }

  recordMetric(name: string, value: number, unit: string, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata,
    }

    this.metrics.push(metric)
    this.checkThresholds(metric)
    this.sendToAnalytics(metric)
  }

  private checkThresholds(metric: PerformanceMetric) {
    const threshold = this.thresholds.find(t => t.name === metric.name)
    if (!threshold) return

    if (metric.value >= threshold.critical) {
      console.error(`🚨 Critical performance issue: ${metric.name} = ${metric.value}${metric.unit}`)
      this.alertPerformanceIssue(metric, 'critical')
    } else if (metric.value >= threshold.warning) {
      console.warn(`⚠️ Performance warning: ${metric.name} = ${metric.value}${metric.unit}`)
      this.alertPerformanceIssue(metric, 'warning')
    }
  }

  private alertPerformanceIssue(metric: PerformanceMetric, severity: 'warning' | 'critical') {
    // Send to monitoring service
    fetch('/api/monitoring/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        unit: metric.unit,
        severity,
        timestamp: metric.timestamp,
        metadata: metric.metadata,
      }),
    }).catch(console.error)
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // Send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_unit: metric.unit,
        ...metric.metadata,
      })
    }
  }

  // Custom performance measurements
  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now()
    return fn().finally(() => {
      const duration = performance.now() - startTime
      this.recordMetric(name, duration, 'ms')
    })
  }

  measureSync<T>(name: string, fn: () => T): T {
    const startTime = performance.now()
    try {
      return fn()
    } finally {
      const duration = performance.now() - startTime
      this.recordMetric(name, duration, 'ms')
    }
  }

  // Memory monitoring
  monitorMemory() {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory
      this.recordMetric('memory_used', memory.usedJSHeapSize, 'bytes')
      this.recordMetric('memory_total', memory.totalJSHeapSize, 'bytes')
      this.recordMetric('memory_limit', memory.jsHeapSizeLimit, 'bytes')
    }
  }

  // Get performance report
  getReport(): {
    metrics: PerformanceMetric[]
    summary: Record<string, { avg: number; min: number; max: number; count: number }>
  } {
    const summary: Record<string, any> = {}

    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = { values: [], count: 0 }
      }
      summary[metric.name].values.push(metric.value)
      summary[metric.name].count++
    })

    Object.keys(summary).forEach(name => {
      const values = summary[name].values
      summary[name] = {
        avg: values.reduce((a: number, b: number) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: summary[name].count,
      }
      delete summary[name].values
    })

    return {
      metrics: [...this.metrics],
      summary,
    }
  }

  // Clear old metrics
  clearOldMetrics(maxAge: number = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoff = Date.now() - maxAge
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoff)
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    measureSync: performanceMonitor.measureSync.bind(performanceMonitor),
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    getReport: performanceMonitor.getReport.bind(performanceMonitor),
  }
}
