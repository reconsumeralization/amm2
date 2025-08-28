'use client'

import React, { useState, useCallback } from 'react'
import { logger } from '@/lib/logger'
import { Button } from './button'
import { AlertTriangle, RefreshCw, WifiOff } from '@/lib/icon-mapping'
import { AsyncErrorBoundary } from './global-error-boundary'

interface AsyncErrorHandlerProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onRetry?: () => Promise<void> | void
  showRetryButton?: boolean
  maxRetries?: number
  retryDelay?: number
}

interface NetworkErrorState {
  isOnline: boolean
  wasOffline: boolean
  retryCount: number
}

export function AsyncErrorHandler({
  children,
  fallback,
  onRetry,
  showRetryButton = true,
  maxRetries = 3,
  retryDelay = 1000
}: AsyncErrorHandlerProps) {
  const [networkState, setNetworkState] = useState<NetworkErrorState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    retryCount: 0
  })

  const handleRetry = useCallback(async () => {
    if (networkState.retryCount >= maxRetries) {
      logger.warn('Max retries exceeded for async operation', {
        maxRetries,
        currentCount: networkState.retryCount
      })
      return
    }

    try {
      setNetworkState(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1
      }))

      // Wait for retry delay
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }

      // Call the retry function
      if (onRetry) {
        await onRetry()
      }

      logger.info('Async operation retry successful', {
        retryCount: networkState.retryCount + 1
      })

      // Reset retry count on success
      setNetworkState(prev => ({
        ...prev,
        retryCount: 0
      }))

    } catch (error) {
      logger.error('Async operation retry failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: networkState.retryCount + 1,
        maxRetries
      }, error instanceof Error ? error : undefined)
    }
  }, [networkState.retryCount, maxRetries, retryDelay, onRetry])

  // Network status monitoring
  React.useEffect(() => {
    const handleOnline = () => {
      setNetworkState(prev => ({
        ...prev,
        isOnline: true,
        wasOffline: prev.wasOffline || !prev.isOnline
      }))

      if (networkState.wasOffline) {
        logger.info('Network connection restored', {
          wasOffline: networkState.wasOffline
        })
      }
    }

    const handleOffline = () => {
      setNetworkState(prev => ({
        ...prev,
        isOnline: false,
        wasOffline: true
      }))

      logger.warn('Network connection lost', {
        timestamp: new Date().toISOString()
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [networkState.wasOffline])

  const defaultFallback = (
    <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
      <div className="flex items-start gap-3">
        {!networkState.isOnline ? (
          <WifiOff className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
        )}

        <div className="flex-1">
          <h3 className="font-medium text-destructive mb-1">
            {!networkState.isOnline ? 'Connection Lost' : 'Loading Failed'}
          </h3>

          <p className="text-sm text-muted-foreground mb-4">
            {!networkState.isOnline
              ? 'Please check your internet connection and try again.'
              : 'Something went wrong while loading this content.'
            }
          </p>

          <div className="flex items-center gap-2">
            {!networkState.isOnline ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="icon-placeholder">Wifi</div>
                Waiting for connection...
              </div>
            ) : showRetryButton ? (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                disabled={networkState.retryCount >= maxRetries}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {networkState.retryCount >= maxRetries
                  ? 'Max Retries Reached'
                  : `Try Again (${maxRetries - networkState.retryCount} left)`
                }
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <AsyncErrorBoundary fallback={fallback || defaultFallback}>
      {children}
    </AsyncErrorBoundary>
  )
}

// Hook for handling async operations with error boundaries
export function useAsyncErrorHandler() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const executeAsync = useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void
      onError?: (error: Error) => void
      retries?: number
    }
  ): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    let attempt = 0
    const maxRetries = options?.retries ?? 0

    while (attempt <= maxRetries) {
      try {
        const result = await asyncFn()
        setIsLoading(false)
        options?.onSuccess?.(result)
        return result
      } catch (err) {
        attempt++

        if (attempt > maxRetries) {
          const error = err instanceof Error ? err : new Error('Unknown error')
          setError(error)
          setIsLoading(false)
          options?.onError?.(error)

          logger.error('Async operation failed after retries', {
            error: error.message,
            attempts: attempt,
            maxRetries
          }, error)

          return null
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }

    return null
  }, [])

  return {
    executeAsync,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}
