'use client'

import React from 'react'
import { ErrorBoundary, APIErrorBoundary } from './error-boundary'
import { logger } from '@/lib/logger'

interface GlobalErrorBoundaryProps {
  children: React.ReactNode
  showDevDetails?: boolean
}

export function GlobalErrorBoundary({
  children,
  showDevDetails = process.env.NODE_ENV === 'development'
}: GlobalErrorBoundaryProps) {
  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global Error Boundary:', error)
      console.error('Component Stack:', errorInfo.componentStack)
    }

    // Send to external monitoring service if configured
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Would integrate with Sentry here
      logger.error('Global error boundary triggered', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      }, error)
    }
  }

  return (
    <ErrorBoundary
      onError={handleGlobalError}
      showErrorDetails={showDevDetails}
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-destructive mb-2">Oops!</h1>
              <p className="text-lg text-muted-foreground">
                Something went wrong with the application
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Reload Application
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Go to Homepage
              </button>
            </div>

            {showDevDetails && (
              <div className="mt-6 p-4 bg-muted rounded-lg text-left">
                <p className="text-sm font-medium text-destructive mb-2">
                  Development Mode: Error Details Available
                </p>
                <p className="text-xs text-muted-foreground">
                  Check browser console for detailed error information.
                </p>
              </div>
            )}
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Specialized boundary for layout components
export function LayoutErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('Layout Error Boundary', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          context: 'layout'
        }, error)
      }}
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              Layout Error
            </h1>
            <p className="text-muted-foreground mb-6">
              There was an error loading the page layout. Please try refreshing.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Boundary for async components and data fetching
export function AsyncErrorBoundary({
  children,
  fallback
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <APIErrorBoundary
      retryable={true}
      fallback={fallback || (
        <div className="p-4 bg-muted/50 border border-dashed rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Loading failed. Please try again.
          </p>
        </div>
      )}
      onError={(error, errorInfo) => {
        logger.error('Async Error Boundary', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          context: 'async'
        }, error)
      }}
    >
      {children}
    </APIErrorBoundary>
  )
}
