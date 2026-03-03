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

    // Get all notebooks with sharedWith field
    const allNotebooks = await Notebook.find({}).select('title userId sharedWith isPublic isTrashed').lean();
    
    // Get notebooks shared with current user
    const sharedWithMe = await Notebook.find({
      sharedWith: currentUser._id,
      isTrashed: false
    }).select('title userId sharedWith isPublic').lean();

    return NextResponse.json({
      currentUserId: currentUser._id,
      currentUserClerkId: userId,
      currentUserEmail: currentUser.email,
      totalNotebooks: allNotebooks.length,
      notebooksSharedWithMe: sharedWithMe.length,
      allNotebooks: allNotebooks.map(n => ({
        id: n._id,
        title: n.title,
        owner: n.userId,
        sharedWith: n.sharedWith,
        isPublic: n.isPublic,
        isTrashed: n.isTrashed
      })),
      sharedWithMe: sharedWithMe.map(n => ({
        id: n._id,
        title: n.title,
        owner: n.userId,
        sharedWith: n.sharedWith,
        isPublic: n.isPublic
      }))
    });
  } catch (error) {
    console.error('Debug sharing error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}
