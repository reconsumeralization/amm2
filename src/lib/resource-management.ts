import { getPayloadClient } from '@/lib/payload-client';
import { emailService } from '@/lib/email-service';

interface AppointmentNotification {
  customerEmail: string;
  customerName: string;
  appointmentDate: string;
  appointmentTime: string;
  service: string;
  reason: string;
}

/**
 * Service to handle resource deactivation and appointment management
 */
export class ResourceManagementService {
  
  /**
   * Handle existing appointments when a resource (staff member, room, etc.) is deactivated
   */
  async handleDeactivatedResource(resourceType: 'staff' | 'room' | 'equipment', resourceId: string, reason: string = 'Resource no longer available') {
    try {
      const payload = await getPayloadClient();
      
      console.log(`Handling deactivation of ${resourceType} resource:`, resourceId);

      // Find all future appointments that depend on this resource
      const whereClause = this.buildResourceQuery(resourceType, resourceId);
      
      const futureAppointments = await payload.find({
        collection: 'appointments',
        where: {
          and: [
            whereClause,
            { date: { greater_than: new Date().toISOString() } },
            { status: { in: ['confirmed', 'pending'] } }
          ]
        }
      });

      console.log(`Found ${futureAppointments.totalDocs} appointments affected by ${resourceType} deactivation`);

      // Process each affected appointment
      for (const appointment of futureAppointments.docs) {
        await this.handleAffectedAppointment(appointment, resourceType, reason, payload);
      }

      // Log the resource deactivation
      await this.logResourceDeactivation(resourceType, resourceId, futureAppointments.totalDocs, reason, payload);

      return {
        success: true,
        affectedAppointments: futureAppointments.totalDocs,
        message: `Successfully handled deactivation of ${resourceType}. ${futureAppointments.totalDocs} appointments were processed.`
      };
    } catch (error) {
      console.error('Error handling deactivated resource:', error);
      throw new Error(`Failed to handle deactivated resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build query based on resource type
   */
  private buildResourceQuery(resourceType: 'staff' | 'room' | 'equipment', resourceId: string) {
    switch (resourceType) {
      case 'staff':
        return { barber: { equals: resourceId } };
      case 'room':
        return { room: { equals: resourceId } };
      case 'equipment':
        return { equipment: { contains: resourceId } };
      default:
        throw new Error(`Unknown resource type: ${resourceType}`);
    }
  }

  /**
   * Handle an individual affected appointment
   */
  private async handleAffectedAppointment(appointment: any, resourceType: string, reason: string, payload: any) {
    try {
      // Get customer information
      const customer = await payload.findByID({
        collection: 'users',
        id: appointment.user
      });

      if (!customer) {
        console.error('Customer not found for appointment:', appointment.id);
        return;
      }

      // Update appointment status to require rescheduling
      await payload.update({
        collection: 'appointments',
        id: appointment.id,
        data: {
          status: 'requires_rescheduling',
          cancellationReason: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} no longer available: ${reason}`,
          requiresRescheduling: true,
          originalDate: appointment.date,
          originalTime: appointment.time,
        }
      });

      // Send notification to customer
      if (customer.email) {
        await this.sendReschedulingNotification({
          customerEmail: customer.email,
          customerName: customer.name || customer.email,
          appointmentDate: new Date(appointment.date).toLocaleDateString(),
          appointmentTime: appointment.time || 'TBD',
          service: appointment.service || 'Appointment',
          reason
        });
      }

