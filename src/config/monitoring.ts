// Define MonitoringConfig interface locally
interface MonitoringConfig {
  analytics: {
    enabled: boolean;
    providers: string[];
    trackPerformance?: boolean;
    trackErrors?: boolean;
  };
  errorTracking?: {
    enabled: boolean;
    provider: string;
    dsn?: string;
  };
  performance?: {
    enabled: boolean;
    trackPageLoad?: boolean;
    trackApiCalls?: boolean;
    trackUserInteractions?: boolean;
  };
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    remoteEnabled: boolean;
    consoleEnabled: boolean;
  };
  sentry?: {
    dsn: string;
    environment: string;
    release?: string;
    sampleRate?: number;
    tracesSampleRate?: number;
    replaysOnErrorSampleRate?: number;
    replaysSessionSampleRate?: number;
  };
  logRocket?: {
    appId: string;
    environment: string;
  };
}

// Environment-based configuration
const getMonitoringConfig = (): MonitoringConfig => {
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'

  return {
    analytics: {
      enabled: isProduction,
      providers: isProduction ? ['google-analytics', 'mixpanel'] : [],
      trackPerformance: true,
      trackErrors: true,
    },
    errorTracking: {
      enabled: isProduction,
      provider: 'sentry',
      dsn: process.env.SENTRY_DSN,
    },
    performance: {
      enabled: true,
      trackPageLoad: true,
      trackApiCalls: true,
      trackUserInteractions: isProduction,
    },
    logging: {
      level: isDevelopment ? 'debug' : 'warn',
      remoteEnabled: isProduction,
      consoleEnabled: isDevelopment,
    },
    sentry: isProduction ? {
      dsn: process.env.SENTRY_DSN || '',
      environment: process.env.VERCEL_ENV || 'production',
      release: process.env.VERCEL_GIT_COMMIT_SHA,
      sampleRate: 1.0,
      tracesSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
    } : undefined,
    logRocket: isProduction ? {
      appId: process.env.LOGROCKET_APP_ID || '',
      environment: process.env.VERCEL_ENV || 'production',
    } : undefined,
  }
}

export const monitoringConfig = getMonitoringConfig()
export type { MonitoringConfig }