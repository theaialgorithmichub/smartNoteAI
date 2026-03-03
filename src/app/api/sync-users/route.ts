import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get all users from Clerk
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({ limit: 100 });

    let synced = 0;
    let skipped = 0;

    for (const clerkUser of clerkUsers.data) {
      // Check if user already exists in MongoDB
      const existingUser = await User.findOne({ clerkId: clerkUser.id });

      if (existingUser) {
        skipped++;
        continue;
      }

      // Create user in MongoDB
      await User.create({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
        avatar: clerkUser.imageUrl || undefined,
      });

      synced++;
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${synced} users, skipped ${skipped} existing users`,
      synced,
      skipped,
      total: clerkUsers.data.length
    });
  } catch (error) {
    console.error('Sync users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
