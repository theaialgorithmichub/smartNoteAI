import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { getOrCreateUser } from '@/lib/utils/syncUser';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Get or create current user in MongoDB
    const currentUser = await getOrCreateUser(userId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Search in Clerk first to get all users
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({
      query,
      limit: 20
    });

    // Sync found users to MongoDB and filter results
    const results = [];
    for (const clerkUser of clerkUsers.data) {
      // Skip self
      if (clerkUser.id === userId) continue;

      // Get or create user in MongoDB
      let mongoUser = await User.findOne({ clerkId: clerkUser.id });
      if (!mongoUser) {
        mongoUser = await User.create({
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'User',
          avatar: clerkUser.imageUrl || undefined,
        });
      }

      // Skip if already friends
      if (currentUser.friends.some((f: any) => f.toString() === mongoUser._id.toString())) {
        continue;
      }

      results.push({
        id: mongoUser._id.toString(),
        name: mongoUser.name,
        email: mongoUser.email,
        avatar: mongoUser.avatar
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