      console.log(`Processed appointment ${appointment.id} for rescheduling`);
    } catch (error) {
      console.error(`Error processing appointment ${appointment.id}:`, error);
    }
  }

  /**
   * Send rescheduling notification to customer
   */
  private async sendReschedulingNotification(notification: AppointmentNotification) {
    try {
      await emailService.sendEmail({
        to: notification.customerEmail,
        subject: 'Appointment Rescheduling Required - ModernMen',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ffc107;">Appointment Rescheduling Required</h2>
            <p>Hi ${notification.customerName},</p>
            <p>We need to reschedule your upcoming appointment due to an unexpected change.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Original Appointment:</strong></p>
              <p><strong>Service:</strong> ${notification.service}</p>
              <p><strong>Date:</strong> ${notification.appointmentDate}</p>
              <p><strong>Time:</strong> ${notification.appointmentTime}</p>
              <p><strong>Reason:</strong> ${notification.reason}</p>
            </div>

            <p>We sincerely apologize for any inconvenience this may cause. Our team will contact you shortly to help you find a new appointment time that works for you.</p>
            
            <p>Alternatively, you can:</p>
            <ul>
              <li>Visit our website to book a new appointment</li>
              <li>Call us directly at your convenience</li>
              <li>Reply to this email with your preferred times</li>
            </ul>
            
            <p>Thank you for your understanding and continued trust in ModernMen.</p>
            <p>Best regards,<br>The ModernMen Team</p>
          </div>
        `,
        text: `Hi ${notification.customerName},\n\nWe need to reschedule your upcoming appointment due to an unexpected change.\n\nOriginal Appointment:\nService: ${notification.service}\nDate: ${notification.appointmentDate}\nTime: ${notification.appointmentTime}\nReason: ${notification.reason}\n\nWe sincerely apologize for any inconvenience. Our team will contact you shortly to help you find a new appointment time.\n\nThank you for your understanding.\n\nBest regards,\nThe ModernMen Team`
      });
      console.log('Rescheduling notification sent to:', notification.customerEmail);
    } catch (error) {
      console.error('Failed to send rescheduling notification:', error);
    }
  }

  /**
   * Log resource deactivation for audit purposes
   */
  private async logResourceDeactivation(resourceType: string, resourceId: string, affectedAppointments: number, reason: string, payload: any) {
    try {
      await payload.create({
        collection: 'system-logs',
        data: {
          type: 'resource_deactivation',
          resourceType,
          resourceId,
          affectedAppointments,
          reason,
          timestamp: new Date(),
          status: 'completed'
        }
      });
    } catch (error) {
      console.error('Failed to log resource deactivation:', error);
      // Don't throw here as it's just logging
    }
  }

  /**
   * Reactivate a resource and restore related appointments
   */
  async reactivateResource(resourceType: 'staff' | 'room' | 'equipment', resourceId: string) {
    try {
      const payload = await getPayloadClient();
      
      console.log(`Reactivating ${resourceType} resource:`, resourceId);

      // Find appointments that were marked for rescheduling due to this resource
      const whereClause = this.buildResourceQuery(resourceType, resourceId);
      
      const affectedAppointments = await payload.find({
        collection: 'appointments',
        where: {
          and: [
            whereClause,
            { status: { equals: 'requires_rescheduling' } }
          ]
        }
      });

      // Process each appointment - could be restored or still need rescheduling
      for (const appointment of affectedAppointments.docs) {
        // Check if the original time is still available
        if (new Date(appointment.originalDate) > new Date()) {
          await payload.update({
            collection: 'appointments',
            id: appointment.id,
            data: {
              status: 'confirmed',
              cancellationReason: null,
              requiresRescheduling: false,
            }
          });

          // Notify customer of restoration
          const customer = await payload.findByID({
            collection: 'users',
            id: appointment.user
          });

          if (customer?.email) {
            await emailService.sendEmail({
              to: customer.email,
              subject: 'Appointment Restored - ModernMen',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #28a745;">Great News! Your Appointment is Restored</h2>
                  <p>Hi ${customer.name || customer.email},</p>
                  <p>We're happy to inform you that your appointment has been restored to its original time.</p>
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Confirmed Appointment:</strong></p>
                    <p><strong>Service:</strong> ${appointment.service}</p>
                    <p><strong>Date:</strong> ${new Date(appointment.originalDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${appointment.time}</p>
                  </div>
                  <p>We look forward to seeing you!</p>
                  <p>Best regards,<br>The ModernMen Team</p>
                </div>
              `
            });
          }
        }
      }

      return {
        success: true,
        restoredAppointments: affectedAppointments.totalDocs,
        message: `Successfully reactivated ${resourceType}. ${affectedAppointments.totalDocs} appointments were processed.`
      };
    } catch (error) {
      console.error('Error reactivating resource:', error);
      throw new Error(`Failed to reactivate resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Singleton instance
export const resourceManagementService = new ResourceManagementService();
export default resourceManagementService;