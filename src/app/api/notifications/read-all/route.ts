import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export async function PATCH() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await Notification.updateMany(
      { recipient: currentUser._id, read: false },
      { read: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
