import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build');

// Subscription plan IDs
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  MEMBER: process.env.STRIPE_MEMBER_PLAN_ID || '',
};

// Subscription prices (in cents)
export const SUBSCRIPTION_PRICES = {
  MEMBER: 499, // $4.99 per month
};

// Create a price in Stripe if it doesn't exist
export async function ensurePriceExists(): Promise<string> {
  // If we have a price ID in the environment, use it
  if (process.env.STRIPE_MEMBER_PLAN_ID) {
    return process.env.STRIPE_MEMBER_PLAN_ID;
  }

  try {
    // Look for existing prices
    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
    });

    // Find a price that matches our criteria
    const existingPrice = prices.data.find(
      (price) =>
        price.unit_amount === SUBSCRIPTION_PRICES.MEMBER &&
        price.recurring?.interval === 'month'
    );

    if (existingPrice) {
      console.log(`Found existing price: ${existingPrice.id}`);
      SUBSCRIPTION_PLANS.MEMBER = existingPrice.id;
      return existingPrice.id;
    }

    // Create a new price
    console.log('Creating new price in Stripe...');
    const product = await stripe.products.create({
      name: 'Journly Membership',
      description: 'Monthly subscription for Journly premium content',
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: SUBSCRIPTION_PRICES.MEMBER,
      currency: 'usd',
      recurring: { interval: 'month' },
    });

    console.log(`Created new price: ${price.id}`);
    SUBSCRIPTION_PLANS.MEMBER = price.id;
    return price.id;
  } catch (error) {
    console.error('Error ensuring price exists:', error);
    throw error;
  }
};

// Helper function to format price for display
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price / 100);
}

// Helper function to create a Stripe customer
export async function createStripeCustomer(email: string, name?: string): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
  });

  return customer.id;
}

// Helper function to create a subscription
export async function createSubscription(
  customerId: string,
  priceId: string,
  paymentMethodId: string
): Promise<Stripe.Subscription> {
  // Attach the payment method to the customer
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });

  // Set the default payment method for the customer
  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  // Create the subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
}

// Helper function to cancel a subscription
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId);
}

// Helper function to update a subscription
export async function updateSubscription(
  subscriptionId: string,
  priceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
  });
}

// Helper function to get a subscription
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

// Helper function to create a checkout session
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session.url || '';
}

// Helper function to create a billing portal session
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}
