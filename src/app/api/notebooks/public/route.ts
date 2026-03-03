import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import { Notebook } from '@/lib/models/notebook';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const notebooks = await Notebook.find({
      isPublic: true,
      userId: { $ne: userId },
      isTrashed: false
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

    // Populate owner information
    const notebooksWithOwner = await Promise.all(
      notebooks.map(async (notebook) => {
        const owner = await User.findOne({ clerkId: notebook.userId }).select('name email avatar');
        return {
          ...notebook,
          owner: owner || { name: 'Unknown', email: '', avatar: '' },
          sharedAt: notebook.createdAt,
          lastModified: notebook.updatedAt
        };
      })
    );

    return NextResponse.json(notebooksWithOwner);
  } catch (error) {
    console.error('Get public notebooks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
