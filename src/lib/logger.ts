type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  email?: string
  ip?: string
  userAgent?: string
  sessionId?: string
  requestId?: string
  [key: string]: any
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private context: LogContext = {}

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context }
  }

  clearContext() {
    this.context = {}
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    }

    // In development, log to console with colors
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(entry)
    }

    // In production, you might want to send to a logging service
    if (process.env.NODE_ENV === 'production') {
      this.logToService(entry)
    }

    // Always log errors to console
    if (level === 'error') {
      console.error(entry)
    }
  }

  private logToConsole(entry: LogEntry) {
    const colors = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
      reset: '\x1b[0m'
    }

    const color = colors[entry.level]
    const prefix = `${color}[${entry.level.toUpperCase()}]${colors.reset}`
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()

    console.log(`${prefix} ${timestamp} ${entry.message}`)

    if (entry.context && Object.keys(entry.context).length > 0) {
      console.log(`${color}Context:${colors.reset}`, entry.context)
    }

    if (entry.error) {
      console.error(`${color}Error:${colors.reset}`, entry.error)
    }
  }

  private logToService(entry: LogEntry) {
    // Implement your logging service here
    // Examples: DataDog, LogRocket, Sentry, etc.

    // For now, we'll just use console in production too
    this.logToConsole(entry)
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, context?: LogContext, error?: Error) {
    this.log('error', message, context, error)
  }

  // Authentication specific logging methods
  authEvent(event: string, context?: LogContext) {
    this.info(`Auth Event: ${event}`, { ...context, eventType: 'auth' })
  }

  authError(event: string, context?: LogContext, error?: Error) {
    this.error(`Auth Error: ${event}`, { ...context, eventType: 'auth' }, error)
  }

  securityEvent(event: string, context?: LogContext) {
    this.warn(`Security Event: ${event}`, { ...context, eventType: 'security' })
  }

  rateLimitExceeded(identifier: string, context?: LogContext) {
    this.securityEvent('Rate limit exceeded', { ...context, identifier, eventType: 'rate_limit' })
  }

  suspiciousActivity(activity: string, context?: LogContext) {
    this.securityEvent(`Suspicious activity: ${activity}`, { ...context, eventType: 'suspicious' })
  }
}

// Export singleton instance
export const logger = new Logger()

// Helper function to get request context
export function getRequestContext(request?: any): LogContext {
  if (!request) return {}

  const context: LogContext = {}

  // Extract from request headers
  if (request.headers) {
    context.ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                request.ip ||
                'unknown'

    context.userAgent = request.headers.get('user-agent') || 'unknown'
  }

  // Generate request ID if not present
  context.requestId = request.headers?.get('x-request-id') ||
                     `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return context
}

// Middleware helper to add user context
export function withUserContext(user: any) {
  return {
    userId: user?.id,
    email: user?.email,
    role: user?.role
  }
}
