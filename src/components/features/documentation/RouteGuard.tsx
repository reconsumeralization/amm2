'use client'

import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { checkRouteAccess, getUserFromSession } from '@/lib/documentation-auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, AlertTriangle, ArrowRight } from '@/lib/icon-mapping'

interface RouteGuardProps {
  children: React.ReactNode
  redirectOnDenied?: boolean
  showAccessDenied?: boolean
}

/**
 * Route Guard Component
 * Protects routes based on user permissions and redirects or shows access denied
 */
export function RouteGuard({ 
  children, 
  redirectOnDenied = false, 
  showAccessDenied = true 
}: RouteGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return

    const accessCheck = checkRouteAccess(session, pathname)
    
    if (!accessCheck.allowed && redirectOnDenied && accessCheck.redirectTo) {
      router.push(accessCheck.redirectTo)
    }
  }, [session, status, pathname, router, redirectOnDenied])

  // Loading state
  if (status === 'loading') {
    return <RouteGuardLoading />
  }

  const accessCheck = checkRouteAccess(session, pathname)
  
  if (!accessCheck.allowed) {
    if (redirectOnDenied) {
      return <RouteGuardLoading message="Redirecting..." />
    }
    
    if (showAccessDenied) {
      return (
        <RouteAccessDenied 
          message={accessCheck.message}
          redirectTo={accessCheck.redirectTo}
        />
      )
    }
    
    return null
  }

  return <>{children}</>
}

function RouteGuardLoading({ message = "Checking permissions..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  )
}

interface RouteAccessDeniedProps {
  message?: string
  redirectTo?: string
}

function RouteAccessDenied({ message, redirectTo }: RouteAccessDeniedProps) {
  const { data: session } = useSession()
  const user = getUserFromSession(session)

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <div className="icon-placeholder">Shield</div>
            Access Denied
          </CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            {message || "You don't have permission to access this page."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Current role: <span className="font-medium">{user.role.replace('_', ' ')}</span>
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            {redirectTo && (
              <Button asChild>
                <a href={redirectTo} className="flex items-center gap-2">
                  {!user ? 'Sign In' : 'Go to Dashboard'}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button asChild variant="outline">
              <a href="/documentation">Back to Documentation</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Page Guard Hook
 * Custom hook for protecting pages with role/permission checks
 */
export function usePageGuard(requiredRole?: string | string[], requiredPermission?: string) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return

    const user = getUserFromSession(session)
    
    // Check role requirement
    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      if (!user || !roles.includes(user.role)) {
        router.push('/documentation')
        return
      }
    }
    
    // Check permission requirement
    if (requiredPermission) {
      if (!user || !user.permissions.includes(requiredPermission)) {
        router.push('/documentation')
        return
      }
    }
    
    // Check general path access
    const accessCheck = checkRouteAccess(session, pathname)
    if (!accessCheck.allowed && accessCheck.redirectTo) {
      router.push(accessCheck.redirectTo)
    }
  }, [session, status, pathname, router, requiredRole, requiredPermission])

  return {
    user: getUserFromSession(session),
    isLoading: status === 'loading',
    isAuthenticated: !!session
  }
}

/**
 * Conditional Route Component
 * Shows different content based on route access
 */
interface ConditionalRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  loadingFallback?: React.ReactNode
}

export function ConditionalRoute({ 
  children, 
  fallback, 
  loadingFallback 
}: ConditionalRouteProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  if (status === 'loading') {
    return <>{loadingFallback || <RouteGuardLoading />}</>
  }

  const accessCheck = checkRouteAccess(session, pathname)
  
  if (!accessCheck.allowed) {
    return <>{fallback || <RouteAccessDenied message={accessCheck.message} redirectTo={accessCheck.redirectTo} />}</>
  }

  return <>{children}</>
}
