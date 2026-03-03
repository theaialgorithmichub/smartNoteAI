import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const notification = await Notification.findOneAndUpdate(
      { _id: params.id, recipient: currentUser._id },
      { read: true },
      { new: true }
    );

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
