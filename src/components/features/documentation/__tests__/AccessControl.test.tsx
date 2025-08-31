import React from 'react'
import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { AccessControl, PermissionGate, RoleGuard, AdminOnly, DeveloperOnly } from '../AccessControl'

// Mock next-auth
jest.mock('next-auth/react')
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

// Mock the auth utilities
jest.mock('@/lib/documentation-auth', () => ({
  getUserFromSession: jest.fn((session) => {
    if (!session) return null
    return {
      id: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      role: ((session as any).user)?.role || 'guest',
      permissions: ((session as any).user)?.permissions || [],
      preferences: {
        theme: 'system',
        language: 'en',
        compactMode: false
      }
    }
  }),
  canAccessPath: jest.fn(() => true),
  getAccessDeniedMessage: jest.fn(() => 'Access denied'),
  getDefaultLandingPage: jest.fn(() => '/documentation')
}))

describe('AccessControl', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading'
    })

    render(
      <AccessControl>
        <div>Protected content</div>
      </AccessControl>
    )

    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows content when user has required role', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'developer'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <AccessControl requiredRole="developer">
        <div>Developer content</div>
      </AccessControl>
    )

    expect(screen.getByText('Developer content')).toBeInTheDocument()
  })

  it('shows access denied when user lacks required role', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'guest'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <AccessControl requiredRole="developer">
        <div>Developer content</div>
      </AccessControl>
    )

    expect(screen.getByText('Access Restricted')).toBeInTheDocument()
    expect(screen.queryByText('Developer content')).not.toBeInTheDocument()
  })

  it('shows content when user has required permission', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'developer'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <AccessControl requiredPermission="documentation.edit">
        <div>Editable content</div>
      </AccessControl>
    )

    expect(screen.getByText('Editable content')).toBeInTheDocument()
  })

  it('shows access denied when user lacks required permission', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'guest'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <AccessControl requiredPermission="documentation.edit">
        <div>Editable content</div>
      </AccessControl>
    )

    expect(screen.getByText('Access Restricted')).toBeInTheDocument()
    expect(screen.queryByText('Editable content')).not.toBeInTheDocument()
  })

  it('shows custom fallback when provided', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'guest'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <AccessControl 
        requiredRole="developer" 
        fallback={<div>Custom fallback</div>}
      >
        <div>Developer content</div>
      </AccessControl>
    )

    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
    expect(screen.queryByText('Developer content')).not.toBeInTheDocument()
  })

  it('hides content when showFallback is false', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-guest-id',
          email: 'guest@example.com',
          name: 'Guest User',
          role: 'guest'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <AccessControl requiredRole="developer" showFallback={false}>
        <div>Developer content</div>
      </AccessControl>
    )

    expect(screen.queryByText('Developer content')).not.toBeInTheDocument()
    expect(screen.queryByText('Access Restricted')).not.toBeInTheDocument()
  })
})

describe('PermissionGate', () => {
  it('shows content when user has permission', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'developer'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <PermissionGate permission="documentation.edit">
        <div>Editable content</div>
      </PermissionGate>
    )

    expect(screen.getByText('Editable content')).toBeInTheDocument()
  })

  it('hides content when user lacks permission', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-guest-id',
          email: 'guest@example.com',
          name: 'Guest User',
          role: 'guest'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <PermissionGate permission="documentation.edit">
        <div>Editable content</div>
      </PermissionGate>
    )

    expect(screen.queryByText('Editable content')).not.toBeInTheDocument()
  })
})

describe('RoleGuard', () => {
  it('shows content for single role match', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-developer-id',
          email: 'developer@example.com',
          name: 'Developer User',
          role: 'developer'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <RoleGuard roles="developer">
        <div>Developer content</div>
      </RoleGuard>
    )

    expect(screen.getByText('Developer content')).toBeInTheDocument()
  })

  it('shows content for multiple role match', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-barber-owner-id',
          email: 'owner@example.com',
          name: 'barber Owner',
          role: 'barber_owner'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <RoleGuard roles={['barber_owner', 'system_admin']}>
        <div>Business content</div>
      </RoleGuard>
    )

    expect(screen.getByText('Business content')).toBeInTheDocument()
  })

  it('hides content when role does not match', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-guest-id',
          email: 'guest@example.com',
          name: 'Guest User',
          role: 'guest'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <RoleGuard roles="developer">
        <div>Developer content</div>
      </RoleGuard>
    )

    expect(screen.queryByText('Developer content')).not.toBeInTheDocument()
  })
})

describe('AdminOnly', () => {
  it('shows content for system admin', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-system-admin-id',
          email: 'admin@example.com',
          name: 'System Admin',
          role: 'system_admin'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <AdminOnly>
        <div>Admin content</div>
      </AdminOnly>
    )

    expect(screen.getByText('Admin content')).toBeInTheDocument()
  })

  it('hides content for non-admin users', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-developer-id',
          email: 'developer@example.com',
          name: 'Developer User',
          role: 'developer'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <AdminOnly>
        <div>Admin content</div>
      </AdminOnly>
    )

    expect(screen.queryByText('Admin content')).not.toBeInTheDocument()
  })
})

describe('DeveloperOnly', () => {
  it('shows content for developer', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'developer@example.com',
          name: 'Developer User',
          role: 'developer'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <DeveloperOnly>
        <div>Developer content</div>
      </DeveloperOnly>
    )

    expect(screen.getByText('Developer content')).toBeInTheDocument()
  })

  it('shows content for system admin', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-system-admin-id',
          email: 'admin@example.com',
          name: 'System Admin',
          role: 'system_admin'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <DeveloperOnly>
        <div>Developer content</div>
      </DeveloperOnly>
    )

    expect(screen.getByText('Developer content')).toBeInTheDocument()
  })

  it('hides content for business users', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-barber-owner-id',
          email: 'owner@example.com',
          name: 'barber Owner',
          role: 'barber_owner'
        , permissions: []},
        expires: '2024-12-31T23:59:59.999Z'
      },
      status: 'authenticated'
    })

    render(
      <DeveloperOnly>
        <div>Developer content</div>
      </DeveloperOnly>
    )

    expect(screen.queryByText('Developer content')).not.toBeInTheDocument()
  })
})
