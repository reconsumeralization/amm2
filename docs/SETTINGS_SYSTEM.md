# Settings System Documentation

The Settings system provides a centralized configuration management solution for the ModernMen barbershop application. It allows administrators to customize behaviors, appearance, and functionality across all features through the Payload CMS admin panel.

## 🎯 Overview

### Purpose
- **Centralized Configuration**: Manage all application settings in one place
- **Tenant-Specific Settings**: Support multi-tenant configurations
- **Dynamic Updates**: Real-time settings changes without code deployment
- **Feature Toggles**: Enable/disable features per tenant or globally
- **Customization**: Tailor the application to specific business needs

### Benefits
- **Flexibility**: No code changes required for configuration updates
- **Consistency**: Standardized settings across all features
- **Scalability**: Support for multiple tenants with different configurations
- **User Experience**: Intuitive admin interface for non-technical users
- **Performance**: Cached settings with automatic refresh capabilities

## 📋 Settings Structure

### Global vs Tenant-Specific Settings
- **Global Settings**: Applied to all tenants when no tenant-specific settings exist
- **Tenant-Specific Settings**: Override global settings for specific tenants
- **Fallback System**: Automatic fallback to global settings when tenant-specific settings are missing

### Settings Categories

#### 1. Chatbot Settings
```typescript
chatbot: {
  enabled: boolean;                    // Enable/disable chatbot globally
  displayPaths: Array<{path: string}>; // URLs where chatbot appears
  roles: string[];                     // User roles that can see chatbot
  aiTriggers: {                        // AI-driven visibility triggers
    pendingAppointments: boolean;
    staffAvailability: boolean;
    newServices: boolean;
  };
  styles: {                            // Visual customization
    position: string;                  // 'bottom-right', 'bottom-left', etc.
    backgroundColor: string;           // Hex color code
    borderRadius: string;              // CSS border-radius
    maxWidth: string;                  // Maximum width
  };
  behavior: {                          // Interaction behavior
    autoOpen: boolean;                 // Auto-open on page load
    welcomeMessage: string;            // Initial message
    typingIndicator: boolean;          // Show typing indicator
  };
}
```

#### 2. Clock-In/Out Settings
```typescript
clock: {
  enabled: boolean;                    // Enable clock-in/out system
  notifications: {                     // Notification settings
    emailAdmins: boolean;              // Email admins on clock events
    emailTemplate: string;             // Custom email template
    slackWebhook: string;              // Slack webhook URL
  };
  shiftRules: {                        // Shift duration rules
    minShiftHours: number;             // Minimum shift duration
    maxShiftHours: number;             // Maximum shift duration
    breakTime: number;                 // Break time in minutes
    overtimeThreshold: number;         // Weekly overtime threshold
  };
  geolocation: {                       // Location-based clock-in/out
    enabled: boolean;                  // Require GPS location
    radius: number;                    // Maximum distance in meters
    workplaceAddress: string;          // Workplace address
  };
}
```

#### 3. Editor Settings
```typescript
editor: {
  enabledPlugins: string[];            // Enabled Lexical editor plugins
  theme: {                             // Editor styling
    heading: string;                   // Heading CSS classes
    link: string;                      // Link CSS classes
    paragraph: string;                 // Paragraph CSS classes
    list: string;                      // List CSS classes
  };
  aiFeatures: {                        // AI-powered features
    contentGeneration: boolean;        // AI content generation
    grammarCheck: boolean;             // Grammar and spelling check
    toneAdjustment: boolean;           // Tone adjustment suggestions
  };
}
```

#### 4. Barbershop Settings
```typescript
barbershop: {
  services: Array<{                    // Available services
    name: string;
    description: string;
    price: number;
    duration: number;
    category: string;
  }>;
  loyalty: {                           // Loyalty program configuration
    pointsPerBooking: number;          // Points per appointment
    pointsPerReferral: number;         // Points per referral
    pointsPerDollar: number;           // Points per dollar spent
    badgeThreshold: number;            // Points needed for badges
    tiers: Array<{                     // Loyalty tiers
      name: string;
      minPoints: number;
      multiplier: number;
      benefits: string;
    }>;
  };
  simulator: {                         // Hair simulator settings
    enabled: boolean;                  // Enable hair simulator
    maxFileSize: number;               // Maximum file size
    styles: Array<{                    // Available hair styles
      style: string;
      category: string;
    }>;
    aiSettings: {                      // AI generation settings
      model: string;                   // DALL-E model version
      imageSize: string;               // Image dimensions
      quality: string;                 // Image quality
    };
  };
  events: {                            // Community events
    enabled: boolean;                  // Enable events
    categories: Array<{                // Event categories
      name: string;
      description: string;
    }>;
    defaultLoyaltyPoints: number;      // Points for attendance
    maxCapacity: number;               // Default capacity
  };
  retail: {                            // Retail corner
    enabled: boolean;                  // Enable retail sales
    categories: Array<{                // Product categories
      name: string;
      description: string;
    }>;
    aiRecommendations: boolean;        // AI product recommendations
    loyaltyPoints: number;             // Points per dollar spent
  };
}
```

