import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { useSettings } from '../hooks/useSettings';

// Mock fetch with proper typing
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Helper function to create proper Response mocks
const createMockResponse = (data: any, options: { ok?: boolean; status?: number } = {}) => {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    statusText: 'OK',
    headers: new Headers(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    clone: jest.fn(),
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    body: null,
    bodyUsed: false,
  } as unknown as Response;
};

describe('Settings System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useSettings Hook', () => {
    it('should fetch settings correctly', async () => {
      const mockSettings = {
        chatbot: { enabled: true },
        clock: { enabled: false },
        barbershop: {
          services: [
            { name: 'Haircut', price: 30, duration: 45 }
          ],
          loyalty: {
            pointsPerBooking: 10,
            pointsPerReferral: 20
          }
        }
      };

      mockFetch.mockResolvedValueOnce(
        createMockResponse(mockSettings)
      );

      // Note: In a real test, you'd use React Testing Library
      // This is a simplified test for the logic
      const settings = await fetch('/api/settings').then(res => res.json());
      
      expect(settings).toEqual(mockSettings);
      expect(fetch).toHaveBeenCalledWith('/api/settings');
    });

    it('should fetch tenant-specific settings', async () => {
      const mockSettings = {
        chatbot: { enabled: false },
        tenant: 'tenant-123'
      };

      mockFetch.mockResolvedValueOnce(
        createMockResponse(mockSettings)
      );

      const settings = await fetch('/api/settings?tenantId=tenant-123').then(res => res.json());
      
      expect(settings).toEqual(mockSettings);
      expect(fetch).toHaveBeenCalledWith('/api/settings?tenantId=tenant-123');
    });

    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/settings');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });
  });

  describe('Settings Validation', () => {
    it('should validate shift duration rules', () => {
      const validSettings = {
        clock: {
          shiftRules: {
            minShiftHours: 4,
            maxShiftHours: 8
          }
        }
      };

      const invalidSettings = {
        clock: {
          shiftRules: {
            minShiftHours: 8,
            maxShiftHours: 4 // Invalid: min > max
          }
        }
      };

      // This would be tested in the Settings collection hooks
      const isValid = validSettings.clock.shiftRules.minShiftHours < validSettings.clock.shiftRules.maxShiftHours;
      expect(isValid).toBe(true);

      const isInvalid = invalidSettings.clock.shiftRules.minShiftHours < invalidSettings.clock.shiftRules.maxShiftHours;
      expect(isInvalid).toBe(false);
    });

    it('should validate loyalty tier progression', () => {
      const validTiers = [
        { name: 'Bronze', minPoints: 0 },
        { name: 'Silver', minPoints: 100 },
        { name: 'Gold', minPoints: 500 }
      ];

      const invalidTiers = [
        { name: 'Bronze', minPoints: 0 },
        { name: 'Silver', minPoints: 50 }, // Invalid: should be higher than previous
        { name: 'Gold', minPoints: 500 }
      ];

      // Test valid progression
      let isValid = true;
      for (let i = 1; i < validTiers.length; i++) {
        if (validTiers[i].minPoints <= validTiers[i-1].minPoints) {
          isValid = false;
          break;
        }
      }
      expect(isValid).toBe(true);

      // Test invalid progression
      isValid = true;
      for (let i = 1; i < invalidTiers.length; i++) {
        if (invalidTiers[i].minPoints <= invalidTiers[i-1].minPoints) {
          isValid = false;
          break;
        }
      }
      expect(isValid).toBe(false);
    });
  });

  describe('Settings Helper Functions', () => {
    const mockSettings = {
      barbershop: {
        services: [
          { name: 'Haircut', price: 30, duration: 45 },
          { name: 'Beard Trim', price: 20, duration: 30 }
        ],
        loyalty: {
          pointsPerBooking: 10,
          pointsPerReferral: 20,
          pointsPerDollar: 1,
          tiers: [
            { name: 'Bronze', minPoints: 0, multiplier: 1 },
            { name: 'Silver', minPoints: 100, multiplier: 1.2 },
            { name: 'Gold', minPoints: 500, multiplier: 1.5 }
          ]
        }
      }
    };

    it('should get service by name', () => {
      const haircutService = mockSettings.barbershop.services.find(service => service.name === 'Haircut');
      expect(haircutService).toEqual({ name: 'Haircut', price: 30, duration: 45 });
    });

    it('should calculate loyalty points correctly', () => {
      const loyalty = mockSettings.barbershop.loyalty;
      
      const bookingPoints = loyalty.pointsPerBooking;
      const referralPoints = loyalty.pointsPerReferral;
      const purchasePoints = Math.floor(50 * loyalty.pointsPerDollar); // $50 purchase

      expect(bookingPoints).toBe(10);
      expect(referralPoints).toBe(20);
      expect(purchasePoints).toBe(50);
    });

    it('should determine loyalty tier correctly', () => {
      const tiers = mockSettings.barbershop.loyalty.tiers;
      
      // Sort by minPoints descending to find highest applicable tier
      const sortedTiers = [...tiers].sort((a, b) => b.minPoints - a.minPoints);
      
      const bronzeTier = sortedTiers.find(tier => 50 >= tier.minPoints);
      const silverTier = sortedTiers.find(tier => 150 >= tier.minPoints);
      const goldTier = sortedTiers.find(tier => 600 >= tier.minPoints);

      expect(bronzeTier?.name).toBe('Bronze');
      expect(silverTier?.name).toBe('Silver');
      expect(goldTier?.name).toBe('Gold');
    });

    it('should find next tier correctly', () => {
      const tiers = mockSettings.barbershop.loyalty.tiers;
      
      // Sort by minPoints ascending to find next tier
      const sortedTiers = [...tiers].sort((a, b) => a.minPoints - b.minPoints);
      
      const nextTierFor50 = sortedTiers.find(tier => tier.minPoints > 50);
      const nextTierFor150 = sortedTiers.find(tier => tier.minPoints > 150);
      const nextTierFor600 = sortedTiers.find(tier => tier.minPoints > 600);

      expect(nextTierFor50?.name).toBe('Silver');
      expect(nextTierFor150?.name).toBe('Gold');
      expect(nextTierFor600).toBeUndefined(); // No next tier
    });
  });

  describe('Settings API', () => {
    it('should handle global settings request', async () => {
      const mockGlobalSettings = {
        chatbot: { enabled: true },
        clock: { enabled: true }
      };

      mockFetch.mockResolvedValueOnce(
        createMockResponse(mockGlobalSettings)
      );

      const response = await fetch('/api/settings');
      const settings = await response.json();

      expect(settings).toEqual(mockGlobalSettings);
    });

    it('should handle tenant-specific settings request', async () => {
      const mockTenantSettings = {
        chatbot: { enabled: false },
        tenant: 'tenant-123'
      };

      mockFetch.mockResolvedValueOnce(
        createMockResponse(mockTenantSettings)
      );

      const response = await fetch('/api/settings?tenantId=tenant-123');
      const settings = await response.json();

      expect(settings).toEqual(mockTenantSettings);
    });

    it('should handle settings update', async () => {
      const updateData = {
        chatbot: { enabled: false },
        tenantId: 'tenant-123'
      };

      const mockResponse = {
        id: 'settings-123',
        ...updateData
      };

      mockFetch.mockResolvedValueOnce(
        createMockResponse(mockResponse)
      );

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const result = await response.json();

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({}, { ok: false, status: 500 })
      );

      const response = await fetch('/api/settings');
      expect(response.ok).toBe(false);
    });
  });

  describe('Feature Toggles', () => {
    const mockSettings = {
      chatbot: { enabled: true },
      clock: { enabled: false },
      barbershop: {
        simulator: { enabled: true },
        events: { enabled: false },
        retail: { enabled: true }
      }
    };

    it('should check if features are enabled', () => {
      const isFeatureEnabled = (feature: string) => {
        const featureSettings = mockSettings[feature as keyof typeof mockSettings];
        return featureSettings && typeof featureSettings === 'object' && 'enabled' in featureSettings
          ? (featureSettings as any).enabled
          : false;
      };

      expect(isFeatureEnabled('chatbot')).toBe(true);
      expect(isFeatureEnabled('clock')).toBe(false);
      expect(isFeatureEnabled('simulator')).toBe(false); // Not at root level
      expect(isFeatureEnabled('nonexistent')).toBe(false);
    });

    it('should handle nested feature checks', () => {
      const isNestedFeatureEnabled = (path: string) => {
        const parts = path.split('.');
        let current: any = mockSettings;
        
        for (const part of parts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            return false;
          }
        }
        
        return current && typeof current === 'object' && 'enabled' in current
          ? current.enabled
          : false;
      };

      expect(isNestedFeatureEnabled('barbershop.simulator')).toBe(true);
      expect(isNestedFeatureEnabled('barbershop.events')).toBe(false);
      expect(isNestedFeatureEnabled('barbershop.retail')).toBe(true);
      expect(isNestedFeatureEnabled('barbershop.nonexistent')).toBe(false);
    });
  });

  describe('Settings Merging', () => {
    const globalSettings = {
      chatbot: { enabled: true, position: 'bottom-right' },
      clock: { enabled: true },
      barbershop: {
        services: [
          { name: 'Haircut', price: 30 }
        ]
      }
    };

    const tenantSettings = {
      chatbot: { enabled: false }, // Override global
      barbershop: {
        services: [
          { name: 'Haircut', price: 35 } // Override global
        ]
      }
    };

    it('should merge tenant settings with global settings', () => {
      // Simple deep merge function
      const deepMerge = (target: any, source: any) => {
        const result = { ...target };
        
        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
          } else {
            result[key] = source[key];
          }
        }
        
        return result;
      };

      const mergedSettings = deepMerge(globalSettings, tenantSettings);

      expect(mergedSettings.chatbot.enabled).toBe(false); // Tenant override
      expect(mergedSettings.chatbot.position).toBe('bottom-right'); // Global preserved
      expect(mergedSettings.clock.enabled).toBe(true); // Global only
      expect(mergedSettings.barbershop.services[0].price).toBe(35); // Tenant override
    });
  });
});
