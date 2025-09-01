import { ComponentType } from 'react'
import { ModuleRegistry, ModuleNavigation } from './module-registry'

export interface NavigationItem extends ModuleNavigation {
  id: string
  moduleId: string
  priority: number
  group?: string
}

export interface NavigationGroup {
  id: string
  label: string
  items: NavigationItem[]
  priority: number
}

export class NavigationService {
  private static navigationItems: Map<string, NavigationItem> = new Map()
  private static navigationGroups: Map<string, NavigationGroup> = new Map()

  static async loadModuleNavigation() {
    console.log('🔧 Loading navigation from modules...')

    // Load navigation from all registered modules
    const modules = ModuleRegistry.getAllModules()

    for (const [moduleId, manifest] of modules) {
      if (manifest.navigation && manifest.navigation.length > 0) {
        console.log(`📍 Loading navigation for module: ${moduleId}`)

        for (const navItem of manifest.navigation) {
          const navigationItem: NavigationItem = {
            ...navItem,
            id: `${moduleId}-${navItem.path.replace(/\//g, '-')}`,
            moduleId,
            priority: this.getNavigationPriority(navItem.path)
          }

          this.navigationItems.set(navigationItem.id, navigationItem)
        }
      }
    }

    console.log(`✅ Loaded ${this.navigationItems.size} navigation items from modules`)
  }

  static getNavigationItems(): NavigationItem[] {
    return Array.from(this.navigationItems.values())
      .sort((a, b) => a.priority - b.priority)
  }

  static getNavigationByGroup(): NavigationGroup[] {
    const groups = new Map<string, NavigationItem[]>()

    // Group navigation items
    for (const item of this.navigationItems.values()) {
      const groupId = item.group || 'main'
      if (!groups.has(groupId)) {
        groups.set(groupId, [])
      }
      groups.get(groupId)!.push(item)
    }

    // Convert to NavigationGroup array
    return Array.from(groups.entries()).map(([groupId, items]) => ({
      id: groupId,
      label: this.getGroupLabel(groupId),
      items: items.sort((a, b) => a.priority - b.priority),
      priority: this.getGroupPriority(groupId)
    })).sort((a, b) => a.priority - b.priority)
  }

  static getNavigationForModule(moduleId: string): NavigationItem[] {
    return Array.from(this.navigationItems.values())
      .filter(item => item.moduleId === moduleId)
      .sort((a, b) => a.priority - b.priority)
  }

  static hasNavigationForModule(moduleId: string): boolean {
    return Array.from(this.navigationItems.values())
      .some(item => item.moduleId === moduleId)
  }

  static async getComponentForNavigation(path: string): Promise<ComponentType<any> | null> {
    for (const item of this.navigationItems.values()) {
      if (item.path === path && item.component) {
        return item.component
      }
    }
    return null
  }

  static getNavigationByPath(path: string): NavigationItem | undefined {
    return Array.from(this.navigationItems.values())
      .find(item => item.path === path)
  }

  static getNavigationPermissions(): string[] {
    const permissions = new Set<string>()

    for (const item of this.navigationItems.values()) {
      if (item.permissions) {
        item.permissions.forEach(permission => permissions.add(permission))
      }
    }

    return Array.from(permissions)
  }

  private static getNavigationPriority(path: string): number {
    // Define priority based on path patterns
    if (path === '/' || path === '/home') return 1
    if (path.includes('/dashboard')) return 2
    if (path.includes('/admin')) return 3
    if (path.includes('/demo') || path.includes('/theme')) return 4
    if (path.includes('/settings')) return 5
    return 10 // Default priority
  }

  private static getGroupLabel(groupId: string): string {
    const groupLabels: Record<string, string> = {
      main: 'Main Navigation',
      admin: 'Administration',
      demo: 'Demo & Examples',
      theme: 'Theme Showcase',
      tools: 'Tools & Utilities',
      settings: 'Settings'
    }

    return groupLabels[groupId] || 'Navigation'
  }

  private static getGroupPriority(groupId: string): number {
    const groupPriorities: Record<string, number> = {
      main: 1,
      admin: 2,
      demo: 3,
      theme: 4,
      tools: 5,
      settings: 6
    }

    return groupPriorities[groupId] || 10
  }

  static clearNavigation() {
    this.navigationItems.clear()
    this.navigationGroups.clear()
  }

  static reloadNavigation() {
    this.clearNavigation()
    return this.loadModuleNavigation()
  }
}

// Helper function to get navigation items for a specific user role
export function getNavigationForRole(role?: string): NavigationItem[] {
  const allItems = NavigationService.getNavigationItems()

  if (!role) return allItems

  return allItems.filter(item => {
    if (!item.permissions) return true

    // Check if user has required permissions
    return item.permissions.some(permission => {
      // This would typically check against user permissions
      // For now, return all items (implement permission checking as needed)
      return true
    })
  })
}

// Export navigation utilities
export { NavigationService as default }
