# Modern Men Admin System Documentation

## Overview

The Modern Men Admin System is a comprehensive dashboard and management interface built with Next.js, TypeScript, and PayloadCMS. It provides business owners and managers with powerful tools to manage their barbershop operations.

## Architecture

### Core Components

```
src/
├── app/admin/           # Admin pages and layout
├── components/features/admin/  # Admin-specific components
├── lib/
│   ├── admin-api.ts     # Centralized API client
│   └── admin-utils.ts   # Utility functions
└── docs/admin-system.md # This documentation
```

### Key Features

- **Unified Admin Layout** (`/admin/layout.tsx`)
- **Centralized API Client** (`admin-api.ts`)
- **Utility Functions** (`admin-utils.ts`)
- **Component Library** (`AdminWrapper.tsx`)
- **Notification System** (`NotificationCenter.tsx`)

## Admin Pages

### Main Dashboard (`/admin`)
The central hub providing:
- Real-time KPIs and metrics
- System health monitoring
- Quick actions for common tasks
- Recent activity feed

### Content Management (`/admin/content`)
- Rich text editor integration
- Content templates and themes
- SEO optimization tools
- Multi-format content support

### Page Builder (`/admin/page-builder`)
- Drag-and-drop visual editor
- 17+ component types
- Responsive design preview
- Live editing capabilities

### Analytics (`/admin/analytics`)
- Business intelligence dashboard
- Revenue and performance tracking
- Customer insights
- Staff performance metrics

### User Management (`/admin/users`)
- Role-based access control
- User CRUD operations
- Bulk actions
- Permission management

### Settings (`/admin/settings`)
- System configuration
- Business settings
- Integration management
- Security settings

### Backups (`/admin/backups`)
- Automated backup system
- Manual backup creation
- Restore functionality
- Backup monitoring

## API Integration

### Centralized API Client

```typescript
import { adminApi } from '@/lib/admin-api';

// Example usage
const response = await adminApi.getPageViews({ dateRange: '30d' });
if (response.success) {
  console.log(response.data);
}
```

### Available API Methods

#### Analytics APIs
- `getPageViews(params?)` - Page view analytics
- `getUserAnalytics(params?)` - User analytics
- `getRevenueAnalytics(params?)` - Revenue data
- `getAppointmentAnalytics(params?)` - Appointment metrics
- `getCustomerAnalytics(params?)` - Customer insights
- `getActivityFeed(params?)` - Activity logs

#### Content Management APIs
- `getContent(params?)` - Fetch content items
- `createContent(data)` - Create new content
- `updateContent(id, data)` - Update existing content
- `deleteContent(id)` - Delete content

#### User Management APIs
- `getUsers(params?)` - Fetch users
- `createUser(data)` - Create new user
- `updateUser(id, data)` - Update user
- `deleteUser(id)` - Delete user
- `bulkUpdateUsers(ids, updates)` - Bulk operations

#### Settings APIs
- `getSettings()` - Get system settings
- `updateSettings(data)` - Update settings
- `resetSettings()` - Reset to defaults

#### Backup APIs
- `getBackups()` - List backups
- `createBackup(options?)` - Create backup
- `downloadBackup(id)` - Download backup
- `deleteBackup(id)` - Delete backup
- `restoreBackup(id, options?)` - Restore from backup

## Component Architecture

### AdminWrapper Component

Provides consistent loading, error, and layout handling:

```tsx
<AdminWrapper
  isLoading={isLoading}
  error={error}
  onRetry={refetch}
  title="Dashboard"
  subtitle="Monitor your business performance"
>
  {/* Your content here */}
</AdminWrapper>
```

### Utility Functions

#### Formatting Utilities
```typescript
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatFileSize
} from '@/lib/admin-utils';

formatCurrency(1234.56); // "$1,234.56"
formatDate('2024-01-15'); // "Jan 15, 2024"
```

#### Permission Checking
```typescript
import { hasPermission, canAccessAdmin } from '@/lib/admin-utils';

if (hasPermission(userRole, 'manage_users')) {
  // Show user management features
}
```

#### Data Management
```typescript
import { filterData, paginateData } from '@/lib/admin-utils';

// Filter data
const filteredUsers = filterData(users, searchQuery, ['name', 'email']);

// Paginate results
const { data, total, totalPages } = paginateData(filteredUsers, 1, 10);
```

## Security & Permissions

### Role-Based Access Control

Four predefined roles with specific permissions:

