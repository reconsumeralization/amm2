import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/payload';
import config from '../../../../payload.config';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, template, data, tenantId } = await req.json();

    if (!to || !subject || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, template' },
        { status: 400 }
      );
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    const settings = await getSettings(tenantId);

    if (!settings.notifications?.email?.enabled) {
      return NextResponse.json(
        { error: 'Email notifications are disabled' },
        { status: 400 }
      );
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Process template with data
    const processedTemplate = processTemplate(template, data);

    // Create email content
    const emailContent = createEmailContent(processedTemplate, settings);

    // Send email
    const info = await transporter.sendMail({
      from: `"${settings.notifications.email.fromName}" <${settings.notifications.email.fromEmail}>`,
      to: to,
      subject: subject,
      html: emailContent,
    });

    // Log email sent
    await logEmailSent({
      to,
      subject,
      template,
      data,
      tenantId,
      messageId: info.messageId,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

function processTemplate(template: string, data: any): string {
  let processedTemplate = template;

  // Replace placeholders with actual data
  Object.entries(data || {}).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    processedTemplate = processedTemplate.replace(placeholder, String(value));
  });

  return processedTemplate;
}

function createEmailContent(template: string, settings: any): string {
  const themeColor = settings.portal?.themeColor || '#1f2937';
  const logoUrl = settings.portal?.logoUrl || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ModernMen Barbershop</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: ${themeColor};
          color: white;
          padding: 2rem;
          text-align: center;
        }
        .logo {
          max-width: 150px;
          height: auto;
          margin-bottom: 1rem;
        }
        .content {
          padding: 2rem;
        }
        .footer {
          background-color: #f3f4f6;
          padding: 1.5rem 2rem;
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
        }
        .button {
          display: inline-block;
          background-color: ${themeColor};
          color: white;
          padding: 0.75rem 1.5rem;
          text-decoration: none;
          border-radius: 6px;
          margin: 1rem 0;
        }
        .button:hover {
          opacity: 0.9;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .header, .content, .footer {
            padding: 1rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${logoUrl ? `<img src="${logoUrl}" alt="ModernMen" class="logo">` : ''}
          <h1 style="margin: 0; font-size: 1.5rem;">ModernMen Barbershop</h1>
        </div>
        
        <div class="content">
          ${template}
        </div>
        
        <div class="footer">
          <p>Thank you for choosing ModernMen Barbershop</p>
          <p>If you have any questions, please contact us</p>
          <p>&copy; ${new Date().getFullYear()} ModernMen Barbershop. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function logEmailSent(emailData: any) {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    
    await payload.create({
      collection: 'email-logs',
      data: {
        to: emailData.to,
        subject: emailData.subject,
        template: emailData.template,
        data: emailData.data,
        tenantId: emailData.tenantId,
        messageId: emailData.messageId,
        sentAt: new Date().toISOString(),
        status: 'sent',
      },
    });
  } catch (error) {
    console.error('Error logging email:', error);
  }
}

async function getSettings(tenantId?: string): Promise<any> {
  try {
  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();
    
    let settings;
    if (tenantId) {
      settings = await payload.find({
        collection: 'settings',
        where: { tenant: { equals: tenantId } },
        limit: 1,
      });
    } else {
      settings = await payload.find({
        collection: 'settings',
        where: { tenant: { exists: false } },
        limit: 1,
      });
    }

    return settings.docs[0] || {};
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {};
  }
}
