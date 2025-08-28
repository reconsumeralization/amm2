import {
  filterContentByRole,
  canUserAccessContent,
  filterNavigationItems,
  getContentAccessSummary,
  createUserContentFilter,
  filterrchResults,
  getRestrictedContentFallback
} from '../content-filtering'
import { DocumentationUser } from '../documentation-auth'
import { UserRole } from '@/types/documentation'

// Mock the documentation permissions
jest.mock('../documentation-permissions', () => ({
  hasDocumentationPermission: jest.fn((role: UserRole, section: string, action: string) => {
    const permissions = {
      'system_admin': ['developer', 'business', 'admin', 'shared'],
      'developer': ['developer', 'shared'],
      'salon_owner': ['business', 'business.owner', 'shared'],
      'salon_employee': ['business.employee', 'business.customer', 'shared'],
      'salon_customer': ['business.customer', 'shared'],
      'guest': ['shared', 'business.customer']
    }
    
    const userSections = permissions[role] || []
    return userSections.some(s => section.startsWith(s))
  })
}))

describe('Content Filtering', () => {
  const mockUsers: Record<string, DocumentationUser> = {
    admin: {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'system_admin',
      permissions: ['documentation.admin', 'documentation.edit', 'documentation.read'],
      preferences: { theme: 'dark', language: 'en', compactMode: false }
    },
    developer: {
      id: 'dev-1',
      email: 'dev@example.com',
      name: 'Developer User',
      role: 'developer',
      permissions: ['documentation.edit', 'documentation.read', 'developer.access'],
      preferences: { theme: 'dark', language: 'en', compactMode: false }
    },
    owner: {
      id: 'owner-1',
      email: 'owner@example.com',
      name: 'Salon Owner',
      role: 'salon_owner',
      permissions: ['documentation.read', 'business.owner.access'],
      preferences: { theme: 'light', language: 'en', compactMode: false }
    },
    customer: {
      id: 'customer-1',
      email: 'customer@example.com',
      name: 'Customer User',
      role: 'salon_customer',
      permissions: ['documentation.read', 'business.customer.access'],
      preferences: { theme: 'system', language: 'en', compactMode: false }
    }
  }

  const mockContent = [
    {
      id: 'content-1',
      title: 'Public Content',
      content: 'This is public content',
      metadata: {
        roles: [] as UserRole[],
        permissions: [],
        sections: [],
        tags: ['public'],
        lastModified: new Date(),
        author: 'System'
      }
    },
    {
      id: 'content-2',
      title: 'Developer Content',
      content: 'This is developer content',
      metadata: {
        roles: ['developer', 'system_admin'] as UserRole[],
        permissions: ['developer.access'],
        sections: ['developer'],
        tags: ['technical'],
        lastModified: new Date(),
        author: 'Dev Team'
      }
    },
    {
      id: 'content-3',
      title: 'Business Owner Content',
      content: 'This is business owner content',
      metadata: {
        roles: ['salon_owner', 'system_admin'] as UserRole[],
        permissions: ['business.owner.access'],
        sections: ['business.owner'],
        tags: ['business'],
        lastModified: new Date(),
        author: 'Business Team'
      }
    },
    {
      id: 'content-4',
      title: 'Admin Only Content',
      content: 'This is admin only content',
      metadata: {
        roles: ['system_admin'] as UserRole[],
        permissions: ['documentation.admin'],
        sections: ['admin'],
        tags: ['admin'],
        lastModified: new Date(),
        author: 'Admin'
      }
    }
  ]

  describe('filterContentByRole', () => {
    it('returns all content for admin user', () => {
      const filtered = filterContentByRole(mockContent, mockUsers.admin)
      expect(filtered).toHaveLength(4)
    })

    it('filters content for developer user', () => {
      const filtered = filterContentByRole(mockContent, mockUsers.developer)
      expect(filtered).toHaveLength(2) // Public + Developer content
      expect(filtered.map(c => c.id)).toEqual(['content-1', 'content-2'])
    })

    it('filters content for business owner', () => {
      const filtered = filterContentByRole(mockContent, mockUsers.owner)
      expect(filtered).toHaveLength(2) // Public + Business owner content
      expect(filtered.map(c => c.id)).toEqual(['content-1', 'content-3'])
    })

    it('filters content for customer user', () => {
      const filtered = filterContentByRole(mockContent, mockUsers.customer)
      expect(filtered).toHaveLength(1) // Only public content
      expect(filtered.map(c => c.id)).toEqual(['content-1'])
    })

    it('returns only public content for guest user', () => {
      const filtered = filterContentByRole(mockContent, null)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('content-1')
    })

    it('includes restricted content when includeRestricted is true', () => {
      const filtered = filterContentByRole(
        mockContent, 
        mockUsers.customer, 
        { includeRestricted: true }
      )
      expect(filtered).toHaveLength(4)
    })

    it('shows placeholders for restricted content when showPlaceholders is true', () => {
      const filtered = filterContentByRole(
        mockContent, 
        mockUsers.customer, 
        { 
          includeRestricted: true, 
          showPlaceholders: true,
          fallbackMessage: 'Restricted content'
        }
      )
      
      expect(filtered).toHaveLength(4)
      expect(filtered[1].content).toBe('Restricted content')
      expect(filtered[2].content).toBe('Restricted content')
      expect(filtered[3].content).toBe('Restricted content')
    })
  })

  describe('canUserAccessContent', () => {
    it('allows access to public content for all users', () => {
      expect(canUserAccessContent(mockContent[0], null)).toBe(true)
      expect(canUserAccessContent(mockContent[0], mockUsers.customer)).toBe(true)
      expect(canUserAccessContent(mockContent[0], mockUsers.admin)).toBe(true)
    })

    it('restricts developer content to appropriate roles', () => {
      expect(canUserAccessContent(mockContent[1], null)).toBe(false)
      expect(canUserAccessContent(mockContent[1], mockUsers.customer)).toBe(false)
      expect(canUserAccessContent(mockContent[1], mockUsers.developer)).toBe(true)
      expect(canUserAccessContent(mockContent[1], mockUsers.admin)).toBe(true)
    })

    it('restricts admin content to admin only', () => {
      expect(canUserAccessContent(mockContent[3], mockUsers.developer)).toBe(false)
      expect(canUserAccessContent(mockContent[3], mockUsers.owner)).toBe(false)
      expect(canUserAccessContent(mockContent[3], mockUsers.admin)).toBe(true)
    })
  })

  describe('getContentAccessSummary', () => {
    it('returns correct summary for admin user', () => {
      const summary = getContentAccessSummary(mockUsers.admin)
      expect(summary.role).toBe('system_admin')
      expect(summary.accessibleSections).toContain('developer')
      expect(summary.accessibleSections).toContain('business')
      expect(summary.accessibleSections).toContain('admin')
      expect(summary.restrictedSections).toHaveLength(0)
    })

    it('returns correct summary for developer user', () => {
      const summary = getContentAccessSummary(mockUsers.developer)
      expect(summary.role).toBe('developer')
      expect(summary.accessibleSections).toContain('developer')
      expect(summary.accessibleSections).toContain('shared')
      expect(summary.restrictedSections).toContain('admin')
      expect(summary.restrictedSections).toContain('business.owner')
    })

    it('returns correct summary for guest user', () => {
      const summary = getContentAccessSummary(null)
      expect(summary.role).toBe(null)
      expect(summary.accessibleSections).toEqual(['shared', 'business.customer'])
      expect(summary.restrictedSections).toContain('developer')
      expect(summary.restrictedSections).toContain('admin')
    })
  })

  describe('createUserContentFilter', () => {
    it('creates correct filter for developer user', () => {
      const filter = createUserContentFilter(mockUsers.developer)
      expect(filter.roles).toEqual(['developer'])
      expect(filter.permissions).toContain('developer.access')
      expect(filter.sections).toContain('developer')
      expect(filter.sections).toContain('shared')
    })

    it('creates correct filter for guest user', () => {
      const filter = createUserContentFilter(null)
      expect(filter.roles).toEqual(['guest'])
      expect(filter.permissions).toEqual([])
      expect(filter.sections).toEqual(['shared', 'business.customer'])
      expect(filter.tags).toEqual(['public'])
    })
  })

  describe('filterrchResults', () => {
    const mockrchResults = [
      {
        id: 'result-1',
        title: 'Public Result',
        section: 'shared'
      },
      {
        id: 'result-2',
        title: 'Developer Result',
        section: 'developer',
        requiredRoles: ['developer', 'system_admin']
      },
      {
        id: 'result-3',
        title: 'Admin Result',
        section: 'admin',
        requiredPermissions: ['documentation.admin']
      }
    ]

    it('filters rch results for developer user', () => {
      const filtered = filterrchResults(mockrchResults, mockUsers.developer)
      expect(filtered).toHaveLength(2)
      expect(filtered.map(r => r.id)).toEqual(['result-1', 'result-2'])
    })

    it('filters rch results for customer user', () => {
      const filtered = filterrchResults(mockrchResults, mockUsers.customer)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('result-1')
    })

    it('returns all results for admin user', () => {
      const filtered = filterrchResults(mockrchResults, mockUsers.admin)
      expect(filtered).toHaveLength(3)
    })
  })

  describe('getRestrictedContentFallback', () => {
    it('returns appropriate fallback for developer content', () => {
      const fallback = getRestrictedContentFallback('developer', 'salon_customer')
      expect(fallback.title).toBe('Developer Documentation Restricted')
      expect(fallback.message).toContain('salon customer')
      expect(fallback.suggestions).toContain('Contact your administrator to request developer access')
    })

    it('returns appropriate fallback for admin content', () => {
      const fallback = getRestrictedContentFallback('admin', 'developer')
      expect(fallback.title).toBe('Administrator Documentation Restricted')
      expect(fallback.message).toContain('system admin privileges')
      expect(fallback.suggestions).toContain('Contact your system administrator')
    })

    it('returns default fallback for unknown content type', () => {
      const fallback = getRestrictedContentFallback('unknown', 'guest')
      expect(fallback.title).toBe('Content Restricted')
      expect(fallback.message).toContain('guest')
      expect(fallback.suggestions).toContain('Sign in with appropriate credentials')
    })
  })
})