1. **Admin** - Full system access
2. **Manager** - Management operations
3. **Barber** - Appointment and basic reporting
4. **Customer** - Personal appointment management

### Permission System

Granular permissions for different features:
- `view_dashboard` - Access to dashboard
- `manage_users` - User management
- `manage_appointments` - Appointment handling
- `manage_services` - Service configuration
- `view_reports` - Reporting access
- `manage_content` - Content management
- `manage_settings` - System settings
- `view_analytics` - Analytics access

## Data Management

### Real-time Updates

Components automatically refresh data:
```typescript
const { data, isLoading, error, refetch } = useAdminData(
  () => adminApi.getPageViews(),
  [dateRange] // Dependencies
);
```

### Error Handling

Consistent error handling across all components:
```typescript
const { mutate, isLoading, error } = useAdminMutation(
  (data) => adminApi.updateUser(userId, data)
);

const handleUpdate = async (userData) => {
  try {
    await mutate(userData);
    toast.success('User updated successfully');
  } catch (err) {
    toast.error('Failed to update user');
  }
};
```

## Styling & Theming

### Consistent Design System

- Uses Tailwind CSS for styling
- Consistent color palette and spacing
- Responsive design patterns
- Accessibility considerations

### Component Variants

```typescript
// Button variants
<Button variant="primary|secondary|outline|ghost" />

// Status badges
<Badge variant="default|secondary|destructive" />

// Card layouts
<Card className="hover:shadow-md transition-shadow" />
```

## Performance Optimization

### Code Splitting
- Dynamic imports for large components
- Lazy loading of admin pages
- Optimized bundle sizes

### Caching Strategy
- API response caching
- Component memoization
- Image optimization

### Monitoring
- Performance metrics tracking
- Error logging and reporting
- System health monitoring

## Development Guidelines

### File Organization
```
src/app/admin/
├── layout.tsx          # Shared layout
├── page.tsx           # Main dashboard
├── content/
├── analytics/
├── users/
├── settings/
└── backups/

src/components/features/admin/
├── AdminWrapper.tsx   # Layout wrapper
├── AdminNavigation.tsx # Navigation component
├── NotificationCenter.tsx
└── [feature-specific components]
```

### Code Patterns
```typescript
// 1. Use centralized API client
const { data } = await adminApi.getUsers();

// 2. Use utility functions
const formatted = formatCurrency(amount);

// 3. Use AdminWrapper for consistency
<AdminWrapper title="Users" isLoading={isLoading}>
  {/* Content */}
</AdminWrapper>

// 4. Handle errors consistently
if (error) {
  return <ErrorState error={error} onRetry={refetch} />;
}
```

### Testing
```typescript
// Component testing
describe('AdminDashboard', () => {
  it('renders loading state', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

// API testing
describe('adminApi', () => {
  it('fetches users successfully', async () => {
    const response = await adminApi.getUsers();
    expect(response.success).toBe(true);
  });
});
```

## Deployment & Maintenance

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-domain.com

# External Services
STRIPE_SECRET_KEY=sk_live_...
GOOGLE_CALENDAR_API_KEY=...
```

### Backup Strategy
- Daily automated backups
- Manual backups before major changes
- Cloud storage integration
- Backup retention policies

### Monitoring
- System health checks
- Performance monitoring
- Error tracking and alerting
- User activity logging

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Check environment variables
   - Verify API endpoints
   - Check network connectivity

2. **Permission Errors**
   - Verify user roles
   - Check permission configuration
   - Clear browser cache

3. **Performance Issues**
   - Check database connections
   - Review API response times
   - Optimize component rendering

### Debug Mode
Enable debug mode in settings for detailed logging:
```typescript
// In browser console
localStorage.setItem('admin_debug', 'true');
```

## Future Enhancements

### Planned Features
- Advanced reporting with custom dashboards
- Multi-tenant support for chain operations
- Mobile app integration
- AI-powered insights and recommendations
- Advanced user onboarding flows

### API Extensions
- Webhook support for external integrations
- Bulk data import/export
- Advanced filtering and search
- Real-time collaboration features

---

## Quick Start

1. **Access Admin Panel**
   ```
   Navigate to /admin in your application
   ```

2. **First Login**
   ```
   Use admin credentials to log in
   ```

3. **Configure Settings**
   ```
   Go to Settings to configure business information
   ```

4. **Create Content**
   ```
   Use Content Manager to create your first page
   ```

5. **Set Up Users**
   ```
   Add staff members and set their roles
   ```

For more detailed information about specific features, refer to the individual component documentation or contact the development team.
