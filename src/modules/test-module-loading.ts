/**
 * Test script to verify module loading functionality
 * This script tests the modular architecture and can be run to verify
 * that all modules load correctly and widgets are available.
 */

import { ModuleRegistry } from './module-registry'

export async function testModuleLoading() {
  console.log('🧪 Testing Modern Men Modules System...\n')

  const results = {
    sharedModule: false,
    themeModule: false,
    demoModule: false,
    themeWidget: false,
    demoComponent: false
  }

  try {
    // Test 1: Load Shared Module
    console.log('1. Testing Shared Module loading...')
    const sharedManifest = await ModuleRegistry.loadModule('shared')
    if (sharedManifest) {
      results.sharedModule = true
      console.log('✅ Shared module loaded successfully')

      // Test shared components
      const loadingComponent = ModuleRegistry.getComponent('shared', 'Loading')
      if (loadingComponent) {
        console.log('✅ Loading component available')
      } else {
        console.log('❌ Loading component not found')
      }
    } else {
      console.log('❌ Shared module failed to load')
    }

    // Test 2: Load Theme Module
    console.log('\n2. Testing Theme Module loading...')
    const themeManifest = await ModuleRegistry.loadModule('theme')
    if (themeManifest) {
      results.themeModule = true
      console.log('✅ Theme module loaded successfully')

      // Test theme widget
      const themeWidget = await ModuleRegistry.loadWidget('theme', 'ThemeShowcaseWidget')
      if (themeWidget) {
        results.themeWidget = true
        console.log('✅ ThemeShowcaseWidget loaded successfully')
      } else {
        console.log('❌ ThemeShowcaseWidget failed to load')
      }

      // Test theme components
      const monitoringExample = ModuleRegistry.getComponent('theme', 'MonitoringExample')
      if (monitoringExample) {
        console.log('✅ MonitoringExample component available')
      } else {
        console.log('❌ MonitoringExample component not found')
      }
    } else {
      console.log('❌ Theme module failed to load')
    }

    // Test 3: Load Demo Module
    console.log('\n3. Testing Demo Module loading...')
    const demoManifest = await ModuleRegistry.loadModule('demo')
    if (demoManifest) {
      results.demoModule = true
      console.log('✅ Demo module loaded successfully')

      // Test demo component
      const demoPage = ModuleRegistry.getComponent('demo', 'DemoPage')
      if (demoPage) {
        results.demoComponent = true
        console.log('✅ DemoPage component available')
      } else {
        console.log('❌ DemoPage component not found')
      }
    } else {
      console.log('❌ Demo module failed to load')
    }

    // Test 4: Cross-module interaction
    console.log('\n4. Testing cross-module interaction...')
    if (results.themeModule && results.demoModule) {
      console.log('✅ Both theme and demo modules loaded - cross-module interaction possible')

      // Test widget loading from demo module
      const widget = await ModuleRegistry.loadWidget('theme', 'ThemeShowcaseWidget')
      if (widget) {
        console.log('✅ Widget can be loaded from demo module context')
      }
    } else {
      console.log('⚠️ Cross-module testing skipped - modules not fully loaded')
    }

    // Test 5: Module Registry functionality
    console.log('\n5. Testing Module Registry functionality...')
    const allModules = ModuleRegistry.getAllModules()
    console.log(`📊 Total modules registered: ${allModules.size}`)

    const availableWidgets = ModuleRegistry.getAvailableWidgets()
    console.log(`🎨 Available widgets: ${Object.keys(availableWidgets).join(', ')}`)

    const allPermissions = ModuleRegistry.getAllPermissions()
    console.log(`🔐 Total permissions available: ${allPermissions.length}`)

    // Summary
    console.log('\n📋 Test Results Summary:')
    console.log(`Shared Module: ${results.sharedModule ? '✅' : '❌'}`)
    console.log(`Theme Module: ${results.themeModule ? '✅' : '❌'}`)
    console.log(`Demo Module: ${results.demoModule ? '✅' : '❌'}`)
    console.log(`Theme Widget: ${results.themeWidget ? '✅' : '❌'}`)
    console.log(`Demo Component: ${results.demoComponent ? '✅' : '❌'}`)

    const passedTests = Object.values(results).filter(Boolean).length
    const totalTests = Object.keys(results).length

    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`)

    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Modular system is working correctly.')
      return true
    } else {
      console.log('⚠️ Some tests failed. Check the output above for details.')
      return false
    }

  } catch (error) {
    console.error('❌ Module loading test failed:', error)
    return false
  }
}

// Export for use in other test files
export { results }
