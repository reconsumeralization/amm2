# Shared Module

The Shared Module contains common components, utilities, and functionality that can be used across multiple modules in the Modern Men application.

## Overview

The shared module provides:
- **Common Components**: Reusable UI components
- **Shared Utilities**: Common helper functions
- **Base Functionality**: Core features used by multiple modules
- **Type Definitions**: Shared TypeScript interfaces
- **Constants**: Application-wide constants

## Structure

```
src/modules/shared/
├── components/           # Shared components
├── utils/               # Shared utilities
├── types/               # Shared type definitions
├── constants/           # Shared constants
├── manifest.ts          # Module manifest
├── index.ts             # Module exports
└── README.md            # This file
```

## Components

### Planned Shared Components
- **Common Buttons**: Standardized button components
- **Form Elements**: Reusable form inputs and controls
- **Layout Components**: Common layout structures
- **Data Display**: Tables, cards, and data presentation
- **Feedback Components**: Loading states, error messages
- **Navigation Elements**: Common navigation patterns

## Utilities

### Planned Shared Utilities
- **API Helpers**: Common API interaction patterns
- **Data Formatting**: Date, number, and text formatting
- **Validation**: Shared validation functions
- **Storage**: Local storage and session management
- **Error Handling**: Common error processing

## Usage

### Importing Shared Components
```typescript
import { Button, Card, LoadingSpinner } from '@/modules/shared'
```

### Using Shared Utilities
```typescript
import { formatDate, validateEmail, handleApiError } from '@/modules/shared'
```

## Integration

### Module Dependencies
Other modules can depend on the shared module:
```typescript
// In theme/manifest.ts
import { Button } from '@/modules/shared'

const manifest: ModuleManifest = {
  dependencies: ['shared'],
  components: {
    ThemeButton: Button // Use shared Button component
  }
}
```

### Shared Module Loading
The shared module is loaded automatically with other modules:
```typescript
import { initializeModules } from '@/modules'

// Loads shared, theme, demo modules
await initializeModules()
```

## Permissions

The shared module provides basic permissions:
- `access_shared_components`: Access to shared UI components
- `use_shared_utilities`: Use shared utility functions

## Dependencies

- `@nextjs`: Next.js framework
- `react`: React library
- `tailwindcss`: Tailwind CSS
- `@/components/ui`: Base UI component library

## Development

### Adding New Shared Components
1. Create component in `components/` directory
2. Export from `index.ts`
3. Update manifest if needed
4. Document usage patterns
5. Add to module dependencies

### Adding New Shared Utilities
1. Create utility in `utils/` directory
2. Export from `index.ts`
3. Add TypeScript types if needed
4. Document function signatures
5. Update module exports

## Testing

The shared module requires comprehensive testing:
- Unit tests for all utilities
- Component tests for shared components
- Integration tests with consuming modules

Run tests:
```bash
npm run test:shared
```

## Best Practices

### Component Design
- Keep components generic and reusable
- Use proper TypeScript interfaces
- Follow established design patterns
- Maintain consistent styling

### Utility Functions
- Pure functions where possible
- Comprehensive error handling
- Clear function signatures
- Good documentation

### Naming Conventions
- Use descriptive, generic names
- Follow established patterns
- Avoid module-specific terminology
- Use consistent casing

## Migration Guide

### Moving Existing Components
1. Identify commonly used components
2. Move to shared module
3. Update import statements
4. Test all consuming modules
5. Update documentation

### Creating New Shared Components
1. Design for maximum reusability
2. Consider all use cases
3. Implement with TypeScript
4. Add comprehensive tests
5. Document usage patterns
