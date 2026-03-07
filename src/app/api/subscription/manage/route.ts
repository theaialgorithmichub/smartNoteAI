import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Subscription } from '@/lib/models/subscription';
import { cancelSubscription, resumeSubscription, createBillingPortalSession } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    await connectDB();

    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    switch (action) {
      case 'cancel':
        if (!subscription.stripeSubscriptionId) {
          return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
        }
        await cancelSubscription(subscription.stripeSubscriptionId, true);
        await Subscription.findOneAndUpdate(
          { userId },
          { cancelAtPeriodEnd: true }
        );
        return NextResponse.json({ success: true, message: 'Subscription will be canceled at period end' });

      case 'resume':
        if (!subscription.stripeSubscriptionId) {
          return NextResponse.json({ error: 'No subscription to resume' }, { status: 400 });
        }
        await resumeSubscription(subscription.stripeSubscriptionId);
        await Subscription.findOneAndUpdate(
          { userId },
          { cancelAtPeriodEnd: false }
        );
        return NextResponse.json({ success: true, message: 'Subscription resumed' });

      case 'billing-portal':
        if (!subscription.stripeCustomerId) {
          return NextResponse.json({ error: 'No customer found' }, { status: 400 });
        }
        const portalSession = await createBillingPortalSession(subscription.stripeCustomerId);
        return NextResponse.json({ url: portalSession.url });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing subscription:', error);
    return NextResponse.json({ error: 'Failed to manage subscription' }, { status: 500 });
  }
}
