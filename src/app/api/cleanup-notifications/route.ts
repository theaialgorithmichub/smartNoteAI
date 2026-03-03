import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Find all friend_accepted notifications for this user
    const notifications = await Notification.find({
      recipient: currentUser._id,
      type: 'friend_accepted'
    }).sort({ createdAt: -1 });

    // Group by actionData.userId to find duplicates
    const seen = new Set();
    const duplicateIds = [];

    for (const notif of notifications) {
      const key = notif.actionData?.userId?.toString();
      if (key) {
        if (seen.has(key)) {
          // This is a duplicate
          duplicateIds.push(notif._id);
        } else {
          // First occurrence, keep it
          seen.add(key);
        }
      }
    }

    // Delete duplicates
    if (duplicateIds.length > 0) {
      await Notification.deleteMany({ _id: { $in: duplicateIds } });
    }

    return NextResponse.json({
      success: true,
      totalNotifications: notifications.length,
      duplicatesRemoved: duplicateIds.length,
      remaining: notifications.length - duplicateIds.length
    });
  } catch (error) {
    console.error('Cleanup notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
