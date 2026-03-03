import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import FriendRequest from '@/lib/models/FriendRequest';
import Notification from '@/lib/models/Notification';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { requestId } = await params;
    console.log('[ACCEPT REQUEST] Request ID:', requestId);

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest || friendRequest.to.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    friendRequest.status = 'accepted';
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.from, { $addToSet: { friends: friendRequest.to } });
    await User.findByIdAndUpdate(friendRequest.to, { $addToSet: { friends: friendRequest.from } });

    // Mark the friend request notification as read
    await Notification.updateMany(
      {
        recipient: currentUser._id,
        type: 'friend_request',
        'actionData.requestId': requestId,
        read: false
      },
      { $set: { read: true } }
    );

    // Check if friend accepted notification already exists
    const existingAcceptedNotification = await Notification.findOne({
      recipient: friendRequest.from,
      type: 'friend_accepted',
      'actionData.userId': currentUser._id
    });

    // Only create notification if it doesn't exist
    if (!existingAcceptedNotification) {
      await Notification.create({
        recipient: friendRequest.from,
        type: 'friend_accepted',
        title: 'Friend Request Accepted',
        message: `${currentUser.name} accepted your friend request`,
        actionData: { userId: currentUser._id }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Accept friend request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
