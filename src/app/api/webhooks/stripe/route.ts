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
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err?.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await connectDB();

  try {
    console.log(`[Webhook] Processing event: ${event.type} id=${event.id}`);
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
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    console.log(`[Webhook] Successfully processed: ${event.type}`);
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`[Webhook] FAILED event ${event.type}:`, error?.message, error?.stack);
    return NextResponse.json({ 
      error: 'Webhook processing failed', 
      detail: error?.message,
      stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined,
    }, { status: 500 });
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
  let userId = subscription.metadata?.userId;
  let planType = subscription.metadata?.planType as 'pro' | 'ultra' | undefined;
  let billingCycle = subscription.metadata?.billingCycle as 'monthly' | 'yearly' | undefined;

  const stripeCustomerId = subscription.customer as string;

  // If metadata is missing (can happen on subscription.created before session metadata propagates),
  // fall back to looking up by stripeCustomerId in our DB
  if (!userId) {
    console.warn(`[Webhook] subscription.metadata.userId missing for sub ${subscription.id}, looking up by customerId ${stripeCustomerId}`);
    const existing = await Subscription.findOne({ stripeCustomerId });
    if (existing) {
      userId = existing.userId;
      planType = planType || existing.planType;
      billingCycle = billingCycle || existing.billingCycle;
    }
  }

  if (!userId) {
    console.error(`[Webhook] Cannot find userId for subscription ${subscription.id}, skipping update`);
    return;
  }

  const updateData: any = {
    userId,
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0]?.price.id,
    status: subscription.status,
    currentPeriodStart: (subscription as any).current_period_start
      ? new Date((subscription as any).current_period_start * 1000)
      : undefined,
    currentPeriodEnd: (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000)
      : undefined,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  if (planType) updateData.planType = planType;
  if (billingCycle) updateData.billingCycle = billingCycle;

  // Remove undefined values so Mongoose doesn't try to cast them
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

  await Subscription.findOneAndUpdate(
    { userId },
    updateData,
    { upsert: true, new: true }
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  let userId = subscription.metadata?.userId;
  if (!userId) {
    const existing = await Subscription.findOne({ stripeCustomerId: subscription.customer as string });
    if (existing) userId = existing.userId;
  }
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
  const subscriptionId = (invoice as any).subscription as string;
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
    stripePaymentIntentId: (invoice as any).payment_intent as string,
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
  const subscriptionId = (invoice as any).subscription as string;
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
