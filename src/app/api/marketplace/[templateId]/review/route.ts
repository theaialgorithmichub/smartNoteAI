import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { MarketplaceTemplate, TemplateReview } from '@/lib/models/marketplace-template';

export async function POST(
  req: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json(
        { error: 'Comment must be at least 10 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    const template = await MarketplaceTemplate.findById(params.templateId);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if user already reviewed
    const existingReview = await TemplateReview.findOne({
      templateId: params.templateId,
      userId,
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
    } else {
      // Create new review
      const clerkUser = await currentUser();
      const review = await TemplateReview.create({
        templateId: params.templateId,
        userId,
        userName: clerkUser?.firstName && clerkUser?.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser?.username || 'Anonymous',
        userAvatar: clerkUser?.imageUrl,
        rating,
        comment,
        helpful: 0,
      });

      template.reviews.push(review._id);
    }

    // Recalculate average rating
    const reviews = await TemplateReview.find({ templateId: params.templateId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    template.stats.rating = totalRating / reviews.length;
    template.stats.ratingCount = reviews.length;
    await template.save();

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
    });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}
