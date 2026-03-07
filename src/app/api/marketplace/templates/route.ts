import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { MarketplaceTemplate } from '@/lib/models/marketplace-template';

// Get marketplace templates with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const featured = searchParams.get('featured') === 'true';

    const query: any = { status: 'approved' };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (featured) {
      query.featured = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    let sortQuery: any = {};
    switch (sort) {
      case 'popular':
        sortQuery = { 'stats.downloads': -1, 'stats.rating': -1 };
        break;
      case 'rating':
        sortQuery = { 'stats.rating': -1, 'stats.ratingCount': -1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'trending':
        sortQuery = { 'stats.views': -1, createdAt: -1 };
        break;
      default:
        sortQuery = { 'stats.downloads': -1 };
    }

    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      MarketplaceTemplate.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .select('-content'), // Don't send full content in list
      MarketplaceTemplate.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching marketplace templates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// Submit a new template to marketplace
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      templateType,
      category,
      tags,
      content,
      preview,
      pricing,
    } = body;

    if (!title || !description || !templateType || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const template = await MarketplaceTemplate.create({
      title,
      description,
      templateType,
      authorId: userId,
      authorName: user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user?.username || 'Anonymous',
      authorAvatar: user?.imageUrl,
      category: category || 'other',
      tags: tags || [],
      content,
      preview: preview || { images: [], description: '' },
      pricing: pricing || { type: 'free' },
      stats: {
        downloads: 0,
        rating: 0,
        ratingCount: 0,
        views: 0,
      },
      featured: false,
      verified: false,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      template,
      message: 'Template submitted for review',
    });
  } catch (error: any) {
    console.error('Error submitting template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit template' },
      { status: 500 }
    );
  }
}
