import { getPayload } from 'payload';
import { NextResponse } from 'next/server';
import { sendEmail } from '../../../utils/email';

export async function POST(req: Request) {
  const { firstName, lastName, email, phone, subject, message } = await req.json();
  const payload = await getPayload({ config: (await import('@/payload.config')).default });

  // Input validation
  if (!firstName || !lastName || !email || !subject || !message) {
    return NextResponse.json({ error: 'Missing required fields: First Name, Last Name, Email, Subject, Message' }, { status: 400 });
  }

  try {
    const settings = await payload.find({
      collection: 'settings',
      limit: 1,
    });
    const config = settings.docs[0] || {};

    if (!config.email?.enableNotifications) {
      return NextResponse.json({ error: 'Email notifications are disabled' }, { status: 403 });
    }

    const adminEmail = 'admin@modernmen.com'; // This should ideally come from settings or a dedicated admin user

    await sendEmail({
      to: adminEmail,
      subject: `Contact Form Submission: ${subject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>From:</strong> ${firstName} ${lastName} (${email})</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr>
        <p>${config.email?.signature || ''}</p>
      `,
      from: config.email?.fromAddress || 'no-reply@modernmen.com',
    });

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}