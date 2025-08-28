import { useState, useEffect } from 'react';

export interface Settings {
  chatbot?: {
    enabled?: boolean;
    displayPaths?: Array<{ path: string }>;
    roles?: string[];
    aiTriggers?: {
      pendingAppointments?: boolean;
      staffAvailability?: boolean;
      newServices?: boolean;
    };
    styles?: {
      position?: string;
      backgroundColor?: string;
      borderRadius?: string;
      maxWidth?: string;
    };
    behavior?: {
      autoOpen?: boolean;
      welcomeMessage?: string;
      typingIndicator?: boolean;
    };
  };
  clock?: {
    enabled?: boolean;
    notifications?: {
      emailAdmins?: boolean;
      emailTemplate?: string;
      slackWebhook?: string;
    };
    shiftRules?: {
      minShiftHours?: number;
      maxShiftHours?: number;
      breakTime?: number;
      overtimeThreshold?: number;
    };
    geolocation?: {
      enabled?: boolean;
      radius?: number;
      workplaceAddress?: string;
    };
  };
  editor?: {
    enabledPlugins?: string[];
    theme?: {
      heading?: string;
      link?: string;
      paragraph?: string;
      list?: string;
    };
    aiFeatures?: {
      contentGeneration?: boolean;
      grammarCheck?: boolean;
      toneAdjustment?: boolean;
    };
  };
  barbershop?: {
    services?: Array<{
      name: string;
      description?: string;
      price?: number;
      duration?: number;
      category?: string;
    }>;
    loyalty?: {
      pointsPerBooking?: number;
      pointsPerReferral?: number;
      pointsPerDollar?: number;
      badgeThreshold?: number;
      tiers?: Array<{
        name: string;
        minPoints: number;
        multiplier: number;
        benefits?: string;
      }>;
    };
    simulator?: {
      enabled?: boolean;
      maxFileSize?: number;
      styles?: Array<{
        style: string;
        category?: string;
      }>;
      aiSettings?: {
        model?: string;
        imageSize?: string;
        quality?: string;
      };
    };
    events?: {
      enabled?: boolean;
      categories?: Array<{
        name: string;
        description?: string;
      }>;
      defaultLoyaltyPoints?: number;
      maxCapacity?: number;
    };
    retail?: {
      enabled?: boolean;
      categories?: Array<{
        name: string;
        description?: string;
      }>;
      aiRecommendations?: boolean;
      loyaltyPoints?: number;
    };
  };
  notifications?: {
    email?: {
      enabled?: boolean;
      fromEmail?: string;
      fromName?: string;
      templates?: {
        appointmentConfirmation?: string;
        appointmentReminder?: string;
        loyaltyPoints?: string;
      };
    };
    sms?: {
      enabled?: boolean;
      provider?: string;
      apiKey?: string;
    };
  };
  analytics?: {
    enabled?: boolean;
    tracking?: {
      pageViews?: boolean;
      userActions?: boolean;
      featureUsage?: boolean;
      performance?: boolean;
    };
    retention?: number;
  };
}

interface UseSettingsOptions {
  tenantId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useSettings(options: UseSettingsOptions = {}) {
  const { tenantId, autoRefresh = false, refreshInterval = 30000 } = options;
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = tenantId 
        ? `/api/settings?tenantId=${tenantId}`
        : '/api/settings';
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [tenantId]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchSettings, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, tenantId]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      setError(null);
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId,
          ...newSettings,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update settings: ${response.statusText}`);
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  };

  // Helper functions for common settings checks
  const isFeatureEnabled = (feature: keyof Settings) => {
    const featureSettings = settings[feature];
    return featureSettings && typeof featureSettings === 'object' && 'enabled' in featureSettings
      ? (featureSettings as any).enabled
      : false;
  };

  const getServiceByName = (serviceName: string) => {
    return settings.barbershop?.services?.find(service => service.name === serviceName);
  };

  const getLoyaltyTier = (points: number) => {
    const tiers = settings.barbershop?.loyalty?.tiers;
    if (!tiers) return null;
    
    // Sort tiers by minPoints in descending order to find the highest applicable tier
    const sortedTiers = [...tiers].sort((a, b) => b.minPoints - a.minPoints);
    return sortedTiers.find(tier => points >= tier.minPoints) || sortedTiers[sortedTiers.length - 1];
  };

  const getNextTier = (currentPoints: number) => {
    const tiers = settings.barbershop?.loyalty?.tiers;
    if (!tiers) return null;
    
    const sortedTiers = [...tiers].sort((a, b) => a.minPoints - b.minPoints);
    return sortedTiers.find(tier => tier.minPoints > currentPoints);
  };

  const calculateLoyaltyPoints = (action: 'booking' | 'referral' | 'purchase', value?: number) => {
    const loyalty = settings.barbershop?.loyalty;
    if (!loyalty) return 0;

    switch (action) {
      case 'booking':
        return loyalty.pointsPerBooking || 0;
      case 'referral':
        return loyalty.pointsPerReferral || 0;
      case 'purchase':
        return value ? Math.floor(value * (loyalty.pointsPerDollar || 0)) : 0;
      default:
        return 0;
    }
  };

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    isFeatureEnabled,
    getServiceByName,
    getLoyaltyTier,
    getNextTier,
    calculateLoyaltyPoints,
  };
}
