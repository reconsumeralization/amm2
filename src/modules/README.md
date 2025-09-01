# Modern Men Modules System

A comprehensive modular architecture for the Modern Men Hair BarberShop application, providing clean separation between theme/demo functionality, user management, and shared utilities.

## Overview

The modules system provides:
- **Modular Architecture**: Clean separation of concerns
- **Dynamic Loading**: Optional module loading with fallbacks
- **Widget System**: Reusable widget components
- **Registry Pattern**: Centralized module management
- **Type Safety**: Full TypeScript support
- **Error Handling**: Graceful degradation and fallbacks

## Architecture

```
src/modules/
├── module-registry.ts      # Central module registry
├── init.ts                # Module initialization
├── theme/                 # Theme/demo components module
├── demo/                  # User demo management module
├── shared/                # Shared utilities and components
├── index.ts              # Main module exports
└── README.md             # This documentation
```

## Core Components

### Module Registry
Central registry for managing modules, widgets, and components:

```typescript
import { ModuleRegistry } from '@/modules'

// Load a widget dynamically
const ThemeWidget = await ModuleRegistry.loadWidget('theme', 'ThemeShowcaseWidget')

// Get available widgets
const widgets = ModuleRegistry.getAvailableWidgets()

// Check module status
const isLoaded = ModuleRegistry.isModuleLoaded('theme')
```

### Module Manifest
Each module defines its capabilities through a manifest:

```typescript
const manifest: ModuleManifest = {
  name: 'Theme Module',
  version: '1.0.0',
  description: 'Theme and demo components',
  dependencies: ['@nextjs', 'react'],
  widgets: {
    ThemeShowcaseWidget: ThemeShowcaseWidget
  },
  components: {
    MonitoringExample: MonitoringExample
  },
  permissions: ['view_theme_examples'],
  navigation: [
    {
      path: '/theme/demo',
      label: 'Theme Demo',
      component: DemoPage
    }
  ]
}
```

## Modules

### Theme Module (`/theme`)
Contains all demo and example components:
- **Monitoring Examples**: Real-time analytics demos
- **Component Playground**: Interactive component testing
- **Responsive Images**: Image optimization examples
- **Interactive Examples**: Dynamic code execution

### Demo Module (`/demo`)
User account management and demonstration:
- **Demo Accounts**: Pre-configured user accounts
- **Theme Integration**: Dynamic theme widget loading
- **Fallback UI**: Graceful handling of missing modules
- **Role Testing**: Easy user role switching

### Shared Module (`/shared`)
Common utilities and components:
- **Shared Components**: Reusable UI elements
- **Utilities**: Common helper functions
- **Types**: Shared TypeScript definitions
- **Constants**: Application-wide constants

## Usage Patterns

### Dynamic Module Loading
```typescript
// Load a specific widget
const ThemeWidget = await ModuleRegistry.loadWidget('theme', 'ThemeShowcaseWidget')

// Load an entire module
const themeManifest = await ModuleRegistry.loadModule('theme')

// Check if module is available
if (ModuleRegistry.isModuleLoaded('theme')) {
  // Use theme features
}
```

### Conditional Rendering
```typescript
function DemoPage() {
  const [ThemeWidget, setThemeWidget] = useState(null)

  useEffect(() => {
    ModuleRegistry.loadWidget('theme', 'ThemeShowcaseWidget')
      .then(widget => setThemeWidget(() => widget))
      .catch(() => console.log('Theme module not available'))
  }, [])

  return (
    <div>
      {/* Always available demo content */}
      <DemoAccounts />

      {/* Conditionally render theme widget */}
      {ThemeWidget ? (
        <ThemeWidget />
      ) : (
        <FallbackUI />
      )}
    </div>
  )
}
```

### Module Initialization
```typescript
// Initialize all modules on app startup
import { initializeModules } from '@/modules'

// In your app layout
useEffect(() => {
  initializeModules()
}, [])
```

## Widget System

### Creating Widgets
```typescript
// ThemeShowcaseWidget.tsx
export function ThemeShowcaseWidget({ showHeader = true, defaultTab = 'overview' }) {
  // Widget implementation
  return <div>Theme Showcase Content</div>
}
```

### Registering Widgets
```typescript
// In manifest.ts
const manifest: ModuleManifest = {
  widgets: {
    ThemeShowcaseWidget: ThemeShowcaseWidget
  }
}
```

### Consuming Widgets
```typescript
// Dynamic consumption
const Widget = await ModuleRegistry.loadWidget('theme', 'ThemeShowcaseWidget')
return <Widget showHeader={false} />
```

