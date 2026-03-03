import { clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';

export async function syncUserToMongoDB(clerkUserId: string) {
  try {
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId: clerkUserId });
    if (existingUser) {
      return existingUser;
    }

    // Get user from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);

    // Create user in MongoDB
    const newUser = await User.create({
      clerkId: clerkUserId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
      avatar: clerkUser.imageUrl || undefined,
    });

    console.log('[SYNC] Created user in MongoDB:', newUser._id);
    return newUser;
  } catch (error) {
    console.error('[SYNC] Error syncing user to MongoDB:', error);
    throw error;
  }
}

export async function getOrCreateUser(clerkUserId: string) {
  try {
    await connectDB();

    // Try to find existing user
    let user = await User.findOne({ clerkId: clerkUserId });

    // If not found, sync from Clerk
    if (!user) {
      user = await syncUserToMongoDB(clerkUserId);
    }

    return user;
  } catch (error) {
    console.error('[SYNC] Error getting or creating user:', error);
    throw error;
  }
}
