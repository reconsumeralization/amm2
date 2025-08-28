import { MonitoringConfig } from '@/lib/monitoring'

// Environment-based configuration
const getMonitoringConfig = (): MonitoringConfig => {
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'

  const baseConfig: MonitoringConfig = {
    analytics: {
      enabled: true,
      trackPerformance: true,
      trackErrors: true
    }
  }

  // Sentry configuration
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    baseConfig.sentry = {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
      release: process.env.VERCEL_GIT_COMMIT_SHA,
      sampleRate: isProduction ? 1.0 : 0.1,
      tracesSampleRate: isProduction ? 0.1 : 0.5,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: isProduction ? 0.1 : 0.5
    }
  }

  // LogRocket configuration
  if (process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
    baseConfig.logRocket = {
      appId: process.env.NEXT_PUBLIC_LOGROCKET_APP_ID,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown'
    }
  }

  // Development-specific overrides
  if (isDevelopment) {
    if (baseConfig.sentry) {
      baseConfig.sentry.sampleRate = 0.1
      baseConfig.sentry.tracesSampleRate = 1.0
    }

    if (baseConfig.logRocket) {
      baseConfig.logRocket.appId += '-dev' // Use development app ID if available
    }
  }

  return baseConfig
}

// Export configuration
export const monitoringConfig = getMonitoringConfig()

// Helper to check if monitoring is enabled
export const isMonitoringEnabled = () => {
  return !!(
    monitoringConfig.sentry ||
    monitoringConfig.logRocket ||
    monitoringConfig.analytics?.enabled
  )
}

// Helper to check specific services
export const isServiceEnabled = {
  sentry: () => !!monitoringConfig.sentry,
  logRocket: () => !!monitoringConfig.logRocket,
  analytics: () => !!monitoringConfig.analytics?.enabled
}
