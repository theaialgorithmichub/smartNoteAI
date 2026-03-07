import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { MarketplaceTemplate, UserTemplate } from '@/lib/models/marketplace-template';
import { Subscription } from '@/lib/models/subscription';

export async function POST(
  req: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const template = await MarketplaceTemplate.findById(params.templateId);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (template.status !== 'approved') {
      return NextResponse.json({ error: 'Template not available' }, { status: 403 });
    }

    // Check if already downloaded
    const existing = await UserTemplate.findOne({
      userId,
      templateId: params.templateId,
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        template,
        message: 'Already downloaded',
      });
    }

    let purchaseType: 'free' | 'credits' | 'subscription' = 'free';

    // Handle pricing
    if (template.pricing.type === 'premium') {
      const subscription = await Subscription.findOne({ userId });

      // Check if user has subscription that includes this
      if (subscription && subscription.planType === 'ultra') {
        purchaseType = 'subscription';
      } else if (template.pricing.credits) {
        // Deduct credits
        if (!subscription || subscription.credits < template.pricing.credits) {
          return NextResponse.json(
            { error: 'Insufficient credits' },
            { status: 402 }
          );
        }

        subscription.credits -= template.pricing.credits;
        await subscription.save();
        purchaseType = 'credits';
      } else {
        return NextResponse.json(
          { error: 'Payment required' },
          { status: 402 }
        );
      }
    }

    // Record download
    await UserTemplate.create({
      userId,
      templateId: params.templateId,
      purchaseType,
    });

    // Increment download count
    template.stats.downloads += 1;
    await template.save();

    return NextResponse.json({
      success: true,
      template,
      message: 'Template downloaded successfully',
    });
  } catch (error: any) {
    console.error('Error downloading template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download template' },
      { status: 500 }
    );
  }
}
