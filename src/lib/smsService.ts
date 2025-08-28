interface SMSConfig {
  accountSid: string
  authToken: string
  fromNumber: string
}

interface SMSData {
  to: string
  message: string
}

class SMSService {
  private static instance: SMSService
  private config: SMSConfig | null = null

  private constructor() {
    this.initializeConfig()
  }

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService()
    }
    return SMSService.instance
  }

  private initializeConfig() {
    // In a real implementation, use environment variables for Twilio or other SMS service
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.config = {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_FROM_NUMBER || ''
      }
    } else {
      console.log('SMS service: Using mock service (configure TWILIO_* environment variables for real SMS)')
    }
  }

  async sendSMS(smsData: SMSData): Promise<void> {
    try {
      if (!this.config) {
        // Mock SMS service for development
        console.log(`Mock SMS sent to ${smsData.to}: ${smsData.message}`)
        return
      }

      // In a real implementation, use Twilio or another SMS service
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: this.config.fromNumber,
          To: smsData.to,
          Body: smsData.message,
        }),
      })

      if (!response.ok) {
        throw new Error(`SMS sending failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log(`SMS sent successfully: ${result.sid}`)

    } catch (error) {
      console.error('SMS sending failed:', error)
      throw new Error('Failed to send SMS')
    }
  }

  // Template methods for different types of SMS messages
  async sendAppointmentConfirmation(to: string, customerName: string, stylistName: string, date: string, time: string): Promise<void> {
    const message = `Hi ${customerName}! Your appointment with ${stylistName} is confirmed for ${date} at ${time}. See you at Modern Men Salon! ✂`

    await this.sendSMS({ to, message })
  }

  async sendAppointmentReminder(to: string, customerName: string, stylistName: string, date: string, time: string): Promise<void> {
    const message = `Hi ${customerName}! Reminder: You have an appointment with ${stylistName} tomorrow at ${time}. Modern Men Salon ✂`

    await this.sendSMS({ to, message })
  }

  async sendAppointmentCancellation(to: string, customerName: string, stylistName: string, date: string): Promise<void> {
    const message = `Hi ${customerName}, your appointment with ${stylistName} on ${date} has been cancelled. Contact us to reschedule. Modern Men Salon ✂`

    await this.sendSMS({ to, message })
  }

  async sendWelcomeSMS(to: string, name: string, role: string): Promise<void> {
    const message = `Welcome to Modern Men Salon, ${name}! Your ${role} account is now active. Access the portal to get started. ✂`

    await this.sendSMS({ to, message })
  }

  async sendPasswordResetSMS(to: string, name: string, resetCode: string): Promise<void> {
    const message = `Hi ${name}, your password reset code is: ${resetCode}. This code expires in 10 minutes. Modern Men Salon ✂`

    await this.sendSMS({ to, message })
  }

  async sendStylistNotification(to: string, stylistName: string, appointmentCount: number): Promise<void> {
    const message = `Hi ${stylistName}, you have ${appointmentCount} appointment${appointmentCount !== 1 ? 's' : ''} scheduled today. Check the portal for details. Modern Men Salon ✂`

    await this.sendSMS({ to, message })
  }

  async sendSystemAlert(to: string, message: string): Promise<void> {
    const alertMessage = `SYSTEM ALERT: ${message}. Please check the admin dashboard. Modern Men Salon ⚠️`

    await this.sendSMS({ to, message: alertMessage })
  }

  // Validate phone number format
  isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation (can be enhanced)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phoneNumber)
  }

  // Format phone number for SMS service
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '')

    // Add country code if not present (assuming US for demo)
    if (digitsOnly.length === 10) {
      return `+1${digitsOnly}`
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return `+${digitsOnly}`
    } else if (!digitsOnly.startsWith('+')) {
      return `+${digitsOnly}`
    }

    return phoneNumber
  }
}

// Export singleton instance
export const smsService = SMSService.getInstance()

// Convenience functions
export const sendAppointmentConfirmation = (to: string, customerName: string, stylistName: string, date: string, time: string) =>
  smsService.sendAppointmentConfirmation(to, customerName, stylistName, date, time)

export const sendAppointmentReminder = (to: string, customerName: string, stylistName: string, date: string, time: string) =>
  smsService.sendAppointmentReminder(to, customerName, stylistName, date, time)

export const sendAppointmentCancellation = (to: string, customerName: string, stylistName: string, date: string) =>
  smsService.sendAppointmentCancellation(to, customerName, stylistName, date)

export const sendWelcomeSMS = (to: string, name: string, role: string) =>
  smsService.sendWelcomeSMS(to, name, role)

export const sendPasswordResetSMS = (to: string, name: string, code: string) =>
  smsService.sendPasswordResetSMS(to, name, code)

export const sendStylistNotification = (to: string, stylistName: string, count: number) =>
  smsService.sendStylistNotification(to, stylistName, count)

export const sendSystemAlertSMS = (to: string, message: string) =>
  smsService.sendSystemAlert(to, message)
