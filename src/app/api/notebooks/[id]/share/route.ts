import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import { Notebook } from '@/lib/models/notebook';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

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
    const { isPublic, sharedWith } = await request.json();

    console.log('[SHARE NOTEBOOK] Notebook ID:', notebookId);
    console.log('[SHARE NOTEBOOK] isPublic:', isPublic, 'sharedWith:', sharedWith);

    const notebook = await Notebook.findOne({ _id: notebookId, userId });
    if (!notebook) return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });

    if (sharedWith && sharedWith.length > 0) {
      const validFriends = sharedWith.every((id: string) =>
        currentUser.friends.some((friendId: any) => friendId.toString() === id)
      );
      if (!validFriends) {
        return NextResponse.json({ error: 'Can only share with friends' }, { status: 400 });
      }
    }

    notebook.isPublic = isPublic;
    // Convert string IDs to ObjectIds
    const mongoose = require('mongoose');
    const sharedWithObjectIds = (sharedWith || []).map((id: string) => new mongoose.Types.ObjectId(id));
    notebook.sharedWith = sharedWithObjectIds;
    
    console.log('[SHARE NOTEBOOK] Before save:', {
      sharedWithInput: sharedWith,
      sharedWithObjectIds: sharedWithObjectIds,
      sharedWithTypes: sharedWithObjectIds.map((id: any) => typeof id)
    });
    
    await notebook.save();

    console.log('[SHARE NOTEBOOK] After save:', {
      id: notebook._id,
      title: notebook.title,
      isPublic: notebook.isPublic,
      sharedWith: notebook.sharedWith,
      sharedWithTypes: notebook.sharedWith?.map((id: any) => typeof id)
    });

    if (sharedWith && sharedWith.length > 0) {
      const notifications = sharedWith.map((userId: string) => ({
        recipient: userId,
        type: 'notebook_shared',
        title: 'Notebook Shared',
        message: `${currentUser.name} shared "${notebook.title}" with you`,
        actionData: { notebookId: notebook._id, userId: currentUser._id }
      }));
      await Notification.insertMany(notifications);
      console.log('[SHARE NOTEBOOK] Created notifications for:', sharedWith);
    }

    return NextResponse.json(notebook);
  } catch (error) {
    console.error('Share notebook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
