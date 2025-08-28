import { notificationEmitter } from './notificationEmitter'
import { sendWelcomeEmail, sendPasswordResetEmail, sendAppointmentNotification, sendSystemAlert } from './emailService'
import { sendWelcomeSMS, sendSystemAlertSMS } from './smsService'

export interface NotificationData {
  userId: string
  type: 'user_created' | 'user_updated' | 'employee_created' | 'appointment_booked' | 'system_alert' | 'security_alert'
  title: string
  message: string
  data?: any
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export class NotificationService {
  private static instance: NotificationService

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  /**
   * Send a notification to a specific user
   */
  async sendToUser(notification: NotificationData): Promise<void> {
    const notificationPayload = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      timestamp: new Date().toISOString(),
      read: false,
      priority: notification.priority || 'medium'
    }

    // Emit real-time notification
    notificationEmitter.emit('notification', notificationPayload)

    // Store in database (in a real implementation)
    await this.storeNotification(notificationPayload)

    // Send email and SMS if high priority
    if (notification.priority === 'high' || notification.priority === 'urgent') {
      await this.sendEmailNotification(notificationPayload)
      await this.sendSMSNotification(notificationPayload)
    } else if (notification.priority === 'medium') {
      await this.sendEmailNotification(notificationPayload)
    }

    console.log(`Notification sent: ${notification.title} to user ${notification.userId}`)
  }

  /**
   * Send notification to all admin users
   */
  async sendToAdmins(notification: Omit<NotificationData, 'userId'>): Promise<void> {
    // In a real implementation, get all admin users from database
    const adminUsers = await this.getAdminUsers()

    for (const admin of adminUsers) {
      await this.sendToUser({
        ...notification,
        userId: admin.id
      })
    }
  }

  /**
   * Send system-wide notification to all users
   */
  async sendToAll(notification: Omit<NotificationData, 'userId'>): Promise<void> {
    const notificationPayload = {
      id: `broadcast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'all',
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      timestamp: new Date().toISOString(),
      read: false,
      priority: notification.priority || 'medium'
    }

    notificationEmitter.emit('notification', notificationPayload)

    // Store broadcast notification
    await this.storeNotification(notificationPayload)

    console.log(`Broadcast notification sent: ${notification.title}`)
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, options: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
  } = {}): Promise<any[]> {
    // In a real implementation, query the notifications collection
    return []
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    // In a real implementation, update the notification in database
    console.log(`Notification ${notificationId} marked as read by user ${userId}`)
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    // In a real implementation, update all notifications for the user
    console.log(`All notifications marked as read for user ${userId}`)
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId: string): Promise<{
    total: number
    unread: number
    urgent: number
  }> {
    // In a real implementation, aggregate notification data
    return {
      total: 0,
      unread: 0,
      urgent: 0
    }
  }

  private async storeNotification(notification: any): Promise<void> {
    // In a real implementation, store in Payload CMS notifications collection
    // For now, just log it
    console.log('Storing notification:', notification)
  }

  private async sendEmailNotification(notification: any): Promise<void> {
    try {
      // Get user email (in a real implementation, fetch from database)
      // For demo, we'll use a mock email
      const mockUserEmail = 'user@example.com' // This would be fetched from user data

      switch (notification.type) {
        case 'user_created':
          await sendWelcomeEmail(mockUserEmail, 'New User', notification.data.userRole || 'staff')
          break
        case 'employee_created':
          await sendWelcomeEmail(mockUserEmail, notification.data.employeeName || 'New Employee', 'stylist')
          break
        case 'appointment_booked':
          await sendAppointmentNotification(
            mockUserEmail,
            notification.data.customerName || 'Customer',
            notification.data.stylistName || 'Stylist',
            notification.data
          )
          break
        case 'system_alert':
          await sendSystemAlert(
            mockUserEmail,
            notification.title,
            notification.message,
            notification.priority
          )
          break
        default:
          console.log('Email notification sent:', notification)
      }
    } catch (error) {
      console.error('Email notification failed:', error)
    }
  }

  private async sendSMSNotification(notification: any): Promise<void> {
    try {
      // Get user phone (in a real implementation, fetch from database)
      // For demo, we'll skip actual SMS sending
      const mockUserPhone = '+1234567890' // This would be fetched from user data

      switch (notification.type) {
        case 'user_created':
          await sendWelcomeSMS(mockUserPhone, 'New User', notification.data.userRole || 'staff')
          break
        case 'employee_created':
          await sendWelcomeSMS(mockUserPhone, notification.data.employeeName || 'New Employee', 'stylist')
          break
        case 'system_alert':
          if (notification.priority === 'high' || notification.priority === 'urgent') {
            await sendSystemAlertSMS(mockUserPhone, notification.message)
          }
          break
        default:
          console.log('SMS notification sent:', notification)
      }
    } catch (error) {
      console.error('SMS notification failed:', error)
    }
  }

  private async getAdminUsers(): Promise<any[]> {
    // In a real implementation, query users with admin role
    return []
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance()

// Convenience functions
export const sendUserNotification = (notification: NotificationData) =>
  notificationService.sendToUser(notification)

export const sendAdminNotification = (notification: Omit<NotificationData, 'userId'>) =>
  notificationService.sendToAdmins(notification)

export const sendBroadcastNotification = (notification: Omit<NotificationData, 'userId'>) =>
  notificationService.sendToAll(notification)
