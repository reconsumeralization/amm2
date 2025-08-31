import type { Payload } from 'payload';

// Define the webhook handler type locally
type WebhookHandler = (args: { event: any; payload: Payload }) => Promise<{ status: 'success' | 'error'; message?: string }>;

export const invoicePaymentSucceeded: WebhookHandler = async ({ event, payload }) => {
  try {
    const invoice = event.data.object;

    // Update customer's subscription status
    const customerId = invoice.customer;

    if (customerId) {
      const customers = await payload.find({
        collection: 'customers',
        where: { stripeCustomerId: { equals: customerId } },
      });

      if (customers.docs.length > 0) {
        const customer = customers.docs[0];

        // Update customer's billing info
        await payload.update({
          collection: 'customers',
          id: customer.id,
          data: {
            lastPaymentDate: new Date().toISOString(),
            subscriptionStatus: 'active',
          },
        });

        // Create a payment record for this invoice
        await payload.create({
          collection: 'orders',
          data: {
            customer: customer.id,
            total: invoice.amount_paid / 100, // Convert from cents
            status: 'paid',
            paymentMethod: 'subscription',
            stripeInvoiceId: invoice.id,
            tenant: customer.tenant,
            items: [{
              product: null,
              service: null,
              quantity: 1,
              price: invoice.amount_paid / 100,
              description: `Subscription payment - ${invoice.number}`,
            }],
          },
        });
      }
    }

    return { status: 'success' };
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
    return { status: 'error', message: 'Failed to process invoice payment' };
  }
};
