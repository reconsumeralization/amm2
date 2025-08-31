import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { emailService } from '@/lib/email-service';
import { getPayloadClient } from '@/lib/payload-client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Stripe webhook event received:', event.type);

    // Handle payment success
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      try {
        await handlePaymentSuccess(paymentIntent);
      } catch (error) {
        console.error('Error handling payment success:', error);
      }
    }

    // Handle payment failure
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      try {
        await handlePaymentFailure(paymentIntent);
      } catch (error) {
        console.error('Error handling payment failure:', error);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing successful payment:', paymentIntent.id);

  // Try to get customer email from payment intent
  let customerEmail: string | null = null;
  let customerName: string | null = null;

  if (paymentIntent.customer) {
    try {
      const customer = await stripe.customers.retrieve(paymentIntent.customer as string);
      if ('email' in customer && customer.email) {
        customerEmail = customer.email;
        customerName = customer.name || customer.email;
      }
    } catch (error) {
      console.error('Failed to retrieve customer from Stripe:', error);
    }
  }

  // Try to find customer in our database if we have metadata
  if (!customerEmail && paymentIntent.metadata?.userId) {
    try {
      const payload = await getPayloadClient();
      const user = await payload.findByID({
        collection: 'users',
        id: paymentIntent.metadata.userId,
      });
      
      if (user?.email) {
        customerEmail = user.email;
        customerName = user.name || user.email;
      }
    } catch (error) {
      console.error('Failed to find user in database:', error);
    }
  }

  // Send payment confirmation email
  if (customerEmail) {
    try {
      await emailService.sendPaymentConfirmation(
        customerEmail,
        customerName || customerEmail,
        {
          amount: paymentIntent.amount / 100, // Convert from cents
          service: paymentIntent.metadata?.service || 'ModernMen Service',
          transactionId: paymentIntent.id,
          date: new Date().toLocaleDateString(),
        }
      );
      console.log('Payment confirmation email sent to:', customerEmail);
    } catch (emailError) {
      console.error('Failed to send payment confirmation email:', emailError);
    }
  }

  // Log the successful payment
  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: 'payment-logs',
      data: {
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'succeeded',
        customerEmail,
        customerName,
        metadata: paymentIntent.metadata,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to log payment:', error);
    // Continue even if logging fails
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing failed payment:', paymentIntent.id);

  // Try to get customer email for failure notification
  let customerEmail: string | null = null;
  let customerName: string | null = null;

  if (paymentIntent.customer) {
    try {
      const customer = await stripe.customers.retrieve(paymentIntent.customer as string);
      if ('email' in customer && customer.email) {
        customerEmail = customer.email;
        customerName = customer.name || customer.email;
      }
    } catch (error) {
      console.error('Failed to retrieve customer from Stripe:', error);
    }
  }

  // Send payment failure notification
  if (customerEmail) {
    try {
      await emailService.sendEmail({
        to: customerEmail,
        subject: 'Payment Issue - ModernMen',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Payment Issue</h2>
            <p>Hi ${customerName || customerEmail},</p>
            <p>We encountered an issue processing your payment for ModernMen services.</p>
            <p><strong>Amount:</strong> $${(paymentIntent.amount / 100).toFixed(2)}</p>
            <p><strong>Transaction ID:</strong> ${paymentIntent.id}</p>
            <p>Please try again or contact us for assistance. We're here to help!</p>
            <p>Best regards,<br>The ModernMen Team</p>
          </div>
        `,
        text: `Hi ${customerName || customerEmail},\n\nWe encountered an issue processing your payment for ModernMen services.\n\nAmount: $${(paymentIntent.amount / 100).toFixed(2)}\nTransaction ID: ${paymentIntent.id}\n\nPlease try again or contact us for assistance. We're here to help!\n\nBest regards,\nThe ModernMen Team`
      });
      console.log('Payment failure notification sent to:', customerEmail);
    } catch (emailError) {
      console.error('Failed to send payment failure notification:', emailError);
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe webhook endpoint',
    supportedEvents: [
      'payment_intent.succeeded',
      'payment_intent.payment_failed'
    ]
  });
}