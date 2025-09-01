# Theme Module

The Theme Module contains all demo, example, and showcase components for the Modern Men application. This module is designed to be optional and can be loaded dynamically.

## Overview

The theme module provides interactive demonstrations of various application features including:

- **Monitoring Examples**: Real-time monitoring and analytics demos
- **Component Playground**: Interactive component testing and exploration
- **Responsive Images**: Image optimization and responsive loading examples
- **Interactive Examples**: Dynamic code execution and API testing

## Structure

```
src/modules/theme/
├── components/           # Demo/example components
│   ├── MonitoringExample.tsx
│   ├── ComponentPlayground.tsx
│   ├── ResponsiveImageTest.tsx
│   └── InteractiveExample.tsx
├── widgets/              # Widget components
│   └── ThemeShowcaseWidget.tsx
├── manifest.ts           # Module manifest
├── index.ts              # Module exports
└── README.md             # This file
```

## Components

### MonitoringExample
Interactive monitoring and analytics demonstration with:
- Component performance tracking
- User interaction monitoring
- Form submission analytics
- API call performance tracking
- Error reporting and handling

### ComponentPlayground
Interactive component testing environment with:
- Live component rendering
- Props manipulation
- Code generation
- Storybook-style interface

### ResponsiveImageTest
Responsive image optimization demonstration with:
- Multiple size generation
- Lazy loading examples
- CDN integration
- Performance metrics

### InteractiveExample
Dynamic code execution and API testing with:
- JavaScript/TypeScript execution
- API endpoint testing
- Code editor interface
- Result display

## Widgets

### ThemeShowcaseWidget
Main widget that aggregates all theme components into a unified interface with:
- Tabbed navigation
- Component overview
- Interactive demos
- Fallback handling

## Usage

### Dynamic Import
```typescript
import { ModuleRegistry } from '@/modules'

// Load theme widget
const ThemeWidget = await ModuleRegistry.loadWidget('theme', 'ThemeShowcaseWidget')

// Render widget
return <ThemeWidget showHeader={false} defaultTab="overview" />
```

### Direct Import
```typescript
import { ThemeShowcaseWidget } from '@/modules/theme'

// Use directly
<ThemeShowcaseWidget />
```

## Integration

The theme module integrates with the demo module through dynamic widget loading:

```typescript
// In demo module
const ThemeWidget = await ModuleRegistry.loadWidget('theme', 'ThemeShowcaseWidget')

if (ThemeWidget) {
  return <ThemeWidget />
} else {
  return <FallbackUI />
}
```

## Permissions

The theme module defines the following permissions:
- `view_theme_examples`: Access to theme examples
- `access_monitoring_demo`: Access to monitoring demonstrations
- `use_component_playground`: Use interactive component playground
- `view_responsive_images`: View responsive image examples
- `interact_with_examples`: Interact with dynamic examples

## Navigation

The theme module provides navigation entries:
- `/theme/monitoring`: Monitoring demo page
- `/theme/playground`: Component playground
- `/theme/responsive-images`: Responsive images demo

## Dependencies

- `@nextjs`: Next.js framework
- `react`: React library
- `tailwindcss`: Tailwind CSS
- `@/components/ui`: UI component library
- `@/hooks`: Custom hooks
- `@/lib`: Utility libraries

## Development

### Adding New Components
1. Create component in `components/` directory
2. Export from `index.ts`
3. Add to manifest if needed
4. Update ThemeShowcaseWidget to include new component

### Adding New Widgets
1. Create widget in `widgets/` directory
2. Export from `index.ts`
3. Add to manifest widgets
4. Update consumers to use new widget

## Testing

The theme module includes comprehensive testing:
- Unit tests for individual components
- Integration tests for widget functionality
- E2E tests for interactive features

Run tests:
```bash
npm run test:theme
```
