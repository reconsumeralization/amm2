import { ModuleRegistry } from './module-registry'
import { NavigationService } from './navigation-service'

// Initialize all modules
export async function initializeModules() {
  try {
    console.log('🚀 Initializing Modern Men Modules System...')

    // Register shared module
    const sharedManifest = await ModuleRegistry.loadModule('shared')
    if (sharedManifest) {
      console.log('✅ Shared module loaded successfully')
    } else {
      console.warn('⚠️ Shared module failed to load')
    }

    // Register theme module
    const themeManifest = await ModuleRegistry.loadModule('theme')
    if (themeManifest) {
      console.log('✅ Theme module loaded successfully')
    } else {
      console.warn('⚠️ Theme module failed to load')
    }

    // Register demo module
    const demoManifest = await ModuleRegistry.loadModule('demo')
    if (demoManifest) {
      console.log('✅ Demo module loaded successfully')
    } else {
      console.warn('⚠️ Demo module failed to load')
    }

    // Load navigation from modules
    await NavigationService.loadModuleNavigation()

    console.log('🎉 All modules and navigation initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize modules:', error)
  }
}

// Export available widgets for easy access
export function getAvailableWidgets() {
  return ModuleRegistry.getAvailableWidgets()
}

// Export module utilities
export { ModuleRegistry }
