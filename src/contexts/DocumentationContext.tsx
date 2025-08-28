'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { DocumentationUser, getUserFromSession } from '@/lib/documentation-auth'
import { getContentAccessSummary } from '@/lib/content-filtering'
import { UserRole } from '@/types/documentation'

interface DocumentationContextType {
  user: DocumentationUser | null
  isLoading: boolean
  isAuthenticated: boolean
  accessSummary: {
    accessibleSections: string[]
    restrictedSections: string[]
    permissions: string[]
    role: UserRole | null
  }
  hasPermission: (permission: string) => boolean
  canAccessSection: (section: string) => boolean
  refreshUser: () => void
}

const DocumentationContext = createContext<DocumentationContextType | undefined>(undefined)

interface DocumentationProviderProps {
  children: React.ReactNode
}

export function DocumentationProvider({ children }: DocumentationProviderProps) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<DocumentationUser | null>(null)
  const [accessSummary, setAccessSummary] = useState({
    accessibleSections: [] as string[],
    restrictedSections: [] as string[],
    permissions: [] as string[],
    role: null as UserRole | null
  })

  const isLoading = status === 'loading'
  const isAuthenticated = !!session

  // Update user and access summary when session changes
  useEffect(() => {
    const documentationUser = getUserFromSession(session)
    setUser(documentationUser)
    
    const summary = getContentAccessSummary(documentationUser)
    setAccessSummary(summary)
  }, [session])

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.permissions.includes(permission) || user.permissions.includes('documentation.admin')
  }

  const canAccessSection = (section: string): boolean => {
    return accessSummary.accessibleSections.some(accessible => 
      section.startsWith(accessible)
    )
  }

  const refreshUser = () => {
    const documentationUser = getUserFromSession(session)
    setUser(documentationUser)
    
    const summary = getContentAccessSummary(documentationUser)
    setAccessSummary(summary)
  }

  const value: DocumentationContextType = {
    user,
    isLoading,
    isAuthenticated,
    accessSummary,
    hasPermission,
    canAccessSection,
    refreshUser
  }

  return (
    <DocumentationContext.Provider value={value}>
      {children}
    </DocumentationContext.Provider>
  )
}

export function useDocumentation() {
  const context = useContext(DocumentationContext)
  if (context === undefined) {
    throw new Error('useDocumentation must be used within a DocumentationProvider')
  }
  return context
}

/**
 * Hook for checking permissions
 */
export function usePermissions() {
  const { user, hasPermission, canAccessSection } = useDocumentation()
  
  return {
    user,
    hasPermission,
    canAccessSection,
    isAdmin: user?.role === 'system_admin',
    isDeveloper: user?.role === 'developer' || user?.role === 'system_admin',
    isBusiness: ['salon_owner', 'salon_employee', 'salon_customer'].includes(user?.role || ''),
    isOwner: user?.role === 'salon_owner',
    isEmployee: user?.role === 'salon_employee',
    isCustomer: user?.role === 'salon_customer',
    isGuest: !user || user.role === 'guest'
  }
}

/**
 * Hook for role-based conditional rendering
 */
export function useRoleAccess() {
  const { user, canAccessSection } = useDocumentation()
  
  const checkRoleAccess = (requiredRoles: UserRole | UserRole[]): boolean => {
    if (!user) return false
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return roles.includes(user.role)
  }

  const checkMultipleConditions = (conditions: {
    roles?: UserRole[]
    permissions?: string[]
    sections?: string[]
  }): boolean => {
    if (!user) return false

    // Check roles
    if (conditions.roles && !conditions.roles.includes(user.role)) {
      return false
    }

    // Check permissions
    if (conditions.permissions && !conditions.permissions.some(p => user.permissions.includes(p))) {
      return false
    }

    // Check sections
    if (conditions.sections && !conditions.sections.some(s => canAccessSection(s))) {
      return false
    }

    return true
  }

  return {
    checkRoleAccess,
    checkMultipleConditions,
    canAccess: {
      developer: checkRoleAccess(['developer', 'system_admin']),
      admin: checkRoleAccess('system_admin'),
      business: checkRoleAccess(['salon_owner', 'salon_employee', 'salon_customer', 'system_admin']),
      owner: checkRoleAccess(['salon_owner', 'system_admin']),
      employee: checkRoleAccess(['salon_employee', 'salon_owner', 'system_admin']),
      customer: checkRoleAccess(['salon_customer', 'salon_employee', 'salon_owner', 'system_admin'])
    }
  }
}

/**
 * Hook for navigation filtering
 */
export function useNavigationAccess() {
  const { canAccessSection } = useDocumentation()
  const { canAccess } = useRoleAccess()

  const filterNavigationItems = (items: any[]): any[] => {
    return items.filter(item => {
      // Check section access
      if (item.section && !canAccessSection(item.section)) {
        return false
      }

      // Check role access
      if (item.requiredRole) {
        const roles = Array.isArray(item.requiredRole) ? item.requiredRole : [item.requiredRole]
        const hasAccess = roles.some((role: string) => {
          switch (role) {
            case 'developer': return canAccess.developer
            case 'admin': return canAccess.admin
            case 'business': return canAccess.business
            case 'owner': return canAccess.owner
            case 'employee': return canAccess.employee
            case 'customer': return canAccess.customer
            default: return false
          }
        })
        if (!hasAccess) return false
      }

      // Filter children recursively
      if (item.children) {
        item.children = filterNavigationItems(item.children)
        return item.children.length > 0
      }

      return true
    })
  }

  return { filterNavigationItems }
}