#### 5. Notification Settings
```typescript
notifications: {
  email: {                             // Email notifications
    enabled: boolean;                  // Enable email notifications
    fromEmail: string;                 // From email address
    fromName: string;                  // From name
    templates: {                       // Email templates
      appointmentConfirmation: string;
      appointmentReminder: string;
      loyaltyPoints: string;
    };
  };
  sms: {                              // SMS notifications
    enabled: boolean;                  // Enable SMS notifications
    provider: string;                  // SMS provider
    apiKey: string;                    // Provider API key
  };
}
```

#### 6. Analytics Settings
```typescript
analytics: {
  enabled: boolean;                    // Enable analytics tracking
  tracking: {                          // What to track
    pageViews: boolean;                // Track page views
    userActions: boolean;              // Track user actions
    featureUsage: boolean;             // Track feature usage
    performance: boolean;              // Track performance
  };
  retention: number;                   // Data retention in days
}
```

## 🚀 Implementation

### 1. Settings Collection
The Settings collection is defined in `src/collections/Settings.ts` with comprehensive field definitions, validation hooks, and admin interface customization.

### 2. Settings API
The `/api/settings` endpoint provides:
- **GET**: Fetch settings (global or tenant-specific)
- **POST**: Create or update settings

### 3. Settings Hook
The `useSettings` hook provides:
- Automatic settings fetching
- Settings updates
- Helper functions for common operations
- Error handling and loading states

### 4. Settings Widget
The `SettingsWidget` component displays:
- Current settings status
- Quick access to settings management
- Visual indicators for enabled/disabled features

## 📖 Usage Examples

### Using the Settings Hook
```typescript
import { useSettings } from '@/hooks/useSettings';

function MyComponent() {
  const { 
    settings, 
    loading, 
    isFeatureEnabled, 
    getServiceByName,
    calculateLoyaltyPoints 
  } = useSettings({ tenantId: 'tenant-123' });

  if (loading) return <div>Loading settings...</div>;

  // Check if chatbot is enabled
  const chatbotEnabled = isFeatureEnabled('chatbot');

  // Get service details
  const haircutService = getServiceByName('Haircut');

  // Calculate loyalty points
  const points = calculateLoyaltyPoints('booking');

  return (
    <div>
      {chatbotEnabled && <Chatbot />}
      {haircutService && <ServiceCard service={haircutService} />}
    </div>
  );
}
```

### Updating Settings
```typescript
import { useSettings } from '@/hooks/useSettings';

function SettingsManager() {
  const { updateSettings } = useSettings();

  const handleUpdate = async () => {
    try {
      await updateSettings({
        chatbot: {
          enabled: true,
          styles: {
            position: 'bottom-right',
            backgroundColor: '#ffffff'
          }
        }
      });
      console.log('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  return <button onClick={handleUpdate}>Update Settings</button>;
}
```

### Conditional Feature Rendering
```typescript
function FeatureWrapper({ children, feature }) {
  const { isFeatureEnabled } = useSettings();
  
  if (!isFeatureEnabled(feature)) {
    return null;
  }
  
  return children;
}

// Usage
<FeatureWrapper feature="simulator">
  <HairSimulator />
</FeatureWrapper>
```

## 🔧 Configuration

### Creating Global Settings
1. Navigate to `/admin/payload/collections/settings`
2. Click "Create New"
3. Leave the "Tenant" field empty
4. Configure desired settings
5. Save

### Creating Tenant-Specific Settings
1. Navigate to `/admin/payload/collections/settings`
2. Click "Create New"
3. Select the tenant from the "Tenant" dropdown
4. Configure settings (only specify values that differ from global)
5. Save

