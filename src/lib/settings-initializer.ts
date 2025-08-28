import { getPayload } from 'payload';
import config from '@/payload.config';

/**
 * Default settings configuration for ModernMen
 * Ensures all required settings are available with sensible defaults
 */
const DEFAULT_SETTINGS = {
  name: 'Global Settings',
  chatbot: {
    enabled: true,
    displayPaths: [{ path: '/portal' }, { path: '/book' }, { path: '/services' }],
    roles: ['customer', 'staff'],
    aiTriggers: {
      pendingAppointments: true,
      staffAvailability: true,
      userActivityThreshold: 5,
    },
    styles: {
      position: 'bottom-right',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      animation: 'fade',
    },
  },
  clock: {
    enabled: true,
    notifications: {
      emailAdmins: true,
      emailTemplate: '<p>{{staffName}} {{action}} at {{timestamp}}.</p>',
      googleCalendarSync: true,
    },
    shiftRules: {
      minShiftHours: 4,
      maxShiftHours: 8,
      maxWeeklyHours: 40,
    },
  },
  editor: {
    enabledPlugins: ['image', 'serviceTemplate', 'productEmbed', 'aiContent', 'hairSimulator'],
    theme: {
      heading: 'text-2xl font-bold',
      link: 'text-blue-500 underline',
      fontFamily: 'Inter, sans-serif',
    },
    maxImageSize: 5242880,
    imageOptimization: {
      maxImageSize: 5242880,
      responsiveSizes: [
        { width: 320, label: 'mobile' },
        { width: 768, label: 'tablet' },
        { width: 1200, label: 'desktop' },
      ],
      formats: ['jpeg', 'webp'],
      quality: 80,
    },
  },
  barbershop: {
    services: [
      { name: 'Haircut', description: 'Precision haircut with wash.', price: 30, duration: 30 },
      { name: 'Beard Trim', description: 'Groomed beard with oil.', price: 20, duration: 15 },
    ],
    loyalty: {
      pointsPerBooking: 10,
      pointsPerReferral: 20,
      badgeThreshold: 100,
      rewardThreshold: 200,
      rewardDiscount: 10,
    },
    simulator: {
      enabled: true,
      styles: [{ style: 'Fade' }, { style: 'Mohawk' }],
      maxImageResolution: 1024,
    },
    events: {
      enabled: true,
      maxAttendees: 50,
      bookingWindowDays: 30,
    },
  },
  dashboard: {
    enabledWidgets: ['appointments', 'revenue', 'clock', 'schedules'],
    chartType: 'line',
    refreshInterval: 300,
  },
  portal: {
    showServices: true,
    showAppointments: true,
    showTrends: true,
    themeColor: '#2563eb',
  },
  email: {
    fromAddress: 'no-reply@modernmen.com',
    signature: 'Best regards,\nModernMen Team',
    enableNotifications: true,
  },
  stripe: {
    currency: 'usd',
    taxRate: 0.1,
    successUrl: '/booking/success',
    cancelUrl: '/booking/cancel',
  },
  googleCalendar: {
    enabled: true,
    calendarId: 'primary',
    eventPrefix: 'ModernMen - ',
    timezone: 'America/New_York',
    syncInterval: 300,
  },
  ai: {
    model: 'text-davinci-003',
    maxTokens: 200,
    temperature: 0.7,
  },
};

/**
 * Initialize default settings if none exist
 * This ensures the app has working defaults even if no settings are configured
 */
export async function initializeSettings() {
  try {
    const payload = await getPayload({ config });
    
    // Check if any settings exist
    const existingSettings = await payload.find({
      collection: 'settings',
      limit: 1,
    });

    if (existingSettings.docs.length === 0) {
      console.log('No settings found. Creating default settings...');
      
      // Create global settings
      await payload.create({
        collection: 'settings',
        data: DEFAULT_SETTINGS,
      });

      console.log('✅ Default settings created successfully');
    } else {
      console.log('✅ Settings already exist');
    }
  } catch (error) {
    console.error('❌ Failed to initialize settings:', error);
    throw error;
  }
}

/**
 * Get settings with fallback to defaults
 * Ensures components always have working configuration
 */
export async function getSettingsWithFallback(tenantId?: string) {
  try {
    const payload = await getPayload({ config });
    
    const settings = await payload.find({
      collection: 'settings',
      where: tenantId ? { tenant: { equals: tenantId } } : { tenant: { exists: false } },
      limit: 1,
    });

    if (settings.docs.length > 0) {
      return settings.docs[0];
    }

    // Return defaults if no settings found
    console.warn(`No settings found for tenant ${tenantId || 'global'}. Using defaults.`);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to get settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Validate critical settings
 * Checks that required settings are properly configured
 */
export function validateSettings(settings: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!settings.stripe?.currency) {
    errors.push('Stripe currency is required');
  }

  if (!settings.googleCalendar?.calendarId) {
    errors.push('Google Calendar ID is required');
  }

  if (!settings.email?.fromAddress) {
    errors.push('Email from address is required');
  }

  // Check image optimization settings
  if (!settings.editor?.imageOptimization?.responsiveSizes?.length) {
    errors.push('Image optimization responsive sizes are required');
  }

  // Check chatbot settings
  if (!settings.chatbot?.displayPaths?.length) {
    errors.push('Chatbot display paths are required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
