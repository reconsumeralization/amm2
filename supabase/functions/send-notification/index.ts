import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  userId: string
  type: 'appointment_reminder' | 'appointment_cancelled' | 'appointment_confirmed' | 'payment_success' | 'payment_failed' | 'general'
  title: string
  message: string
  data?: any
  channels?: ('email' | 'sms' | 'push' | 'in_app')[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const notification: NotificationPayload = await req.json()

    // Validate required fields
    if (!notification.userId || !notification.type || !notification.title || !notification.message) {
      throw new Error('Missing required notification fields')
    }

    // Get user preferences and contact info
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', notification.userId)
      .single()

    if (profileError) throw profileError

    // Default channels if not specified
    const channels = notification.channels || ['in_app']

    // Create in-app notification
    if (channels.includes('in_app')) {
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data || {},
          read: false,
          created_at: new Date().toISOString()
        })

      if (notificationError) throw notificationError
    }

    // Send email notification
    if (channels.includes('email') && profile.email) {
      await sendEmailNotification(profile.email, notification)
    }

    // Send SMS notification
    if (channels.includes('sms') && profile.phone) {
      await sendSmsNotification(profile.phone, notification)
    }

    // Send push notification
    if (channels.includes('push')) {
      await sendPushNotification(notification.userId, notification)
    }

    // Log notification
    await supabaseClient
      .from('notification_logs')
      .insert({
        user_id: notification.userId,
        type: notification.type,
        channels: channels,
        title: notification.title,
        message: notification.message,
        sent_at: new Date().toISOString(),
        status: 'sent'
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification sent successfully',
        channels: channels
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error sending notification:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function sendEmailNotification(email: string, notification: NotificationPayload) {
  const emailData = {
    to: email,
    subject: notification.title,
    html: generateEmailTemplate(notification),
    from: Deno.env.get('FROM_EMAIL') || 'noreply@modernmen.com'
  }

  // Example SendGrid integration
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  })

  if (!response.ok) {
    console.error('Failed to send email:', await response.text())
  }
}

async function sendSmsNotification(phone: string, notification: NotificationPayload) {
  const smsData = {
    to: phone,
    body: `${notification.title}: ${notification.message}`,
    from: Deno.env.get('TWILIO_PHONE_NUMBER')
  }

  // Example Twilio integration
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${Deno.env.get('TWILIO_ACCOUNT_SID')}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${Deno.env.get('TWILIO_ACCOUNT_SID')}:${Deno.env.get('TWILIO_AUTH_TOKEN')}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(smsData)
  })

  if (!response.ok) {
    console.error('Failed to send SMS:', await response.text())
  }
}

async function sendPushNotification(userId: string, notification: NotificationPayload) {
  // This would integrate with push notification services like Firebase Cloud Messaging
  // For now, we'll just log it
  console.log(`Sending push notification to user ${userId}:`, notification.title)

  // Example FCM integration:
  /*
  const fcmData = {
    to: userFcmToken,
    notification: {
      title: notification.title,
      body: notification.message
    },
    data: notification.data
  }

  await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(fcmData)
  })
  */
}

function generateEmailTemplate(notification: NotificationPayload): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${notification.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 5px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; font-size: 12px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Modern Men Hair BarberShop</h1>
        </div>
        <div class="content">
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          ${notification.data ? `<pre>${JSON.stringify(notification.data, null, 2)}</pre>` : ''}
        </div>
        <div class="footer">
          <p>This is an automated message from Modern Men Hair BarberShop.</p>
          <p>If you have any questions, please contact us at support@modernmen.com</p>
        </div>
      </div>
    </body>
    </html>
  `
}
