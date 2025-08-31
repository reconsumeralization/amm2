import type { Payload } from 'payload';

// Define the webhook handler type locally
type WebhookHandler = (args: { event: any; payload: Payload }) => Promise<{ status: 'success' | 'error'; message?: string }>;

export const customerSubscriptionUpdated: WebhookHandler = async ({ event, payload }) => {
  try {
    const subscription = event.data.object;

    // Update customer's subscription status
    const customerId = subscription.customer;

    if (customerId) {
      const customers = await payload.find({
        collection: 'customers',
        where: { stripeCustomerId: { equals: customerId } },
      });

      if (customers.docs.length > 0) {
        const customer = customers.docs[0];

        // Map Stripe subscription status to our status
        let status = 'inactive';
        switch (subscription.status) {
          case 'active':
            status = 'active';
            break;
          case 'canceled':
            status = 'canceled';
            break;
          case 'incomplete':
            status = 'incomplete';
            break;
          case 'incomplete_expired':
            status = 'expired';
            break;
          case 'past_due':
            status = 'past_due';
            break;
          case 'unpaid':
            status = 'unpaid';
            break;
          case 'trialing':
            status = 'trialing';
            break;
        }

        // Update customer subscription info
        await payload.update({
          collection: 'customers',
          id: customer.id,
          data: {
            subscriptionStatus: status,
            subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            subscriptionCurrentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });
      }
    }

    return { status: 'success' };
  } catch (error) {
    console.error('Error handling customer subscription updated:', error);
    return { status: 'error', message: 'Failed to process subscription update' };
  }
};
