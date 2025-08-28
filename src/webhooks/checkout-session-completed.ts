import type { Payload } from 'payload';

// Define the webhook handler type locally
type WebhookHandler = (args: { event: any; payload: Payload }) => Promise<{ status: 'success' | 'error'; message?: string }>;

export const checkoutSessionCompleted: WebhookHandler = async ({ event, payload }) => {
  try {
    const session = event.data.object;

    // Handle successful checkout session
    switch (session.mode) {
      case 'payment':
        // Handle one-time payment
        await handleOneTimePayment(payload, session);
        break;
      case 'subscription':
        // Handle subscription payment
        await handleSubscriptionPayment(payload, session);
        break;
      case 'setup':
        // Handle setup payment
        await handleSetupPayment(payload, session);
        break;
    }

    return { status: 'success' };
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    return { status: 'error', message: 'Failed to process checkout session' };
  }
};

async function handleOneTimePayment(payload: Payload, session: any) {
  // Find and update the order/payment record
  const orderId = session.metadata?.orderId;
  if (orderId) {
    await payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        status: 'paid',
        paymentIntent: session.payment_intent,
        stripeSessionId: session.id,
      },
    });
  }
}

async function handleSubscriptionPayment(payload: Payload, session: any) {
  // Handle subscription setup
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  // Update customer with subscription info
  if (customerId) {
    const customers = await payload.find({
      collection: 'customers',
      where: { stripeCustomerId: { equals: customerId } },
    });

    if (customers.docs.length > 0) {
      await payload.update({
        collection: 'customers',
        id: customers.docs[0].id,
        data: {
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: 'active',
        },
      });
    }
  }
}

async function handleSetupPayment(payload: Payload, session: any) {
  // Handle setup payment (for future payments)
  const setupIntent = session.setup_intent;
  // Store setup intent for future use
}
