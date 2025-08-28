import { hasDocumentationPermission, getAccessibleSections, getUserRoleFromSession, getRoleBasedNavigation, isAdminOrDeveloper } from '@/lib/documentation-permissions'
 

describe('Documentation Permissions Utilities', () => {
  test('hasDocumentationPermission correctly evaluates read access', () => {
    expect(hasDocumentationPermission('developer', 'developer', 'read')).toBe(true)
    expect(hasDocumentationPermission('salon_owner', 'developer', 'read')).toBe(false)
    expect(hasDocumentationPermission('system_admin', 'admin', 'read')).toBe(true)
    expect(hasDocumentationPermission('guest', 'shared', 'read')).toBe(true)
  })

  test('hasDocumentationPermission correctly evaluates edit access', () => {
    expect(hasDocumentationPermission('developer', 'developer', 'edit')).toBe(true)
    expect(hasDocumentationPermission('salon_owner', 'developer', 'edit')).toBe(false)
    expect(hasDocumentationPermission('system_admin', 'admin', 'edit')).toBe(true)
    expect(hasDocumentationPermission('guest', 'shared', 'edit')).toBe(false)
  })

  test('hasDocumentationPermission returns false for undefined sections', () => {
    // Section not defined in permissions map
    expect(hasDocumentationPermission('developer', 'nonexistent', 'read')).toBe(false)
    expect(hasDocumentationPermission('guest', 'nonexistent', 'read')).toBe(true) // fallback to guest read
  })

  test('getAccessibleSections returns all readable sections for a role', () => {
    const devSections = getAccessibleSections('developer')
    expect(devSections).toContain('developer')
    expect(devSections).toContain('shared')
    expect(devSections).not.toContain('admin')

    const adminSections = getAccessibleSections('system_admin')
    expect(adminSections).toContain('admin')
    expect(adminSections).toContain('developer')
    expect(adminSections).toContain('business')
    expect(adminSections).toContain('shared')
  })

  test('getUserRoleFromSession maps session roles correctly', () => {
    const sessionAdmin = { user: { role: 'system_admin' } } as any
    const sessionDev = { user: { role: 'developer' } } as any
    const sessionOwner = { user: { role: 'owner' } } as any
    const sessionEmployee = { user: { role: 'stylist' } } as any
    const sessionCustomer = { user: { role: 'client' } } as any
    const sessionGuest: any = { user: { role: undefined } }

    expect(getUserRoleFromSession(sessionAdmin)).toBe('system_admin')
    expect(getUserRoleFromSession(sessionDev)).toBe('developer')
    expect(getUserRoleFromSession(sessionOwner)).toBe('salon_owner')
    expect(getUserRoleFromSession(sessionEmployee)).toBe('salon_employee')
    expect(getUserRoleFromSession(sessionCustomer)).toBe('salon_customer')
    expect(getUserRoleFromSession(sessionGuest)).toBe('guest')
  })

  test('getRoleBasedNavigation builds correct navigation structure', () => {
const devNav = getRoleBasedNavigation('developer') as any[]
const adminNav = getRoleBasedNavigation('system_admin') as any[]
const guestNav = getRoleBasedNavigation('guest') as any[]

    // Developer should see Developer, Business (shared), and Shared sections
    expect(devNav.some(item => item.title === 'Developer')).toBe(true)
    expect(devNav.some(item => item.title === 'Business')).toBe(false) // developer role does not have business read
    expect(devNav.some(item => item.title === 'Shared Resources')).toBe(true)

    // Admin should see all top‑level sections
    expect(adminNav.some(item => item.title === 'Developer')).toBe(true)
    expect(adminNav.some(item => item.title === 'Business')).toBe(true)
    expect(adminNav.some(item => item.title === 'Administration')).toBe(true)

    // Guest should only see Shared Resources
    expect(guestNav.length).toBe(1)
    expect(guestNav[0].title).toBe('Shared Resources')
  })

  test('isAdminOrDeveloper identifies admin or developer roles', () => {
    expect(isAdminOrDeveloper('system_admin')).toBe(true)
    expect(isAdminOrDeveloper('developer')).toBe(true)
    expect(isAdminOrDeveloper('salon_owner')).toBe(false)
    expect(isAdminOrDeveloper('guest')).toBe(false)
  })
})
