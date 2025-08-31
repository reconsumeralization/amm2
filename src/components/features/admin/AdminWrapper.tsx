'use client';

import { ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertTriangle, Wifi, WifiOff } from "lucide-react";

interface AdminWrapperProps {
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  title?: string;
  subtitle?: string;
  showOfflineIndicator?: boolean;
}

export function AdminWrapper({
  children,
  isLoading = false,
  error = null,
  onRetry,
  title,
  subtitle,
  showOfflineIndicator = true
}: AdminWrapperProps) {
  if (isLoading) {
    return (
      <LoadingState title={title} subtitle={subtitle} />
    );
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={onRetry}
        title={title}
        subtitle={subtitle}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>}
            {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
          </div>
          {showOfflineIndicator && <OfflineIndicator />}
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}

function LoadingState({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      {(title || subtitle) && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            {title && (
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            )}
            {subtitle && (
              <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
            )}
          </div>
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      )}

      {/* Content Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">
              {title ? `Loading ${title.toLowerCase()}...` : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
  title,
  subtitle
}: {
  error: string;
  onRetry?: () => void;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>}
            {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
          </div>
          <OfflineIndicator />
        </div>
      )}

      {/* Error Content */}
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              {onRetry && (
                <Button onClick={onRetry} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

function OfflineIndicator() {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <div className="flex items-center space-x-2 text-sm text-green-600">
        <Wifi className="h-4 w-4" />
        <span>Online</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm text-red-600">
      <WifiOff className="h-4 w-4" />
      <span>Offline</span>
    </div>
  );
}

// Import React at the top
import React from 'react';

// Export common loading and error states for reuse
export { LoadingState, ErrorState, OfflineIndicator };

// Utility hooks for common admin patterns
export function useAdminData<T>(
  fetchFn: () => Promise<T>,
  dependencies: React.DependencyList = []
) {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refetch = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  React.useEffect(() => {
    refetch();
  }, dependencies);

  return { data, isLoading, error, refetch };
}

export function useAdminMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const mutate = React.useCallback(async (variables: TVariables) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await mutationFn(variables);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn]);

  return { mutate, isLoading, error };
}
