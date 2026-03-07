import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Subscription } from '@/lib/models/subscription';
import { PLAN_CONFIG } from '@/config/template-points';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templates } = await req.json();

    if (!Array.isArray(templates)) {
      return NextResponse.json({ error: 'Invalid templates format' }, { status: 400 });
    }

    await connectDB();

    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const planConfig = PLAN_CONFIG[subscription.planType];

    // Check if user can select templates
    if (subscription.planType === 'free') {
      return NextResponse.json({ error: 'Free plan cannot select templates' }, { status: 403 });
    }

    if (subscription.planType === 'ultra') {
      return NextResponse.json({ error: 'Ultra plan has access to all templates' }, { status: 400 });
    }

    // Pro plan - check limit
    if (templates.length > planConfig.maxTemplates) {
      return NextResponse.json({ 
        error: `Cannot select more than ${planConfig.maxTemplates} templates` 
      }, { status: 400 });
    }

    await Subscription.findOneAndUpdate(
      { userId },
      { selectedTemplates: templates }
    );

    return NextResponse.json({ success: true, selectedTemplates: templates });
  } catch (error) {
    console.error('Error selecting templates:', error);
    return NextResponse.json({ error: 'Failed to select templates' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return NextResponse.json({ selectedTemplates: [] });
    }

    return NextResponse.json({ selectedTemplates: subscription.selectedTemplates || [] });
  } catch (error) {
    console.error('Error fetching selected templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}