### Settings Validation
The Settings collection includes validation hooks that:
- Ensure only one global settings document exists
- Validate shift duration rules (min < max)
- Validate loyalty tier progression
- Prevent invalid configurations

## 🔄 Integration with Features

### Chatbot Integration
```typescript
// In BookingChatbot.tsx
const { settings } = useSettings({ tenantId });

// Check visibility
const isVisible = settings.chatbot?.enabled && 
  settings.chatbot.displayPaths.some(p => pathname.startsWith(p.path));

// Apply styles
const styles = {
  position: settings.chatbot?.styles?.position,
  backgroundColor: settings.chatbot?.styles?.backgroundColor,
  borderRadius: settings.chatbot?.styles?.borderRadius
};
```

### Clock System Integration
```typescript
// In clock API
const { settings } = await getSettings(tenantId);

if (!settings.clock?.enabled) {
  return { error: 'Clock system is disabled' };
}

// Validate shift duration
const { minShiftHours, maxShiftHours } = settings.clock.shiftRules;
if (duration < minShiftHours || duration > maxShiftHours) {
  return { error: 'Invalid shift duration' };
}
```

### Loyalty Program Integration
```typescript
// In loyalty API
const { settings } = await getSettings(tenantId);
const { pointsPerBooking, pointsPerReferral } = settings.barbershop.loyalty;

const points = action === 'booking' ? pointsPerBooking : pointsPerReferral;
```

## 🧪 Testing

### Unit Tests
```typescript
// settings.test.ts
import { useSettings } from '@/hooks/useSettings';

describe('useSettings', () => {
  it('should fetch settings correctly', async () => {
    // Test implementation
  });

  it('should calculate loyalty points correctly', () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
// settings-api.test.ts
describe('Settings API', () => {
  it('should return global settings when no tenant specified', async () => {
    // Test implementation
  });

  it('should return tenant-specific settings when tenant specified', async () => {
    // Test implementation
  });
});
```

## 🔒 Security Considerations

### Access Control
- Settings are only accessible to admin users
- Tenant-specific settings are scoped to the appropriate tenant
- API endpoints validate user permissions

### Data Validation
- All settings are validated before saving
- Type checking ensures data integrity
- Hooks prevent invalid configurations

### Caching
- Settings are cached for performance
- Automatic refresh prevents stale data
- Cache invalidation on settings updates

## 📈 Performance Optimization

### Caching Strategy
- Settings are cached in memory
- Automatic refresh every 30 seconds (configurable)
- Cache invalidation on updates

### Lazy Loading
- Settings are loaded only when needed
- Components can specify required settings
- Partial loading for large settings objects

### Database Optimization
- Indexed queries for tenant-specific settings
- Efficient fallback to global settings
- Minimal database calls through caching

## 🚨 Troubleshooting

### Common Issues

#### Settings Not Loading
- Check network connectivity
- Verify API endpoint is accessible
- Check browser console for errors
- Ensure user has admin permissions

#### Settings Not Applying
- Verify settings are saved correctly
- Check tenant ID is correct
- Clear browser cache
- Restart the application

#### Validation Errors
- Review settings validation rules
- Check for conflicting configurations
- Ensure required fields are populated
- Verify data types are correct

### Debug Mode
Enable debug logging by setting:
```typescript
// In settings API
console.log('Settings request:', { tenantId, settings });
```

## 🔮 Future Enhancements

### Planned Features
- **Settings Templates**: Pre-configured settings for common use cases
- **Settings Import/Export**: Bulk settings management
- **Settings Versioning**: Track settings changes over time
- **Settings Analytics**: Monitor settings usage and effectiveness
- **Settings Migration**: Automated settings updates across tenants

### Integration Opportunities
- **Feature Flags**: Advanced feature toggling
- **A/B Testing**: Settings-based experimentation
- **Personalization**: User-specific settings
- **Automation**: AI-powered settings optimization

## 📚 Related Documentation

- [Payload CMS Configuration](../payload.config.ts)
- [API Documentation](./API.md)
- [Admin Dashboard](./ADMIN_DASHBOARD.md)
- [Multi-Tenant Setup](./MULTI_TENANT.md)
- [Feature Documentation](./INNOVATIVE_FEATURES.md)

---

This settings system provides a robust foundation for managing application configuration, enabling flexibility and customization while maintaining consistency and security across the ModernMen barbershop platform.
