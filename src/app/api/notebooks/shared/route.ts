import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import { Notebook } from '@/lib/models/notebook';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const { userId } = await auth();
    console.log('[SHARED NOTEBOOKS] Clerk userId:', userId);
    
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    console.log('[SHARED NOTEBOOKS] Current user:', {
      _id: currentUser?._id,
      email: currentUser?.email,
      idType: typeof currentUser?._id
    });
    
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // First, check all notebooks to see which ones have sharedWith
    const allNotebooksWithSharing = await Notebook.find({
      sharedWith: { $exists: true, $ne: [] },
      isTrashed: false
    }).select('title userId sharedWith').lean();
    
    console.log('[SHARED NOTEBOOKS] All notebooks with sharing:', allNotebooksWithSharing.length);
    allNotebooksWithSharing.forEach(nb => {
      console.log('[SHARED NOTEBOOKS] Notebook:', {
        title: nb.title,
        sharedWith: nb.sharedWith,
        sharedWithTypes: nb.sharedWith?.map((id: any) => typeof id),
        currentUserIdString: currentUser._id.toString(),
        matches: nb.sharedWith?.some((id: any) => id.toString() === currentUser._id.toString())
      });
    });

    // Query for notebooks where current user is in sharedWith array
    const notebooks = await Notebook.find({
      sharedWith: { $in: [currentUser._id] },
      isTrashed: false
    })
    .sort({ updatedAt: -1 })
    .lean();

    console.log('[SHARED NOTEBOOKS] Found notebooks for user:', notebooks.length);

    // Populate owner information and transform to match frontend interface
    const notebooksWithOwner = await Promise.all(
      notebooks.map(async (notebook) => {
        const owner = await User.findOne({ clerkId: notebook.userId }).select('name email avatar');
        return {
          id: notebook._id.toString(),
          _id: notebook._id.toString(),
          title: notebook.title,
          template: notebook.template,
          category: notebook.category,
          appearance: notebook.appearance,
          tags: notebook.tags,
          isPublic: notebook.isPublic,
          sharedWith: notebook.sharedWith,
          pageCount: notebook.pageCount || 1,
          owner: owner ? {
            id: owner._id.toString(),
            name: owner.name,
            email: owner.email,
            avatar: owner.avatar
          } : { name: 'Unknown', email: '', avatar: '' },
          sharedAt: notebook.updatedAt,
          lastModified: notebook.updatedAt,
          createdAt: notebook.createdAt,
          updatedAt: notebook.updatedAt
        };
      })
    );

    console.log('[SHARED NOTEBOOKS] Returning:', notebooksWithOwner.length, 'notebooks');
    return NextResponse.json(notebooksWithOwner);
  } catch (error) {
    console.error('Get shared notebooks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
