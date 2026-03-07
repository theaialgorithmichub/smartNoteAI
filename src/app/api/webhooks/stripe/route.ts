import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { connectDB } from '@/lib/mongodb';
import { Subscription } from '@/lib/models/subscription';
import { Transaction } from '@/lib/models/transaction';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await connectDB();

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  if (session.mode === 'subscription') {
    // Handle subscription checkout
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionUpdate(subscription);
  } else if (session.mode === 'payment' && session.metadata?.type === 'credit_purchase') {
    // Handle credit purchase
    const credits = parseInt(session.metadata.credits || '0');
    
    await Subscription.findOneAndUpdate(
      { userId },
      { $inc: { credits } },
      { upsert: true }
    );

    await Transaction.create({
      userId,
      type: 'credit_purchase',
      amount: session.amount_total! / 100,
      currency: session.currency || 'usd',
      credits,
      stripePaymentIntentId: session.payment_intent as string,
      status: 'completed',
      metadata: {
        description: `Purchased ${credits} credits`,
      },
    });
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  const planType = subscription.metadata.planType as 'pro' | 'ultra';
  const billingCycle = subscription.metadata.billingCycle as 'monthly' | 'yearly';

  const updateData = {
    userId,
    planType,
    billingCycle,
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0].price.id,
    status: subscription.status as 'active' | 'canceled' | 'past_due' | 'trialing',
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  await Subscription.findOneAndUpdate(
    { userId },
    updateData,
    { upsert: true, new: true }
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  await Subscription.findOneAndUpdate(
    { userId },
    {
      planType: 'free',
      status: 'canceled',
      stripeSubscriptionId: null,
      stripePriceId: null,
      billingCycle: null,
    }
  );
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata.userId;
  if (!userId) return;

  // Record transaction
  await Transaction.create({
    userId,
    type: 'subscription',
    amount: invoice.amount_paid / 100,
    currency: invoice.currency,
    stripeInvoiceId: invoice.id,
    stripePaymentIntentId: invoice.payment_intent as string,
    status: 'completed',
    metadata: {
      planType: subscription.metadata.planType,
      billingCycle: subscription.metadata.billingCycle,
      description: `Subscription payment for ${subscription.metadata.planType} plan`,
    },
  });

  // Add monthly credits for Pro/Ultra users
  const planType = subscription.metadata.planType as 'pro' | 'ultra';
  const creditsToAdd = planType === 'pro' ? 50 : planType === 'ultra' ? 150 : 0;

  if (creditsToAdd > 0) {
    await Subscription.findOneAndUpdate(
      { userId },
      { $inc: { credits: creditsToAdd } }
    );
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata.userId;
  if (!userId) return;

  await Subscription.findOneAndUpdate(
    { userId },
    { status: 'past_due' }
  );

  await Transaction.create({
    userId,
    type: 'subscription',
    amount: invoice.amount_due / 100,
    currency: invoice.currency,
    stripeInvoiceId: invoice.id,
    status: 'failed',
    metadata: {
      planType: subscription.metadata.planType,
      billingCycle: subscription.metadata.billingCycle,
      description: `Failed payment for ${subscription.metadata.planType} plan`,
    },
  });
}
