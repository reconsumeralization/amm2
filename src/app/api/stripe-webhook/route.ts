import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getPayloadClient } from '@/payload';
// Config will be imported dynamically to avoid issues
import { handleAPIError, createErrorResponse, validateEnvironmentVariables } from '@/lib/api-error-handler';
import { getSettingsWithFallback } from '@/lib/settings-initializer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    // Validate environment variables
    const envValidation = validateEnvironmentVariables();
    if (!envValidation.isValid) {
      return createErrorResponse(
        'Missing required environment variables',
        'CONFIGURATION_ERROR',
        500,
        envValidation.errors
      );
    }

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return createErrorResponse('Missing Stripe signature', 'VALIDATION_ERROR', 400);
    }

    if (!webhookSecret) {
      return createErrorResponse('Stripe webhook secret not configured', 'CONFIGURATION_ERROR', 500);
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return createErrorResponse('Invalid Stripe signature', 'VALIDATION_ERROR', 400);
    }

  // @ts-ignore - Payload config type issue
    const payload = await getPayloadClient();

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, payload);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, payload);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, payload);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, payload);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, payload);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, payload);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, payload);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ 
      received: true, 
      eventType: event.type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return handleAPIError(error, 'Stripe Webhook');
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, payload: any) {
  try {
    const appointmentId = paymentIntent.metadata?.appointmentId;
    const tenantId = paymentIntent.metadata?.tenantId;

    if (!appointmentId) {
      console.error('No appointment ID in payment intent metadata');
      return;
    }

    // Update appointment status
    await payload.update({
      collection: 'appointments',
      id: appointmentId,
      data: {
        status: 'confirmed',
        paymentStatus: 'paid',
        stripePaymentIntentId: paymentIntent.id,
        paidAt: new Date().toISOString(),
      },
    });

    // Get appointment details for email notification
    const appointment = await payload.findByID({
      collection: 'appointments',
      id: appointmentId,
    });

    if (appointment) {
      // Send confirmation email
      await sendPaymentConfirmationEmail(appointment, paymentIntent, tenantId);
      
      // Update loyalty points if applicable
      await updateLoyaltyPoints(appointment, tenantId);
    }

    console.log(`Payment succeeded for appointment ${appointmentId}`);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, payload: any) {
  try {
    const appointmentId = paymentIntent.metadata?.appointmentId;
    const tenantId = paymentIntent.metadata?.tenantId;

    if (!appointmentId) {
      console.error('No appointment ID in payment intent metadata');
      return;
    }

    // Update appointment status
    await payload.update({
      collection: 'appointments',
      id: appointmentId,
      data: {
        status: 'payment_failed',
        paymentStatus: 'failed',
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    // Get appointment details for email notification
    const appointment = await payload.findByID({
      collection: 'appointments',
      id: appointmentId,
    });

    if (appointment) {
      // Send payment failure email
      await sendPaymentFailureEmail(appointment, paymentIntent, tenantId);
    }

    console.log(`Payment failed for appointment ${appointmentId}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, payload: any) {
  try {
    // Handle recurring payments or subscription renewals
    console.log(`Invoice payment succeeded: ${invoice.id}`);
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, payload: any) {
  try {
    // Handle failed recurring payments
    console.log(`Invoice payment failed: ${invoice.id}`);
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, payload: any) {
  try {
    // Handle new subscription creation
    console.log(`Subscription created: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, payload: any) {
  try {
    // Handle subscription updates
    console.log(`Subscription updated: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, payload: any) {
  try {
    // Handle subscription cancellations
    console.log(`Subscription deleted: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function sendPaymentConfirmationEmail(appointment: any, paymentIntent: Stripe.PaymentIntent, tenantId?: string) {
  try {
    const settings = await getSettings(tenantId);
    
    if (!settings.notifications?.email?.enabled) {
      return;
    }

    const emailData = {
      to: appointment.customer?.email || appointment.email,
      subject: 'Payment Confirmed - ModernMen Barbershop',
      template: settings.notifications.email.templates?.appointmentConfirmation || 
        '<h2>Payment Confirmed</h2><p>Your appointment has been confirmed and payment received.</p>',
      data: {
        customerName: appointment.customer?.name || 'Customer',
        service: appointment.service?.name || 'Service',
        date: new Date(appointment.date).toLocaleDateString(),
        time: new Date(appointment.date).toLocaleTimeString(),
        amount: (paymentIntent.amount / 100).toFixed(2),
        currency: paymentIntent.currency.toUpperCase(),
      },
    };

    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
  }
}

async function sendPaymentFailureEmail(appointment: any, paymentIntent: Stripe.PaymentIntent, tenantId?: string) {
  try {
    const settings = await getSettings(tenantId);
    
    if (!settings.notifications?.email?.enabled) {
      return;
    }

    const emailData = {
      to: appointment.customer?.email || appointment.email,
      subject: 'Payment Failed - ModernMen Barbershop',
      template: '<h2>Payment Failed</h2><p>Your payment was unsuccessful. Please try again or contact us.</p>',
      data: {
        customerName: appointment.customer?.name || 'Customer',
        service: appointment.service?.name || 'Service',
        date: new Date(appointment.date).toLocaleDateString(),
        time: new Date(appointment.date).toLocaleTimeString(),
      },
    };

    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });
  } catch (error) {
    console.error('Error sending payment failure email:', error);
  }
}

async function updateLoyaltyPoints(appointment: any, tenantId?: string) {
  try {
    const settings = await getSettings(tenantId);
    
    if (!settings.barbershop?.loyalty?.pointsPerBooking) {
      return;
    }

    const pointsToAdd = settings.barbershop.loyalty.pointsPerBooking;
    const customerId = appointment.customer?.id;

    if (!customerId) {
      return;
    }

    // Update customer loyalty points
    await fetch('/api/loyalty/add-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        points: pointsToAdd,
        reason: 'Appointment booking',
        tenantId,
      }),
    });
  } catch (error) {
    console.error('Error updating loyalty points:', error);
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