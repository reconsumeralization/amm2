# Demo Module

The Demo Module provides user account management and demonstration functionality for the Modern Men application. This module integrates with the theme module for enhanced demo experiences.

## Overview

The demo module offers:
- **Demo Accounts**: Pre-configured user accounts for testing different roles
- **Theme Integration**: Dynamic loading of theme showcase widgets
- **Fallback UI**: Graceful handling when theme module is unavailable
- **Role Testing**: Easy switching between admin, customer, and stylist roles

## Structure

```
src/modules/demo/
├── components/           # Demo components
│   └── DemoPage.tsx
├── widgets/              # Demo-specific widgets
├── manifest.ts           # Module manifest
├── index.ts              # Module exports
└── README.md             # This file
```

## Components

### DemoPage
Main demo page component with:
- Demo account listings
- Role-based login options
- Theme showcase integration
- Fallback UI for missing theme module
- User guidance and instructions

## Integration

### Theme Module Integration
The demo module dynamically loads the theme module's showcase widget:

```typescript
const ThemeShowcaseWidget = await ModuleRegistry.loadWidget('theme', 'ThemeShowcaseWidget')

if (ThemeShowcaseWidget) {
  return (
    <div>
      {/* Demo accounts */}
      <DemoAccounts />

      {/* Theme showcase */}
      <ThemeShowcaseWidget showHeader={false} />
    </div>
  )
} else {
  return (
    <div>
      {/* Demo accounts */}
      <DemoAccounts />

      {/* Fallback UI */}
      <FallbackMessage />
    </div>
  )
}
```

### Fallback Handling
When the theme module is not available, the demo module provides:
- Clear messaging about missing functionality
- Optional feature indicators
- Graceful degradation
- Instructions for enabling theme features

## Demo Accounts

The module includes pre-configured demo accounts:

### Admin User
- **Email**: admin@modernmen.ca
- **Password**: admin123
- **Permissions**: Full system access
- **Dashboard**: `/admin`

### Customer User
- **Email**: customer@modernmen.ca
- **Password**: customer123
- **Permissions**: Customer-specific access
- **Dashboard**: `/customer`

### Stylist User
- **Email**: stylist@modernmen.ca
- **Password**: stylist123
- **Permissions**: Stylist-specific access
- **Dashboard**: `/stylist`

## Usage

### Dynamic Loading
```typescript
import { ModuleRegistry } from '@/modules'

// Load demo page
const DemoPage = await ModuleRegistry.loadComponent('demo', 'DemoPage')

return <DemoPage />
```

### Direct Import
```typescript
import { DemoPage } from '@/modules/demo'

<DemoPage />
```

## Permissions

The demo module defines the following permissions:
- `view_demo_accounts`: Access to demo account listings
- `access_admin_demo`: Use admin demo account
- `access_customer_demo`: Use customer demo account
- `access_stylist_demo`: Use stylist demo account
- `switch_user_roles`: Switch between different user roles

## Navigation

The demo module provides navigation entries:
- `/demo`: Main demo page with accounts and theme showcase

## Dependencies

- `@nextjs`: Next.js framework
- `react`: React library
- `tailwindcss`: Tailwind CSS
- `@/modules`: Module system
- `@/components/ui`: UI component library
- `@/auth`: Authentication system

## Development

### Adding New Demo Accounts
1. Update demo accounts array in `DemoPage.tsx`
2. Add appropriate permissions
3. Update role-specific styling
4. Test login functionality

### Theme Module Integration
1. Ensure proper error handling for missing theme module
2. Test fallback UI scenarios
3. Update integration logic as needed
4. Maintain backward compatibility

## Testing

The demo module includes comprehensive testing:
- Unit tests for demo account functionality
- Integration tests for theme module loading
- E2E tests for complete demo workflows

Run tests:
```bash
npm run test:demo
```

## Error Handling

The demo module handles various error scenarios:
- **Theme Module Missing**: Graceful fallback with informative messaging
- **Authentication Errors**: Clear error messages for login failures
- **Network Issues**: Offline handling and retry mechanisms
- **Permission Errors**: Appropriate access control messaging
