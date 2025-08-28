import { getUserFromSession, canAccessPath, getAccessDeniedMessage, getDefaultLandingPage } from '@/lib/documentation-auth'
import { filterContentByRole, canUserAccessContent, filterNavigationItems, getContentAccessSummary, createUserContentFilter, filterrchResults, getRestrictedContentFallback } from '@/lib/content-filtering'
import { hasPermission } from '@/lib/documentation-auth'
import { hasDocumentationPermission } from '@/lib/documentation-permissions'
import { DocumentationUser } from '@/lib/documentation-auth'
import { UserRole } from '@/types/documentation'

describe('System-wide sanity tests', () => {
  const mockSession = {
    user: {
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'developer',
      permissions: ['documentation.edit', 'developer.access']
    }
  } as any

  const mockUser: DocumentationUser = {
    id: 'test-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'developer',
    permissions: ['documentation.edit', 'developer.access'],
    preferences: { theme: 'system', language: 'en', compactMode: false }
  }

  test('getUserFromSession returns a DocumentationUser', () => {
    const user = getUserFromSession(mockSession)
    expect(user).toBeDefined()
    expect(user?.role).toBe('developer')
    expect(user?.permissions).toContain('developer.access')
  })

  test('hasPermission works for granted and denied permissions', () => {
    expect(hasPermission(mockUser, 'developer.access')).toBe(true)
    expect(hasPermission(mockUser, 'documentation.admin')).toBe(false)
  })

  test('canAccessPath allows developer paths', () => {
    expect(canAccessPath(mockUser, '/documentation/developer')).toBe(true)
    expect(canAccessPath(mockUser, '/documentation/business')).toBe(false)
  })

  test('getAccessDeniedMessage returns a string', () => {
    const msg = getAccessDeniedMessage(mockUser, '/some/path')
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })

  test('getDefaultLandingPage returns correct path for role', () => {
    const landing = getDefaultLandingPage(mockUser)
    expect(landing).toBe('/documentation/developer')
  })

  test('filterContentByRole returns public content for guest', () => {
    const content = [
      {
        id: 'c1',
        title: 'Public',
        content: 'public',
        metadata: { roles: [] as UserRole[], permissions: [], sections: [], tags: [], lastModified: new Date(), author: 'sys' }
      },
      {
        id: 'c2',
        title: 'Dev',
        content: 'dev',
        metadata: { roles: ['developer'] as UserRole[], permissions: [], sections: [], tags: [], lastModified: new Date(), author: 'dev' }
      }
    ]
    const filtered = filterContentByRole(content, null)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('c1')
  })

  test('canUserAccessContent respects role restrictions', () => {
    const content = {
      id: 'c2',
      title: 'Dev',
      content: 'dev',
      metadata: { roles: ['developer'] as UserRole[], permissions: [], sections: [], tags: [], lastModified: new Date(), author: 'dev' }
    }
    expect(canUserAccessContent(content, mockUser)).toBe(true)
    expect(canUserAccessContent(content, null)).toBe(false)
  })

  test('filterNavigationItems removes inaccessible items', () => {
    const nav = [
      { href: '/documentation/developer', requiredRole: ['developer'] },
      { href: '/documentation/business', requiredRole: ['salon_owner'] }
    ]
    const filtered = filterNavigationItems(nav, mockUser)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].href).toBe('/documentation/developer')
  })

  test('getContentAccessSummary returns expected sections for developer', () => {
    const summary = getContentAccessSummary(mockUser)
    expect(summary.role).toBe('developer')
    expect(summary.accessibleSections).toContain('developer')
    expect(summary.restrictedSections).toContain('admin')
  })

  test('createUserContentFilter builds correct filter', () => {
    const filter = createUserContentFilter(mockUser)
    expect(filter.roles).toEqual(['developer'])
    expect(filter.permissions).toContain('developer.access')
    expect(filter.sections).toContain('developer')
  })

  test('filterrchResults respects user filter', () => {
    const results = [
      { id: 'r1', section: 'shared' },
      { id: 'r2', section: 'developer', requiredRoles: ['developer'] },
      { id: 'r3', section: 'admin', requiredPermissions: ['documentation.admin'] }
    ]
    const filtered = filterrchResults(results, mockUser)
    expect(filtered.map(r => r.id)).toEqual(['r1', 'r2'])
  })

  test('getRestrictedContentFallback returns appropriate fallback', () => {
    const fallback = getRestrictedContentFallback('developer', 'salon_customer')
    expect(fallback.title).toBe('Developer Documentation Restricted')
    expect(fallback.message).toContain('salon customer')
  })
})
