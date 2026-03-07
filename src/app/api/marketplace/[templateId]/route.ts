import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { MarketplaceTemplate, TemplateReview } from '@/lib/models/marketplace-template';

// Get single template details
export async function GET(
  req: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    await connectDB();

    const template = await MarketplaceTemplate.findById(params.templateId);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Increment view count
    template.stats.views += 1;
    await template.save();

    // Get reviews
    const reviews = await TemplateReview.find({ templateId: params.templateId })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      template,
      reviews,
    });
  } catch (error: any) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// Update template (author only)
export async function PATCH(
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

    if (template.authorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await req.json();
    
    // Don't allow updating certain fields
    delete updates.authorId;
    delete updates.stats;
    delete updates.status;
    delete updates.featured;
    delete updates.verified;

    Object.assign(template, updates);
    template.updatedAt = new Date();
    await template.save();

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    );
  }
}

// Delete template (author only)
export async function DELETE(
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

    if (template.authorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await template.deleteOne();

    return NextResponse.json({ success: true, message: 'Template deleted' });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    );
  }
}
