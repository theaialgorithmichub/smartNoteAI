import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Subscription } from '@/lib/models/subscription';
import { PLAN_CONFIG } from '@/config/template-points';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let subscription = await Subscription.findOne({ userId });

    // Create default free subscription if doesn't exist
    if (!subscription) {
      subscription = await Subscription.create({
        userId,
        planType: 'free',
        status: 'active',
        credits: 0,
        notebooksCreated: 0,
        selectedTemplates: [],
      });
    }

    const planConfig = PLAN_CONFIG[subscription.planType];

    return NextResponse.json({
      subscription: {
        planType: subscription.planType,
        billingCycle: subscription.billingCycle,
        status: subscription.status,
        credits: subscription.credits,
        notebooksCreated: subscription.notebooksCreated,
        selectedTemplates: subscription.selectedTemplates,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
      planConfig: {
        name: planConfig.name,
        maxNotebooks: planConfig.maxNotebooks,
        maxTemplates: planConfig.maxTemplates,
        features: planConfig.features,
      },
      limits: {
        canCreateNotebook: 
          planConfig.maxNotebooks === -1 || 
          subscription.notebooksCreated < planConfig.maxNotebooks,
        remainingNotebooks: 
          planConfig.maxNotebooks === -1 
            ? -1 
            : Math.max(0, planConfig.maxNotebooks - subscription.notebooksCreated),
        canSelectMoreTemplates:
          planConfig.maxTemplates === -1 ||
          subscription.selectedTemplates.length < planConfig.maxTemplates,
        remainingTemplateSlots:
          planConfig.maxTemplates === -1
            ? -1
            : Math.max(0, planConfig.maxTemplates - subscription.selectedTemplates.length),
      },
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}
