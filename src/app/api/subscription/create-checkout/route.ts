import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Subscription } from '@/lib/models/subscription';
import { getOrCreateStripeCustomer, createSubscriptionCheckout, createCreditCheckout, STRIPE_PRICE_IDS } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, planType, billingCycle, creditPackageId } = await req.json();

    await connectDB();

    // Get user email from Clerk
    const { user } = await auth();
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const email = user.emailAddresses[0].emailAddress;

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(userId, email);

    if (type === 'subscription') {
      // Create subscription checkout
      const priceKey = `${planType}_${billingCycle}` as keyof typeof STRIPE_PRICE_IDS;
      const priceId = STRIPE_PRICE_IDS[priceKey];

      if (!priceId) {
        return NextResponse.json({ error: 'Invalid plan configuration' }, { status: 400 });
      }

      const session = await createSubscriptionCheckout(
        customerId,
        priceId,
        userId,
        planType as 'pro' | 'ultra',
        billingCycle as 'monthly' | 'yearly'
      );

      return NextResponse.json({ sessionId: session.id, url: session.url });
    } else if (type === 'credits') {
      // Create credit purchase checkout
      const priceId = STRIPE_PRICE_IDS[creditPackageId as keyof typeof STRIPE_PRICE_IDS];
      
      if (!priceId) {
        return NextResponse.json({ error: 'Invalid credit package' }, { status: 400 });
      }

      // Extract credits from package ID (e.g., 'credits_50' -> 50)
      const credits = parseInt(creditPackageId.split('_')[1]);

      const session = await createCreditCheckout(customerId, priceId, userId, credits);

      return NextResponse.json({ sessionId: session.id, url: session.url });
    }

    return NextResponse.json({ error: 'Invalid checkout type' }, { status: 400 });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
