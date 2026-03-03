import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const count = await Notification.countDocuments({
      recipient: currentUser._id,
      read: false
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
