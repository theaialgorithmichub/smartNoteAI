import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { Share } from '@/lib/models/share';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notebookId = req.nextUrl.searchParams.get('notebookId');

    await connectDB();

    const query: any = { userId };
    if (notebookId) {
      query.notebookId = notebookId;
    }

    const shares = await Share.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Add share URLs
    const sharesWithUrls = shares.map(share => ({
      ...share.toObject(),
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${share.shareId}`,
    }));

    return NextResponse.json({ success: true, shares: sharesWithUrls });
  } catch (error) {
    console.error('Error listing shares:', error);
    return NextResponse.json({ error: 'Failed to list shares' }, { status: 500 });
  }
}
