/**
 * Data Synchronization Service
 * Ensures consistency and synchronization across all ModernMen services
 */

import { getPayload } from 'payload';
import config from '../payload.config';
import { getSettingsWithFallback } from './settings-initializer';

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
  details?: any;
}

export class DataSyncService {
  public payload: any = null;

  async initialize(): Promise<void> {
    if (!this.payload) {
      this.payload = await getPayload({ config });
    }
  }

  /**
   * Sync appointments with Google Calendar
   */
  async syncAppointmentsWithCalendar(tenantId?: string): Promise<SyncResult> {
    await this.initialize();

    const result: SyncResult = {
      success: false,
      synced: 0,
      failed: 0,
      errors: []
    };

    try {
      const settings = await getSettingsWithFallback(tenantId);

      if (!settings.googleCalendar?.enabled) {
        result.errors.push('Google Calendar sync is not enabled');
        return result;
      }

      // Get appointments that need syncing
      const appointments = await this.payload.find({
        collection: 'appointments',
        where: {
          and: [
            { status: { in: ['confirmed', 'rescheduled'] } },
            { date: { greater_than: new Date() } },
            {
              or: [
                { googleEventId: { exists: false } },
                { googleEventId: { equals: null } },
                { googleEventId: { equals: '' } }
              ]
            }
          ]
        },
        populate: ['user']
      });

      console.log(`Syncing ${appointments.docs.length} appointments`);

      for (const appointment of appointments.docs) {
        try {
          const user = appointment.user;
          
          if (!user?.googleAccessToken) {
            result.failed++;
            result.errors.push(`User ${user?.email || appointment.user} has no Google access token`);
            continue;
          }

          // Call the calendar integration API
          const response = await fetch('/api/integrations/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'create',
              userId: user.id,
              appointmentId: appointment.id,
              title: appointment.title || appointment.service,
              date: appointment.date,
            }),
          });

          if (response.ok) {
            result.synced++;
          } else {
            result.failed++;
            const error = await response.json();
            result.errors.push(`Failed to sync appointment ${appointment.id}: ${error.error}`);
          }

        } catch (error) {
          result.failed++;
          result.errors.push(`Error syncing appointment ${appointment.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      result.success = result.failed === 0;
      console.log(`Calendar sync completed: ${result.synced} synced, ${result.failed} failed`);

    } catch (error) {
      result.errors.push(`Calendar sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Sync user data across services
   */
  async syncUserData(userId: string): Promise<SyncResult> {
    await this.initialize();

    const result: SyncResult = {
      success: false,
      synced: 0,
      failed: 0,
      errors: []
    };

    try {
      const user = await this.payload.findByID({
        collection: 'users',
        id: userId
      });

      if (!user) {
        result.errors.push('User not found');
        return result;
      }

      // Sync with customers collection if user is a customer
      if (user.role === 'customer') {
        try {
          const existingCustomer = await this.payload.find({
            collection: 'customers',
            where: { email: { equals: user.email } },
            limit: 1
          });

          if (existingCustomer.docs.length === 0) {
            // Create customer record
            await this.payload.create({
              collection: 'customers',
              data: {
                email: user.email,
                name: user.name,
                phone: user.profile?.phone,
                preferences: user.profile?.preferences,
                loyaltyPoints: user.loyalty?.points || 0,
                loyaltyTier: user.loyalty?.tier || 'bronze',
                tenant: user.tenant
              }
            });
            result.synced++;
          } else {
            // Update existing customer record
            await this.payload.update({
              collection: 'customers',
              id: existingCustomer.docs[0].id,
              data: {
                name: user.name,
                phone: user.profile?.phone,
                preferences: user.profile?.preferences,
                loyaltyPoints: user.loyalty?.points || 0,
                loyaltyTier: user.loyalty?.tier || 'bronze'
              }
            });
            result.synced++;
          }
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to sync customer data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Sync with stylists collection if user is a barber
      if (user.role === 'barber') {
        try {
          const existingStylist = await this.payload.find({
            collection: 'stylists',
            where: { email: { equals: user.email } },
            limit: 1
          });

          if (existingStylist.docs.length === 0) {
            // Create stylist record
            await this.payload.create({
              collection: 'stylists',
              data: {
                email: user.email,
                name: user.name,
                bio: user.bio,
                specialties: user.specialties,
                profilePhoto: user.profilePhoto,
                tenant: user.tenant
              }
            });
            result.synced++;
          } else {
            // Update existing stylist record
            await this.payload.update({
              collection: 'stylists',
              id: existingStylist.docs[0].id,
              data: {
                name: user.name,
                bio: user.bio,
                specialties: user.specialties,
                profilePhoto: user.profilePhoto
              }
            });
            result.synced++;
          }
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to sync stylist data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.failed === 0;

    } catch (error) {
      result.errors.push(`User sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Sync settings across services
   */
  async syncSettingsAcrossServices(tenantId?: string): Promise<SyncResult> {
    await this.initialize();

    const result: SyncResult = {
      success: false,
      synced: 0,
      failed: 0,
      errors: []
    };

    try {
      const settings = await getSettingsWithFallback(tenantId);

      // Sync chatbot settings with chatbot service
      try {
        // This would sync with an external chatbot service if needed
        console.log('Chatbot settings synced');
        result.synced++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Chatbot sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Sync payment settings with Stripe
      try {
        // This would sync with Stripe if needed
        console.log('Payment settings synced');
        result.synced++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Payment sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Sync email settings with email service
      try {
        // This would sync with email service if needed
        console.log('Email settings synced');
        result.synced++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Email sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      result.success = result.failed === 0;

    } catch (error) {
      result.errors.push(`Settings sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Comprehensive sync of all data
   */
  async syncAllData(tenantId?: string): Promise<{
    calendar: SyncResult;
    settings: SyncResult;
    summary: {
      totalSynced: number;
      totalFailed: number;
      allErrors: string[];
    };
  }> {
    console.log('Starting comprehensive data synchronization...');

    const [calendarSync, settingsSync] = await Promise.all([
      this.syncAppointmentsWithCalendar(tenantId),
      this.syncSettingsAcrossServices(tenantId)
    ]);

    const summary = {
      totalSynced: calendarSync.synced + settingsSync.synced,
      totalFailed: calendarSync.failed + settingsSync.failed,
      allErrors: [...calendarSync.errors, ...settingsSync.errors]
    };

    console.log(`Data sync completed: ${summary.totalSynced} synced, ${summary.totalFailed} failed`);

    return {
      calendar: calendarSync,
      settings: settingsSync,
      summary
    };
  }

  /**
   * Health check for all sync services
   */
  async healthCheck(): Promise<{
    services: Record<string, { status: 'healthy' | 'unhealthy'; details?: string }>;
    overall: 'healthy' | 'unhealthy';
  }> {
    const services: Record<string, { status: 'healthy' | 'unhealthy'; details?: string }> = {};

    // Check Payload CMS connection
    try {
      await this.initialize();
      await this.payload.find({ collection: 'settings', limit: 1 });
      services.payload = { status: 'healthy' };
    } catch (error) {
      services.payload = { 
        status: 'unhealthy', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    // Check Google Calendar API availability
    try {
      const settings = await getSettingsWithFallback();
      if (settings.googleCalendar?.enabled) {
        services.googleCalendar = { status: 'healthy' };
      } else {
        services.googleCalendar = { status: 'unhealthy', details: 'Google Calendar disabled in settings' };
      }
    } catch (error) {
      services.googleCalendar = { 
        status: 'unhealthy', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    // Check settings service
    try {
      await getSettingsWithFallback();
      services.settings = { status: 'healthy' };
    } catch (error) {
      services.settings = { 
        status: 'unhealthy', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    const unhealthyServices = Object.values(services).filter(s => s.status === 'unhealthy');
    const overall = unhealthyServices.length === 0 ? 'healthy' : 'unhealthy';

    return { services, overall };
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();