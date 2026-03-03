import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import FriendRequest from '@/lib/models/FriendRequest';

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
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest || friendRequest.to.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reject friend request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
