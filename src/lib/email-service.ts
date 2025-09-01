import nodemailer from 'nodemailer';

export interface EmailConfig {
  from: string;
  replyTo?: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;

  constructor() {
    this.config = {
      from: process.env.EMAIL_FROM || 'ModernMen <noreply@modernmen.com>',
      replyTo: process.env.EMAIL_REPLY_TO || 'support@modernmen.com',
      smtp: {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      }
    };
  }

  private async getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.config.smtp.host,
        port: this.config.smtp.port,
        secure: this.config.smtp.secure,
        auth: this.config.smtp.auth,
        tls: {
          rejectUnauthorized: false
        }
      });
    }
    return this.transporter;
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: this.config.from,
        replyTo: this.config.replyTo,
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        cc: emailData.cc ? (Array.isArray(emailData.cc) ? emailData.cc.join(', ') : emailData.cc) : undefined,
        bcc: emailData.bcc ? (Array.isArray(emailData.bcc) ? emailData.bcc.join(', ') : emailData.bcc) : undefined,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        attachments: emailData.attachments
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Template methods for specific email types
  async sendVerificationEmail(email: string, name: string, verificationLink: string): Promise<boolean> {
    const template = this.getVerificationTemplate(name, verificationLink);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendPasswordResetEmail(email: string, name: string, resetLink: string): Promise<boolean> {
    const template = this.getPasswordResetTemplate(name, resetLink);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendAppointmentConfirmation(
    email: string, 
    customerName: string, 
    appointmentDetails: {
      service: string;
      date: string;
      time: string;
      stylist: string;
      location: string;
    }
  ): Promise<boolean> {
    const template = this.getAppointmentConfirmationTemplate(customerName, appointmentDetails);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendStaffNotification(
    email: string,
    staffName: string,
    notificationType: 'schedule_update' | 'new_appointment' | 'cancellation' | 'review',
    details: any
  ): Promise<boolean> {
    const template = this.getStaffNotificationTemplate(staffName, notificationType, details);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendPaymentConfirmation(
    email: string,
    customerName: string,
    paymentDetails: {
      amount: number;
      service: string;
      transactionId: string;
      date: string;
    }
  ): Promise<boolean> {
    const template = this.getPaymentConfirmationTemplate(customerName, paymentDetails);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  // Template generators
  private getVerificationTemplate(name: string, verificationLink: string): EmailTemplate {
    return {
      subject: 'Verify Your ModernMen Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to ModernMen, ${name}!</h2>
          <p>Thanks for signing up! Please verify your email address to complete your account setup.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
          </div>
          <p>If you didn't create this account, you can safely ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">This verification link will expire in 24 hours.</p>
        </div>
      `,
      text: `Welcome to ModernMen, ${name}!\n\nPlease verify your email address by clicking this link: ${verificationLink}\n\nIf you didn't create this account, you can safely ignore this email.`
    };
  }

  private getPasswordResetTemplate(name: string, resetLink: string): EmailTemplate {
    return {
      subject: 'Reset Your ModernMen Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">This reset link will expire in 1 hour.</p>
        </div>
      `,
      text: `Hi ${name},\n\nWe received a request to reset your password. Click this link to create a new password: ${resetLink}\n\nIf you didn't request this password reset, you can safely ignore this email.`
    };
  }

  private getAppointmentConfirmationTemplate(name: string, details: any): EmailTemplate {
    return {
      subject: 'Appointment Confirmed - ModernMen',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Appointment Confirmed!</h2>
          <p>Hi ${name},</p>
          <p>Your appointment has been confirmed. Here are the details:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Service:</strong> ${details.service}</p>
            <p><strong>Date:</strong> ${details.date}</p>
            <p><strong>Time:</strong> ${details.time}</p>
            <p><strong>Stylist:</strong> ${details.stylist}</p>
            <p><strong>Location:</strong> ${details.location}</p>
          </div>
          <p>We look forward to seeing you!</p>
          <p>If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
        </div>
      `,
      text: `Hi ${name},\n\nYour appointment has been confirmed:\n\nService: ${details.service}\nDate: ${details.date}\nTime: ${details.time}\nStylist: ${details.stylist}\nLocation: ${details.location}\n\nWe look forward to seeing you!`
    };
  }

  private getStaffNotificationTemplate(staffName: string, type: string, details: any): EmailTemplate {
    const subjects = {
      schedule_update: 'Schedule Update - ModernMen',
      new_appointment: 'New Appointment - ModernMen',
      cancellation: 'Appointment Cancellation - ModernMen',
      review: 'New Customer Review - ModernMen'
    };

    return {
      subject: subjects[type as keyof typeof subjects] || 'Staff Notification - ModernMen',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Staff Notification</h2>
          <p>Hi ${staffName},</p>
          <p>${this.getNotificationMessage(type, details)}</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            ${this.formatNotificationDetails(type, details)}
          </div>
          <p>Please check your staff dashboard for more information.</p>
        </div>
      `,
      text: `Hi ${staffName},\n\n${this.getNotificationMessage(type, details)}\n\nPlease check your staff dashboard for more information.`
    };
  }

  private getPaymentConfirmationTemplate(name: string, details: any): EmailTemplate {
    return {
      subject: 'Payment Confirmation - ModernMen',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Payment Confirmed!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for your payment. Here are your receipt details:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Service:</strong> ${details.service}</p>
            <p><strong>Amount:</strong> $${details.amount.toFixed(2)}</p>
            <p><strong>Transaction ID:</strong> ${details.transactionId}</p>
            <p><strong>Date:</strong> ${details.date}</p>
          </div>
          <p>Keep this email for your records.</p>
        </div>
      `,
      text: `Hi ${name},\n\nThank you for your payment.\n\nService: ${details.service}\nAmount: $${details.amount.toFixed(2)}\nTransaction ID: ${details.transactionId}\nDate: ${details.date}\n\nKeep this email for your records.`
    };
  }

  private getNotificationMessage(type: string, details: any): string {
    const messages = {
      schedule_update: 'Your schedule has been updated.',
      new_appointment: 'You have a new appointment booking.',
      cancellation: 'An appointment has been cancelled.',
      review: 'You have received a new customer review.'
    };
    return messages[type as keyof typeof messages] || 'You have a new notification.';
  }

  private formatNotificationDetails(type: string, details: any): string {
    // Format details based on notification type
    const detailsArray = Object.entries(details).map(([key, value]) => 
      `<p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</p>`
    );
    return detailsArray.join('');
  }

  async verifyConnection(): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();
      await transporter.verify();
      console.log('Email service connection verified');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const emailService = new EmailService();
export default emailService;