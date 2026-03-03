import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import { Notebook } from '@/lib/models/notebook';
import User from '@/lib/models/User';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { id: notebookId } = await params;
    const { userIds } = await request.json();

    console.log('[UNSHARE NOTEBOOK] Notebook ID:', notebookId);
    console.log('[UNSHARE NOTEBOOK] Removing users:', userIds);

    const notebook = await Notebook.findOne({ _id: notebookId, userId });
    if (!notebook) return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });

    if (userIds && userIds.length > 0) {
      // Remove specific users
      notebook.sharedWith = notebook.sharedWith.filter(
        (id: any) => !userIds.includes(id.toString())
      );
    } else {
      // Remove all shares
      notebook.sharedWith = [];
      notebook.isPublic = false;
    }

    await notebook.save();

    return NextResponse.json({ 
      success: true, 
      notebook: {
        id: notebook._id,
        sharedWith: notebook.sharedWith,
        isPublic: notebook.isPublic
      }
    });
  } catch (error) {
    console.error('Unshare notebook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
