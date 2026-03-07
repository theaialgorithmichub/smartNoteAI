import Stripe from 'stripe';

function getStripeInstance(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
  }
  return new Stripe(key, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
  });
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripeInstance() as any)[prop];
  },
});

// Stripe Price IDs - These will be created in Stripe Dashboard
export const STRIPE_PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
  ultra_monthly: process.env.STRIPE_ULTRA_MONTHLY_PRICE_ID || '',
  ultra_yearly: process.env.STRIPE_ULTRA_YEARLY_PRICE_ID || '',
  credits_10: process.env.STRIPE_CREDITS_10_PRICE_ID || '',
  credits_25: process.env.STRIPE_CREDITS_25_PRICE_ID || '',
  credits_50: process.env.STRIPE_CREDITS_50_PRICE_ID || '',
  credits_100: process.env.STRIPE_CREDITS_100_PRICE_ID || '',
  credits_250: process.env.STRIPE_CREDITS_250_PRICE_ID || '',
};

// Helper function to create or retrieve a Stripe customer
export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  try {
    // Search for existing customer
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      return customers.data[0].id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        userId: userId,
      },
    });

    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

// Create a checkout session for subscription
export async function createSubscriptionCheckout(
  customerId: string,
  priceId: string,
  userId: string,
  planType: 'pro' | 'ultra',
  billingCycle: 'monthly' | 'yearly'
) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      metadata: {
        userId,
        planType,
        billingCycle,
      },
      subscription_data: {
        metadata: {
          userId,
          planType,
          billingCycle,
        },
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Create a checkout session for credit purchase
export async function createCreditCheckout(
  customerId: string,
  priceId: string,
  userId: string,
  credits: number
) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?session_id={CHECKOUT_SESSION_ID}&credits_purchased=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        credits: credits.toString(),
        type: 'credit_purchase',
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating credit checkout session:', error);
    throw error;
  }
}

// Cancel a subscription
export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });

    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

// Resume a canceled subscription
export async function resumeSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return subscription;
  } catch (error) {
    console.error('Error resuming subscription:', error);
    throw error;
  }
}

// Create a billing portal session
export async function createBillingPortalSession(customerId: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
    });

    return session;
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    throw error;
  }
}

// Get subscription details
export async function getSubscriptionDetails(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
}
