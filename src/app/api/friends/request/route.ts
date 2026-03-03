import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import FriendRequest from '@/lib/models/FriendRequest';
import Notification from '@/lib/models/Notification';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    console.log('[FRIEND REQUEST] Clerk userId:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    console.log('[FRIEND REQUEST] Request body:', body);
    
    const { userId: targetUserIdString } = body;
    console.log('[FRIEND REQUEST] Target user ID:', targetUserIdString);

    // Get current user
    const currentUser = await User.findOne({ clerkId: userId });
    console.log('[FRIEND REQUEST] Current user:', currentUser?._id, currentUser?.email);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get target user by MongoDB _id
    const targetUser = await User.findById(targetUserIdString);
    console.log('[FRIEND REQUEST] Target user:', targetUser?._id, targetUser?.email);
    
    if (!targetUser) {
      console.log('[FRIEND REQUEST] Target user not found in DB');
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Check if already friends
    if (currentUser.friends.some((f: any) => f.toString() === targetUser._id.toString())) {
      return NextResponse.json({ error: 'Already friends' }, { status: 400 });
    }

    // Check for existing request
    const existing = await FriendRequest.findOne({
      $or: [
        { from: currentUser._id, to: targetUser._id },
        { from: targetUser._id, to: currentUser._id }
      ]
    });

    console.log('[FRIEND REQUEST] Existing request:', existing);

    if (existing) {
      console.log('[FRIEND REQUEST] Request already exists, status:', existing.status);
      return NextResponse.json({ 
        error: 'Request already exists',
        details: `A ${existing.status} request already exists between these users`
      }, { status: 400 });
    }

    // Create request
    const friendRequest = await FriendRequest.create({
      from: currentUser._id,
      to: targetUser._id
    });

    // Create notification
    await Notification.create({
      recipient: targetUser._id,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${currentUser.name} sent you a friend request`,
      actionData: { requestId: friendRequest._id, userId: currentUser._id }
    });

    return NextResponse.json(friendRequest);
  } catch (error) {
    console.error('Send friend request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
