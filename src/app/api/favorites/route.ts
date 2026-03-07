import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { Favorite } from '@/lib/models/favorite';

// Get user's favorite templates
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const favorites = await Favorite.find({ userId }).sort({ createdAt: -1 });
    const templateIds = favorites.map(f => f.templateId);

    return NextResponse.json({ success: true, favorites: templateIds });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

// Add template to favorites
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId } = await req.json();

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    await connectDB();

    // Check if already favorited
    const existing = await Favorite.findOne({ userId, templateId });
    if (existing) {
      return NextResponse.json({ 
        success: true, 
        message: 'Template already in favorites',
        alreadyExists: true 
      });
    }

    // Add to favorites
    await Favorite.create({ userId, templateId });

    return NextResponse.json({ 
      success: true, 
      message: 'Template added to favorites' 
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

// Remove template from favorites
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = req.nextUrl.searchParams.get('templateId');

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    await connectDB();

    await Favorite.findOneAndDelete({ userId, templateId });

    return NextResponse.json({ 
      success: true, 
      message: 'Template removed from favorites' 
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}
