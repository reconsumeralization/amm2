import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private static instance: EmailService
  private transporter: any

  private constructor() {
    this.initializeTransporter()
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  private initializeTransporter() {
    // In a real implementation, use environment variables
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    }

    // For demo purposes, use a mock transporter
    if (!process.env.SMTP_USER) {
      console.log('Email service: Using mock transporter (configure SMTP_* environment variables for real emails)')
      this.transporter = {
        sendMail: async (mailOptions: any) => {
          console.log('Mock email sent:', mailOptions)
          return { messageId: 'mock-' + Date.now() }
        }
      }
    } else {
      this.transporter = nodemailer.createTransport(config)
    }
  }

  async sendEmail(emailData: EmailData): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@modernmen.com',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log(`Email sent successfully: ${result.messageId}`)

    } catch (error) {
      console.error('Email sending failed:', error)
      throw new Error('Failed to send email')
    }
  }

  // Template methods for different types of emails
  async sendWelcomeEmail(to: string, name: string, role: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #2563eb, #8b5cf6); color: white; padding: 20px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 2rem;">✂ Modern Men Salon</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Professional Salon Management</p>
        </div>
        <div style="background: white; color: #333; padding: 30px; border-radius: 8px; margin: 20px 0;">
          <h2>Welcome to the Team, ${name}!</h2>
          <p>Your account has been created successfully with the role: <strong>${role.toUpperCase()}</strong></p>
          <p>You can now access the Modern Men Salon management system with your credentials.</p>
          ${role === 'stylist' ? '<p><strong>Next Steps:</strong> Please complete your stylist profile, upload your portfolio photos, and set your working hours.</p>' : ''}
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/login"
               style="background: linear-gradient(135deg, #2563eb, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              Access Your Account
            </a>
          </div>
        </div>
        <p style="text-align: center; opacity: 0.8; font-size: 0.9rem;">
          Modern Men Salon - Professional Grooming Services
        </p>
      </div>
    `

    await this.sendEmail({
      to,
      subject: 'Welcome to Modern Men Salon!',
      html
    })
  }

  async sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #2563eb, #8b5cf6); color: white; padding: 20px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 2rem;">🔐 Password Reset</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Modern Men Salon</p>
        </div>
        <div style="background: white; color: #333; padding: 30px; border-radius: 8px; margin: 20px 0;">
          <h2>Hi ${name},</h2>
          <p>We received a request to reset your password for your Modern Men Salon account.</p>
          <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 0.9rem;">
            If you didn't request this password reset, please ignore this email.
          </p>
        </div>
        <p style="text-align: center; opacity: 0.8; font-size: 0.9rem;">
          Modern Men Salon - Secure Account Management
        </p>
      </div>
    `

    await this.sendEmail({
      to,
      subject: 'Reset Your Password - Modern Men Salon',
      html
    })
  }

  async sendAppointmentNotification(to: string, customerName: string, stylistName: string, appointmentDetails: any): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 20px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 2rem;">📅 New Appointment</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Modern Men Salon</p>
        </div>
        <div style="background: white; color: #333; padding: 30px; border-radius: 8px; margin: 20px 0;">
          <h2>New Appointment Booked!</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Stylist:</strong> ${stylistName}</p>
            <p><strong>Service:</strong> ${appointmentDetails.service || 'General Service'}</p>
            <p><strong>Date:</strong> ${new Date(appointmentDetails.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointmentDetails.time}</p>
            ${appointmentDetails.duration ? `<p><strong>Duration:</strong> ${appointmentDetails.duration} minutes</p>` : ''}
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/appointments"
               style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              View Appointment Details
            </a>
          </div>
        </div>
        <p style="text-align: center; opacity: 0.8; font-size: 0.9rem;">
          Modern Men Salon - Appointment Management System
        </p>
      </div>
    `

    await this.sendEmail({
      to,
      subject: 'New Appointment Booked - Modern Men Salon',
      html
    })
  }

  async sendSystemAlert(to: string, alertType: string, message: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'): Promise<void> {
    const priorityColors = {
      low: '#6b7280',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#dc2626'
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1f2937, #374151); color: white; padding: 20px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 2rem; color: ${priorityColors[priority]};">⚠️ System Alert</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Modern Men Salon</p>
        </div>
        <div style="background: white; color: #333; padding: 30px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: ${priorityColors[priority]};">${alertType}</h2>
          <p style="font-size: 1.1rem; line-height: 1.6;">${message}</p>
          <div style="background: ${priorityColors[priority]}10; border: 1px solid ${priorityColors[priority]}; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: ${priorityColors[priority]}; font-weight: 600;">
              Priority: ${priority.toUpperCase()}
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard"
               style="background: linear-gradient(135deg, #1f2937, #374151); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              Access Admin Dashboard
            </a>
          </div>
        </div>
        <p style="text-align: center; opacity: 0.8; font-size: 0.9rem;">
          Modern Men Salon - System Monitoring
        </p>
      </div>
    `

    await this.sendEmail({
      to,
      subject: `[${priority.toUpperCase()}] System Alert - Modern Men Salon`,
      html
    })
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance()

// Convenience functions
export const sendWelcomeEmail = (to: string, name: string, role: string) =>
  emailService.sendWelcomeEmail(to, name, role)

export const sendPasswordResetEmail = (to: string, name: string, token: string) =>
  emailService.sendPasswordResetEmail(to, name, token)

export const sendAppointmentNotification = (to: string, customerName: string, stylistName: string, details: any) =>
  emailService.sendAppointmentNotification(to, customerName, stylistName, details)

export const sendSystemAlert = (to: string, type: string, message: string, priority?: 'low' | 'medium' | 'high' | 'urgent') =>
  emailService.sendSystemAlert(to, type, message, priority)