## Error Handling

### Graceful Degradation
```typescript
try {
  const widget = await ModuleRegistry.loadWidget('theme', 'ThemeShowcaseWidget')
  return <widget />
} catch (error) {
  console.warn('Theme module not available:', error)
  return <FallbackComponent />
}
```

### Module Loading Errors
```typescript
const manifest = await ModuleRegistry.loadModule('theme')
if (!manifest) {
  console.error('Failed to load theme module')
  // Handle error appropriately
}
```

## Permissions

### Defining Permissions
```typescript
const manifest: ModuleManifest = {
  permissions: [
    'view_theme_examples',
    'access_monitoring_demo',
    'use_component_playground'
  ]
}
```

### Checking Permissions
```typescript
// Get all available permissions
const permissions = ModuleRegistry.getAllPermissions()

// Get module-specific permissions
const themePermissions = ModuleRegistry.getModulePermissions('theme')
```

## Navigation

### Module Navigation
```typescript
const manifest: ModuleManifest = {
  navigation: [
    {
      path: '/theme/monitoring',
      label: 'Monitoring Demo',
      icon: '📊',
      component: MonitoringExample,
      permissions: ['view_theme_examples']
    }
  ]
}
```

### Dynamic Navigation
```typescript
// Get navigation for a module
const navigation = ModuleRegistry.getNavigation('theme')

// Render navigation items
navigation.forEach(item => {
  // Render navigation item
})
```

## Development Workflow

### Creating a New Module
1. Create module directory: `src/modules/new-module/`
2. Create manifest: `manifest.ts`
3. Add components/widgets: `components/` and `widgets/`
4. Create index file: `index.ts`
5. Add README: `README.md`
6. Register in initialization: `init.ts`

### Adding to Existing Module
1. Create component/widget
2. Export from module index
3. Update manifest if needed
4. Update documentation
5. Add tests

## Testing

### Module Testing
```typescript
// Test module loading
describe('Theme Module', () => {
  it('should load theme widget', async () => {
    const widget = await ModuleRegistry.loadWidget('theme', 'ThemeShowcaseWidget')
    expect(widget).toBeDefined()
  })
})
```

### Integration Testing
```typescript
// Test module interactions
describe('Demo-Theme Integration', () => {
  it('should handle missing theme module gracefully', async () => {
    // Test fallback behavior
  })
})
```

## Best Practices

### Module Design
- **Single Responsibility**: Each module has a clear purpose
- **Loose Coupling**: Modules depend on abstractions, not concretions
- **High Cohesion**: Related functionality stays together
- **Clear Interfaces**: Well-defined APIs and contracts

### Error Handling
- **Graceful Degradation**: App works without optional modules
- **Clear Messaging**: Users understand missing functionality
- **Fallback UI**: Provide alternatives when modules fail
- **Logging**: Comprehensive error logging and monitoring

### Performance
- **Lazy Loading**: Load modules only when needed
- **Code Splitting**: Split bundles by module
- **Caching**: Cache loaded modules appropriately
- **Bundle Optimization**: Minimize bundle sizes

## Migration Guide

### From Monolithic to Modular
1. Identify feature boundaries
2. Create module manifests
3. Move components gradually
4. Update import statements
5. Test incrementally
6. Update documentation

### Adding Module Support
1. Create module structure
2. Implement registry pattern
3. Add dynamic loading
4. Update build process
5. Test thoroughly

## Troubleshooting

### Common Issues

#### Module Not Loading
```typescript
// Check module registration
console.log(ModuleRegistry.getAllModules())

// Verify manifest exports
import manifest from './manifest'
console.log(manifest)
```

#### Widget Not Found
```typescript
// Check widget registration
const widgets = ModuleRegistry.getAvailableWidgets()
console.log(widgets)

// Verify widget export
import { ThemeShowcaseWidget } from './widgets/ThemeShowcaseWidget'
console.log(ThemeShowcaseWidget)
```

#### Import Errors
```typescript
// Check TypeScript paths
// Verify file paths and exports
// Check module resolution
```

## Contributing

### Module Development
1. Follow established patterns
2. Add comprehensive tests
3. Update documentation
4. Follow TypeScript best practices
5. Maintain backward compatibility

### Code Standards
- Use TypeScript for type safety
- Follow consistent naming conventions
- Add JSDoc comments for public APIs
- Write comprehensive unit tests
- Follow established styling patterns
