'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { Clock } from '@/lib/icon-mapping'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserFromSession, canAccessPath, getAccessDeniedMessage, getDefaultLandingPage } from '@/lib/documentation-auth'
import { UserRole } from '@/types/documentation'

interface AccessControlProps {
    children: React.ReactNode
    requiredRole?: UserRole | UserRole[]
    requiredPermission?: string
    path?: string
    fallback?: React.ReactNode
    showFallback?: boolean
}

/**
 * Access Control Component
 * Wraps content and shows/hides based on user permissions
 */
export function AccessControl({
    children,
    requiredRole,
    requiredPermission,
    path,
    fallback,
    showFallback = true
}: AccessControlProps): React.ReactElement | null {
    const { data: session, status } = useSession() as any

    // Loading state
    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
        )
    }

    const user = getUserFromSession(session)

    // Check path-based access
    if (path && !canAccessPath(user, path)) {
        return showFallback ? (
            fallback ? <>{fallback}</> : <AccessDeniedFallback user={user} path={path} />
        ) : null
    }

    // Check role-based access
    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
        if (!user || !roles.includes(user.role)) {
            return showFallback ? (
                fallback ? <>{fallback}</> : <AccessDeniedFallback user={user} requiredRole={roles} />
            ) : null
        }
    }

    // Check permission-based access
    if (requiredPermission) {
        if (!user || !user.permissions || !user.permissions.includes(requiredPermission)) {
            return showFallback ? (
                fallback ? <>{fallback}</> : <AccessDeniedFallback user={user} requiredPermission={requiredPermission} />
            ) : null
        }
    }

    return <>{children}</>
}

interface AccessDeniedFallbackProps {
    user: any
    path?: string
    requiredRole?: UserRole[]
    requiredPermission?: string
}

function AccessDeniedFallback({ user, path, requiredRole, requiredPermission }: AccessDeniedFallbackProps) {
    const getMessage = () => {
        if (path) {
            return getAccessDeniedMessage(user, path)
        }

        if (requiredRole) {
            const roleNames = requiredRole.map(role =>
                role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
            ).join(', ')
            return `This content requires one of the following roles: ${roleNames}`
        }

        if (requiredPermission) {
            return `This content requires the permission: ${requiredPermission}`
        }

        return "You don't have permission to access this content."
    }

    const getRedirectPath = () => {
        if (user) {
            return getDefaultLandingPage(user)
        }
        return '/auth/signin'
    }

    return (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                    {/* The 'Lock' component is currently not a valid React component based on linting errors. */}
                    {/* Falling back to the emoji to resolve the error. Please ensure 'Lock' is a valid React component if intended for use. */}
                    <span className="h-5 w-5">🔒</span>
                    Access Restricted
                </CardTitle>
                <CardDescription className="text-amber-700 dark:text-amber-300">
                    {getMessage()}
                    {getMessage()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                    {!user && (
                        <Button asChild size="sm">
                            <a href="/auth/signin">Sign In</a>
                        </Button>
                    )}
                    <Button asChild variant="outline" size="sm">
                        <a href={getRedirectPath()}>
                            {user ? 'Go to Your Dashboard' : 'Back to Documentation'}
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

/**
 * Permission Gate Component
 * Simple wrapper that shows/hides content based on permissions
 */
interface PermissionGateProps {
    children: React.ReactNode
    permission: string
    fallback?: React.ReactNode
}

export function PermissionGate({ children, permission, fallback }: PermissionGateProps) {
    return (
        <AccessControl
            requiredPermission={permission}
            fallback={fallback}
            showFallback={!!fallback}
        >
            {children}
        </AccessControl>
    )
}

/**
 * Role Guard Component
 * Simple wrapper that shows/hides content based on user role
 */
interface RoleGuardProps {
    children: React.ReactNode
    roles: UserRole | UserRole[]
    fallback?: React.ReactNode
}

export function RoleGuard({ children, roles, fallback }: RoleGuardProps) {
    return (
        <AccessControl
            requiredRole={roles}
            fallback={fallback}
            showFallback={!!fallback}
        >
            {children}
        </AccessControl>
    )
}

/**
 * Admin Only Component
 * Convenience wrapper for admin-only content
 */
interface AdminOnlyProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function AdminOnly({ children, fallback }: AdminOnlyProps) {
    return (
        <RoleGuard roles="system_admin" fallback={fallback}>
            {children}
        </RoleGuard>
    )
}

/**
 * Developer Only Component
 * Convenience wrapper for developer-only content
 */
interface DeveloperOnlyProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function DeveloperOnly({ children, fallback }: DeveloperOnlyProps) {
    return (
        <RoleGuard roles={['developer', 'system_admin']} fallback={fallback}>
            {children}
        </RoleGuard>
    )
}

/**
 * Business Only Component
 * Convenience wrapper for business user content
 */
interface BusinessOnlyProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function BusinessOnly({ children, fallback }: BusinessOnlyProps) {
    return (
        <RoleGuard
            roles={['salon_owner', 'salon_employee', 'salon_customer', 'system_admin']}
            fallback={fallback}
        >
            {children}
        </RoleGuard>
    )
}

/**
 * Authenticated Only Component
 * Shows content only to authenticated users
 */
interface AuthenticatedOnlyProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function AuthenticatedOnly({ children, fallback }: AuthenticatedOnlyProps) {
    const { data: session, status } = useSession() as any

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
            </div>
        )
    }

    if (!session) {
        return fallback ? <>{fallback}</> : (
            <Alert>
                {/* The 'Lock' component is not a valid JSX element type according to linting errors.
                    To fix this, we are directly using the fallback emoji.
                    If a specific icon component is intended, ensure it is correctly imported
                    and defined as a React component (e.g., from a UI library like Lucide). */}
                <span className="h-4 w-4">🔒</span>
                <AlertDescription>
                    Please sign in to access this content.
                </AlertDescription>
            </Alert>
        )
    }

    return <>{children}</>
}
