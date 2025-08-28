interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  userId?: string
  sessionId?: string
}

class Analytics {
  private static instance: Analytics
  private sessionId: string
  private userId?: string
  private queue: AnalyticsEvent[] = []
  private isOnline = true

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.setupEventListeners()
    this.startBatchSending()
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return

    // Track page views
    window.addEventListener('popstate', () => {
      this.track('page_view', { url: window.location.href })
    })

    // Track online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true
      this.flushQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // Track user engagement
    let lastActivity = Date.now()
    const trackActivity = () => {
      const now = Date.now()
      const timeSpent = now - lastActivity
      if (timeSpent > 30000) { // 30 seconds threshold
        this.track('user_engagement', { time_spent: timeSpent })
      }
      lastActivity = now
    }

    ['click', 'scroll', 'keypress'].forEach(event => {
      window.addEventListener(event, trackActivity, { passive: true })
    })
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      },
      userId: this.userId,
      sessionId: this.sessionId,
    }

    this.queue.push(event)

    // Send immediately for critical events
    if (['error', 'conversion', 'purchase'].includes(eventName)) {
      this.flushQueue()
    }
  }

  private async flushQueue() {
    if (!this.isOnline || this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      })
    } catch (error) {
      console.error('Failed to send analytics:', error)
      // Re-add events to queue if sending failed
      this.queue.unshift(...events)
    }
  }

  private startBatchSending() {
    // Send events every 10 seconds
    setInterval(() => {
      this.flushQueue()
    }, 10000)

    // Send events before page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushQueue()
      })
    }
  }

  // Common tracking methods
  pageView(url?: string) {
    this.track('page_view', { url: url || (typeof window !== 'undefined' ? window.location.href : undefined) })
  }

  click(element: string, properties?: Record<string, any>) {
    this.track('click', { element, ...properties })
  }

  conversion(type: string, value?: number, properties?: Record<string, any>) {
    this.track('conversion', { type, value, ...properties })
  }

  error(error: Error, context?: Record<string, any>) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context,
    })
  }
}

export const analytics = Analytics.getInstance()
