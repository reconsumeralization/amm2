import { ComponentType } from 'react'

export interface ModuleManifest {
  name: string
  version: string
  description: string
  author?: string
  dependencies?: string[]
  widgets?: Record<string, ComponentType<any>>
  components?: Record<string, ComponentType<any>>
  routes?: Record<string, ComponentType<any>>
  hooks?: Record<string, any>
  utils?: Record<string, any>
  styles?: string[]
  permissions?: string[]
  navigation?: ModuleNavigation[]
}

export interface ModuleNavigation {
  path: string
  label: string
  icon?: string
  component: ComponentType<any>
  permissions?: string[]
  children?: ModuleNavigation[]
}

export class ModuleRegistry {
  private static modules: Map<string, ModuleManifest> = new Map()
  private static loadedModules: Set<string> = new Set()

  static register(moduleId: string, manifest: ModuleManifest) {
    this.modules.set(moduleId, manifest)
    console.log(`Module registered: ${moduleId} v${manifest.version}`)
  }

  static getModule(moduleId: string): ModuleManifest | undefined {
    return this.modules.get(moduleId)
  }

  static getAllModules(): Map<string, ModuleManifest> {
    return this.modules
  }

  static getWidget(moduleId: string, widgetId: string): ComponentType<any> | undefined {
    const module = this.modules.get(moduleId)
    return module?.widgets?.[widgetId]
  }

  static getComponent(moduleId: string, componentId: string): ComponentType<any> | undefined {
    const module = this.modules.get(moduleId)
    return module?.components?.[componentId]
  }

  static getNavigation(moduleId: string): ModuleNavigation[] | undefined {
    const module = this.modules.get(moduleId)
    return module?.navigation
  }

  static isModuleLoaded(moduleId: string): boolean {
    return this.loadedModules.has(moduleId)
  }

  static markModuleLoaded(moduleId: string) {
    this.loadedModules.add(moduleId)
  }

  static async loadModule(moduleId: string): Promise<ModuleManifest | null> {
    try {
      // Dynamic import of module
      const module = await import(`./${moduleId}/manifest.ts`)
      const manifest: ModuleManifest = module.default

      this.register(moduleId, manifest)
      this.markModuleLoaded(moduleId)

      return manifest
    } catch (error) {
      console.error(`Failed to load module ${moduleId}:`, error)
      return null
    }
  }

  static async loadWidget(moduleId: string, widgetId: string): Promise<ComponentType<any> | null> {
    try {
      const widget = this.getWidget(moduleId, widgetId)
      if (widget) {
        return widget
      }

      // Try to load the module if not already loaded
      if (!this.isModuleLoaded(moduleId)) {
        await this.loadModule(moduleId)
      }

      return this.getWidget(moduleId, widgetId) || null
    } catch (error) {
      console.error(`Failed to load widget ${moduleId}:${widgetId}:`, error)
      return null
    }
  }

  static getAvailableWidgets(): Record<string, Record<string, ComponentType<any>>> {
    const widgets: Record<string, Record<string, ComponentType<any>>> = {}

    for (const [moduleId, manifest] of this.modules) {
      if (manifest.widgets) {
        widgets[moduleId] = manifest.widgets
      }
    }

    return widgets
  }

  static getModulePermissions(moduleId: string): string[] {
    const module = this.modules.get(moduleId)
    return module?.permissions || []
  }

  static getAllPermissions(): string[] {
    const permissions = new Set<string>()

    for (const manifest of this.modules.values()) {
      if (manifest.permissions) {
        manifest.permissions.forEach(perm => permissions.add(perm))
      }
    }

    return Array.from(permissions)
  }
}
